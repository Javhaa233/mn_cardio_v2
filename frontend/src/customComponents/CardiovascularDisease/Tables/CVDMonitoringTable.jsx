import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import CVDMonitoring from "customComponents/CardiovascularDisease/DetailViews/CVDMonitoring";
import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import IsActive from "customComponents/CardiovascularDisease/Tables/Columns/IsActive";
import DateStatus from "customComponents/CardiovascularDisease/DateStatus";

// helper
import Helper from "helper";

class CVDMonitoringTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "CVDMonitoring",
      Config: {},
      FirstDataCheck: true,
      PatRegNo: props.PatRegNo || null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 5 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    if (props.PatRegNo) {
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "PatRegNo",
        props.PatRegNo,
        this.SearchOption.SearchField,
        "Equals",
      );
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Status",
        ["activated", "expired", "out_control"],
        this.SearchOption.SearchField,
        "In",
      );
    }

    // refs
    this.CVDMonitoringRef = createRef();
    this.DialogRef = createRef();
  }

  componentDidMount() {
    if (this.state.PatRegNo) {
      super.componentDidMount();
    }
  }

  SetPatRegNo = (PatRegNo) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatRegNo",
      PatRegNo,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "Status",
      ["activated", "expired", "out_control"],
      this.SearchOption.SearchField,
      "In",
    );
    this.setState({ PatRegNo: PatRegNo }, () => this.GetData(true));
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
      "CreateDate",
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
        (el) => el.Field !== "CreateDate",
      );
      this.GetData(false);
    }
  };

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

  CustomRender = () => {
    const { t } = this.props;
    const {
      Data,
      DialogData,
      GridOption,
      isLoading,
      FirstDataCheck,
      PatRegNo,
    } = this.state;
    const { Title, Color, WithoutCard = false } = this.props;

    if (!PatRegNo) {
      return null;
    }

    return (
      <div style={this.props.style}>
        {!WithoutCard ? (
          <UniCard
            title={t(Title || "CVD Monitoring")}
          >
            <div style={{ position: "relative" }}>
              {DialogData}
              {isLoading ? <DivLoading /> : null}
              <BaseTable
                headerColor={Color || "success"}
                Data={Data}
                Option={GridOption}
                ChangePage={this.PageLimitChange}
                PageSize={this.SearchOption.PageOption.Limit}
                ShowData={this.ShowData}
                OrderBy={this.OrderBy}
                Search={this.SetSearchOption}
                Refresh={this.Refresh}
                WithoutCard={true}
                Height={this.props.Height || "350px"}
                Clean={this.props.Clean}
                ColumnActions={[
                  { Field: "IsActive", Component: <IsActive /> },
                  { Field: "date_status", Component: <DateStatus /> },
                ]}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  { Label: t("Гаргасан эмч"), Name: "OutDoctor.firstname" },
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
                  { Label: t("Төлөв"), Name: "IsActive" },
                  { Label: t("Хугацааны төлөв"), Name: "date_status" },
                ]}
                widthPattern="120, 120, 100c, 100c, 100c, 120c, 120c"
              />
            </div>
          </UniCard>
        ) : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              headerColor={Color || "success"}
              Data={Data}
              Option={GridOption}
              ChangePage={this.PageLimitChange}
              PageSize={this.SearchOption.PageOption.Limit}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              WithoutCard={true}
              Height={this.props.Height || "350px"}
              Clean={this.props.Clean}
              ColumnActions={[
                { Field: "IsActive", Component: <IsActive /> },
                { Field: "date_status", Component: <DateStatus /> },
              ]}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                { Label: t("Гаргасан эмч"), Name: "OutDoctor.firstname" },
                { Label: t("Авсан огноо"), Name: "StartedDate", Type: "Date" },
                { Label: t("Гаргасан огноо"), Name: "OutDate", Type: "Date" },
                { Label: t("Дуусах огноо"), Name: "ExpiredDate", Type: "Date" },
                { Label: t("Төлөв"), Name: "IsActive" },
                { Label: t("Хугацааны төлөв"), Name: "date_status" },
              ]}
              widthPattern="120, 120, 100c, 100c, 100c, 120c, 120c"
            />
          </div>
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  CVDMonitoringTable,
);
