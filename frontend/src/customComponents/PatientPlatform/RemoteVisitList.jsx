import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// @mui/icons-material
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";
import AdviceFileInfo from "customComponents/Advice/AdviceFileInfo";
import StatusChip from "customComponents/StatusChip";
// theme
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import VideocamIcon from "@mui/icons-material/Videocam";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
// helper
import Helper from "helper";

/**
 * 2.6 Цахим үзлэг — the history half of the remote-examination screen.
 *
 * Two callers, two data paths, one component:
 *
 *   - the DOCTOR side (`PatientMonitoring/PatientMonitoringDoctor.jsx`) opens
 *     this in a dialog for a patient it names, and keeps the legacy
 *     `RemoteVisit/GetList` route — that route is the only one that returns the
 *     attached files, and it is the only one a doctor's token can use to read
 *     someone else's history.
 *   - the PATIENT side passes `UsePatientApi`, which switches the read to
 *     GET /api/patient/evisits. That endpoint takes no patient identifier: the
 *     server derives the patient from the verified token, so the screen no
 *     longer trusts whatever `localStorage` happens to hold.
 *
 * The switch is opt-in precisely so the doctor caller keeps its behaviour
 * unchanged.
 */
/**
 * How each status reads. The server sends both the code and a StatusLabel from
 * the `remotevisit_status` dico; the label wins when the dico is seeded and the
 * code is the fallback, which is the contract shapeEvisit() documents.
 */
const STATUS_TONE = {
  requested: "warning",
  scheduled: "info",
  completed: "success",
  cancelled: "neutral",
};

const STATUS_FALLBACK = {
  requested: "Хүсэлт илгээсэн",
  scheduled: "Товлосон",
  completed: "Дууссан",
  cancelled: "Цуцалсан",
};

/** The server allows cancel from these two only; anything else is terminal. */
const CANCELLABLE = ["requested", "scheduled"];

