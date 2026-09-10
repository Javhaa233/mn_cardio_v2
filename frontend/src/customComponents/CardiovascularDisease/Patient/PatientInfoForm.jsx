import { useTranslation } from "react-i18next";
import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class PatientInfoForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.PatRegNo = props.PatRegNo || null;
    this.ModifyObject = {};
  }

  componentDidMount() {
    this.GetFormConfig();
  }

  GetData = async () => {
    if (this.PatRegNo) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Op: "Equals", Value: this.PatRegNo },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "Patient", SearchOption },
        (resData) => {
          if (resData) {
            if (resData.Success && resData.Data) {
              this.setState({
                EditObject: Object.assign({}, resData.Data),
                isLoading: false,
              });
            } else if (resData.Success && !resData.Data) {
              this.setState({ isLoading: false });
            }
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Save = async (callback) => {
    let alert = null;
    if (this.PatRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/UpdatePatient",
        { PatRegNo: this.PatRegNo, Data: JSON.stringify(this.ModifyObject) },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data found", false, () => {
        this.setState({ Alert: null });
      });
      this.setState({ Alert: alert });
      callback && callback(false);
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("Age")}
                /> */}
              {/* <Divider variant="middle" style={{ marginBottom: "15px" }} /> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_gender")}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_telephone")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_telephone2")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_workplace")}
                Variant={"outlined"}
                FullWidth={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_address")}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_temp_address")}
              />
              {/* <Divider variant="middle" /> */}
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default PatientInfoForm;
