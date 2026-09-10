import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import BaseList from "baseComponents/BaseList";

import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import HfHospitalization from "customComponents/DetailViews/NationalRegistry/HeartFailure/HfHospitalization";
import HfHospitalizationForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfHospitalizationForm";

import Helper from "helper";

class HfHospitalizationTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "HfHospitalization",
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
    this.HfHospitalization = createRef();
    this.HfHospitalizationForm = createRef();
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
        <HfHospitalization
          ref={(ref) => (this.HfHospitalization = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <HfHospitalizationForm
          ref={(ref) => (this.HfHospitalizationForm = ref)}
          ObjectName="HfHospitalization"
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
            this.HfHospitalization.Print &&
              this.HfHospitalization.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Save={(setLoading) => {
            this.HfHospitalizationForm.Save &&
              this.HfHospitalizationForm.Save((Success) => {
                if (Success) {
                  this.GetData(false);
                  this.setState({ DialogData: null });
                } else {
                  setLoading && setLoading(false);
                }
              });
          }}
          Confirm={(setLoading) => {
            this.HfHospitalizationForm.Confirm &&
              this.HfHospitalizationForm.Confirm(() => {
                setLoading && setLoading(false);
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
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;
    const { Title, Color, WithoutCard = false, t } = this.props;

    return (
      <div style={this.props.style}>
        {!WithoutCard ? (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <UniCard title={t(Title || "Heart Failure - Hospitalization")}>
              <BaseTable
                Height={this.props.Height || "454px"}
                Clean={this.props.Clean}
                Data={Data}
                Option={GridOption}
                ChangePage={this.PageLimitChange}
                PageSize={this.SearchOption.PageOption.Limit}
                ShowData={this.ShowData}
                OrderBy={this.OrderBy}
                Search={this.SetSearchOption}
                Refresh={this.Refresh}
                WithoutCard={true}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  { Label: t("Баталгаажилт"), Name: "is_confirm" },
                  {
                    Label: t("Хэвтсэн огноо"),
                    Name: "hospitalized_date",
                    Type: "Date",
                  },
                  {
                    Label: t("Create date"),
                    Name: "CreatedDate",
                    Type: "Date",
                  },
                ]}
                ColumnActions={[
                  {
                    Field: "is_confirm",
                    Component: <IsActive />,
                    onClick: (data) => {},
                  },
                ]}
                widthPattern="120, 100c, 100c, 100c"
              />
            </UniCard>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              Height={this.props.Height || "454px"}
              Clean={this.props.Clean}
              Data={Data}
              Option={GridOption}
              ChangePage={this.PageLimitChange}
              PageSize={this.SearchOption.PageOption.Limit}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              WithoutCard={true}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                { Label: t("Баталгаажилт"), Name: "is_confirm" },
                {
                  Label: t("Хэвтсэн огноо"),
                  Name: "hospitalized_date",
                  Type: "Date",
                },
                { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
              ]}
              ColumnActions={[
                {
                  Field: "is_confirm",
                  Component: <IsActive />,
                  onClick: (data) => {},
                },
              ]}
              widthPattern="120, 100c, 100c, 100c"
            />
          </div>
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  HfHospitalizationTable,
);
