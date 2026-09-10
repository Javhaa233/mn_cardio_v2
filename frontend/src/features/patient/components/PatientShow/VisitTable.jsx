import { withTranslation } from "react-i18next";
import React, { createRef } from "react";
import Visit from "customComponents/DetailViews/Visit";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog"; // Шинэ forwardRef бүхий хувилбар
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import Helper from "helper";

class VisitTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "Visit",
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

    this.VisitRef = createRef();
    this.DialogRef = createRef();
  }

  componentDidMount() {
    if (this.state.PatientId) {
      super.componentDidMount();
    }
  }

  SetPatientId = (PatientId) => {
    console.log("VisitTable.SetPatientId called with:", PatientId);
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatientId",
      PatientId,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatientId }, () => {
      console.log("VisitTable PatientId set in state:", this.state.PatientId);
      console.log("VisitTable - Now calling GetData(true)");
      this.GetData(true);
    });
  };

  GetData = async (FirstCheck) => {
    console.log("VisitTable.GetData called with FirstCheck:", FirstCheck);
    const { ObjectName, PatientId } = this.state;
    console.log(
      "VisitTable.GetData - ObjectName:",
      ObjectName,
      "PatientId:",
      PatientId,
    );
    console.log("VisitTable.GetData - SearchOption:", this.SearchOption);
    if (PatientId) {
      this.setState({ isLoading: true });
      console.log("VisitTable.GetData - Calling BaseGetList...");
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
        (resData) => {
          console.log("VisitTable.GetData - Response:", resData);
          if (resData?.Data) {
            this.setState({
              FirstDataCheck: resData.Data.length === 0 && FirstCheck,
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    } else {
      console.log(
        "VisitTable.GetData - PatientId is not set, skipping API call",
      );
    }
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "visit_date",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData(false);
  };

  Refresh = () => {
    if (this.SearchOption.SearchField?.length > 0) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "visit_date",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    const { PatientId } = this.state;

    this.setState({
      DialogData: (
        <BaseDialog
          ref={this.DialogRef}
          Close={() => this.setState({ DialogData: null })}
          Print={(onComplete) => {
            const visit = this.VisitRef.current;
            if (visit?.Print) {
              visit.Print(() => {
                onComplete && onComplete();
              });
            } else {
              onComplete && onComplete();
            }
          }}
          ShowPrint={true}
        >
          <Visit
            ref={this.VisitRef}
            DataId={data.id_data}
            PatientId={PatientId}
            ObjectName="Visit"
          />
        </BaseDialog>
      ),
    });
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
            Title={Title || "Visit"}
            headerColor={Color || "info"}
            Data={Data}
            GridOption={GridOption}
            PageLimitChange={this.PageLimitChange}
            SearchField={this.SearchField}
            SearchFieldData={this.SearchOption.SearchField}
            PageSize={this.SearchOption.PageOption.Limit}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            WithoutCard={WithoutCard}
            Fields={[
              { Label: t("Visit date"), Name: "visit_date", Type: "Date" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("City"), Name: "Organization.DictProvinceCity.name" },
              { Label: t("Soum"), Name: "Organization.DictSoumDistrict.name" },
              {
                Label: t("Bag/Khoroo"),
                Name: "Organization.DictBagKhoroo.name",
              },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
            ]}
            widthPattern="110c, 100, 150, 100, 100, 100, 110c"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(VisitTable);
