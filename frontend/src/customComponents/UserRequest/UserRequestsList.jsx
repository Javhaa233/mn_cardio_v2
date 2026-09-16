import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import RangeDate from "customComponents/RangeDate";
import UniCard from "customComponents/UniCard";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import BaseDialog from "customComponents/BaseDialog";
import BaseList from "baseComponents/BaseList";
import IsActiveStatus from "customComponents/UserRequest/IsActiveStatus";
import UserRequestInfo from "customComponents/UserRequest/UserRequestInfo";
// helper
import Helper from "helper";
import PendingRequests from "helper/PendingRequests";
import { FormField } from "customComponents/Profile/profileDialogParts";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

// Matches DECLINE_MANY_CAP in backend/controllers/auth/UserRequestController.js,
// which is also MUI's largest page size - so one visible page is one call.
const DECLINE_BATCH = 100;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The request date, and for a pending one how long it has been waiting.
 *
 * The queue holds requests years old; a date alone does not say that, and the
 * whole point of this screen is deciding what has gone unanswered.
 */
function WaitedFor(props) {
  const { rowdata = {} } = props;
  const Raw = rowdata.CreateDate;
  if (!Raw) return null;
  // WaitedDays is stamped when the list arrives - reading the clock during a
  // render makes the cell impure, and the row is only ever a day old anyway.
  const Days = rowdata.WaitedDays;
  return (
    <span>
      {String(Raw).replace("T", " ").slice(0, 10)}
      {Days > 0 ? (
        <span
          style={{ display: "block", fontSize: 12, color: colors.brand.inkDim }}
        >
          {Days} хоног
        </span>
      ) : null}
    </span>
  );
}

/** How long each pending request has been waiting, measured once per fetch. */
function StampWaitedDays(Rows) {
  if (!Array.isArray(Rows)) return Rows;
  const Now = Date.now();
  return Rows.map((Row) =>
    String(Row.IsActive) === "0" && Row.CreateDate
      ? {
          ...Row,
          WaitedDays: Math.floor(
            (Now - new Date(Row.CreateDate).getTime()) / DAY_MS,
          ),
        }
      : Row,
  );
}

// UserRequests.IsActive codes; "" shows every request.
const STATUS_FILTERS = [
  { Value: "0", Label: "Хүлээгдэж буй" },
  { Value: "1", Label: "Зөвшөөрсөн" },
  { Value: "2", Label: "Татгалзсан" },
  { Value: "", Label: "Бүгд" },
];

class UserRequestsList extends BaseList {
  constructor(props) {
    super(props);
    // Opens on the queue that needs a decision.
    this.state = {
      ...this.state,
      ReadMoreDialog: null,
      StatusFilter: "0",
      GridPage: 0,
      Selected: [],
      DeclineManyOpen: false,
      DeclineManyReason: "",
      DeclineManyError: "",
      DeclineManyBusy: false,
    };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = [
      { Field: "IsActive", Value: "0", Op: "Equals" },
    ];
    this.InfoRef = null;
  }

