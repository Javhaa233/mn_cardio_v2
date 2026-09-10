import { withTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import ICDRhythm from "customComponents/DetailViews/NationalRegistry/Rhythm/ICDRhythm";
import ICDRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/ICDRhythmForm";

import Helper from "helper";

class ICDRhythmTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      ObjectName: "ICDRhythm",
      Config: {},
      FirstDataCheck: true,
      PatRegNo: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.DialogRef = createRef();
    this.ICDRhythm = createRef();
    this.ICDRhythmForm = createRef();
    this.ICDRhythmTable = createRef();
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
        <ICDRhythm ref={(ref) => (this.ICDRhythm = ref)} DataId={data.Id} />
      );
    } else {
      tempView = (
        <ICDRhythmForm
          ref={(ref) => (this.ICDRhythmForm = ref)}
          ObjectName="ICDRhythm"
          PatientRegNo={data.PatRegNo}
        />
      );
    }

    const DialogDatas = (
      <BaseDialog
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
        Save={() => {
          this.ICDRhythmForm.Save &&
            this.ICDRhythmForm.Save((Success) => {
              if (Success) {
                this.GetData(false);
                this.setState({ DialogData: null });
              } else {
                this.DialogRef.setState({ Loading: false });
              }
            });
        }}
        Confirm={() => {
          this.ICDRhythmForm.Confirm &&
            this.ICDRhythmForm.Confirm(() => {
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
            Title={Title || "ICD Rhythm"}
            headerColor={Color || "danger"}
            WithoutCard={WithoutCard}
            Data={Data}
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={this.SearchOption.PageOption.Limit}
            ShowData={this.ShowData}
            OrderBy={this.OrderBy}
            Search={this.SetSearchOption}
            Refresh={this.Refresh}
            Fields={[
              { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
              { Label: t("Баталгаажилт"), Name: "is_confirm" },
              { Label: t("Personal number"), Name: "PatRegNo" },
              { Label: t("Create date"), Name: "CreatedDate", Type: "Date" },
            ]}
            ColumnActions={[
              {
                Field: "is_confirm",
                Component: <IsActive />,
                onClick: (data) => {},
              },
            ]}
            widthPattern="120, 100c, 110, 100c"
          />
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(ICDRhythmTable);