class RemoteVisitList extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      LoadErrorMessage: null,
      Confirm: null,
      Alert: null,
      CancellingId: null,
    };
    this.Patient = props.Patient || null;
    this.SearchOption.PageOption.Limit = 5;
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = [
      { Field: "PatientId", Value: props.PatientId, Op: "Equals" },
    ];
  }

  /**
   * The patient path needs no ModelConfig — the rows are rendered by hand and
   * /api/patient/evisits returns exactly the three columns used below. Skipping
   * the legacy config fetch keeps a config failure from stranding the screen on
   * a spinner that never resolves.
   */
  componentDidMount() {
    if (this.props.UsePatientApi) this.GetData();
    else super.componentDidMount();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.PatientId !== this.props.PatientId) this.GetData(true);
  }

  GetData = async (Reset) => {
    if (this.props.UsePatientApi) return this.GetDataFromPatientApi(Reset);
    return this.GetDataFromLegacy(Reset);
  };

  ResetPaging = (Reset) => {
    if (Reset === true) this.SearchOption.PageOption = { Page: 0, Limit: 5 };
    const { Page = 0, Limit = 5 } = this.SearchOption.PageOption || {};
    return { Page, Limit };
  };

  GetDataFromPatientApi = async (Reset) => {
    const { t } = this.props;
    const { Page, Limit } = this.ResetPaging(Reset);

    this.setState({ isLoading: true, LoadErrorMessage: null });
    const res = await Helper.PatientApiHelper.GetEvisits({
      limit: Limit,
      offset: Page * Limit,
    });

    if (!res.success) {
      this.setState({
        isLoading: false,
        LoadErrorMessage: res.message || t("Алдаа гарлаа"),
      });
      return;
    }

    const Rows = Array.isArray(res.data) ? res.data : [];
    this.setState({
      Data: Rows,
      GridOption: {
        Total: typeof res.total === "number" ? res.total : Rows.length,
      },
      isLoading: false,
      LoadErrorMessage: null,
    });
  };

  GetDataFromLegacy = async (Reset) => {
    const { ObjectName, PatientId, t } = this.props;

    // Without a patient there is nothing to read. This used to return without
    // touching state at all, so the caller was left looking at a permanent
    // spinner with no explanation and no way to recover.
    if (!PatientId) {
      this.setState({
        Data: [],
        isLoading: false,
        LoadErrorMessage: t("Иргэний мэдээлэл олдсонгүй"),
      });
      return;
    }

    const { Page, Limit } = this.ResetPaging(Reset);
    this.SearchOption.PageOption = { Page, Limit };
    this.SearchOption.SearchField = [
      { Field: "PatientId", Value: PatientId, Op: "Equals" },
    ];

    this.setState({ isLoading: true, LoadErrorMessage: null });
    const ReqData = Helper.BaseCrudHelper.GetRequestData(
      ObjectName,
      this.SearchOption,
    );
    await Helper.BaseCrudHelper.CallService(
      "RemoteVisit/GetList",
      ReqData,
      (resData) => {
        if (resData && resData.Success !== false && resData.Data) {
          this.setState({
            Data: resData.Data,
            GridOption: resData.Option,
            isLoading: false,
            LoadErrorMessage: null,
          });
        } else {
          this.setState({
            isLoading: false,
            LoadErrorMessage: (resData && resData.Message) || t("Алдаа гарлаа"),
          });
        }
      },
    );
  };

  /**
   * Withdraw a request.
   *
   * POST /evisits/:id/cancel has existed since the patient API layer was
   * built and had no caller at all, so a patient who asked for an appointment
   * by mistake - or no longer needed one - had no way to take it back and the
   * doctor kept seeing it in their queue.
   */
  CancelEvisit = (row) => {
    const { t } = this.props;

    // ShowConfirm/ShowAlert return an element for the caller to render - they
    // do not display anything themselves - so both live in state below.
    const Confirm = Helper.BaseCrudHelper.ShowConfirm(
      t("Энэ хүсэлтийг цуцлах уу?"),
      async () => {
        this.setState({ Confirm: null, CancellingId: row.Id });
        const res = await Helper.PatientApiHelper.CancelEvisit(row.Id);
        this.setState({ CancellingId: null });

        if (!res.success) {
          this.setState({
            Alert: Helper.BaseCrudHelper.ShowAlert(
              res.message || t("Цуцлах үед алдаа гарлаа"),
              false,
              () => this.setState({ Alert: null }),
            ),
          });
          return;
        }
        this.GetData(true);
      },
      () => this.setState({ Confirm: null }),
      { Destructive: true },
    );
    this.setState({ Confirm });
  };

  CustomRender = () => {
    const {
      Data,
      GridOption,
      isLoading,
      LoadErrorMessage,
      Confirm,
      Alert,
      CancellingId,
    } = this.state;
    const { t, UsePatientApi } = this.props;

    // Loading, error and empty are three different answers and used to render
    // as one: the spinner and the "no data" panel were drawn on top of each
    // other, and a failed request was indistinguishable from an empty history.
    if (isLoading) {
      return (
        <div style={{ minHeight: "120px" }}>
          <DivLoading WithoutCard={true} />
        </div>
      );
    }

    if (LoadErrorMessage) {
      return (
        <LoadError
          Message={LoadErrorMessage}
          Retry={() => this.GetData(true)}
          MinHeight="120px"
        />
      );
    }

    if (!Array.isArray(Data) || Data.length === 0) {
      return (
        <div style={{ minHeight: "120px" }}>
          <BaseNoData Text={t("Цахим үзлэгийн бүртгэл байхгүй байна")} />
        </div>
      );
    }

    return (
      <div style={{ minHeight: "120px" }}>
        {Confirm}
        {Alert}
        <List style={{ padding: 0 }}>
          {Data.map((e, key) => (
            <ListItem
              key={"List" + key}
              style={{
                background: colors.background.primary,
                borderRadius: "8px",
                marginBottom: "10px",
                padding: "12px 16px",
                boxShadow: "0 2px 4px " + colors.shadow.light,
                display: "block",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  color: colors.text.secondary,
                  fontSize: "13px",
                }}
              >
                <AccessTimeIcon
                  style={{ width: "16px", height: "16px", marginRight: "6px" }}
                />
                {Helper.ObjectHelper.getDateYMDHMS({ DateStr: e.CreateDate })}
                {/* Status, the doctor and the appointment time all came back
                    from /api/patient/evisits from the first day and none of
                    them were shown, so every request looked identical to
                    every other one whatever had happened to it. The legacy
                    doctor path has no Status column, hence the guard. */}
                {UsePatientApi && e.Status ? (
                  <Box sx={{ marginLeft: "auto" }}>
                    <StatusChip
                      Tone={STATUS_TONE[e.Status] || "neutral"}
                      Label={
                        e.StatusLabel ||
                        t(STATUS_FALLBACK[e.Status] || e.Status)
                      }
                    />
                  </Box>
                ) : null}
              </div>

              {UsePatientApi && (e.DoctorName || e.ScheduledDate) ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: space[3],
                    marginBottom: space[2],
                    color: colors.brand.inkMuted,
                    fontSize: "13px",
                  }}
                >
                  {e.DoctorName ? (
                    <span>
                      {t("Эмч")}: {e.DoctorName}
                    </span>
                  ) : null}
                  {e.ScheduledDate ? (
                    <span>
                      {t("Товлосон цаг")}:{" "}
                      {Helper.ObjectHelper.getDateYMDHMS({
                        DateStr: e.ScheduledDate,
                      })}
                    </span>
                  ) : null}
                </Box>
              ) : null}
              {e.Comment && e.Comment !== "" && (
                <div
                  style={{
                    background: colors.background.surfaceAlt,
                    padding: "10px 14px",
                    borderRadius: "6px",
                    marginBottom: e.Files && e.Files.length > 0 ? "10px" : 0,
                    fontSize: "14px",
                    color: colors.text.strong,
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {e.Comment}
                </div>
              )}
              {e.Files && e.Files.length > 0 && (
                <div
                  style={{
                    background: colors.background.infoTint,
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: colors.button.primary,
                      fontWeight: 500,
                      marginBottom: "6px",
                    }}
                  >
                    {t("File attachment")}
                  </div>
                  <AdviceFileInfo Data={e.Files} />
                </div>
              )}

              {UsePatientApi &&
              (e.MeetingUrl || CANCELLABLE.includes(e.Status)) ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: space[2],
                    marginTop: space[3],
                    paddingTop: space[2],
                    borderTop: `1px solid ${colors.brand.hairline}`,
                  }}
                >
                  {/* The server only fills MeetingUrl once the request is
                      scheduled, so this appears exactly when there is
                      something to join. */}
                  {e.MeetingUrl ? (
                    <Button
                      component="a"
                      href={e.MeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<VideocamIcon />}
                      sx={gridToolbarButtonSx.primary}
                    >
                      {t("Үзлэгт нэгдэх")}
                    </Button>
                  ) : null}

                  {CANCELLABLE.includes(e.Status) ? (
                    <Button
                      onClick={() => this.CancelEvisit(e)}
                      disabled={CancellingId === e.Id}
                      sx={gridToolbarButtonSx.danger}
                    >
                      {CancellingId === e.Id
                        ? t("Цуцалж байна")
                        : t("Хүсэлт цуцлах")}
                    </Button>
                  ) : null}
                </Box>
              ) : null}
            </ListItem>
          ))}
          <Paginition
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            RowsPerPageOptions={[5]}
            PageSize={5}
          />
        </List>
      </div>
    );
  };
}
export default withTranslation(undefined, { withRef: true })(RemoteVisitList);
