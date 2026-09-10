import { withTranslation } from "react-i18next";
import React from "react";

import BaseTable from "customComponents/BaseTable";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import Cathlab from "customComponents/DetailViews/Cathlab";
import BaseDialog from "customComponents/BaseDialog";

import Helper from "helper";

class PCathlabTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "PCathlab",
      Config: {},
      FirstDataCheck: true,
      PatientId: props.PatientId || null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

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
      "date_creation",
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
        (el) => el.Field !== "date_creation",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    const DialogDatas = (
      <BaseDialog
        Close={() => this.setState({ DialogData: null })}
        Scroll="body"
      >
        <Cathlab ObjectName="PCathlab" DataId={data.id_data} NotEdit={true} />
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
            Title={Title || "Cathlab"}
            headerColor={Color || "info"}
            WithoutCard={WithoutCard}
            Data={Data}
            GridOption={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={this.SearchOption.PageOption.Limit}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            Fields={[
              { Label: t("Create date"), Name: "date_creation" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("City"), Name: "Organization.DictProvinceCity.name" },
              { Label: t("Soum"), Name: "Organization.DictSoumDistrict.name" },
              {
                Label: t("Bag/Khoroo"),
                Name: "Organization.DictBagKhoroo.name",
              },
            ]}
            widthPattern="100c, 120, 200, 120, 120, 120"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(PCathlabTable);
