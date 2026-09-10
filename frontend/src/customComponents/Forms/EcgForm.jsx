import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class EcgForm extends BaseCustomForm {
  /*
  constructor(props) {
    super(props);
  }
*/
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
    const { PatientId } = this.props;
    const { ObjectName } = this.state;

    let alert = null;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data: { ...this.ModifyObject, PatientId, Files: null } },
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
              this.setState({ Alert: alert });
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
            <div>
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("comment")}
              />
              <BaseField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("Files")}
                WithLabel={true}
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

export default EcgForm;
