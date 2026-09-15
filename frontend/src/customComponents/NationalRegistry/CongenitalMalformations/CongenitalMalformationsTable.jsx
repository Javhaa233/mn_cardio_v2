import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import SearchIcon from "@mui/icons-material/Search";
import ImportExportIcon from "@mui/icons-material/ImportExport";

import UniCard from "customComponents/UniCard";

import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import GridToolbar, { ToolbarField } from "customComponents/GridToolbar";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import CustomTextField from "customComponents/Forms/Components/CustomTextField";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";
import IsType from "customComponents/NationalRegistry/Components/IsType";

// views
import Neelttei from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Neelttei";
import Sudas from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Sudas";
import Katetr from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Katetr";
// helper
import Helper from "helper";

class CongenitalMalformationsTable extends BaseList {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = {
      ...this.state,
      ObjectName: "CongenitalMalformations",
      Config: {},
      DialogData: null,
    };

    this.Category = props.Category || null;
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = props.Category
      ? [{ Field: "n_category", Value: props.Category, Op: "Equals" }]
      : null;

    // refs
    this.DialogRef = createRef();
    this.NeeltteiRef = createRef();
    this.SudasRef = createRef();
    this.KatetrRef = createRef();

    this.DoctorConfig = {
      Name: "CreateUserId",
      Label: t("Эмч"),
      Config: {
        ObjectName: "DoctorsProfile",
        IdField: "id",
        TextField: "firstname",
        MinTextLength: 0,
        SearchType: "AllData",
        Fields: [
          { Name: "lastname", Label: t("Last name") },
          { Name: "firstname", Label: t("First name") },
          { Name: "telephone", Label: t("Telephone") },
        ],
      },
    };
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const { Category } = this;
    if (Category) {
      this.setState({ isLoading: true });
      const ReqData = Helper.BaseCrudHelper.GetRequestData(
        "CongenitalMalformations",
        this.SearchOption,
      );
      await Helper.BaseCrudHelper.CallService(
        "/CongenitalMalformations/GetList",
        ReqData,
        (resData) => {
          resData &&
            this.setState({ Data: resData.Data, GridOption: resData.Option });
          this.setState({ isLoading: false });
        },
      );
    }
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "CreateDate",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData();
  };

  handleDoctorChange = (Value) => {
    this.setState({ SelectedDoctorId: Value });
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "CreateUserId",
      Value,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.GetData();
  };

  Refresh = () => {};

  ShowData = (data) => {
    const category = data.n_category;

    let tempTitle = "Congenital malformation";
    let tempView = null;

    if (category === "neelttei") {
      tempTitle = "НЭЭЛТТЭЙ МЭС ЗАСАЛ";
      tempView = (
        <Neelttei ref={(ref) => (this.NeeltteiRef = ref)} DataId={data.Id} />
      );
    } else if (category === "sudsan_dotuurh") {
      tempTitle = "СУДСАН ДОТУУРХ МЭС ЗАСАЛ";
      tempView = (
        <Sudas ref={(ref) => (this.SudasRef = ref)} DataId={data.Id} />
      );
    } else if (category === "katetr") {
      tempTitle = "Катетр ангиографийн оношилгоо";
      tempView = (
        <Katetr ref={(ref) => (this.KatetrRef = ref)} DataId={data.Id} />
      );
    } else {
      /* empty */
    }

    this.setState({
      DialogData: (
        <BaseDialog
          Title={this.props.Title || "Congenital malformation"}
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
        >
          {tempView}
        </BaseDialog>
      ),
    });
  };

  HandleExportResult = (resData) => {
    const { t } = this.props;
    const Success = !!(resData && resData.Success);
    this.setState({ ExportLoading: false });
    this.ShowAlert(
      Success
        ? t("Excel file downloaded")
        : (resData && resData.Message) || t("Excel export failed"),
      Success,
    );
  };

  ExportExcel = async () => {
    const ObjectName = "CongenitalMalformations";
    this.setState({ ExportLoading: true });
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName,
        Url: "/BaseObject/ExportExcel",
        SearchOption: this.SearchOption,
        FileName:
          ObjectName + "_" + new Date().toISOString().slice(0, 10) + ".xlsx",
      },
      this.HandleExportResult,
    );
  };

  CustomRender = () => {
    const { t, color, Title } = this.props;
    const { Alert, Data, DialogData, GridOption, isLoading } = this.state;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          padding: 0,
          boxSizing: "border-box",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        {Alert}
        {DialogData}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {isLoading ? <DivLoading /> : null}
          <UniCard title={t(Title || "Congenital malformation")}>
            <div
              style={{
                marginTop: "0px",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                maxWidth: "100%",
                minWidth: 0,
              }}
            >
              <GridToolbar>
                <ToolbarField width={140}>
                  <SimpleSelect
                    ChangeValue={(Value) => {
                      if (Value !== "-1") {
                        this.SearchOption.SearchField =
                          Helper.BaseCrudHelper.SetSearchField(
                            "n_type",
                            Value,
                            this.SearchOption.SearchField,
                            "Equals",
                          );
                      } else {
                        this.SearchOption.SearchField =
                          Helper.BaseCrudHelper.SetSearchField(
                            "n_type",
                            "inactive",
                            this.SearchOption.SearchField,
                            "NotEquals",
                          );
                      }
                    }}
                    DefaultValue="-- Select --"
                    FullWidth={false}
                    Variant={"outlined"}
                    size="small"
                    Config={{
                      Name: "n_type",
                      Config: { IdField: "Value", TextField: "Value" },
                      Data: [{ Value: "Насанд хүрэгчид" }, { Value: "Хүүхэд" }],
                    }}
                  />
                </ToolbarField>
                <ToolbarField>
                  <BaseLookUpGridLoad
                    disabled={false}
                    Config={this.DoctorConfig}
                    Value={this.state.SelectedDoctorId}
                    Variant="outlined"
                    FullWidth={false}
                    size="small"
                    ChangeValue={this.handleDoctorChange}
                  />
                </ToolbarField>
                <ToolbarField>
                  <CustomTextField
                    placeholder={"Personal No"}
                    ChangeValue={(Value) => {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "PatRegNo",
                          Value,
                          this.SearchOption.SearchField,
                          "Contains",
                        );
                    }}
                  />
                </ToolbarField>
                <BaseLoadButton
                  ButtonText="Хайх"
                  Color="success"
                  Icon={SearchIcon}
                  onClick={(callback) => {
                    this.GetData();
                    callback && callback();
                  }}
                />
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
              <div
                style={{
                  flex: "1 1 auto",
                  position: "relative",
                  minHeight: 0,
                  width: "100%",
                }}
              >
                <BaseGrid
                  PK={"Id"}
                  TextLength={20}
                  FillHeight={true}
                  Fields={[
                    { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
                    { Label: t("Төрөл"), Name: "n_type" },
                    { Label: t("Personal number"), Name: "PatRegNo" },
                    { Label: t("Баталгаажилт"), Name: "is_confirm" },
                    // { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
                  ]}
                  Data={Data}
                  PageSize={20}
                  HideNumber={true}
                  HideCheck={true}
                  HideFilter={true}
                  ColumnActions={[
                    { Field: "PatRegNo", Component: <ShowPatient /> },
                    { Field: "is_confirm", Component: <IsActive /> },
                    { Field: "n_type", Component: <IsType /> },
                  ]}
                  OrderBy={this.OrderBy}
                  ChangePage={this.PageLimitChange}
                  Option={GridOption}
                  ShowData={this.ShowData}
                  SearchField={(Field, Text) => this.SearchField(Field, Text)}
                />
              </div>
            </div>
          </UniCard>
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  CongenitalMalformationsTable,
);
