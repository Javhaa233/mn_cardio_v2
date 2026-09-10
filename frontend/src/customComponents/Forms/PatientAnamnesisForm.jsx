import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";

class PatientAnamnesisForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { p_registration: props.RegisterNo || null };
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
    const { ObjectName } = this.state;
    const { PatientId } = this.props;
    if (PatientId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Value: PatientId, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          resData &&
            this.setState({ EditObject: Object.assign({}, resData.Data) });
          this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Save = async (callback) => {
    const { ObjectName } = this.state;
    const { PatientId } = this.props;
    const p_registration = this.ModifyObject["p_registration"];
    let alert = null;
    if (p_registration && PatientId) {
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName,
          Data: { ...this.ModifyObject, Files: null, id_data: PatientId },
        },
        (resData) => {
          if (resData) {
            callback && callback(resData.Success);
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} style={{ margin: "10px" }}>
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_social_hist_code")}
            md={3}
            boxMd={4}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_soc_hist")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_com_dis_code")}
            md={3}
            boxMd={4}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_com_dis")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_noncom_dis_code")}
            md={3}
            boxMd={6}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_noncom_dis")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_operations_code")}
            md={3}
            boxMd={6}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_operations")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_trauma_code")}
            md={3}
            boxMd={6}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_trauma")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_fam_hist_code")}
            md={3}
            boxMd={4}
          />
          <BaseTextArea
            Rows="3"
            FullWidth
            md={3}
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("p_fam_hist")}
          />
        </GridItem>
      </GridContainer>
    );
  };
}

export default PatientAnamnesisForm;
