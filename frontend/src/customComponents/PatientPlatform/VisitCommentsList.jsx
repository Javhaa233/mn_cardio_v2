import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// @mui/icons-material
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseList from "baseComponents/BaseList";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";
// theme
import { colors } from "@/theme/colors";
// helper
import Helper from "helper";
import { radius, elevation } from "@/theme/tokens";

const PAGE_SIZE = 5;

/**
 * 2.3 Эмчээс асуух асуулт — the thread half.
 *
 * Reads /api/patient/questions, which scopes the thread to the account behind
 * the token, so no patient identifier is sent from the browser.
 *
 * The chat presentation is unchanged. What is new: the component is wrapped in
 * `withTranslation` (it destructured `t` off props while being exported bare,
 * so every string it tried to translate crashed or silently fell back), and it
 * now has explicit empty and error states instead of only ever clearing the
 * spinner.
 */
class VisitCommentsList extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, isLoading: true, LoadFailed: null, Total: 0 };
    this.Page = 0;

    // Set by the scroll container's callback ref in CustomRender.
    this.BodyScroll = null;
  }

  // The list needs no field config - it renders bubbles, not a grid - so skip
  // the BaseList config round-trip and go straight to the data.
  componentDidMount() {
    this.GetData(true);
  }

  /**
   * @param {boolean|undefined} Save
   *   true      - reload from the top (a question was just sent)
   *   false     - append the next older page
   *   undefined - first load
   */
  GetData = async (Save) => {
    const { t } = this.props;
    const { Data } = this.state;

    if (Save === true || Save === undefined) this.Page = 0;

    this.setState({ isLoading: true, LoadFailed: null });

    const res = await Helper.PatientApiHelper.GetQuestions({
      limit: PAGE_SIZE,
      offset: this.Page * PAGE_SIZE,
    });

    if (!res.success) {
      this.setState({
        isLoading: false,
        LoadFailed: res.message || t("Асуултын түүхийг уншиж чадсангүй"),
      });
      return;
    }

    const Rows = Array.isArray(res.data) ? res.data : [];
    // The endpoint answers newest first; older pages are appended and the
    // render reverses once, so the newest question sits at the bottom.
    const Comments = Save === false ? [...(Data || []), ...Rows] : Rows;

    this.setState(
      {
        Data: Comments,
        Total: typeof res.total === "number" ? res.total : Comments.length,
        isLoading: false,
      },
      () => {
        if (Save === undefined || Save === true) this.scrollToBottom();
      },
    );
  };

  LoadOlder = () => {
    this.Page = this.Page + 1;
    this.GetData(false);
  };

  scrollToBottom = () => {
    if (this.BodyScroll) {
      this.BodyScroll.scrollTop = this.BodyScroll.scrollHeight;
    }
  };

  RenderBubble = (row, index) => {
    const { t } = this.props;
    const isDoctor = row.is_doctor + "" === "1";

    return (
      <ListItem
        key={row.id_data || index}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: isDoctor ? "flex-start" : "flex-end",
          alignItems: "flex-end",
          padding: "12px 0",
        }}
      >
        {isDoctor && (
          <Avatar
            style={{
              width: 32,
              height: 32,
              backgroundColor: colors.brand.cyanInk,
              marginRight: 8,
              marginBottom: 4,
            }}
          >
            <MedicalServicesIcon style={{ fontSize: 18 }} />
          </Avatar>
        )}
        <div
          style={{
            maxWidth: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: isDoctor ? "flex-start" : "flex-end",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderRadius: isDoctor
                ? "18px 18px 18px 4px"
                : "18px 18px 4px 18px",
              // White text on the teal accent (#00acc1) was ~2.9:1. The
              // patient's own messages are now the brand tint in ink, the
              // doctor's white with a hairline - both AA.
              backgroundColor: isDoctor
                ? colors.brand.surface
                : colors.brand.tintSolid,
              boxShadow: elevation[1],
              color: colors.brand.ink,
              border: "1px solid " + colors.brand.hairline,
            }}
          >
            {isDoctor && (
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: colors.brand.cyanInk,
                  marginBottom: "4px",
                }}
              >
                {t("Эмч")}
              </div>
            )}
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
              }}
            >
              {row.comment}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: "6px",
                fontSize: "10px",
                opacity: 0.8,
                color: colors.brand.inkDim,
              }}
            >
              <AccessTimeIcon
                style={{ fontSize: "12px", marginRight: "4px" }}
              />
              {Helper.ObjectHelper.getDateYMDHMS({
                DateStr: row.date_creation,
              })}
            </div>
          </div>
        </div>
        {!isDoctor && (
          <Avatar
            style={{
              width: 32,
              height: 32,
              backgroundColor: colors.brand.tintSolidHover,
              marginLeft: 8,
              marginBottom: 4,
            }}
          >
            <PersonIcon
              style={{ fontSize: 18, color: colors.brand.inkMuted }}
            />
          </Avatar>
        )}
      </ListItem>
    );
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, Total, isLoading, LoadFailed } = this.state;

    const HasRows = Array.isArray(Data) && Data.length > 0;

    return (
      <div
        ref={(ref) => (this.BodyScroll = ref)}
        style={{
          backgroundColor: colors.brand.canvas,
          position: "relative",
          maxHeight: "600px",
          minHeight: "400px",
          overflow: "auto",
          padding: "20px",
          borderRadius: radius.md,
          border: "1px solid " + colors.brand.hairline,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: "-20px",
            zIndex: 1,
            width: "100%",
            backgroundColor: colors.brand.canvas,
            padding: "10px 0",
            backdropFilter: "blur(4px)",
            textAlign: "center",
          }}
        >
          {isLoading ? (
            <BaseLoading />
          ) : HasRows && Total > Data.length ? (
            <Button
              simple
              round
              color="info"
              size="sm"
              style={{ backgroundColor: colors.brand.surface }}
              onClick={this.LoadOlder}
            >
              {t("Өмнөх яриануудыг харах")}
            </Button>
          ) : null}
        </div>

        {LoadFailed ? (
          <LoadError Message={LoadFailed} Retry={() => this.GetData(true)} />
        ) : null}

        {!isLoading && !LoadFailed && !HasRows ? (
          <BaseNoData Text={t("Одоогоор асуулт байхгүй байна")} />
        ) : null}

        <List style={{ marginTop: "10px", padding: 0 }}>
          {HasRows
            ? [...Data]
                .reverse()
                .map((row, index) => this.RenderBubble(row, index))
            : null}
        </List>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(VisitCommentsList);
