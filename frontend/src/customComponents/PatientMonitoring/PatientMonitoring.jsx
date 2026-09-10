import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import RangeDate from "customComponents/RangeDate";

import Helper from "helper";

class PatientMonitoring extends BaseList {
  constructor(props) {
    super(props);
    this.PatientId = props.PatientId || null;
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "patient_id",
      this.PatientId,
      this.SearchOption.SearchField,
      "Equals",
    );

    // refs
    this.VisitTable = createRef();
  }

  componentDidMount() {
    // Skip config loading and go directly to GetData
    // since this component doesn't need config from the server
    this.GetData && this.GetData();
  }

  GetData = async () => {
    const { ObjectName, PatientId } = this.props;
    if (PatientId) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
        (resData) => {
          resData &&
            this.setState({
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "date_creation",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData();
  };

  Refresh = () => {
    if (
      this.SearchOption.SearchField &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "date_creation",
      );
      this.GetData(false);
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, isLoading, GridOption } = this.state;
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isLoading ? <DivLoading WithoutCard /> : null}
        <div style={{ marginBottom: "15px", flex: "0 0 auto" }}>
          <RangeDate
            ChangeValue={(StartDate, EndDate) => {
              this.SetSearchOption(StartDate, EndDate);
            }}
            Refresh={this.Refresh}
          />
        </div>
        <div style={{ flex: "1 1 auto", position: "relative" }}>
          <BaseGrid
            PageSize={10}
            WithoutCard={true}
            FillHeight={true}
            Height="400px"
            ref={(ref) => (this.VisitTable = ref)}
            Data={Data}
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            widthPattern="40c, 120c, 100r, 80r, 80r, 80r, 200"
            Fields={[
              { Label: t("Date"), Name: "date", Type: "Date" },
              { Label: t("Blood Pressure"), Name: "BloodPressure" },
              { Label: t("Pulse"), Name: "pulse" },
              { Label: t("Weight"), Name: "weight" },
              { Label: t("Inr"), Name: "inr" },
              { Label: t("Comment"), Name: "comment" },
            ]}
            SearchField={(Field, Text) => this.SearchField(Field, Text)}
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(PatientMonitoring);
