import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";

class PaceMakerOneForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { planned_date: Helper.ObjectHelper.getDateYMD() };
  }

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));
  };

  GetData = async () => {
    const { StayId } = this.props;
    const { ObjectName } = this.state;
    if (StayId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "stay_id_data", Op: "Equals", Value: StayId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData && resData.Success) {
            if (!resData.Data)
              this.setState({ EditObject: null, isLoading: false });
            if (resData.Data) {
              this.setState({
                EditObject: Object.assign({}, resData.Data),
                isLoading: false,
              });
            }
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Print = async (callback) => {
    const { EditObject } = this.state;
    let alert = null;
    if (EditObject && EditObject.Id) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/PacemakerOne/PrintReport",
          Data: { Id: EditObject.Id },
          FileName: "PacemakerOneReport.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  SaveAndConfirm = (callback) => {
    const confirmAlert = Helper.BaseCrudHelper.ShowConfirm(
      "Хэвлэх үү?",
      () => {
        this.setState({ Alert: null });
        this.Print(() => callback && callback());
      },
      () => {
        this.setState({ Alert: null });
        callback && callback();
      },
    );
    this.setState({ Alert: confirmAlert });
  };

  Save = async (callback) => {
    const { PatientId, StayId } = this.props;
    const { ObjectName, EditObject } = this.state;

    let alert = null;
    if (
      ObjectName &&
      Object.keys(this.ModifyObject).length > 0 &&
      PatientId &&
      StayId
    ) {
      var Data = null;
      if (EditObject && EditObject.Id) {
        Data = { ...this.ModifyObject, Id: EditObject.Id };
      } else {
        Data = {
          ...this.ModifyObject,
          pat_id_data: PatientId,
          stay_id_data: StayId,
        };
      }

      await Helper.PacemakerHelper.CustomSavePacemakerOne(
        { ObjectName, Data },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({
                  Alert: null,
                  EditObject: { Id: resData.Data.DataId },
                });
                this.SaveAndConfirm(() => callback && callback());
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} sm={12} md={12}>
          {Fields ? (
            <div>
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("pat_history_id")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("department")}
                FullWidth={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("diagnostic_change")}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("diag_decision")}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("zuvlukh_emch")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("emchlegch_emch")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("emch")}
                FullWidth={true}
              />
              <BaseCheckBox
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("diffs")}
              />
              <BaseCheckBox
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("risks")}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("device_model")}
                FullWidth={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("prev_diagnosis")}
              />
              {/* <BaseDate
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("planned_date")}
                /> */}
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("planned_date")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("operating_emch")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("tuslakh_emch")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("surgery_nurse")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("engineer")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("technician")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("anasthesia_emch")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("anasthesia_nurse")}
                FullWidth={true}
              />
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default PaceMakerOneForm;
