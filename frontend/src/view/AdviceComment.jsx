import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// @mui/material components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import FollowUp from "customComponents/DetailViews/FollowUp";
import Comment from "customComponents/Advice/Comment";
import CommentHeader from "customComponents/Advice/CommentHeader";
import CreateComment from "customComponents/Advice/CreateComment";
import DivLoading from "customComponents/DivLoading";
import FollowUpForm from "customComponents/Forms/FollowUpForm";
import UniCard from "customComponents/UniCard";

// helper
import Helper from "helper";
import customHistory from "customHistory";
import { colors } from "@/theme/colors";
import { radius, space, layout } from "@/theme/tokens";

/**
 * The action bar.
 *
 * Was four identical dark Creative Tim buttons with `float: left`,
 * `borderRadius: 0` and hand-tuned margins inside a bare div, which overflowed
 * rather than wrapped on a 1366px clinic laptop. Now a flex row that wraps,
 * with exactly one filled action - closing a ticket is the only irreversible
 * thing here, so it is the only button that shouts.
 */
const actionSx = {
  textTransform: "none",
  borderRadius: radius.sm,
  boxShadow: "none",
  color: colors.brand.cyanInk,
  borderColor: colors.brand.hairlineStrong,
  "&:hover": { backgroundColor: colors.brand.tint, boxShadow: "none" },
};

const primaryActionSx = {
  ...actionSx,
  color: colors.text.white,
  backgroundColor: colors.brand.cyanInk,
  "&:hover": {
    backgroundColor: colors.brand.cyanInkHover,
    boxShadow: "none",
  },
};

class AdviceComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Comments: [],
      // Read from the tab's own url: a lazily-loaded page can be constructed
      // after the active tab changed, and document.location would then belong
      // to a different record.
      AdviceId: Helper.BaseHelper.getUrlParam(
        props.TabHref || document.location.href,
        "AdviceId",
      ),
      Advice: {},
      LogedUser: {},
      DialogData: null,
      isLoading: false,
      isCommentLoading: false,
      isCommentError: false,
      NotFound: false,
      Alert: null,
    };
  }

  componentDidMount() {
    // Read synchronously and PASS it, rather than setState-then-read. The old
    // code did `setState({LogedUser})` and called SaveAdviceViews in the same
    // tick; that read `this.state.LogedUser`, still `{}`, and `{}` passes the
    // helper's truthiness guard - so every view of this page has been recorded
    // against `UserId: undefined`. AdviceFeed/ReplyThread.jsx already fixed the
    // same bug on its side and its comment names this page.
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.setState({ LogedUser: LogedUser || {} });
    this.GetAdvice();

    if (LogedUser && LogedUser.Id) {
      Helper.AdviceHelper.SaveAdviceViews(
        this.state.AdviceId,
        LogedUser,
        () => {},
      );
    }
  }

  GetAdvice = async () => {
    this.setState({ isLoading: true });
    await Helper.AdviceHelper.GetTicket(this.state.AdviceId, (resData) => {
      const Ticket = resData && resData.Data ? resData.Data : null;
      // Every flag is settled in one place, in every branch. The old version
      // set isDrInfoLoading before the fetch and cleared it only inside the
      // success branch, so an unknown id left the page loading forever.
      this.setState({
        Advice: Ticket || {},
        NotFound: !Ticket,
        isLoading: false,
      });
      if (Ticket) this.GetComments();
    });
  };

  GetComments = async () => {
    const { AdviceId } = this.state;
    this.setState({ isCommentLoading: true });
    await Helper.AdviceHelper.GetComments(AdviceId, (resData) => {
      const ok = !!resData && resData.Success !== false;
      this.setState({
        Comments: ok && Array.isArray(resData.Data) ? resData.Data : [],
        isCommentError: !ok,
        isCommentLoading: false,
      });
    });
  };

  SaveComment = async ({ Comment, Files }, callback) => {
    const { AdviceId } = this.state;
    if (
      (Comment !== "" &&
        Comment.length > 0 &&
        Comment.replace(/\s/g, "").length > 0) ||
      Files.length > 0
    ) {
      await Helper.AdviceHelper.SaveComment(AdviceId, Comment, (resData) => {
        if (resData && resData.Success && resData.Success && Files.length > 0) {
          this.uploadFile(
            { Id: resData.Data.DataId, Files: Files },
            (success) => {
              if (success) {
                callback && callback();
                this.GetComments();
              }
            },
          );
        } else {
          callback && callback();
          this.GetComments();
        }
      });
    }
  };

  uploadFile = async ({ Id, Files }, callback) => {
    const Value = Files;
    if (Value) {
      await Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: "AdviceComment",
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => resData && callback && callback(resData.Success),
      );
    }
  };

  SetInsertForm = (Title) => {
    const { AdviceId, Advice } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          Close={() => this.setState({ DialogData: null })}
          Title={Title}
        >
          <FollowUp
            AdviceId={AdviceId}
            PatientId={Advice.Patient ? Advice.Patient.id_data : null}
          />
        </BaseDialog>
      ),
    });
  };

  SetInsertFormEdit = () => {
    const { Advice } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          Close={() => this.setState({ DialogData: null })}
          Title="Follow Up"
          Save={() => {
            this.FollowUpFormRef.Save &&
              this.FollowUpFormRef.Save(() =>
                this.setState({ DialogData: null }),
              );
          }}
          ShowSave={true}
        >
          <FollowUpForm
            ref={(ref) => (this.FollowUpFormRef = ref)}
            ObjectName="FollowUp"
            AdviceId={Advice.id_data}
          />
        </BaseDialog>
      ),
    });
  };

  SaveClosed = async (ClosedType) => {
    const { Advice } = this.state;
    await Helper.AdviceHelper.CustomSave(
      { id_data: Advice.id_data, adv_ticket_closed: ClosedType },
      (resData) => {
        if (resData) {
          const alert = Helper.BaseCrudHelper.ShowAlert(
            resData.Message,
            resData.Success,
            () => {
              this.setState({ Alert: null });
              if (resData.Success) customHistory.push("/admin/AdviceHome");
            },
          );
          this.setState({ Alert: alert });
        }
      },
    );
  };

  render() {
    const {
      Advice,
      Comments,
      LogedUser,
      DialogData,
      isLoading,
      isCommentLoading,
      isCommentError,
      NotFound,
      Alert,
    } = this.state;
    const { t } = this.props;

    // One reading of the ticket's state, used by every control below. Edit used
    // to test `!== "y"` while Close tested `=== "n"`, so a draft offered Edit
    // and not Close for no reason anybody could state.
    const status = Advice.adv_ticket_closed;
    const hasTicket = !!Advice.id_data;
    const isAuthor = Advice.id + "" === LogedUser.Id + "";
    const canClose = isAuthor || Helper.AuthHelper.CheckRole([1]);

    return (
      // The doctor rail is gone, so the column would otherwise run the full
      // width of a wide monitor. `feedMax` is the same reading measure the feed
      // uses - a 1900px line of Mongolian clinical text is not readable.
      <Box sx={{ width: "100%", maxWidth: layout.feedMax, mx: "auto" }}>
        {DialogData}
        {Alert}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: space[2],
            mb: space[3],
          }}
        >
          <Button
            variant="text"
            sx={actionSx}
            onClick={() => customHistory.goBack()}
          >
            {t("Back")}
          </Button>
          <Button
            variant="outlined"
            sx={actionSx}
            onClick={() => this.SetInsertForm("Full Examination")}
          >
            {t("View current full examination")}
          </Button>

          {/* Who may edit and who may close is a workflow rule, not a layout
              decision - these predicates are carried over unchanged. */}
          {hasTicket && status !== "y" && isAuthor ? (
            <Button
              variant="outlined"
              sx={actionSx}
              onClick={() => this.SetInsertFormEdit()}
            >
              {t("Edit examination")}
            </Button>
          ) : null}

          {hasTicket && status === "n" && canClose ? (
            <Button
              variant="contained"
              sx={primaryActionSx}
              onClick={() => this.SaveClosed("y")}
            >
              {t("Close")}
            </Button>
          ) : null}
        </Box>

        <Box sx={{ position: "relative" }}>
          {isLoading && <DivLoading />}
          <UniCard showHeader={false}>
            {NotFound ? (
              <Typography
                variant="body1"
                sx={{
                  color: colors.brand.inkDim,
                  textAlign: "center",
                  py: space[8],
                }}
              >
                {t("Тасалбар олдсонгүй")}
              </Typography>
            ) : (
              <>
                {hasTicket ? <CommentHeader Data={Advice} /> : null}

                <Box
                  sx={{
                    position: "relative",
                    minHeight: "120px",
                    mt: space[4],
                    pt: space[4],
                    borderTop: `1px solid ${colors.brand.hairline}`,
                  }}
                >
                  {isCommentLoading && <DivLoading WithoutCard />}

                  {isCommentError ? (
                    <Typography
                      variant="body2"
                      sx={{ color: colors.label.error }}
                    >
                      {t("Хариултыг ачаалж чадсангүй")}
                    </Typography>
                  ) : !isCommentLoading && Comments.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: colors.brand.inkDim }}
                    >
                      {t("Хараахан хариулт алга. Эхний хариултыг бичнэ үү.")}
                    </Typography>
                  ) : (
                    Comments.map((e) => (
                      // Keyed by id, not by index: this list is refetched after
                      // every like, rating and reply, and Comment seeds its
                      // rating into useState once - an index key lets React
                      // reuse the instance and show one reply's stars on
                      // another.
                      <Comment
                        AdviceUserId={Advice.id}
                        key={e.id_data}
                        Data={e}
                        ChangeLike={() => this.GetComments()}
                      />
                    ))
                  )}
                </Box>

                <CreateComment
                  LogedUser={LogedUser}
                  AdviceId={Advice.id_data ? Advice.id_data : 0}
                  SaveComment={this.SaveComment}
                  IsDisabled={status === "y"}
                />
              </>
            )}
          </UniCard>
        </Box>
      </Box>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(AdviceComment);
