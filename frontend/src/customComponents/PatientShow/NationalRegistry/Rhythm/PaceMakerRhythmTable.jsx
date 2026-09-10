import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";

import PaceMakerRhythm from "customComponents/DetailViews/NationalRegistry/Rhythm/PaceMakerRhythm";
import PaceMakerRhythmForm from "customComponents/Forms/NationalRegistry/Rhythm/PaceMakerRhythmForm";

import Helper from "helper";

class PaceMakerRhythmTable extends BaseList {
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
    this.DialogRef = createRef();
    this.PaceMakerRhythm = createRef();
    this.PaceMakerRhythmForm = createRef();
    this.PaceMakerRhythmTable = createRef();
  }

  SetPatRegNo = (PatRegNo) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatRegNo",
      PatRegNo,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatRegNo }, () => {
      this.GetData(true);
    });
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
        <PaceMakerRhythm
          ref={(ref) => (this.PaceMakerRhythm = ref)}
          DataId={data.Id}
        />
      );
    } else {
      tempView = (
        <PaceMakerRhythmForm
          ref={(ref) => (this.PaceMakerRhythmForm = ref)}
          ObjectName="PaceMakerRhythm"
          PatientRegNo={data.PatRegNo}
        />
      );
    }

    const DialogDatas = (
      <BaseDialog
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
        Save={() => {
          this.PaceMakerRhythmForm.Save &&
            this.PaceMakerRhythmForm.Save((Success) => {
              if (Success) {
                this.GetData(false);
                this.setState({ DialogData: null });
              } else {
                this.DialogRef.setState({ Loading: false });
              }
            });
        }}
        Confirm={() => {
          this.PaceMakerRhythmForm.Confirm &&
            this.PaceMakerRhythmForm.Confirm(() => {
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

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseGrid
              FillHeight={false}
              Height="454px"
              ref={(ref) => (this.PaceMakerRhythmTable = ref)}
              Data={Data}
              GridOption={GridOption}
              PageLimitChange={this.PageLimitChange}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
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
              SearchField={(Field, Text) => this.SearchField(Field, Text)}
            />
          </div>
        )}
      </div>
    );
  };
}

export default PaceMakerRhythmTable;
