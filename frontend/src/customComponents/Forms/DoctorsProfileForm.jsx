import { withTranslation } from "react-i18next";
import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTab from "baseComponents/BaseTab";
// helper
import Helper from "helper";
//import Organization from "view/Organization";

class DoctorsProfileForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      UserName: "",
    };
    this.UserData = {};
  }

  ChangeUserData = (Field, Value) => {
    this.UserData[Field] = Value;
    if (Field === "UserName") {
      this.setState({ UserName: Value });
    }
    process.env.NODE_ENV === "development" && console.log(this.UserData);
  };

  GetData = async () => {
    const { ObjectName, Fields } = this.state;
    const { DataId } = this.props;
    if (Fields && ObjectName && DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Op: "Equals", Value: DataId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData) {
            const editObj = Object.assign({}, resData.Data);
            this.setState({
              isLoading: false,
              EditObject: editObj,
              UserName:
                editObj && editObj.Users ? editObj.Users.UserName || "" : "",
            });
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
    if (Value) {
      console.log("Uploading files to backend:", {
        LinkedObjectInfo: {
          LinkedObjectName: ObjectName,
          LinkedObjectId: Id,
          FieldName: "Files",
        },
        FileCount: Value.length,
      });

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
          console.log("Backend response for file upload:", resData);
          if (resData) {
            if (!resData.Success) {
              const alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData.Success);
                },
              );
              this.setState({ Alert: alert });
            } else {
              callback && callback(resData.Success);
            }
          }
        },
      );
    }
  };

  SaveUser = async (callback) => {
    const { EditObject } = this.state;

    var UserData = {};
    UserData["UserName"] = this.UserData.UserName
      ? this.UserData.UserName
      : EditObject && EditObject.Users
        ? EditObject.Users.UserName
        : "";

    let alert = null;
    const validationFields = ["UserName"];
    let validationMessage = "";

    if (this.ModifyObject.lastname) {
      UserData.LastName = this.ModifyObject.lastname;
    }
    if (this.ModifyObject.firstname) {
      UserData.FirstName = this.ModifyObject.firstname;
    }

    if (this.ModifyObject.AppId) {
      UserData.AppId = this.ModifyObject.AppId;
    }

    if (this.ModifyObject.email) {
      UserData.Email = this.ModifyObject.email;
    }

    if (this.ModifyObject.telephone) {
      UserData.telephone = this.ModifyObject.telephone;
    }

    if (UserData.UserName && validationFields.includes("UserName")) {
      // Only overwrite if the user explicitly changed the username
      if (this.UserData.UserName) {
        UserData.UserName = this.UserData.UserName;
      }
    } else {
      validationMessage += "Хэрэглэгчийн нэр оруулна уу";
    }

    if (this.UserData.RoleId) {
      UserData.RoleId = this.UserData.RoleId;
    }

    if (validationMessage === "") {
      console.log("Sending user data to backend:", {
        ObjectName: "Users",
        UserData: UserData,
        isUpdate: !!(EditObject && EditObject.Users),
      });

      if (EditObject && EditObject.Users) {
        const userUpdateData = {
          ...UserData,
          Id: EditObject.Users ? EditObject.Users.Id : null,
        };
        console.log("User update data:", userUpdateData);
        await Helper.BaseCrudHelper.BaseUpdate(
          {
            ObjectName: "Users",
            Data: userUpdateData,
          },
          (resData) => {
            console.log("Backend response for user update:", resData);
            if (resData && resData.Success) {
              return callback && callback(EditObject.Users.Id);
            } else {
              this.setState({ Alert: null });
              const message = resData ? resData.Message : "User update failed";
              alert = Helper.BaseCrudHelper.ShowAlert(message, false, () => {
                this.setState({ Alert: null, isLoading: false });
                callback && callback(null);
              });
              this.setState({ Alert: alert });
            }
          },
        );
      } else {
        await Helper.BaseCrudHelper.BaseCreate(
          { ObjectName: "Users", Data: UserData },
          (resData) => {
            console.log("Backend response for user creation:", resData);
            if (resData) {
              if (resData.Success) {
                const dataId =
                  resData.Data && resData.Data.DataId
                    ? resData.Data.DataId
                    : resData.Data
                      ? resData.Data.Id
                      : null;
                callback && callback(dataId);
              } else {
                this.setState({ Alert: null });
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  false,
                  () => {
                    this.setState({ Alert: null, isLoading: false });
                    callback && callback(null);
                  },
                );
                this.setState({ Alert: alert });
              }
            }
          },
        );
      }
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(validationMessage, false, () => {
        this.setState({ Alert: null });
      });
      this.setState({ Alert: alert });
      callback && callback(null);
      return;
    }
  };

  SaveDoctor = async (UserId, callback) => {
    const { EditObject } = this.state;
    const { DataId } = this.props;

    let alert = null;

    console.log("Sending doctor data to backend:", {
      ObjectName: "DoctorsProfile",
      ModifyObject: this.ModifyObject,
      UserId: UserId,
      DataId: DataId,
      isUpdate: !!(EditObject && DataId),
    });

    if (EditObject && DataId) {
      const updateData = {
        ...this.ModifyObject,
        Files: null,
        id_data: DataId,
        UserId: UserId,
      };
      console.log("DoctorsProfile update data:", updateData);
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName: "DoctorsProfile",
          Url: "/DoctorProfile/CustomUpdate",
          Data: updateData,
        },
        (resData) => {
          console.log("Backend response for doctor update:", resData);
          if (resData) {
            if (resData.Data && resData.Success && this.ModifyObject["Files"]) {
              this.uploadFile(resData.Data.DataId, callback);
            } else if (!resData.Success) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData.Success);
                },
              );
              this.setState({ Alert: alert });
            } else {
              callback && callback(resData.Success);
            }
          }
        },
      );
    } else {
      const createData = { ...this.ModifyObject, Files: null, id: UserId };
      console.log("DoctorsProfile create data:", createData);
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "DoctorsProfile",
          Url: "/DoctorProfile/CustomCreate",
          Data: createData,
        },
        (resData) => {
          console.log("Backend response for doctor creation:", resData);
          if (resData) {
            if (resData.Data && resData.Success && this.ModifyObject["Files"]) {
              this.uploadFile(resData.Data.DataId, callback);
            } else if (!resData.Success) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData);
                },
              );
              this.setState({ Alert: alert });
            } else {
              callback && callback(resData);
            }
          }
        },
      );
    }
  };

  ChangeValueAfter = (Field, Value) => {
    const { EditObject, Fields } = this.state;
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
  };

  Save = async (callback) => {
    console.log("Starting save process for DoctorsProfile", {
      ModifyObject: this.ModifyObject,
      EditObject: this.state.EditObject,
    });
    await this.SaveUser(async (UserId) => {
      console.log("User save completed with UserId:", UserId);
      if (UserId) {
        await this.SaveDoctor(UserId, (resData) => {
          console.log("Doctor save completed with result:", resData);
          callback && callback(resData);
        });
      } else {
        console.log("User save failed, skipping doctor save");
        callback && callback(null);
      }
    });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Alert, Fields, EditObject } = this.state;

    const baseOrgConfig = this.GetConfigField("OrganizationId");
    const orgValue = EditObject?.OrganizationId || EditObject?.Organization?.Id;
    const orgText = EditObject?.Organization?.Name || "";
    const OrganizationConfig = {
      ...(baseOrgConfig || {}),
      Name: "OrganizationId",
      Label: baseOrgConfig?.Label || "Байгууллага",
      Type: "GridLookUpSingleLoad",
      Value: orgValue,
      InitialText: orgText,
      Config: {
        ObjectName: "Organization",
        IdField: "Id",
        TextField: "Name",
        MinTextLength: 0,
        SearchType: "AllData",
        SearchUrl: "/BaseObject/",
        Fields: [{ Name: "Name", Label: t("Name") }],
      },
    };
    const FileConfig = this.GetConfigField("Files");

    // Debug logging
    console.log("DEBUG OrganizationId:", {
      orgValue,
      orgText,
      InitialText: OrganizationConfig?.InitialText,
    });

    return (
      <div>
        {Alert}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={12}>
            {Fields.length > 0 ? (
              <div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <BaseField
                    Config={{ ...FileConfig }}
                    Value={
                      FileConfig && Array.isArray(FileConfig.Value)
                        ? FileConfig.Value
                        : []
                    }
                    ChangeValue={this.ChangeValue}
                  />
                </div>

                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("personal_number")}
                      Value={this.GetConfigField("personal_number").Value}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lastname")}
                      Value={this.GetConfigField("lastname").Value}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("firstname")}
                      Value={this.GetConfigField("firstname").Value}
                      FullWidth={true}
                    />
                  </GridItem>

                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeUserData}
                      Value={this.state.UserName}
                      Config={{
                        Type: "Text",
                        Name: "UserName",
                        Label: t("User name"),
                      }}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeUserData}
                      Value={
                        EditObject && EditObject.Users
                          ? EditObject.Users.RoleId
                          : null
                      }
                      Config={this.GetConfigField("RoleId")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeValue}
                      Value={EditObject ? EditObject.AppId : null}
                      Config={this.GetConfigField("AppId")}
                      FullWidth={true}
                    />
                  </GridItem>

                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("email")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("telephone")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("skype")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseField
                      ChangeValue={this.ChangeValue}
                      Value={
                        OrganizationConfig
                          ? OrganizationConfig.Value ||
                            (EditObject &&
                              (EditObject.OrganizationId ||
                                (EditObject.Organization &&
                                  EditObject.Organization.Id)))
                          : null
                      }
                      Config={OrganizationConfig}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("position")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("profession")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("professional_degrees")}
                      FullWidth={true}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("experiences")}
                      FullWidth={true}
                    />
                  </GridItem>
                </GridContainer>
                <div style={{ height: "20px" }} />
                <BaseTab
                  Tabss={[
                    {
                      Label: t("Departments"),
                      TabBody: (
                        <BaseField
                          DataId={EditObject ? EditObject.id_data : null}
                          Config={{
                            Name: "Departments",
                            Label: t("Departments"),
                            Type: "ListView",
                            Config: {
                              ObjectName: "DoctorTooDepartment",
                              Fields: ["dico", "value"],
                              ForiegnKey: "DoctorId",
                            },
                          }}
                        />
                      ),
                    },
                  ]}
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

export default withTranslation(undefined, { withRef: true })(
  DoctorsProfileForm,
);
