import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import PatientTransfer from "customComponents/DetailViews/PatientTransfer";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";

import Helper from "helper";

class PatientTransferTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      FirstDataCheck: true,
      PatientId: props.PatientId || null,
      DialogData: null,
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

    // refs
    this.PatientTransfer = createRef();
    this.DialogRef = createRef();
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
    const { PatientId } = this.state;
    if (PatientId) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "PatientTransfer", SearchOption: this.SearchOption },
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
        Title={this.props.Title}
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
        // Print={() => {
        //   if (this.PatientTransfer) {
        //     this.PatientTransfer.Print((Data) =>
        //       this.DialogRef.setState({ PrintLoading: false })
        //     );
        //   }
        // }}
        // ShowPrint={true}
      >
        <PatientTransfer
          ref={(ref) => (this.PatientTransfer = ref)}
          DataId={data.Id}
          ObjectName="PatientTransfer"
        />
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
            Title={Title || "Patient Transfer"}
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
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
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

export default withTranslation(undefined, { withRef: true })(
  PatientTransferTable,
);
