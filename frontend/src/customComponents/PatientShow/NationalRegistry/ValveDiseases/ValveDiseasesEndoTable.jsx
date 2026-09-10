import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
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

import ValveDiseasesEndo from "customComponents/DetailViews/NationalRegistry/ValveDiseases/ValveDiseasesEndo";
import ValveDiseasesEndoForm from "customComponents/Forms/NationalRegistry/ValveDisease/ValveDiseasesEndoForm";

import Helper from "helper";

class ValveDiseasesEndoTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      FirstDataCheck: true,
      PatRegNo: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.ValveDiseasesEndo = createRef();
    this.ValveDiseasesEndoForm = createRef();
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
    if (ObjectName && PatRegNo) {
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
        <ValveDiseasesEndo
          ref={(ref) => (this.ValveDiseasesEndo = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <ValveDiseasesEndoForm
          ref={(ref) => (this.ValveDiseasesEndoForm = ref)}
          ObjectName="ValveDiseasesEndo"
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
              if (this.ValveDiseasesEndo && this.ValveDiseasesEndo.Print) {
                this.ValveDiseasesEndo.Print(() => resolve());
              } else {
                resolve();
              }
            })
          }
          Save={() =>
            new Promise((resolve) => {
              if (
                this.ValveDiseasesEndoForm &&
                this.ValveDiseasesEndoForm.Save
              ) {
                this.ValveDiseasesEndoForm.Save((Success) => {
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
              if (
                this.ValveDiseasesEndoForm &&
                this.ValveDiseasesEndoForm.Confirm
              ) {
                this.ValveDiseasesEndoForm.Confirm(() => resolve());
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
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseGrid
              FillHeight={false}
              Height="454px"
              headerColor="danger"
              Data={Data}
              GridOption={GridOption}
              PageLimitChange={this.PageLimitChange}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
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
              SearchField={(Field, Text) => this.SearchField(Field, Text)}
            />
          </div>
        )}
      </div>
    );
  };
}

export default ValveDiseasesEndoTable;
