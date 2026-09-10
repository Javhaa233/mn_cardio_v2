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
import CustomTextField from "customComponents/Forms/Components/CustomTextField";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import BaseLoadButton from "customComponents/BaseLoadButton";
import RangeDate from "customComponents/RangeDate";

import TenderForm from "customComponents/Forms/NationalRegistry/Surgery/TenderForm";
import TenderFormPrint from "customComponents/Report/TenderFormPrint";
import {
  TENDER_FORM_GROUPS,
  TENDER_FORMS_ACTIVE,
  TenderFormLabel,
} from "customComponents/Forms/NationalRegistry/Surgery/tenderForms";

import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import RowAction from "baseComponents/BaseGrid/RowActionButton";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import LockIcon from "@mui/icons-material/Lock";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import DescriptionIcon from "@mui/icons-material/Description";

import { colors } from "@/theme/colors";
import Helper from "helper";

/** the record's lock state, as words rather than as 0 and 1 */
function StatusCell({ rowdata, t }) {
  const done = rowdata && rowdata.Status + "" === "1";
  return (
    <span
      style={{ color: done ? colors.status.normal : colors.text.secondary }}
    >
      {done ? t("Баталгаажсан") : t("Ноорог")}
    </span>
  );
}

/**
 * The unified register — upgrade tender rows §101, §102 and §103.
 *
 * §101 wants every form in groups 1-4 reachable from one menu, §102 wants one
 * search across patient, date, doctor and form type, and §103 wants the result
 * exported to .xlsx and .txt carrying source marking.
 *
 * It reads TenderFormData directly rather than the per-form views: the views
 * project one form's answers into columns, which is the wrong shape here. What
 * a cross-form list needs is the columns every form shares, and those are real
 * columns on the table, so this is a ModelConfig and no new SQL.
 *
 * Opening a row hands the row's own FormCode to the same form component the
 * per-form screens use, so a record opens in its own form whichever list it was
 * found from.
 */
class TenderFormAllTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DialogData: null,
      SearchReg: "",
      SearchForm: "",
      SearchDoctor: "",
      SearchAnswer: "",
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "FormDate", Type: "desc" };
  }

  /**
   * Rebuild the whole filter set from the boxes on screen.
   *
   * Written as one function rather than as five handlers each appending to
   * SearchOption, because appending leaves stale clauses behind when a box is
   * cleared - the classic "I deleted the text and it still filters" bug.
   */
  ApplySearch = () => {
    const {
      SearchReg,
      SearchForm,
      SearchDoctor,
      SearchAnswer,
      DateFrom,
      DateTo,
    } = this.state;

    const Fields = [];
    if (SearchReg)
      Fields.push({ Field: "PatRegNo", Value: SearchReg, Op: "Contains" });
    if (SearchForm)
      Fields.push({ Field: "FormCode", Value: SearchForm, Op: "Equals" });
    if (SearchDoctor)
      Fields.push({
        Field: "DoctorsProfile.FullName",
        Value: SearchDoctor,
        Op: "Contains",
      });
    // Looks inside the JSON answers, so a term that lives in a different field
    // on every form - a diagnosis, say - is still findable without the user
    // knowing which field code holds it on which form.
    if (SearchAnswer)
      Fields.push({ Field: "Data", Value: SearchAnswer, Op: "Contains" });
    // ModelHelper understands Contains, Equals, Between, In and NotEquals -
    // there is no greater/less, so a one-sided range is not expressible and
    // both ends are required.
    if (DateFrom && DateTo)
      Fields.push({
        Field: "FormDate",
        Value: [DateFrom, DateTo],
        Op: "Between",
      });

    // Anything the grid's own column filters put there is kept. Rebuilding the
    // whole array would silently drop a column filter the moment a toolbar box
    // changed, which reads as the filter having been ignored.
    const Managed = [
      "PatRegNo",
      "FormCode",
      "DoctorsProfile.FullName",
      "Data",
      "FormDate",
    ];
    const FromGrid = (this.SearchOption.SearchField || []).filter(
      (f) => f && Managed.indexOf(f.Field) === -1,
    );

    this.SearchOption.SearchField = FromGrid.concat(Fields);
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    this.GetData();
  };

  HandleExportResult = (resData) => {
    const { t } = this.props;
    const Success = !!(resData && resData.Success);
    this.ShowAlert(
      Success ? t("Файл татагдлаа") : t("Экспорт амжилтгүй боллоо"),
      Success,
    );
  };

  ExportFileName = (ext) =>
    "Маягтын_нэгдсэн_бүртгэл_" +
    new Date().toISOString().slice(0, 10) +
    "." +
    ext;

  ExportExcel = async () => {
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName: "TenderFormData",
        Url: "/BaseObject/ExportExcel",
        SearchOption: this.SearchOption,
        FileName: this.ExportFileName("xlsx"),
      },
      this.HandleExportResult,
    );
  };

  ExportText = async () => {
    await Helper.BaseCrudHelper.ExportText(
      {
        ObjectName: "TenderFormData",
        SearchOption: this.SearchOption,
        FileName: this.ExportFileName("txt"),
      },
      this.HandleExportResult,
    );
  };

  OpenForm = (row) => {
    const { t } = this.props;
    if (!row || !row.FormCode) return;
    const FormRef = React.createRef();
    const Title = t(TenderFormLabel(row.FormCode));

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
          Title={Title}
          MaxWidth="md"
          ShowSave={true}
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
            FormNo={row.FormCode}
            DataId={row.Id}
            PatientRegNo={row.PatRegNo}
          />
        </BaseDialog>
      ),
    });
  };

  OpenPrint = (row) => {
    const { t } = this.props;
    if (!row || !row.FormCode) return;
    this.setState({
      DialogData: (
        <BaseDialog
          Close={() => this.setState({ DialogData: null })}
          Title={t(TenderFormLabel(row.FormCode))}
          MaxWidth="lg"
          ShowSave={false}
        >
          <TenderFormPrint
            FormCode={row.FormCode}
            DataId={row.Id}
            PatRegNo={row.PatRegNo}
          />
        </BaseDialog>
      ),
    });
  };

  ConfirmRow = (row) => {
    const { t } = this.props;
    if (!row || !row.Id) return;
    if (row.Status + "" === "1") {
      this.ShowAlert(t("Энэ бүртгэл аль хэдийн баталгаажсан байна"), false);
      return;
    }
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
   * Soft delete — rec_status 2, so the record stops appearing everywhere at
   * once without being destroyed. The server refuses on a confirmed record, so
   * that case is caught here first and says so plainly.
   */
  DeleteRow = (row) => {
    const { t } = this.props;
    if (!row || !row.Id) return;
    if (row.Status + "" === "1") {
      this.ShowAlert(t("Баталгаажсан бүртгэлийг устгах боломжгүй"), false);
      return;
    }
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

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, isLoading, Alert } = this.state;

    return (
      <div style={{ width: "100%" }}>
        {Alert}
        {DialogData}
        <GridContainer>
          <GridItem xs={12} md={12}>
            {isLoading ? <DivLoading /> : null}
            <UniCard title={t("Маягтын нэгдсэн бүртгэл")}>
              <GridToolbar>
                <ToolbarField width={240}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("Маягтын төрөл")}
                    value={this.state.SearchForm}
                    onChange={(e) =>
                      this.setState(
                        { SearchForm: e.target.value },
                        this.ApplySearch,
                      )
                    }
                  >
                    <MenuItem value="">{t("Бүх маягт")}</MenuItem>
                    {TENDER_FORM_GROUPS.map((g) => [
                      <MenuItem
                        key={g.code}
                        disabled
                        style={{ opacity: 0.7, fontSize: 12 }}
                      >
                        {t(g.label)}
                      </MenuItem>,
                      ...g.forms
                        .filter((f) => f.disabled !== true)
                        .map((f) => (
                          <MenuItem key={f.no} value={f.no}>
                            {f.no} — {t(f.label)}
                          </MenuItem>
                        )),
                    ])}
                  </TextField>
                </ToolbarField>
                <ToolbarField>
                  <CustomTextField
                    Label={t("Регистрийн дугаар")}
                    Value={this.state.SearchReg}
                    ChangeValue={(value) =>
                      this.setState({ SearchReg: value }, this.ApplySearch)
                    }
                  />
                </ToolbarField>
                <ToolbarField>
                  <CustomTextField
                    Label={t("Эмч")}
                    Value={this.state.SearchDoctor}
                    ChangeValue={(value) =>
                      this.setState({ SearchDoctor: value }, this.ApplySearch)
                    }
                  />
                </ToolbarField>
                <ToolbarField>
                  <CustomTextField
                    Label={t("Хариултаас хайх")}
                    Value={this.state.SearchAnswer}
                    ChangeValue={(value) =>
                      this.setState({ SearchAnswer: value }, this.ApplySearch)
                    }
                  />
                </ToolbarField>
                <RangeDate
                  ChangeValue={(start, end) =>
                    this.setState(
                      { DateFrom: start, DateTo: end },
                      this.ApplySearch,
                    )
                  }
                />
                <BaseLoadButton
                  ButtonText="Excel"
                  Color="info"
                  Icon={ImportExportIcon}
                  onClick={async (callback) => {
                    await this.ExportExcel();
                    callback && callback();
                  }}
                />
                <BaseLoadButton
                  ButtonText="Текст (.txt)"
                  Color="info"
                  Icon={DescriptionIcon}
                  onClick={async (callback) => {
                    await this.ExportText();
                    callback && callback();
                  }}
                />
              </GridToolbar>

              {!isLoading && (!Data || Data.length === 0) ? (
                <BaseNoData Text="Бүртгэл олдсонгүй" />
              ) : (
                <BaseGrid
                  PK={"Id"}
                  TextLength={40}
                  Fields={[
                    { Label: t("Маягт"), Name: "FormCode" },
                    { Label: t("Маягтын нэр"), Name: "TenderForm.NameMn" },
                    { Label: t("Регистрийн дугаар"), Name: "PatRegNo" },
                    { Label: t("Овог"), Name: "Patient.p_lastname" },
                    { Label: t("Нэр"), Name: "Patient.p_firstname" },
                    { Label: t("Огноо"), Name: "FormDate", Type: "Date" },
                    { Label: t("Эмч"), Name: "DoctorsProfile.FullName" },
                    { Label: t("Төлөв"), Name: "Status" },
                  ]}
                  Data={Data}
                  PageSize={20}
                  HideNumber={true}
                  HideCheck={true}
                  HideFilter={true}
                  ColumnActions={[
                    { Field: "PatRegNo", Component: <ShowPatient /> },
                    { Field: "Status", Component: <StatusCell t={t} /> },
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

              <div
                style={{
                  fontSize: 11.5,
                  color: colors.text.secondary,
                  padding: "6px 2px 0",
                }}
              >
                {t("Нийт маягт")}: {TENDER_FORMS_ACTIVE.length}
              </div>
            </UniCard>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation()(TenderFormAllTable);
