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
// import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import CustomTextField from "customComponents/Forms/Components/CustomTextField";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import MonitoringRhythm from "customComponents/DetailViews/NationalRegistry/Rhythm/MonitoringRhythm";

// helper
import Helper from "helper";

class MonitoringRhythmTable extends BaseList {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = {
      ...this.state,
      ObjectName: "MonitoringRhythm",
      Config: {},
      DialogData: null,
    };

    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.MonitoringRhythmRef = createRef();
    this.DialogRef = createRef();

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
    this.setState({ isLoading: true });
    const ReqData = Helper.BaseCrudHelper.GetRequestData(
      "MonitoringRhythm",
      this.SearchOption,
    );
    await Helper.BaseCrudHelper.CallService(
      "/MonitoringRhythm/GetList",
      ReqData,
      (resData) => {
        resData &&
          this.setState({ Data: resData.Data, GridOption: resData.Option });
        this.setState({ isLoading: false });
      },
    );
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
    this.setState({
      DialogData: (
        <BaseDialog
          Title="Хэм алдагдлын хяналт"
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
        >
          <MonitoringRhythm
            ref={(ref) => (this.MonitoringRhythmRef = ref)}
            DataId={data.Id}
          />
        </BaseDialog>
      ),
    });
  };

  HandleExportResult = (resData) => {
    const { t } = this.props;
    const Success = !!(resData && resData.Success);
    this.ShowAlert(
      Success
        ? t("Excel file downloaded")
        : (resData && resData.Message) || t("Excel export failed"),
      Success,
    );
  };

  ExportExcel = async () => {
    const ObjectName = "MonitoringRhythm";
    if (!ObjectName) {
      const { t } = this.props;
      this.ShowAlert(t("Excel export failed"), false);
      return;
    }
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
    const { t } = this.props;
    const { Alert, Data, DialogData, GridOption, isLoading } = this.state;

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {Alert}
        {DialogData}
        <div
          style={{
            position: "relative",
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          {isLoading ? <DivLoading /> : null}
          <UniCard title={t("Хэм алдагдлын хяналт")} padding={15}>
            <GridToolbar>
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
                  // Label={"Personal No"}
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
                minHeight: 0,
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <BaseGrid
                PK={"Id"}
                TextLength={20}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
                  { Label: t("Personal number"), Name: "PatRegNo" },
                  { Label: t("Баталгаажилт"), Name: "is_confirm" },
                  //  { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
                ]}
                Data={Data}
                PageSize={20}
                HideNumber={true}
                HideCheck={true}
                HideFilter={true}
                ColumnActions={[
                  { Field: "PatRegNo", Component: <ShowPatient /> },
                  { Field: "is_confirm", Component: <IsActive /> },
                ]}
                OrderBy={this.OrderBy}
                ChangePage={this.PageLimitChange}
                Option={GridOption}
                ShowData={this.ShowData}
                FillHeight={true}
                SearchField={(Field, Text) => this.SearchField(Field, Text)}
              />
            </div>
          </UniCard>
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  MonitoringRhythmTable,
);
