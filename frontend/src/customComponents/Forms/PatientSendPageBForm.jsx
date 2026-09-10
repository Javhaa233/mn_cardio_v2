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

class PatientSendPageBForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = {
      type: "from_hospital",
      SendDate: Helper.ObjectHelper.getDateYMD(),
    };
  }

  GetFormConfig = async () => {
    this.setState({ isLoading: true });
    const { PatientId, PatRegNo } = this.props;
    if (PatientId) {
      await Helper.BaseCrudHelper.CallService(
        "/PatientSendPage/GetCustomFormData",
        { PatientId, PatRegNo },
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
    const { PatientId, PatRegNo } = this.props;

    let alert = null;
    if (PatientId && PatRegNo) {
      if (Object.keys(this.ModifyObject).length > 0) {
        const ReqData = {
          ObjectName,
          Data: JSON.stringify({ ...this.ModifyObject, PatientId, PatRegNo }),
        };
        await Helper.BaseCrudHelper.CallService(
          "/PatientSendPage/CustomSave",
          ReqData,
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
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
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback(null);
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
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div style={{ height: "340px" }}>
              {/* <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("SendDate")}
                md={3}
              /> */}
              {/* <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("type")}
                FullWidth={true}
              /> */}
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("SendDate")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseField
                ChangeValue={this.ChangeValue}
                Value={this.GetConfigField("FromOrganization").Value}
                Config={this.GetConfigField("FromOrganization")}
                WithLabel={true}
                md={3}
              />
              {/* <BaseField
                ChangeValue={this.ChangeValue}
                Value={this.GetConfigField("ToOrganization").Value}
                Config={this.GetConfigField("ToOrganization")}
                WithLabel={true}
                md={3}
              /> */}
              {/* <BaseSelect
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("FromOrganization")}
                    FullWidth={true}
                  md={3}
                />
                <BaseSelect
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ToOrganization")}
                    FullWidth={true}
                  md={3}
                /> */}
              {/* <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ICD10")}
                FullWidth={true}
                md={3}
              /> */}
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Comment")}
                FullWidth={true}
                md={3}
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

export default PatientSendPageBForm;
