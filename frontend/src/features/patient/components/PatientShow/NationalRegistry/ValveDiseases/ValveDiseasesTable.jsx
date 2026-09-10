import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import BaseList from "baseComponents/BaseList";

import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import ValveDiseases from "customComponents/DetailViews/NationalRegistry/ValveDiseases/ValveDiseases";
import ValveDiseasesForm from "customComponents/Forms/NationalRegistry/ValveDisease/ValveDiseasesForm";

import Helper from "helper";

class ValveDiseasesTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "ValveDiseases",
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
    this.ValveDiseases = createRef();
    this.ValveDiseasesForm = createRef();
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
        <ValveDiseases
          ref={(ref) => (this.ValveDiseases = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <ValveDiseasesForm
          ref={(ref) => (this.ValveDiseasesForm = ref)}
          ObjectName="ValveDiseases"
          PatientRegNo={data.PatRegNo}
        />
      );
    }

    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() =>
            new Promise((resolve) => {
              if (this.ValveDiseases && this.ValveDiseases.Print) {
                this.ValveDiseases.Print(() => resolve());
              } else {
                resolve();
              }
            })
          }
          Save={() =>
            new Promise((resolve) => {
              if (this.ValveDiseasesForm && this.ValveDiseasesForm.Save) {
                this.ValveDiseasesForm.Save((Success) => {
                  if (Success) {
                    this.GetData(false);
                    this.setState({ DialogData: null });
                  }
                  resolve();
                });
              } else {
                resolve();
              }
            })
          }
          Confirm={() =>
            new Promise((resolve) => {
              if (this.ValveDiseasesForm && this.ValveDiseasesForm.Confirm) {
                this.ValveDiseasesForm.Confirm(() => resolve());
              } else {
                resolve();
              }
            })
          }
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
    const { Title, t, WithoutCard = false } = this.props;

    return (
      <div style={this.props.style}>
        {!WithoutCard ? (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <UniCard title={t(Title || "Valve Diseases")}>
              <BaseTable
                Height={this.props.Height || "454px"}
                Clean={this.props.Clean}
                WithoutCard={true}
                Data={Data}
                Option={GridOption}
                ChangePage={this.PageLimitChange}
                PageSize={this.SearchOption.PageOption.Limit}
                ShowData={this.ShowData}
                OrderBy={this.OrderBy}
                Search={this.SetSearchOption}
                Refresh={this.Refresh}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  { Label: t("Баталгаажилт"), Name: "is_confirm" },
                  { Label: t("Эхэлсэн он"), Name: "StartedDate", Type: "Date" },
                  {
                    Label: t("Оношлогдсон он"),
                    Name: "DiagnosedDate",
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
                widthPattern="120, 100c, 110c, 110c, 100c"
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
              WithoutCard={true}
              Data={Data}
              Option={GridOption}
              ChangePage={this.PageLimitChange}
              PageSize={this.SearchOption.PageOption.Limit}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                { Label: t("Баталгаажилт"), Name: "is_confirm" },
                { Label: t("Эхэлсэн он"), Name: "StartedDate", Type: "Date" },
                {
                  Label: t("Оношлогдсон он"),
                  Name: "DiagnosedDate",
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
              widthPattern="120, 100c, 110c, 110c, 100c"
            />
          </div>
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  ValveDiseasesTable,
);
