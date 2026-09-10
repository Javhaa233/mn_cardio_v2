import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseDate from "customComponents/BaseEditControls/BaseDate";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class OrderHospitalizationForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Departments: [], PatientPhone: null };
  }

  GetFormConfig = async () => {
    this.setState({ Fields: [], isLoading: true });
    const { PatientId } = this.props;
    if (PatientId) {
      await Helper.OrderHospitalizationHelper.GetCustomFormData(
        PatientId,
        (resData) => {
          //   this.ListFields = Helper.BaseCrudHelper.GetFieldList(resData.Data.Fields);
          if (resData && resData.Data) {
            this.setState(
              {
                Fields: [...resData.Data.Fields, resData.Data.CustomFields],
                PatientPhone: resData.Data.PatientPhone,
                isLoading: false,
              },
              () => {
                this.ModifyObject["phone"] = resData.Data.PatientPhone;
                this.ModifyObject["patient_from"] = null;
                this.GetDepartments();
              },
            );
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  GetDepartments = async () => {
    await Helper.InPatientHelper.GetDepartmentList(
      this.LogedUser.Doctor.id_data,
      (resData) => resData && this.setState({ Departments: resData.Data }),
    );
  };

  Save = async (callback) => {
    const { PatientId } = this.props;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.OrderHospitalizationHelper.CustomSave(
        { ...this.ModifyObject, patient_id: PatientId },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
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
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { PatientPhone, Fields, Departments } = this.state;
    process.env.NODE_ENV === "development" && console.log({ Fields });
    return (
      <GridContainer style={{ marginTop: "10px", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("schedule_date")}
                FullWidth={true}
                md={4.8}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("department_id"),
                  Data: Departments,
                }}
                FullWidth={true}
                md={4.8}
              />
              <BaseSelect
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ICD10")}
                FullWidth={true}
                md={4.8}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("p_severity")}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("notes")}
              />
              {/* <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("patient_from")}
                /> */}
              {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("where_from")}
                    FullWidth={true}
                /> */}
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("phone"),
                  Value: PatientPhone,
                }}
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

export default OrderHospitalizationForm;
