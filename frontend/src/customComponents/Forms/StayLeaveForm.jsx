import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class StayLeaveForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = {
      diagnose_discharge: null,
      to_where: null,
      to_department: null,
      RefferalTo: null,
    };
  }

  Save = async (callback) => {
    const { StayId, ShowAlert } = this.props;
    if (StayId) {
      await Helper.BaseCrudHelper.CallService(
        "/Stay/LeavePatient",
        {
          StayId,
          diagnose_discharge: this.ModifyObject.diagnose_discharge,
          to_where: this.ModifyObject.to_where,
          to_department: this.ModifyObject.to_department,
          RefferalTo: this.ModifyObject.RefferalTo,
        },
        (resData) => ShowAlert && ShowAlert(resData, callback),
      );
    }
  };

  ChangeValueAfter = (Field, Value) => {
    const RefferalToDiv = document.getElementById("RefferalToDiv");
    const DepartmentToDiv = document.getElementById("DepartmentToDiv");
    if (Field === "to_where") {
      if (RefferalToDiv) {
        if (Value === "2") RefferalToDiv.style.display = "block";
        else RefferalToDiv.style.display = "none";
      }

      if (DepartmentToDiv) {
        if (Value === "3") DepartmentToDiv.style.display = "block";
        else DepartmentToDiv.style.display = "none";
      }
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12} style={{ margin: "10px" }}>
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("diagnose_discharge")}
          />
          <BaseSelect
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("to_where")}
            FullWidth
          />
          <div style={{ display: "none" }} id="RefferalToDiv">
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("RefferalTo")}
              FullWidth
            />
          </div>
          <div style={{ display: "none" }} id="DepartmentToDiv">
            <BaseSelect
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("to_department")}
              FullWidth
            />
          </div>
        </GridItem>
      </GridContainer>
    );
  };
}

export default StayLeaveForm;
