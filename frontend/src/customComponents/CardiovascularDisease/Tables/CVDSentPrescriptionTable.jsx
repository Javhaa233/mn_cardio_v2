import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import CVDSentPrescription from "customComponents/CardiovascularDisease/CVDSentPrescription";
import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import SentStatus from "customComponents/CardiovascularDisease/SentStatus";
// helper
import Helper from "helper";

class CVDSentPrescriptionTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      DialogData: null,
      MonitoringId: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 5 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.CVDSentPrescriptionRef = createRef();
    this.DialogRef = createRef();
  }

  SetMonitoringId = (MonitoringId) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "MonitoringId",
      MonitoringId,
      this.SearchOption.SearchField,
      "Equals",
    );

    this.setState({ MonitoringId: MonitoringId }, () => {
      this.GetData(true);
    });
  };

  GetData = async (FirstCheck) => {
    const { MonitoringId } = this.state;
    if (MonitoringId !== null) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "CVDSentPrescription", SearchOption: this.SearchOption },
        (resData) => {
          if (resData && resData.Data && resData.Success) {
            var AllDataTemp = resData.Data;
            for (var i = 0; i < AllDataTemp.length; i++) {
              var tempData = JSON.parse(resData.Data[i].SentData);
              delete AllDataTemp[i]["SentData"];
              AllDataTemp[i] = { ...AllDataTemp[i], tempData };
            }
            this.setState({
              Data: AllDataTemp,
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
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
        >
          <CVDSentPrescription
            DataId={data.Id}
            ObjectName="CVDSentPrescription"
            ref={(ref) => (this.CVDSentPrescriptionRef = ref)}
          />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { t } = this.props;
    var { Data, DialogData, GridOption, isLoading, MonitoringId } = this.state;

    if (!MonitoringId) {
      return null;
    }

    return (
      <div style={this.props.style}>
        <UniCard title="Жор">
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              headerColor="danger"
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
              ColumnActions={[
                {
                  Field: "RequestStatus",
                  Component: <SentStatus />,
                  onClick: () => {},
                },
              ]}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorRegNo" },
                { Label: t("Жор бүртгэсэн огноо"), Name: "CreateDate" },
                { Label: t("Онош"), Name: "tempData.receiptDiag" },
                { Label: t("Төлөв"), Name: "RequestStatus" },
              ]}
            />
          </div>
        </UniCard>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  CVDSentPrescriptionTable,
);
