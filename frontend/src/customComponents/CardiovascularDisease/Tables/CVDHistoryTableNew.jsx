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

import IsActive from "customComponents/CardiovascularDisease/Tables/Columns/IsActive";
import DateStatus from "customComponents/CardiovascularDisease/DateStatus";
import ShowCVDInfo from "customComponents/CardiovascularDisease/ShowCVDInfo";
import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoadButton from "customComponents/BaseLoadButton";
import CVDMonitoring from "customComponents/CardiovascularDisease/DetailViews/CVDMonitoring";
import CustomTextField from "customComponents/CardiovascularDisease/Tables/Components/CustomTextField";
// helper
import Helper from "helper";

class CVDHistoryTableNew extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Config: {}, DialogData: null };
    this.ModifyObject = {};
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "Status",
      "inactive",
      this.SearchOption.SearchField,
      "NotEquals",
    );

    // refs
    this.CVDMonitoringRef = createRef();
    this.DialogRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    this.setState({ isLoading: true });
    const ReqData = Helper.BaseCrudHelper.GetRequestData(
      "CVDMonitoring",
      this.SearchOption,
    );
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetList",
      ReqData,
      (resData) => {
        if (resData && resData.Data) {
          this.setState({
            Data: resData.Data,
            GridOption: resData.Option,
            isLoading: false,
          });
        }
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

  Refresh = () => {};

  ShowData = (data) => {
    const DialogDatas = (
      <BaseDialog
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
      >
        <CVDMonitoring
          ref={(ref) => (this.CVDMonitoringRef = ref)}
          DataId={data.Id}
          ObjectName="CVDMonitoring"
        />
      </BaseDialog>
    );
    this.setState({ DialogData: DialogDatas });
  };

  GetConfigField = (FieldName) => {
    var Field = Helper.BaseCrudHelper.GetConfigField(FieldName, this.Fields);
    return Field;
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
    const ObjectName = "CVDMonitoring";
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
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        {Alert}
        {DialogData}
        <div
          style={{
            position: "relative",
            flex: "1 1 auto",
            minHeight: 0,
            width: "100%",
            maxWidth: "100%",
            padding: 0,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isLoading ? <DivLoading /> : null}
          <UniCard title={t("Зүрх судасны өвчний хяналт")} padding={15}>
            <GridToolbar>
              {/* Inline label + select: the default 170px left "-- Сонгох --"
                  under the caret. */}
              <ToolbarField width={250}>
                <SimpleSelect
                  Label={t("Хугацаа төлөв")}
                  ChangeValue={(Value) => {
                    if (Value !== "-1") {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "date_status",
                          Value,
                          this.SearchOption.SearchField,
                          "Equals",
                        );
                    } else {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "date_status",
                          "inactive",
                          this.SearchOption.SearchField,
                          "NotEquals",
                        );
                    }
                  }}
                  DefaultValue="-- Select --"
                  FullWidth={true}
                  Variant={"outlined"}
                  Config={{
                    Name: "date_status",
                    Config: { IdField: "Value", TextField: "Label" },
                    Data: [
                      { Label: t("Хэвийн"), Value: "simple" },
                      { Label: t("Хугацаа тулсан"), Value: "date_warning" },
                      { Label: t("Хугацаа дууссан"), Value: "date_expired" },
                    ],
                  }}
                />
              </ToolbarField>
              <ToolbarField width={230}>
                <SimpleSelect
                  Label={t("Төлөв")}
                  ChangeValue={(Value) => {
                    if (Value !== "-1") {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "Status",
                          Value,
                          this.SearchOption.SearchField,
                          "Equals",
                        );
                    } else {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "Status",
                          null,
                          this.SearchOption.SearchField,
                          "NotEquals",
                        );
                    }
                  }}
                  DefaultValue="-- Select --"
                  FullWidth={true}
                  Variant={"outlined"}
                  Config={{
                    Name: "Status",
                    Config: { IdField: "Value", TextField: "Label" },
                    Data: [
                      { Label: t("Идэвхитэй"), Value: "activated" },
                      { Label: t("Хяналтнаас гарсан"), Value: "out_control" },
                      { Label: t("Үзлэгт хамрагдсан"), Value: "expired" },
                    ],
                  }}
                  Value={"activated"}
                />
              </ToolbarField>
              <ToolbarField>
                <CustomTextField
                  Label={t("Personal No")}
                  placeholder={"Personal No"}
                  FullWidth={true}
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
                minHeight: "400px",
                minWidth: 0,
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <BaseGrid
                PK={"Id"}
                TextLength={20}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
                  { Label: t("Гаргасан эмч"), Name: "OutDoctor.FullName" },
                  { Label: t("Personal number"), Name: "PatRegNo" },
                  { Label: t("Last name"), Name: "Patient.p_lastname" },
                  { Label: t("First name"), Name: "Patient.p_firstname" },
                  { Label: t("Эрсдлийн үнэлгээ"), Name: "Risk" },
                  { Label: t("Status"), Name: "Status" },
                  { Label: t("Хугацаа төлөв"), Name: "date_status" },
                  {
                    Label: t("Үзлэгт хамрагдсан огноо"),
                    Name: "CreateDate",
                    Type: "Date",
                  },
                  {
                    Label: t("Авсан огноо"),
                    Name: "StartedDate",
                    Type: "Date",
                  },
                  { Label: t("Гаргасан огноо"), Name: "OutDate", Type: "Date" },
                  {
                    Label: t("Дуусах огноо"),
                    Name: "ExpiredDate",
                    Type: "Date",
                  },
                ]}
                Data={Data}
                PageSize={20}
                HideNumber={true}
                HideCheck={true}
                HideFilter={true}
                widthPattern="150, 150, 100l, 120, 120, 50c, 140l, 120c, 140c, 120c, 120c, 120c"
                ColumnActions={[
                  { Field: "PatRegNo", Component: <ShowCVDInfo /> },
                  { Field: "Status", Component: <IsActive /> },
                  { Field: "date_status", Component: <DateStatus /> },
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
  CVDHistoryTableNew,
);
