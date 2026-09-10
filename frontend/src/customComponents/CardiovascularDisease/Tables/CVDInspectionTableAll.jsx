import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import SearchIcon from "@mui/icons-material/Search";
import ImportExportIcon from "@mui/icons-material/ImportExport";

import UniCard from "customComponents/UniCard";

import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import GridToolbar, { ToolbarField } from "customComponents/GridToolbar";
import CVDInspection from "customComponents/CardiovascularDisease/DetailViews/CVDInspection";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import IsActive from "customComponents/CardiovascularDisease/Tables/Columns/IsActive";
import RiskView from "customComponents/CardiovascularDisease/RiskView";

import ShowCVDInfo from "customComponents/CardiovascularDisease/ShowCVDInfo";
// import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import CustomTextField from "customComponents/CardiovascularDisease/Tables/Components/CustomTextField";

// helper
import Helper from "helper";

class CVDInspectionTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      FirstDataCheck: true,
      DialogData: null,
    };
    this.RoleId = this.LogedUser ? this.LogedUser.RoleId : null;
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.CVDInspectionRef = createRef();
    this.DialogRef = createRef();
  }

  SetPatRegNo = (PatRegNo) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatRegNo",
      PatRegNo,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatRegNo: PatRegNo }, () => this.GetData(true));
  };

  GetData = async () => {
    const { ObjectName } = this.props;
    this.setState({ isLoading: true });
    if (ObjectName) {
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
        (resData) => {
          if (resData && resData.Data)
            this.setState({
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
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
    this.GetData(false);
  };

  Refresh = () => {
    if (
      Array.isArray(this.SearchOption.SearchField) &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "CreateDate",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Height="300px"
        >
          <CVDInspection
            ref={(ref) => (this.CVDInspectionRef = ref)}
            DataId={data.Id}
            ObjectName="vwCVDInspection"
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
    const ObjectName = this.props.ObjectName;
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
          <UniCard title={t("ЗСЭ үзлэгийн түүх")}>
            <GridToolbar>
              {this.RoleId &&
                (parseInt(this.RoleId) === 1 ||
                  parseInt(this.RoleId) === 6) && (
                  <ToolbarField>
                    <BaseLookUpGridLoad
                      disabled={true}
                      Config={{
                        Name: "CreateUserId",
                        Label: t("Үзлэгийн эмч"),
                        Config: {
                          ObjectName: "DoctorsProfile",
                          IdField: "id",
                          TextField: "firstname",
                          MinTextLength: 0,
                          SearchType: "AllData",
                          Fields: [
                            { Name: "lastname", Label: t("Last name") },
                            { Name: "firstname", Label: t("First name") },
                            {
                              Name: "personal_number",
                              Label: t("Personal number"),
                            },
                          ],
                        },
                      }}
                      ChangeValue={(Value) => {
                        this.SearchOption.SearchField =
                          Helper.BaseCrudHelper.SetSearchField(
                            "CreateUserId",
                            Value,
                            this.SearchOption.SearchField,
                            "Equals",
                          );
                      }}
                      Variant="outlined"
                      FullWidth={false}
                      size="small"
                    />
                  </ToolbarField>
                )}
              {this.RoleId &&
                (parseInt(this.RoleId) === 1 ||
                  parseInt(this.RoleId) === 6) && (
                  <ToolbarField>
                    <BaseLookUpGridLoad
                      disabled={true}
                      Config={{
                        Name: "MonitoringUserId",
                        Label: t("Хяналтын эмч"),
                        Config: {
                          ObjectName: "DoctorsProfile",
                          IdField: "id",
                          TextField: "firstname",
                          MinTextLength: 0,
                          SearchType: "AllData",
                          Fields: [
                            { Name: "lastname", Label: t("Last name") },
                            { Name: "firstname", Label: t("First name") },
                            {
                              Name: "personal_number",
                              Label: t("Personal number"),
                            },
                          ],
                        },
                      }}
                      ChangeValue={(Value) => {
                        this.SearchOption.SearchField =
                          Helper.BaseCrudHelper.SetSearchField(
                            "MonitoringUserId",
                            Value,
                            this.SearchOption.SearchField,
                            "Equals",
                          );
                      }}
                      Variant="outlined"
                      FullWidth={false}
                      size="small"
                    />
                  </ToolbarField>
                )}
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
                onClick={async (callback) => {
                  await this.GetData();
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
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              <BaseGrid
                PK={"Id"}
                TextLength={20}
                FillHeight={true}
                Data={Data}
                PageSize={20}
                HideNumber={true}
                HideCheck={true}
                HideFilter={true}
                ColumnActions={[
                  { Field: "PatRegNo", Component: <ShowCVDInfo /> },
                  { Field: "Status", Component: <IsActive /> },
                  { Field: "Risk", Component: <RiskView /> },
                ]}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  {
                    Label: t("Хяналтын эмч"),
                    Name: "MontoringDoctor.firstname",
                  },
                  { Label: t("Personal number"), Name: "PatRegNo" },
                  { Label: t("Эрсдлийн үнэлгээ"), Name: "Risk" },
                  { Label: t("Эрсдлийн оноо"), Name: "Score" },
                  {
                    Label: t("Үзлэг хийсэн огноо"),
                    Name: "CreateDate",
                    Type: "Date",
                  },
                  {
                    Label: t("Хяналтанд орсон огноо"),
                    Name: "StartedDate",
                    Type: "Date",
                  },
                ]}
                OrderBy={this.OrderBy}
                ChangePage={this.PageLimitChange}
                Option={GridOption}
                ShowData={this.ShowData}
                widthPattern="120, 120, 120, 150c, 80r, 120c, 120c"
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
  CVDInspectionTable,
);
