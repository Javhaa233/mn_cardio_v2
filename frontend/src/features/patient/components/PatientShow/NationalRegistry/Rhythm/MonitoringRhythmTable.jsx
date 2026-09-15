import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import MonitoringRhythm from "customComponents/DetailViews/NationalRegistry/Rhythm/MonitoringRhythm";
import MonitoringRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/MonitoringRhythmForm";

import Helper from "helper";

class MonitoringRhythmTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "MonitoringRhythm",
      Config: {},
      FirstDataCheck: true,
      PatRegNo: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.DialogRef = createRef();
    this.MonitoringRhythm = createRef();
    this.MonitoringRhythmForm = createRef();
    this.MonitoringRhythmTable = createRef();
  }

  SetPatRegNo = (PatRegNo) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatRegNo",
      PatRegNo,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatRegNo }, () => this.GetData(true));
  };

  GetData = async (FirstCheck) => {
    const { ObjectName, PatRegNo } = this.state;
    if (PatRegNo) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
        (resData) => {
          if (resData && resData.Data) {
            if (resData.Data.length === 0 && FirstCheck)
              this.setState({ FirstDataCheck: true });
            else this.setState({ FirstDataCheck: false });
            this.setState({
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
          }
        },
      );
    }
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "CreatedDate",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData(false);
  };

  Refresh = () => {
    if (
      this.SearchOption.SearchField &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "CreatedDate",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    let tempView = null;
    if (data.is_confirm === "yes") {
      tempView = (
        <MonitoringRhythm
          ref={(ref) => (this.MonitoringRhythm = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <MonitoringRhythmForm
          ref={(ref) => (this.MonitoringRhythmForm = ref)}
          ObjectName="MonitoringRhythm"
          PatientRegNo={data.PatRegNo}
        />
      );
    }

    const DialogDatas = (
      <BaseDialog
        Title={this.props.Title}
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
        Save={() => {
          this.MonitoringRhythmForm.Save &&
            this.MonitoringRhythmForm.Save((Success) => {
              if (Success) {
                this.GetData(false);
                this.setState({ DialogData: null });
              } else {
                this.DialogRef.setState({ Loading: false });
              }
            });
        }}
        Confirm={() => {
          this.MonitoringRhythmForm.Confirm &&
            this.MonitoringRhythmForm.Confirm(() => {
              this.DialogRef.setState({ ConfirmLoading: false });
              this.Refresh();
              this.setState({ DialogData: null });
            });
        }}
        ShowPrint={data.is_confirm === "yes"}
        ShowConfirm={data.is_confirm !== "yes"}
        ShowSave={data.is_confirm !== "yes"}
      >
        {tempView}
      </BaseDialog>
    );
    this.setState({ DialogData: DialogDatas });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;
    const { Title, Color, WithoutCard } = this.props;

    return (
      <div style={this.props.style}>
        <div style={{ position: "relative" }}>
          {DialogData}
          {isLoading ? <DivLoading /> : null}
          <BaseTable
            Height={this.props.Height || "454px"}
            Clean={this.props.Clean}
            Title={Title || "Monitoring Rhythm"}
            headerColor={Color || "success"}
            WithoutCard={WithoutCard}
            Data={Data}
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={this.SearchOption.PageOption.Limit}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            Fields={[
              { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
              { Label: t("Баталгаажилт"), Name: "is_confirm" },
              { Label: t("Personal number"), Name: "PatRegNo" },
              { Label: t("Үзлэгийн огноо"), Name: "visit_date", Type: "Date" },
              { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
            ]}
            ColumnActions={[
              {
                Field: "is_confirm",
                Component: <IsActive />,
                onClick: (data) => {},
              },
            ]}
            widthPattern="120, 100c, 110, 100c, 100c"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  MonitoringRhythmTable,
);
