import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class PatientTransferForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { TransferedDate: Helper.ObjectHelper.getDateYMD() };
  }

  GetFormConfig = async () => {
    this.setState({ isLoading: true });
    const { PatientId } = this.props;
    if (PatientId) {
      await Helper.BaseCrudHelper.CallService(
        "/PatientTransfer/GetCustomFormData",
        { PatientId },
        (resData) => {
          if (resData && resData.Data)
            this.setState({ Fields: resData.Data.Fields, isLoading: false });
        },
      );
    }
  };

  //   GetDepartments = async () => {
  //  await Helper.InPatientHelper.GetDepartmentList(
  //       this.LogedUser.Doctor.id_data,
  //       (data) => {
  //         this.setState({ Departments: data.Data });
  //       }
  //     );
  //   };

  Save = async (callback) => {
    const { ObjectName } = this.state;
    const { PatientId } = this.props;
    if (Object.keys(this.ModifyObject).length > 0) {
      const ReqData = {
        ObjectName,
        Data: JSON.stringify({ ...this.ModifyObject, PatientId }),
      };
      await Helper.BaseCrudHelper.CallService(
        "/PatientTransfer/CustomSave",
        ReqData,
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div style={{ height: "340px" }}>
              {/* <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TransferedDate")}
                
              /> */}
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("TransferedDate")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseField
                ChangeValue={this.ChangeValue}
                Value={this.GetConfigField("FromOrganization").Value}
                Config={this.GetConfigField("FromOrganization")}
                WithLabel={true}
              />
              <BaseField
                ChangeValue={this.ChangeValue}
                Value={this.GetConfigField("ToOrganization").Value}
                Config={this.GetConfigField("ToOrganization")}
                WithLabel={true}
              />
              {/* <BaseSelect
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("FromOrganization")}
                    FullWidth={true}
                  
                />
                <BaseSelect
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ToOrganization")}
                    FullWidth={true}
                  
                /> */}
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ICD10")}
                FullWidth={true}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Purpose")}
                FullWidth={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Comment")}
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

export default PatientTransferForm;
