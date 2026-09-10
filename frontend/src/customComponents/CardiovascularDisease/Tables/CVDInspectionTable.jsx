import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import CVDInspection from "customComponents/CardiovascularDisease/DetailViews/CVDInspection";
import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
// import IsActive from "customComponents/CardiovascularDisease/Tables/Columns/IsActive";
import RiskView from "customComponents/CardiovascularDisease/RiskView";

// helper
import Helper from "helper";

class CVDInspectionTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "vwCVDInspection",
      Config: {},
      PatRegNo: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 5 };
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

  GetData = async (FirstCheck) => {
    const { ObjectName, PatRegNo } = this.state;
    if (PatRegNo) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
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

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, PatRegNo } = this.state;

    if (!PatRegNo) {
      return null;
    }

    return (
      <div style={this.props.style}>
        <UniCard title="Үзлэг">
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              headerColor="rose"
              Data={Data}
              Option={GridOption}
              ChangePage={this.PageLimitChange}
              PageSize={this.SearchOption.PageOption.Limit}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              WithoutCard={true}
              Height="350px"
              ColumnActions={[{ Field: "Risk", Component: <RiskView /> }]}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                { Label: t("Эрсдлийн үнэлгээ"), Name: "Risk" },
                {
                  Label: t("Үзлэг хийсэн огноо"),
                  Name: "CreateDate",
                  Type: "Date",
                },
              ]}
            />
          </div>
        </UniCard>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  CVDInspectionTable,
);
