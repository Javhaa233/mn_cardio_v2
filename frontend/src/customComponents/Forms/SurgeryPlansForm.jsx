import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
// import BaseField from "baseComponents/BaseField";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class SurgeryPlansForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { ognoo: Helper.ObjectHelper.getDateYMD() };
  }

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
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

  Save = async (callback) => {
    const { PatRegNo } = this.props;
    const { ObjectName } = this.state;

    let alert = null;
    if (PatRegNo && ObjectName && Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName,
          Data: {
            ...this.ModifyObject,
            PatRegNo,
            is_confirm: "no",
            Files: null,
          },
        },
        (resData) => {
          if (resData) {
            const Files = this.ModifyObject["Files"];
            if (resData.Success && resData.Data && Files) {
              this.uploadFile(resData.Data.DataId, callback);
            } else {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData.Success);
                },
              );
            }
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback(false);
        },
      );
    }
    this.setState({ Alert: alert });
  };

  GetOrgOther = () => {
    const { EditObject } = this.state;
    const Value =
      EditObject && EditObject["organization_id"]
        ? EditObject["organization_id"]
        : null;
    return Value ? "none" : "block";
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("type_exam1")}
              />
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ognoo")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseLookUpGridLoad
                ChangeValue={(value) =>
                  this.ChangeValue("organization_id", value)
                }
                Config={this.GetConfigField("organization_id")}
                WithLabel={true}
              />
              <div
                id="organizationOther"
                style={{ display: this.GetOrgOther() }}
              >
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("organization_other")}
                  FullWidth={true}
                />
              </div>
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("diagnosis")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("surgery_name")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("surgery_date")}
                FullWidth={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("surgery_doctors")}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("tasag")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("tnha_virus")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("medeeguijuuleg_turul")}
                FullWidth={true}
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("ersdel_zereg")}
                FullWidth={true}
              />
              {/* <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("comment")}
              /> */}
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("nemelt_sanal")}
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

export default SurgeryPlansForm;
