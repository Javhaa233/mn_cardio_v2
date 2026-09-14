import React from "react";
import { withTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";

import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import GridToolbar, { ToolbarField } from "customComponents/GridToolbar";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseNoData from "customComponents/BaseNoData";
import { colors } from "@/theme/colors";
import CustomTextField from "customComponents/Forms/Components/CustomTextField";
import ShowPatient from "customComponents/FieldActions/ShowPatient";

import TenderForm from "customComponents/Forms/NationalRegistry/Surgery/TenderForm";
import TenderFormPrint from "customComponents/Report/TenderFormPrint";

import BaseLoadButton from "customComponents/BaseLoadButton";

import RowAction from "baseComponents/BaseGrid/RowActionButton";

import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import LockIcon from "@mui/icons-material/Lock";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImportExportIcon from "@mui/icons-material/ImportExport";

import Helper from "helper";

/**
 * Renders a coded answer through its option label, so the grid shows "Тийм"
 * rather than the stored "y". BaseGrid clones this with `rowdata` and
 * `fieldName`; the option list comes from the same dictionary the form uses.
 */
function CodedValue({ rowdata, fieldName, options, t }) {
  const raw = rowdata ? rowdata[fieldName] : undefined;
  if (raw === undefined || raw === null || raw === "") return <span>—</span>;
  const hit = (options || []).find((o) => o.Value + "" === raw + "");
  return <span>{hit ? t(hit.Label + "") : raw + ""}</span>;
}

/**
 * List screen for any tender phase-4 form.
 *
 * Reads from the generated per-form view (vwForm_1_1, vwForm_1_6, ...), so
 * search, sort, paging and Excel export come from the generic /BaseObject
 * controller. Nothing here is form-specific: the form is chosen by the
 * FormCode prop, and the extra grid columns come from whichever dictionary
 * fields are flagged IsSearchable.
 */
class TenderFormTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DialogData: null,
      FormTitle: "",
      ExtraColumns: [],
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
  }

  componentDidMount() {
    super.componentDidMount && super.componentDidMount();
    this.LoadFormMeta();
  }

  /** grid columns beyond the fixed ones come from the dictionary */
  LoadFormMeta = async () => {
    const { FormCode } = this.props;
    if (!FormCode) return;
    await Helper.BaseCrudHelper.CallService(
      "/TenderForm/GetConfig",
      { FormCode },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          const fields = (resData.Data.Fields || []).flat();
          this.setState({
            FormTitle: resData.Data.TitleObject
              ? resData.Data.TitleObject.Title
              : "",
            ExtraColumns: fields
              .filter((f) => f.IsSearchable)
              .slice(0, 4)
              .map((f) => ({
                Label: f.Label,
                Name: f.Name,
                Data: f.Data || null,
              })),
          });
        }
      },
    );
  };

  HandleExportResult = (resData) => {
    const { t } = this.props;
    const Success = !!(resData && resData.Success);
    this.ShowAlert(
      Success
        ? t("Excel файл татагдлаа")
        : (resData && resData.Message) || t("Excel экспорт амжилтгүй боллоо"),
      Success,
    );
  };

  /**
   * Exports the current search, not the whole table - SearchOption carries the
   * register-number box and every column filter, so what is exported is what is
   * on screen. Nothing form-specific is needed: the generated per-form view is
   * a registered ObjectName, so /BaseObject/ExportExcel already serves it, and
   * that endpoint stamps the sheet with organisation, database, form, timestamp
   * and user, which the tender requires of every export.
   */
  ExportExcel = async () => {
    const { t, ObjectName, FormCode } = this.props;
    if (!ObjectName) {
      this.ShowAlert(t("Excel экспорт амжилтгүй боллоо"), false);
      return;
    }
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName,
        Url: "/BaseObject/ExportExcel",
        SearchOption: this.SearchOption,
        FileName:
          "Маягт_" +
          (FormCode || "").replace(".", "_") +
          "_" +
          new Date().toISOString().slice(0, 10) +
          ".xlsx",
      },
      this.HandleExportResult,
    );
  };

  OpenForm = (row) => {
    const { FormCode, t } = this.props;
    const { FormTitle } = this.state;
    const FormRef = React.createRef();

    // Closing with unsaved answers asks first; the draft is kept either way.
    const TryClose = () => {
      const form = FormRef.current;
      if (!form || !form.HasUnsaved || !form.HasUnsaved()) {
        this.setState({ DialogData: null });
        return;
      }
      form.FlushDraft && form.FlushDraft();
      this.setState({
        Alert: Helper.BaseCrudHelper.ShowConfirm(
          t(
            "Хадгалагдаагүй өөрчлөлт байна. Хаавал ноорогт хадгалагдах бөгөөд дараа нь сэргээх боломжтой. Хаах уу?",
          ),
          () => this.setState({ Alert: null, DialogData: null }),
          () => this.setState({ Alert: null }),
        ),
      });
    };

    this.setState({
      DialogData: (
        <BaseDialog
          Close={TryClose}
          Title={FormTitle}
          MaxWidth="md"
          // A confirmed record is locked (tender 3.1 L8599-8605): no footer
          // Save. The form's own bar offers "new record from previous".
          ShowSave={!(row && row.Status === 1)}
          Save={(stopLoading) => {
            if (FormRef.current && FormRef.current.Save) {
              FormRef.current.Save((ok) => {
                stopLoading && stopLoading();
                if (ok) this.GetData();
              });
            } else stopLoading && stopLoading();
          }}
        >
          <TenderForm
            ref={FormRef}
            FormNo={FormCode}
            DataId={row ? row.Id : null}
            PatientRegNo={row ? row.PatRegNo : null}
          />
        </BaseDialog>
      ),
    });
  };

  /**
   * Lock a completed record (TenderFormData.Status = 1).
   *
   * This used to sit next to Save inside the form, which meant a doctor had to
   * press two buttons to finish one form. It is a different act by a different
   * person — asserting that a record is complete — so it belongs on the list,
   * not in the middle of data entry. Save now runs the required-field check on
   * its own.
   */
  ConfirmRow = (row) => {
    const { t } = this.props;
    if (!row || !row.Id) return;
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowConfirm(
        t("Энэ бүртгэлийг баталгаажуулах уу? Дараа нь засах боломжгүй болно."),
        async () => {
          this.setState({ Alert: null });
          await Helper.BaseCrudHelper.CallService(
            "/TenderForm/Confirm",
            { Id: row.Id },
            (resData) => {
              const ok = !!(resData && resData.Success);
              this.ShowAlert(
                (resData && resData.Message) ||
                  t("Баталгаажуулахад алдаа гарлаа"),
                ok,
              );
              if (ok) this.GetData();
            },
          );
        },
        () => this.setState({ Alert: null }),
      ),
    });
  };

  /**
   * Soft delete — the record stops appearing but nothing is destroyed.
   *
   * A form filed against the wrong patient has to be retractable, and until now
   * there was no way to retract one at all. The server refuses to delete a
   * confirmed record, so the wording says what will happen rather than
   * promising something it cannot do.
   */
  DeleteRow = (row) => {
    const { t } = this.props;
    if (!row || !row.Id) return;
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowConfirm(
        t("Энэ бүртгэлийг устгах уу?"),
        async () => {
          this.setState({ Alert: null });
          await Helper.BaseCrudHelper.CallService(
            "/TenderForm/Delete",
            { Id: row.Id },
            (resData) => {
              const ok = !!(resData && resData.Success);
              this.ShowAlert(
                (resData && resData.Message) || t("Устгахад алдаа гарлаа"),
                ok,
              );
              if (ok) this.GetData();
            },
          );
        },
        () => this.setState({ Alert: null }),
      ),
    });
  };

  OpenPrint = (row) => {
    const { FormCode } = this.props;
    const { FormTitle } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          Close={() => this.setState({ DialogData: null })}
          Title={FormTitle}
          MaxWidth="lg"
          ShowSave={false}
        >
          <TenderFormPrint
            FormCode={FormCode}
            DataId={row.Id}
            PatRegNo={row.PatRegNo}
          />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { t, FormCode } = this.props;
    const { Data, DialogData, isLoading, FormTitle, ExtraColumns } = this.state;

    return (
      <div style={{ width: "100%" }}>
        {/* BaseList.render() returns CustomRender() alone, so state.Alert is
            only ever shown if the subclass renders it. Without this line every
            alert this screen raises - export finished, export failed, close
            with unsaved answers - is set into state and never seen. */}
        {this.state.Alert}
        {DialogData}
        <GridContainer>
          <GridItem xs={12} md={12}>
            {isLoading ? <DivLoading /> : null}
            <UniCard title={FormTitle || ""}>
              <GridToolbar>
                <ToolbarField width={280}>
                  <CustomTextField
                    Label={t("Регистрийн дугаараар хайх")}
                    Value={this.state.SearchReg || ""}
                    ChangeValue={(value) => {
                      this.setState({ SearchReg: value });
                      this.SearchOption.SearchField = value
                        ? [{ Field: "PatRegNo", Value: value, Op: "Contains" }]
                        : [];
                      this.SearchOption.PageOption = {
                        ...(this.SearchOption.PageOption || {}),
                        Page: 0,
                      };
                      this.GetData();
                    }}
                  />
                </ToolbarField>
                <BaseLoadButton
                  ButtonText="Экспорт"
                  Color="info"
                  Icon={ImportExportIcon}
                  onClick={async (callback) => {
                    await this.ExportExcel();
                    callback && callback();
                  }}
                />
              </GridToolbar>

              {/* Tender item 5 asks for search on these lists. BaseGrid draws a
                  filter box per column but only queries when a SearchField
                  handler is supplied - without one the boxes accept typing and
                  silently do nothing, which is what every list did before. */}
              {!isLoading && (!Data || Data.length === 0) ? (
                // An empty result is information, not an error: neutral
                // brand colours rather than BaseNoData's salmon default.
                <BaseNoData
                  Text="Бүртгэл олдсонгүй"
                  BgColor={colors.brand.cyan}
                  IconColor={colors.brand.cyanInk}
                />
              ) : (
                <BaseGrid
                  PK={"Id"}
                  TextLength={30}
                  Fields={[
                    { Label: t("Регистрийн дугаар"), Name: "PatRegNo" },
                    { Label: t("Огноо"), Name: "FormDate", Type: "Date" },
                    ...ExtraColumns.map((c) => ({
                      Label: t(c.Label),
                      Name: c.Name,
                    })),
                  ]}
                  Data={Data}
                  PageSize={20}
                  HideNumber={true}
                  HideCheck={true}
                  HideFilter={true}
                  ColumnActions={[
                    { Field: "PatRegNo", Component: <ShowPatient /> },
                    ...ExtraColumns.filter((c) => c.Data && c.Data.length).map(
                      (c) => ({
                        Field: c.Name,
                        Component: <CodedValue options={c.Data} t={t} />,
                      }),
                    ),
                  ]}
                  RowActions={[
                    {
                      Component: (
                        <RowAction
                          label={t("Засах")}
                          icon={<EditIcon fontSize="small" />}
                          run={(row) => this.OpenForm(row)}
                        />
                      ),
                    },
                    {
                      Component: (
                        <RowAction
                          label={t("Хэвлэх")}
                          icon={<PrintIcon fontSize="small" />}
                          run={(row) => this.OpenPrint(row)}
                        />
                      ),
                    },
                    {
                      Component: (
                        <RowAction
                          label={t("Баталгаажуулах")}
                          icon={<LockIcon fontSize="small" />}
                          run={(row) => this.ConfirmRow(row)}
                        />
                      ),
                    },
                    {
                      Component: (
                        <RowAction
                          label={t("Устгах")}
                          icon={<DeleteOutlineIcon fontSize="small" />}
                          danger={true}
                          run={(row) => this.DeleteRow(row)}
                        />
                      ),
                    },
                  ]}
                  SearchField={(Field, Text) => this.SearchField(Field, Text)}
                  SortChange={(Field, Type) => this.SortChange(Field, Type)}
                  PageChange={(Page) => this.PageChange(Page)}
                />
              )}
            </UniCard>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation()(TenderFormTable);
