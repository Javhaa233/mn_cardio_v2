import { withTranslation } from "react-i18next";
import React from "react";

import BaseTable from "customComponents/BaseTable";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";

import Helper from "helper";

class PatientHistoryTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "PatientHistory",
      Config: {},
      FirstDataCheck: true,
      PatientId: props.PatientId || null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    if (props.PatientId) {
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "PatientId",
        props.PatientId,
        this.SearchOption.SearchField,
        "Equals",
      );
    }
  }

  componentDidMount() {
    if (this.state.PatientId) {
      super.componentDidMount();
    }
  }

  SetPatientId = (PatientId) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatientId",
      PatientId,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatientId }, () => this.GetData(true));
  };

  GetData = async (FirstCheck) => {
    const { ObjectName, PatientId } = this.state;
    if (PatientId) {
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
      "LogDate",
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
        (el) => el.Field !== "LogDate",
      );
      this.GetData(false);
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, GridOption, isLoading, FirstDataCheck } = this.state;
    const { Title, Color, WithoutCard } = this.props;

    return (
      <div style={this.props.style}>
        <div style={{ position: "relative" }}>
          {isLoading ? <DivLoading /> : null}
          <BaseTable
            Height={this.props.Height || "454px"}
            Clean={this.props.Clean}
            Title={Title || "History"}
            headerColor={Color || "info"}
            Data={Data}
            GridOption={GridOption}
            PageLimitChange={this.PageLimitChange}
            SearchField={this.SearchField}
            SearchFieldData={this.SearchOption.SearchField}
            PageSize={this.SearchOption.PageOption.Limit}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            WithoutCard={WithoutCard}
            Fields={[
              { Label: t("Date"), Name: "LogDate", Type: "Date" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Notes"), Name: "Notes", NoTruncate: true },
            ]}
            widthPattern="100c, 120, 450"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  PatientHistoryTable,
);
