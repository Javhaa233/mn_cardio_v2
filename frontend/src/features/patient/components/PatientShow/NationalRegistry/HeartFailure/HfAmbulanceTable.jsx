import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseList from "baseComponents/BaseList";

import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import HfAmbulance from "customComponents/DetailViews/NationalRegistry/HeartFailure/HfAmbulance";
import HfAmbulanceForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfAmbulanceForm";

import Helper from "helper";

class HfAmbulanceTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "HfAmbulance",
      Config: {},
      FirstDataCheck: true,
      PatRegNo: props.PatRegNo || null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    if (props.PatRegNo) {
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "PatRegNo",
        props.PatRegNo,
        this.SearchOption.SearchField,
        "Equals",
      );
    }

    // refs
    this.HfAmbulance = createRef();
    this.HfAmbulanceForm = createRef();
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
        <HfAmbulance ref={(ref) => (this.HfAmbulance = ref)} DataId={data.Id} />
      );
    } else {
      tempView = (
        <HfAmbulanceForm
          ref={(ref) => (this.HfAmbulanceForm = ref)}
          ObjectName="HfAmbulance"
          PatientRegNo={data.PatRegNo}
        />
      );
    }

    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() => {
            this.HfAmbulance.Print &&
              this.HfAmbulance.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Save={() => {
            this.HfAmbulanceForm.Save &&
              this.HfAmbulanceForm.Save((Success) => {
                if (Success) {
                  this.GetData(false);
                  this.setState({ DialogData: null });
                } else {
                  this.DialogRef.setState({ Loading: false });
                }
              });
          }}
          Confirm={() => {
            this.HfAmbulanceForm.Confirm &&
              this.HfAmbulanceForm.Confirm(() => {
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
            Title={Title || "Heart Failure - Ambulance"}
            headerColor={Color || "rose"}
            Data={Data}
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={this.SearchOption.PageOption.Limit}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            WithoutCard={WithoutCard}
            Fields={[
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Баталгаажилт"), Name: "is_confirm" },
              {
                Label: t("Оношлогдсон он"),
                Name: "diagnosed_year",
                Type: "Date",
              },
              // {
              //   Label: t("Үзлэгт хамрагдсан он"),
              //   Name: "ambulance_date",
              //   Type: "Date",
              // },
              { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
            ]}
            ColumnActions={[
              {
                Field: "is_confirm",
                Component: <IsActive />,
                onClick: (data) => {},
              },
            ]}
            widthPattern="120, 100c, 120c, 100c"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(HfAmbulanceTable);
