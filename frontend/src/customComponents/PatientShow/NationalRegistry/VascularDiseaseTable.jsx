import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import BaseList from "baseComponents/BaseList";
import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import VascularDisease from "customComponents/DetailViews/NationalRegistry/VascularDisease";
import VascularDiseaseForm from "customComponents/Forms/NationalRegistry/VascularDisease/VascularDiseaseForm";

import Helper from "helper";

class VascularDiseaseTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "VascularDisease",
      Config: {},
      FirstDataCheck: true,
      PatRegNo: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    // refs
    this.VascularDisease = createRef();
    this.VascularDiseaseForm = createRef();
    this.DialogRef = createRef();
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
          } else {
            this.setState({ isLoading: false });
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
        <VascularDisease
          ref={(ref) => (this.VascularDisease = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <VascularDiseaseForm
          ref={(ref) => (this.VascularDiseaseForm = ref)}
          ObjectName="VascularDisease"
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
            this.VascularDisease.Print &&
              this.VascularDisease.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Confirm={() => {
            this.VascularDiseaseForm.Confirm &&
              this.VascularDiseaseForm.Confirm(() => {
                this.DialogRef.setState({ ConfirmLoading: false });
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
    const { Title, t } = this.props;

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <UniCard title={t(Title || "Vascular Disease")}>
              <BaseTable
                Height="454px"
                Data={Data}
                GridOption={GridOption}
                PageLimitChange={this.PageLimitChange}
                Search={this.SetSearchOption}
                Refresh={this.Refresh}
                ShowData={this.ShowData}
                OrderBy={this.OrderBy}
                WithoutCard={true}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  { Label: t("Баталгаажилт"), Name: "is_confirm" },
                  {
                    Label: t("Эхэлсэн он"),
                    Name: "started_date",
                    Type: "Date",
                  },
                  {
                    Label: t("Оношлогдсон он"),
                    Name: "diagnosed_date",
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
              />
            </UniCard>
          </div>
        )}
      </div>
    );
  };
}

export default withTranslation()(VascularDiseaseTable);
