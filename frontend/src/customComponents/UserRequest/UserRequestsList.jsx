import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
import UserRequestInfo, {
  RoleOptions,
} from "customComponents/UserRequest/UserRequestInfo";
// helper
import Helper from "helper";
import { FormField } from "customComponents/Profile/profileDialogParts";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

// Each matches its route's cap in backend/controllers/auth/UserRequestController.js,
// so one visible grid page is one call.
//
// Approve is the low one on purpose: declining is a single UPDATE, while each
// approval creates an account and a profile, and the reply has to say which
// rows got one.
const DECLINE_BATCH = 100;
const CONFIRM_BATCH = 25;
const DELETE_BATCH = 100;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A request nobody has decided yet. */
function IsPendingRow(Row) {
  return String(Row.IsActive) === "0";
}

/**
 * Decided, and therefore deletable.
 *
 * A NULL status counts as decided - the old backlog holds rows with none, and
 * the server treats them the same way (see DeleteMany). Only a live pending
 * request is protected.
 */
function IsDecidedRow(Row) {
  return !IsPendingRow(Row);
}

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

/**
 * Who a bulk action is about to touch, by name.
 *
 * Every one of these dialogs acts on people, irreversibly, and a bare count
 * ("25 хүсэлт") is not something an administrator can check before pressing the
 * button. `Note` marks the rows that will not go through.
 */
