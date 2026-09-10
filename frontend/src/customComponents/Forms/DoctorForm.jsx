import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseImageSingle from "baseComponents/Controls/BaseImageSingle";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class DoctorForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  GetData = async () => {
    const { Fields } = this.state;
    const { DataId, ObjectName } = this.props;
    if (Fields && ObjectName && DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Op: "Equals", Value: DataId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData) {
            this.setState({
              isLoading: false,
              EditObject: Object.assign({}, resData.Data),
            });
          }
        },
      );
    } else if (Fields && ObjectName && !DataId) {
      this.setState({ isLoading: false });
    }
  };

  ChangeValueAfter = (Field, Value) => {
    let { EditObject, Fields } = this.state;
    if (Field === "addr_soum_dist") {
      // var NewObj = { ...EditObject, addr_soum_dist: Value };
      // this.setState({ EditObject: NewObj });
      var i = 0;
      var j = 0;
      var NewFields = [];
      EditObject = Object.assign({}, EditObject);
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
        EditObject: { ...EditObject, addr_soum_dist: null },
        Fields: NewFields,
      });
    }
    if (Field === "addr_prov_city") {
      EditObject = Object.assign({}, EditObject);
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
        EditObject: { ...EditObject, addr_soum_dist: null },
        Fields: NewFields,
      });
    }
  };

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
                callback && callback(resData);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  Save = async (callback) => {
    const { ObjectName } = this.state;
    const { DataId } = this.props;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName,
          Data: { ...this.ModifyObject, id_data: DataId, Files: null },
        },
        (resData) => {
          if (resData) {
            if (resData.Success && this.ModifyObject["Files"]) {
              this.uploadFile(resData.Data.DataId, callback);
            } else {
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
          }
        },
      );
    } else {
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data: { ...this.ModifyObject, Files: null } },
        (resData) => {
          if (resData) {
            if (resData.Success && this.ModifyObject["Files"]) {
              this.uploadFile(resData.Data.DataId, callback);
            } else {
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
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Alert, Fields } = this.state;
    const OrganizationConfig = this.GetConfigField("OrganizationId");
    const FileConfig = this.GetConfigField("Files");
    return (
      <div>
        {Alert}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={12}>
            {Fields.length > 0 ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <BaseImageSingle
                    Config={{ ...FileConfig }}
                    ChangeValue={this.ChangeValue}
                    square
                  />
                </div>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("personal_number")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lastname")}
                  FullWidth={true}
                />
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("firstname")}
                    FullWidth={true}
                /> */}
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("firstname")}
                  WithLabel
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("email")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("telephone")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("skype")}
                  FullWidth={true}
                />
                {/* <BaseSelect
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("province_city")}
                    FullWidth={true}
                /> */}
                <BaseField
                  ChangeValue={this.ChangeValue}
                  Value={OrganizationConfig ? OrganizationConfig.Value : null}
                  Config={OrganizationConfig}
                  WithLabel
                />
                {/* <BaseField
                  WithLabel={true}
                  ChangeValue={this.ChangeValue}
                  Value={this.GetConfigField("addr_prov_city").Value}
                  Config={this.GetConfigField("addr_prov_city")}
                  
                />
                <BaseField
                  WithLabel={true}
                  ChangeValue={this.ChangeValue}
                  Value={this.GetConfigField("addr_soum_dist").Value}
                  Config={this.GetConfigField("addr_soum_dist")}
                  
                />
                <BaseField
                  WithLabel={true}
                  ChangeValue={this.ChangeValue}
                  Value={this.GetConfigField("addr_bag_khoroo").Value}
                  Config={this.GetConfigField("addr_bag_khoroo")}
                  
                /> */}
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("organisation")}
                    FullWidth={true}
                  
                /> */}
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("position")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("profession")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("professional_degrees")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("experiences")}
                  FullWidth={true}
                />
              </div>
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default DoctorForm;