  ChangeStatusFilter = (Value) => {
    this.setState({ StatusFilter: Value, Selected: [] });
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "IsActive",
      Value,
      this.SearchOption.SearchField,
      "Equals",
    );
    // Back to the first page: switching filters from page 5 otherwise asks for
    // page 5 of a different, usually shorter, result set.
    this.ResetPage();
    this.GetData();
  };

  /**
   * Put both halves of the pagination back to the first page.
   *
   * The grid keeps its own page number and only follows the `Page` prop when
   * that prop CHANGES, so tracking what the grid moved to is what makes a reset
   * from page 5 actually land. Without it a bulk decline leaves the grid asking
   * for a page the shortened result set no longer has - an empty table with a
   * non-zero row count.
   */
  ChangeGridPage = (Page, Limit) => {
    this.setState({ GridPage: Page });
    this.PageLimitChange(Page, Limit);
  };

  ResetPage = () => {
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    this.setState({ GridPage: 0 });
  };

  /**
   * A STABLE reference, deliberately. BaseGrid re-notifies the parent from an
   * effect that lists this callback in its dependencies, so an inline arrow
   * would make every render a new selection notification - a render loop.
   */
  SelectRows = (Rows) => {
    this.setState({ Selected: Array.isArray(Rows) ? Rows : [] });
  };

  DeclineMany = async () => {
    const { t } = this.props;
    const Reason = this.state.DeclineManyReason.trim();
    if (!Reason) {
      this.setState({ DeclineManyError: t("Татгалзсан шалтгаанаа бичнэ үү") });
      return;
    }
    const Ids = this.state.Selected.map((Row) => Row.Id).filter(Boolean);
    if (Ids.length === 0) return;

    this.setState({ DeclineManyBusy: true, DeclineManyError: "" });
    // Batched to the server's own cap, so one click never asks it to send a
    // thousand emails in a single request.
    let Declined = 0;
    let Skipped = 0;
    let Failed = false;
    let Message = "";
    for (let i = 0; i < Ids.length; i += DECLINE_BATCH) {
      const Batch = Ids.slice(i, i + DECLINE_BATCH);
      const Res = await new Promise((Resolve) =>
        Helper.BaseCrudHelper.CallService(
          "/UserRequest/DeclineMany",
          { Ids: Batch, Reason },
          (resData) => Resolve(resData || {}),
        ),
      );
      if (Res.Success) {
        Declined += (Res.Data && Res.Data.Declined) || 0;
        Skipped += (Res.Data && Res.Data.Skipped) || 0;
      } else {
        Failed = true;
        Message = Res.Message || t("Сервертэй холбогдож чадсангүй");
        break;
      }
    }

    this.setState({
      DeclineManyBusy: false,
      DeclineManyOpen: false,
      DeclineManyReason: "",
      Selected: [],
    });
    const Summary = Failed
      ? Message
      : `${Declined} ${t("хүсэлтийг татгалзлаа")}.` +
        (Skipped
          ? ` ${Skipped} ${t("хүсэлтийг өмнө нь шийдвэрлэсэн тул алгаслаа")}.`
          : "");
    const alert = Helper.BaseCrudHelper.ShowAlert(Summary, !Failed, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
    // The page that held them may no longer exist.
    this.ResetPage();
    this.GetData();
    PendingRequests.Refresh({ force: true });
  };

  // The dialog's reply: close and reload on success, alert either way. A null
  // reply means the dialog marked a field itself and there is nothing to say.
  AfterDecision = (resData) => {
    if (!resData) return;
    if (resData.Success) {
      this.setState({ ReadMoreDialog: null });
      this.GetData();
      PendingRequests.Refresh({ force: true });
    }
    const alert = Helper.BaseCrudHelper.ShowAlert(
      resData.Message,
      resData.Success,
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  GetData = async () => {
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "UserRequests", SearchOption: this.SearchOption },
      (resData) => {
        if (resData) {
          if (resData.Success === false) this.ShowAlert(resData.Message, false);
          // While the pending filter is on, this list IS the pending count -
          // hand it to the sidebar rather than asking the server twice.
          if (this.state.StatusFilter === "0" && resData.Option) {
            PendingRequests.Set(resData.Option.Total);
          }
          this.setState({
            Data: StampWaitedDays(resData.Data),
            GridOption: Object.assign({}, resData.Option),
          });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  ReadMore = (data) => {
    // Only a pending request can be decided; the server refuses the rest too.
    const Pending = data.IsActive + "" === "0";
    const DialogData = (
      <BaseDialog
        Close={() => this.setState({ ReadMoreDialog: null })}
        Title="Хэрэглэгчийн хүсэлт"
        Width="720px"
        Height={Pending ? "720px" : "520px"}
        SaveButtonText="Баталгаажуулах"
        ShowSave={Pending}
        ShowDecline={Pending}
        Save={(setLoading) => {
          if (!this.InfoRef) return setLoading && setLoading(false);
          this.InfoRef.Confirm((resData) => {
            setLoading && setLoading(false);
            this.AfterDecision(resData);
          });
        }}
        Decline={(setDeclineLoading) => {
          if (!this.InfoRef)
            return setDeclineLoading && setDeclineLoading(false);
          this.InfoRef.Decline((resData) => {
            setDeclineLoading && setDeclineLoading(false);
            this.AfterDecision(resData);
          });
        }}
      >
        <UserRequestInfo Id={data.Id} ref={(ref) => (this.InfoRef = ref)} />
      </BaseDialog>
    );
    this.setState({ ReadMoreDialog: DialogData });
  };

  /**
   * The bulk decline: one reason for all of them, and a plain statement of what
   * is about to happen before it happens. Declining is not reversible and each
   * applicant is emailed, so the count and the consequence are both spelled out
   * rather than implied by a button label.
   */
  RenderDeclineMany = (Rows) => {
    const { t } = this.props;
    const { DeclineManyReason, DeclineManyError, DeclineManyBusy } = this.state;
    const NoEmail = Rows.filter((Row) => !Row.Email).length;

    return (
      <BaseDialog
        Close={
          DeclineManyBusy
            ? undefined
            : () => this.setState({ DeclineManyOpen: false })
        }
        Title="Сонгосон хүсэлтийг татгалзах"
        Width="560px"
        Height="520px"
        // The danger slot, not the save slot: this refuses people, and the
        // button rank should say so (CLAUDE.md §6).
        ShowDecline={true}
        Decline={(setLoading) => {
          this.DeclineMany().finally(() => setLoading && setLoading(false));
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: space[3] }}>
          <Alert severity="warning">
            {Rows.length}{" "}
            {t("хүсэлтийг татгалзах гэж байна. Буцаах боломжгүй.")}
            {NoEmail > 0
              ? ` ${NoEmail} ${t("хүсэлтэд и-мэйл хаяг байхгүй тул мэдэгдэл хүрэхгүй.")}`
              : ""}
          </Alert>

          <FormField
            Id="decline-many-reason"
            Label={t("Татгалзсан шалтгаан")}
            Required
            multiline
            minRows={3}
            autoFocus
            disabled={DeclineManyBusy}
            Error={DeclineManyError}
            Hint={t("Хүсэлт гаргагч бүрт и-мэйлээр илгээнэ")}
            value={DeclineManyReason}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            onChange={(e) =>
              this.setState({
                DeclineManyReason: e.target.value,
                DeclineManyError: "",
              })
            }
          />

          <Box
            sx={{
              maxHeight: 180,
              overflowY: "auto",
              border: `1px solid ${colors.brand.hairline}`,
              borderRadius: radius.sm,
              padding: space[2],
            }}
          >
            {Rows.map((Row) => (
              <Typography
                key={Row.Id}
                variant="body2"
                sx={{ color: colors.brand.ink }}
              >
                {Row.UserName}
                {Row.OrgName ? ` · ${Row.OrgName}` : ""}
                {Row.Email ? "" : ` · ${t("и-мэйлгүй")}`}
              </Typography>
            ))}
          </Box>
        </Box>
      </BaseDialog>
    );
  };

  CustomRender = () => {
    const {
      Alert,
      Data,
      GridOption,
      Config,
      ReadMoreDialog,
      isLoading,
      StatusFilter,
      Selected,
      DeclineManyOpen,
      DeclineManyReason,
      DeclineManyError,
      DeclineManyBusy,
    } = this.state;
    const { t } = this.props;
    const Pending = StatusFilter === "0";
    const Total = GridOption && GridOption.Total ? GridOption.Total : 0;
    // Belt and braces: the grid's own column filter can override the status
    // dropdown, so the bulk action judges each row, not the dropdown.
    const SelectedPending = (Selected || []).filter(
      (Row) => String(Row.IsActive) === "0",
    );

    if (!Config) {
      return null;
    } else {
      var FieldLists = Helper.BaseCrudHelper.GetFieldList(Config.Fields);
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {Alert}
          {ReadMoreDialog}
          {DeclineManyOpen ? this.RenderDeclineMany(SelectedPending) : null}
          <div
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Was a Creative Tim Card whose CardHeader drew a floating cyan pill
                over the top edge. UniCard is the frame every other list uses. */}
            <UniCard
              title={
                (Config.TitleObject ? t(Config.TitleObject.Title + "") : "") +
                (Total ? ` (${Total})` : "")
              }
              cardBodyStyle={{ gap: "8px" }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  marginTop: "0px",
                  width: "100%",
                  maxWidth: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Plain label beside the field, like RangeDate's "Хугацаа":
                    a floating MUI label collides with the legacy styles here. */}
                <label htmlFor="user-request-status" style={{ fontSize: 14 }}>
                  {t("Status")}
                </label>
                <TextField
                  select
                  size="small"
                  id="user-request-status"
                  value={StatusFilter}
                  onChange={(e) => this.ChangeStatusFilter(e.target.value)}
                  sx={{ minWidth: 180 }}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  {STATUS_FILTERS.map((Option) => (
                    <MenuItem key={Option.Label} value={Option.Value}>
                      {t(Option.Label)}
                    </MenuItem>
                  ))}
                </TextField>
                <RangeDate
                  ChangeValue={(StartDate, EndDate) => {
                    this.SearchOption.SearchField =
                      Helper.BaseCrudHelper.SetSearchField(
                        "CreateDate",
                        [StartDate, EndDate],
                        this.SearchOption.SearchField,
                        "Between",
                      );
                    this.ResetPage();
                    this.GetData();
                  }}
                />
                {/* Only where a bulk decision applies, and only once rows are
                    ticked. Destructive, so it carries the danger rank. */}
                {Pending && SelectedPending.length > 0 ? (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() =>
                      this.setState({
                        DeclineManyOpen: true,
                        DeclineManyReason: "",
                        DeclineManyError: "",
                      })
                    }
                  >
                    {t("Сонгосныг татгалзах")} ({SelectedPending.length})
                  </Button>
                ) : null}
              </div>
              <div
                style={{
                  flex: "1 1 auto",
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {isLoading ? <DivLoading WithoutCard /> : null}
                <BaseGrid
                  Fields={FieldLists}
                  HideNumber={false}
                  Data={Data}
                  Option={GridOption}
                  TextLength={50}
                  OrderBy={this.OrderBy}
                  SearchField={this.SearchField}
                  SearchFieldData={this.SearchOption.SearchField}
                  PK={Config.PK ? Config.PK : "Id"}
                  ChangePage={this.ChangeGridPage}
                  Page={this.state.GridPage}
                  PageSizeOptions={[20, 50, 100]}
                  // Ticking rows is only useful where a bulk decision applies.
                  HideCheck={!Pending}
                  SelectRow={this.SelectRows}
                  FillHeight={true}
                  NoRowsText={
                    Pending
                      ? t("Хүлээгдэж буй хүсэлт алга")
                      : t("Мэдээлэл олдсонгүй")
                  }
                  // The action sits first: with ten columns the row is wider
                  // than the screen, and a button you must scroll sideways to
                  // reach is a button an administrator does not press.
                  RowActionFirst={true}
                  widthPattern="50c, 160c, 130l, 130, 120, 120, 130, 200, 110, 200, 150c, 120c"
                  ColumnActions={[
                    {
                      Field: "IsActive",
                      Component: <IsActiveStatus />,
                      onClick: () => {},
                    },
                    {
                      Field: "CreateDate",
                      Component: <WaitedFor />,
                      onClick: () => {},
                    },
                  ]}
                  RowActions={[
                    {
                      Component: (
                        <Button
                          color="info"
                          size="sm"
                          style={{ padding: "4px 8px 3px" }}
                        >
                          {t("Read more")}
                        </Button>
                      ),
                      onClick: (data) => this.ReadMore(data),
                    },
                  ]}
                />
              </div>
            </UniCard>
          </div>
        </div>
      );
    }
  };
}

export default withTranslation(undefined, { withRef: true })(UserRequestsList);