function SelectedRows({ Rows, Note }) {
  return (
    <Box
      sx={{
        maxHeight: 180,
        overflowY: "auto",
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.sm,
        padding: space[2],
      }}
    >
      {Rows.map((Row) => {
        const Marked = Note ? Note(Row) : "";
        return (
          <Typography
            key={Row.Id}
            variant="body2"
            sx={{ color: Marked ? colors.brand.inkDim : colors.brand.ink }}
          >
            {Row.UserName}
            {Row.OrgName ? ` · ${Row.OrgName}` : ""}
            {Marked ? ` · ${Marked}` : ""}
          </Typography>
        );
      })}
    </Box>
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
      Roles: [],
      ConfirmManyOpen: false,
      ConfirmManyRole: "2",
      ConfirmManyBusy: false,
      DeclineManyOpen: false,
      DeclineManyReason: "",
      DeclineManyError: "",
      DeclineManyBusy: false,
      DeleteManyOpen: false,
      DeleteManyBusy: false,
    };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = [
      { Field: "IsActive", Value: "0", Op: "Equals" },
    ];
    this.InfoRef = null;
  }

  componentDidMount() {
    super.componentDidMount();
    // The role list for the bulk-approve dialog, from the same config the
    // single-request dialog reads.
    Helper.BaseCrudHelper.GetConfigData("Users", (resData) => {
      if (resData && resData.Data)
        this.setState({ Roles: RoleOptions(resData.Data) });
    });
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

  /**
   * Post one bulk action for many rows, a batch at a time.
   *
   * Every bulk route is capped server-side so a single click can never aim the
   * whole backlog at it. Matching that cap here means one call per visible
   * page, and a partial failure stops at the batch that failed instead of
   * reporting rows that were never sent. Numeric counters in `Data` are summed
   * across batches; `Results` rows are collected in order.
   */
  RunBatched = async (Url, Ids, Size, Body) => {
    const { t } = this.props;
    const Totals = {};
    const Results = [];
    let Failed = false;
    let Message = "";

    for (let i = 0; i < Ids.length; i += Size) {
      const Res = await new Promise((Resolve) =>
        Helper.BaseCrudHelper.CallService(
          Url,
          { ...(Body || {}), Ids: Ids.slice(i, i + Size) },
          (resData) => Resolve(resData || {}),
        ),
      );
      if (!Res.Success) {
        Failed = true;
        Message = Res.Message || t("Сервертэй холбогдож чадсангүй");
        break;
      }
      const Data = Res.Data || {};
      Object.keys(Data).forEach((Key) => {
        if (typeof Data[Key] === "number")
          Totals[Key] = (Totals[Key] || 0) + Data[Key];
      });
      if (Array.isArray(Data.Results)) Results.push(...Data.Results);
    }

    return { Failed, Message, Totals, Results };
  };

  /** What every bulk action does afterwards: say what happened, reload. */
  FinishBulk = (Summary, Ok) => {
    const alert = Helper.BaseCrudHelper.ShowAlert(Summary, Ok, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Selected: [], Alert: alert });
    // The page that held them may no longer exist.
    this.ResetPage();
    this.GetData();
  };

  ConfirmMany = async () => {
    const { t } = this.props;
    const Ids = this.state.Selected.filter(IsPendingRow)
      .map((Row) => Row.Id)
      .filter(Boolean);
    if (Ids.length === 0) return;

    this.setState({ ConfirmManyBusy: true });
    const { Failed, Message, Totals, Results } = await this.RunBatched(
      "/UserRequest/ConfirmMany",
      Ids,
      CONFIRM_BATCH,
      { RoleId: this.state.ConfirmManyRole },
    );
    this.setState({ ConfirmManyBusy: false, ConfirmManyOpen: false });

    // Name what did not go through. A count alone leaves the administrator
    // hunting for which four of twenty-five are still waiting.
    const Left = Results.filter((Row) => Row.Outcome !== "approved");
    const Names = Left.slice(0, 5)
      .map((Row) => Row.Name || Row.UserName)
      .join(", ");
    const Summary = Failed
      ? Message
      : `${Totals.Approved || 0} ${t("хүсэлтийг баталгаажууллаа")}.` +
        (Left.length
          ? ` ${Left.length} ${t("хүсэлт үлдлээ")}: ${Names}${Left.length > 5 ? "…" : ""}.`
          : "");
    this.FinishBulk(Summary, !Failed);
  };

  DeclineMany = async () => {
    const { t } = this.props;
    const Reason = this.state.DeclineManyReason.trim();
    if (!Reason) {
      this.setState({ DeclineManyError: t("Татгалзсан шалтгаанаа бичнэ үү") });
      return;
    }
    const Ids = this.state.Selected.filter(IsPendingRow)
      .map((Row) => Row.Id)
      .filter(Boolean);
    if (Ids.length === 0) return;

    this.setState({ DeclineManyBusy: true, DeclineManyError: "" });
    const { Failed, Message, Totals } = await this.RunBatched(
      "/UserRequest/DeclineMany",
      Ids,
      DECLINE_BATCH,
      { Reason },
    );
    this.setState({
      DeclineManyBusy: false,
      DeclineManyOpen: false,
      DeclineManyReason: "",
    });

    const Summary = Failed
      ? Message
      : `${Totals.Declined || 0} ${t("хүсэлтийг татгалзлаа")}.` +
        (Totals.Skipped
          ? ` ${Totals.Skipped} ${t("хүсэлтийг өмнө нь шийдвэрлэсэн тул алгаслаа")}.`
          : "");
    this.FinishBulk(Summary, !Failed);
  };

  DeleteMany = async () => {
    const { t } = this.props;
    const Ids = this.state.Selected.filter(IsDecidedRow)
      .map((Row) => Row.Id)
      .filter(Boolean);
    if (Ids.length === 0) return;

    this.setState({ DeleteManyBusy: true });
    const { Failed, Message, Totals } = await this.RunBatched(
      "/UserRequest/DeleteMany",
      Ids,
      DELETE_BATCH,
      null,
    );
    this.setState({ DeleteManyBusy: false, DeleteManyOpen: false });

    const Summary = Failed
      ? Message
      : `${Totals.Deleted || 0} ${t("хүсэлтийг устгалаа")}.` +
        (Totals.Skipped
          ? ` ${Totals.Skipped} ${t("хүсэлтийг устгасангүй")}.`
          : "");
    this.FinishBulk(Summary, !Failed);
  };

  // The dialog's reply: close and reload on success, alert either way. A null
  // reply means the dialog marked a field itself and there is nothing to say.
  AfterDecision = (resData) => {
    if (!resData) return;
    if (resData.Success) {
      this.setState({ ReadMoreDialog: null });
      this.GetData();
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
          this.setState({
            Data: StampWaitedDays(resData.Data),
            GridOption: Object.assign({}, resData.Option),
          });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  /** The whole record for one request. Opened by double-clicking its row. */
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
   * The bulk approve: one role for all of them, each into the organization the
   * applicant gave on their own form.
   *
   * There is no per-row organization picker in a batch, and filing a doctor
   * under the wrong hospital is worse than not filing them at all - so a
   * request without one is skipped here and stays in the queue, to be opened
   * on its own. The dialog says so before the button is pressed, by name.
   */
  RenderConfirmMany = (Rows) => {
    const { t } = this.props;
    const { Roles, ConfirmManyRole, ConfirmManyBusy } = this.state;
    const NoOrg = Rows.filter((Row) => !Row.OrganizationId).length;
    const Ready = Rows.length - NoOrg;

    return (
      <BaseDialog
        Close={
          ConfirmManyBusy
            ? undefined
            : () => this.setState({ ConfirmManyOpen: false })
        }
        Title="Сонгосон хүсэлтийг баталгаажуулах"
        Width="560px"
        Height="560px"
        SaveButtonText="Баталгаажуулах"
        // Nothing to press when every selected row would be skipped.
        ShowSave={Ready > 0}
        Save={(setLoading) => {
          this.ConfirmMany().finally(() => setLoading && setLoading(false));
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: space[3] }}>
          <Alert severity="warning">
            {Ready}{" "}
            {t(
              "хүсэлтийг баталгаажуулж, эмчийн эрх үүсгэнэ. Буцаах боломжгүй.",
            )}
            {NoOrg > 0
              ? ` ${NoOrg} ${t("хүсэлтийн байгууллага жагсаалтаас сонгогдоогүй тул алгасна. Тэдгээрийг нэг бүрчлэн нээж байгууллагыг сонгоно уу.")}`
              : ""}
          </Alert>

          <FormField
            Id="confirm-many-role"
            Label={t("Эрхийн төрөл")}
            Required
            select
            disabled={ConfirmManyBusy}
            Hint={t("Бүх сонгосон хүсэлтэд нэг эрх олгоно")}
            value={ConfirmManyRole}
            onChange={(e) => this.setState({ ConfirmManyRole: e.target.value })}
          >
            {/* Same fallback as the single-request dialog: a config fetch that
                failed must not leave an empty, unusable picker. */}
            {(Roles.length
              ? Roles
              : [2, 3].map((Id) => ({ Id, Name: "Role " + Id }))
            ).map((Role) => (
              <MenuItem key={Role.Id} value={String(Role.Id)}>
                {t(Role.Name + "")}
              </MenuItem>
            ))}
          </FormField>

          <SelectedRows
            Rows={Rows}
            Note={(Row) =>
              Row.OrganizationId ? "" : t("байгууллага сонгогдоогүй - алгасна")
            }
          />
        </Box>
      </BaseDialog>
    );
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

          <SelectedRows
            Rows={Rows}
            Note={(Row) => (Row.Email ? "" : t("и-мэйлгүй"))}
          />
        </Box>
      </BaseDialog>
    );
  };

  /**
   * The bulk delete: gone means gone.
   *
   * There is no soft-delete column on this table, so the dialog names what goes
   * with the row rather than leaving the administrator to discover it - who
   * approved an account, and the reason a refused applicant is shown when they
   * try to log in. Only decided requests can reach here; a pending one has to
   * be answered first.
   */
  RenderDeleteMany = (Rows) => {
    const { t } = this.props;
    const { DeleteManyBusy } = this.state;

    return (
      <BaseDialog
        Close={
          DeleteManyBusy
            ? undefined
            : () => this.setState({ DeleteManyOpen: false })
        }
        Title="Сонгосон хүсэлтийг устгах"
        Width="560px"
        Height="520px"
        ShowDecline={true}
        DeclineButtonText="Устгах"
        DeclineIcon={DeleteOutlineIcon}
        Decline={(setLoading) => {
          this.DeleteMany().finally(() => setLoading && setLoading(false));
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: space[3] }}>
          <Alert severity="error">
            {Rows.length} {t("хүсэлтийг бүрмөсөн устгана. Буцаах боломжгүй.")}
          </Alert>
          <Typography variant="body2" sx={{ color: colors.brand.inkDim }}>
            {t(
              "Зөвшөөрсөн хүсэлтийг устгавал эрхийг хэн, хэзээ баталгаажуулсан бүртгэл үлдэхгүй. Татгалзсан хүсэлтийг устгавал хүсэлт гаргагч нэвтрэх үедээ татгалзсан шалтгаанаа харахаа болино.",
            )}
          </Typography>

          <SelectedRows Rows={Rows} />
        </Box>
      </BaseDialog>
    );
  };

  CustomRender = () => {
    const {
      Alert: AlertNode,
      Data,
      GridOption,
      Config,
      ReadMoreDialog,
      isLoading,
      StatusFilter,
      Selected,
      ConfirmManyOpen,
      DeclineManyOpen,
      DeleteManyOpen,
    } = this.state;
    const { t } = this.props;
    const Total = GridOption && GridOption.Total ? GridOption.Total : 0;
    // Belt and braces: the grid's own column filter can override the status
    // dropdown, so each bulk action judges the rows it was given, not the
    // dropdown. A selection can straddle both sets under "Бүгд".
    const SelectedPending = (Selected || []).filter(IsPendingRow);
    const SelectedDecided = (Selected || []).filter(IsDecidedRow);

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
          {AlertNode}
          {ReadMoreDialog}
          {ConfirmManyOpen ? this.RenderConfirmMany(SelectedPending) : null}
          {DeclineManyOpen ? this.RenderDeclineMany(SelectedPending) : null}
          {DeleteManyOpen ? this.RenderDeleteMany(SelectedDecided) : null}
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
                {/* Each action appears only once rows it can act on are ticked,
                    and each counts its OWN subset - under "Бүгд" a selection can
                    hold both pending and decided rows. */}
                {SelectedPending.length > 0 ? (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => this.setState({ ConfirmManyOpen: true })}
                  >
                    {t("Сонгосныг баталгаажуулах")} ({SelectedPending.length})
                  </Button>
                ) : null}
                {SelectedPending.length > 0 ? (
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
                {SelectedDecided.length > 0 ? (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => this.setState({ DeleteManyOpen: true })}
                  >
                    {t("Сонгосныг устгах")} ({SelectedDecided.length})
                  </Button>
                ) : null}
                {/* The row button is gone, so the way in has to be written
                    down somewhere the administrator will see it. */}
                <Typography
                  variant="caption"
                  sx={{ color: colors.brand.inkDim, marginLeft: "auto" }}
                >
                  {t("Мөр дээр давхар товшиж дэлгэрэнгүйг харна уу")}
                </Typography>
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
                  // Ticking rows works on every status now: approving and
                  // declining need pending rows, deleting needs decided ones.
                  HideCheck={false}
                  SelectRow={this.SelectRows}
                  // The detail popup. There is no row button any more - the
                  // action column cost more width than it was worth with ten
                  // columns already off the side of the screen.
                  ShowData={this.ReadMore}
                  FillHeight={true}
                  NoRowsText={
                    StatusFilter === "0"
                      ? t("Хүлээгдэж буй хүсэлт алга")
                      : t("Мэдээлэл олдсонгүй")
                  }
                  // One slot per column, in order, and BaseGrid only advances
                  // through them for columns it actually draws: the row number,
                  // then the ten fields. The action column's slot went with it.
                  widthPattern="50c, 130l, 130, 120, 120, 130, 200, 110, 200, 150c, 120c"
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
