import React from "react";
// @mui/material components
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseField from "baseComponents/BaseField";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import { renderDetailViewFields } from "baseComponents/renderDetailViewFields.jsx";
// helper
import Helper from "helper";

// eslint-disable-next-line no-control-regex
const CryllicRegex = /[^\u0000-\u00FE]+$/;
const PhonenumberRegex = /[0-9]{8}$/;

class PatientForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { p_registration: props.RegisterNo || null };
    this.CryllicRegex = CryllicRegex;
    this.PhonenumberRegex = PhonenumberRegex;

    // Define the layout pattern for form fields
    this.renderLayout = `
Files | p_familyname
      | p_lastname
      | p_firstname
      | p_registration
p_gender | blood_type
p_age      |  
p_birthday |
---
p_ethnicity | p_is_married
addr_prov_city | addr_soum_dist
addr_bag_khoroo | p_address
p_occupation | p_ethnicity_other
p_education 
p_workplace
p_employeement 
p_telephone   |p_telephone2
    `.trim();
  }

  /**
   * Lock the registration number once the patient exists.
   *
   * It is the patient's identity and the key every other screen looks them up
   * by, but the generic renderer showed it as an ordinary editable text field,
   * so on the edit path a doctor could retype one patient's number onto another
   * patient's record - and nothing validates uniqueness client-side. The CVD
   * variant of this form already gets this right.
   *
   * On CREATE it stays editable, because typing it is the whole flow: at ten
   * characters it fills in birthday, gender and age.
   */
  LockRegistrationField = () => {
    const { Fields } = this.state;
    if (!Fields) return;
    Fields.forEach((row) =>
      row.forEach((field) => {
        if (field && field.Name === "p_registration") field.Disabled = true;
      }),
    );
  };

  GetData = async () => {
    const { ObjectName } = this.state;
    const { PatientId, RegisterNo } = this.props;
    if (PatientId) {
      this.LockRegistrationField();
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Op: "Equals", Value: PatientId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData) {
            const Data = Object.assign({}, resData.Data);

            // Stored birthday can be missing/invalid on older records -
            // derive it from the registration number (same rule as backend)
            if (!Data.p_birthday || isNaN(new Date(Data.p_birthday))) {
              const { BirthDate, Age } =
                Helper.ObjectHelper.GetBirthDateFromRegNo(Data.p_registration);
              if (BirthDate) {
                Data.p_birthday = BirthDate;
                if (!Data.p_age) Data.p_age = Age;
                // Persist the derived values on the next save
                this.ModifyObject["p_registration"] = Data.p_registration;
                this.ModifyObject["p_birthday"] = BirthDate;
                this.ModifyObject["p_age"] = Data.p_age;
              }
            }

            this.setState({ EditObject: Data });
          }
          this.setState({ isLoading: false });
        },
      );
    } else {
      if (RegisterNo) {
        const regNo = RegisterNo.replace(/\s/g, "").toUpperCase();
        this.setState(
          {
            EditObject: { p_registration: regNo },
            isLoading: false,
          },
          () => {
            this.ChangeValueAfter("p_registration", regNo);
          },
        );
      } else {
        this.setState({ isLoading: false });
      }
    }
  };

  ChangeValueAfter = (Field, Value) => {
    const { EditObject, Fields } = this.state;

    if (Field === "p_registration") {
      const regNo = Value ? Value.replace(/\s/g, "").toUpperCase() : "";
      if (regNo.length === 10) {
        const { BirthDate, Age } =
          Helper.ObjectHelper.GetBirthDateFromRegNo(regNo);

        this.ModifyObject["p_registration"] = regNo;

        if (BirthDate) {
          const sexPart = regNo.slice(-1); // Last digit determines gender
          const gender = parseInt(sexPart) % 2 === 0 ? "1" : "2"; // Even: Female (1st radio), Odd: Male (2nd radio)

          this.ModifyObject["p_birthday"] = BirthDate;
          this.ModifyObject["p_gender"] = gender;
          this.ModifyObject["p_age"] = Age;

          this.setState((prevState) => ({
            EditObject: {
              ...prevState.EditObject,
              p_registration: regNo,
              p_birthday: BirthDate,
              p_gender: gender,
              p_age: Age,
            },
          }));
        } else {
          this.setState((prevState) => ({
            EditObject: { ...prevState.EditObject, p_registration: regNo },
          }));
        }
      }
    }

    let TempEditObject = {};
    if (Field === "addr_soum_dist") {
      // var NewObj = { ...EditObject, addr_soum_dist: Value };
      // this.setState({ EditObject: NewObj });
      var i = 0;
      var j = 0;
      var NewFields = [];

      TempEditObject = Object.assign({}, EditObject);
      NewFields = Fields;
      for (i = 0; i < NewFields.length; i++) {
        for (j = 0; j < NewFields[i].length; j++) {
          if (NewFields[i][j].Name === "addr_bag_khoroo") {
            NewFields[i][j].DataFilter = [
              { Field: "id_soum", Value, Op: "Equals" },
            ];
          }
        }
      }
      this.setState({
        EditObject: { ...TempEditObject, addr_soum_dist: null },
        Fields: NewFields,
      });
    }
    if (Field === "addr_prov_city") {
      TempEditObject = Object.assign({}, EditObject);
      NewFields = Fields;
      for (i = 0; i < NewFields.length; i++) {
        for (j = 0; j < NewFields[i].length; j++) {
          if (NewFields[i][j].Name === "addr_soum_dist") {
            NewFields[i][j].DataFilter = [
              { Field: "id_province", Value, Op: "Equals" },
            ];
          }
        }
      }
      this.setState({
        EditObject: { ...TempEditObject, addr_soum_dist: null },
        Fields: NewFields,
      });
    }

    // get display
    if (Field === "p_ethnicity") {
      const childDiv = document.getElementById(Field + "Child");
      if (childDiv) {
        if (Value === "6") {
          childDiv.style.display = "block";
        } else {
          childDiv.style.display = "none";
        }
      }
    }

    // Automatic age calculate
    if (Field === "p_birthday") {
      let age = 0;
      if (Value) {
        const today = new Date();
        const birthDate = new Date(Value);
        if (!isNaN(birthDate)) {
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          this.ModifyObject["p_age"] = parseInt(age);

          // Update EditObject to reflect the age change
          const { EditObject } = this.state;
          this.setState({
            EditObject: {
              ...EditObject,
              ...this.ModifyObject,
              p_age: parseInt(age),
            },
          });
        }
      }
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
    process.env.NODE_ENV === "development" && console.log({ Value, Id });
    if (Value) {
      await Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: ObjectName,
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => {
          if (resData) {
            callback && callback(resData.Success);
            const alert = Helper.BaseCrudHelper.ShowAlert(
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
    }
  };

  Save = async (callback) => {
    const { ObjectName, EditObject } = this.state;
    const { PatientId } = this.props;

    let alert = null;

    const p_registration = this.ModifyObject["p_registration"]
      ? this.ModifyObject["p_registration"].replace(/\s/g, "").toUpperCase()
      : null;
    if (p_registration) this.ModifyObject["p_registration"] = p_registration;

    const p_birthday = this.ModifyObject["p_birthday"]
      ? this.ModifyObject["p_birthday"]
      : EditObject && EditObject.id_data
        ? EditObject.p_birthday
        : null;
    const p_telephone = this.ModifyObject["p_telephone"]
      ? this.ModifyObject["p_telephone"]
      : EditObject
        ? EditObject.p_telephone
        : null;
    const p_telephone2 = this.ModifyObject["p_telephone2"]
      ? this.ModifyObject["p_telephone2"]
      : EditObject
        ? EditObject.p_telephone2
        : null;
    const p_lastname = this.ModifyObject["p_lastname"];
    const p_firstname = this.ModifyObject["p_firstname"];
    const p_familyname = this.ModifyObject["p_familyname"];

    if (isNaN(new Date(p_birthday))) {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Төрсөн он сар өдөр буруу байна",
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
      return;
    }

    // cyrrillic check
    let cyrillicCheckMsg = "";
    if (
      p_firstname &&
      typeof p_firstname === "string" &&
      !this.CryllicRegex.test(p_firstname.replace("-", ""))
    ) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ", " : "";
      cyrillicCheckMsg += "Нэр бичихдээ зөвхөн кирилл үсэг ашиглана уу";
    }

    if (
      p_lastname &&
      typeof p_lastname === "string" &&
      !this.CryllicRegex.test(p_lastname.replace("-", ""))
    ) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ", " : "";
      cyrillicCheckMsg += "Овог бичихдээ зөвхөн кирилл үсэг ашиглана уу";
    }

    if (
      p_familyname &&
      typeof p_familyname === "string" &&
      !this.CryllicRegex.test(p_familyname.replace("-", ""))
    ) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ", " : "";
      cyrillicCheckMsg += "Ургийн овог бичихдээ зөвхөн кирилл үсэг ашиглана уу";
    }

    if (cyrillicCheckMsg !== "") {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(cyrillicCheckMsg, false, () => {
        this.setState({ Alert: null });
      });
      this.setState({ Alert: alert });
      return;
    }

    if (!p_telephone) {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Утасны дугаар оруулна уу",
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
      return;
    }

    if (p_telephone && !this.PhonenumberRegex.test(p_telephone)) {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Утасны дугаар №1 алдаатай байна",
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
      return;
    }

    if (p_telephone2 && !this.PhonenumberRegex.test(p_telephone2)) {
      callback && callback(false);
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Утасны дугаар №2 алдаатай байна",
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
      return;
    }

    if (p_registration) {
      if (PatientId) {
        await Helper.BaseCrudHelper.BaseUpdate(
          {
            ObjectName,
            Data: {
              ...this.ModifyObject,
              p_telephone,
              p_telephone2,
              Files: null,
              id_data: PatientId,
            },
          },
          (resData) => {
            if (resData) {
              if (
                resData.Success &&
                resData.Data &&
                this.ModifyObject["Files"]
              ) {
                this.uploadFile(resData.Data.DataId, callback);
              } else {
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
            }
          },
        );
      } else {
        await Helper.BaseCrudHelper.BaseCreate(
          { ObjectName, Data: { ...this.ModifyObject, Files: null } },
          (resData) => {
            if (resData) {
              // Identify the new patient to the caller, so whoever just created
              // someone can act on them - open the record, refresh a list. The
              // registration number rides along because that, not the id, is
              // what /admin/PatientInfo navigates by. Existing callers take one
              // argument and are unaffected.
              const NewId = {
                DataId:
                  resData.Data && resData.Data.DataId
                    ? resData.Data.DataId
                    : null,
                RegisterNo: this.ModifyObject["p_registration"] || null,
              };
              if (resData.Success && this.ModifyObject["Files"]) {
                resData.Data &&
                  this.uploadFile(resData.Data.DataId, (Success) => {
                    callback && callback(Success, NewId);
                  });
              } else {
                callback && callback(resData.Success, NewId);
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
              }
            }
          },
        );
      }
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

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "6") return "block";
    else return "none";
  };

  // GetNoDisplay = (Field) => {
  //   const { EditObject } = this.state;
  //   const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
  //   if (Value === "n") {
  //     return "block";
  //   } else {
  //     return "none";
  //   }
  // };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, EditObject, ObjectName } = this.state;

    return (
      <div style={{ width: "100%" }}>
        {renderDetailViewFields(
          Fields,
          ObjectName,
          this.renderLayout,
          EditObject,
          this.ChangeValue,
        )}
      </div>
    );
  };
}

export default PatientForm;
