import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const styles = {
  headerDiv: {
    position: "relative",
    display: "inline-block",
    width: "100%",
    borderTop: `1px solid ${colors.border.default}`,
    padding: "15px 0 0",
    marginTop: "25px",
  },
  headerTitle: {
    position: "absolute",
    top: "-30px",
    left: "20px",
    fontWeight: "400",
    padding: "5px 25px",
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: "6px",
    color: colors.background.primary,
  },
};

class FollowUpForm extends BaseCustomForm {
  constructor(props) {
    super(props);
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
    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    if (childDiv) {
      if (Value === "a" || Value === "y") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "a" || Value === "y" || Value === "other") return "block";
    else return "none";
  };

  GetFiles = async (id_data) => {
    const { ObjectName } = this.state;
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: "LinkedObjectName", Op: "Equals", Value: ObjectName },
      { Field: "LinkedObjectId", Op: "Equals", Value: id_data },
      { Field: "rec_status", Op: "Equals", Value: "9" },
    ];
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "File", SearchOption },
      (resData) => {
        if (resData && resData.Success) {
          const { EditObject } = this.state;
          const files = resData.Data.map((file) => ({
            FileInfo: { ...file, Name: file.original_name + "." + file.ext },
            Type: file.ext,
          }));
          console.log("GetFiles - Setting OriginalFiles:", files);
          this.setState({
            EditObject: { ...EditObject, Files: files },
            OriginalFiles: files,
          });
        }
      },
    );
  };

  GetData = async () => {
    const { AdviceId } = this.props;
    const { ObjectName } = this.state;
    if (AdviceId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "AdviceId", Op: "Equals", Value: AdviceId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData && resData.Success) {
            this.setState({ EditObject: Object.assign({}, resData.Data) });
            if (resData.Data && resData.Data.id_data) {
              this.GetFiles(resData.Data.id_data);
            }
          }
          this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  deleteRemovedFiles = async () => {
    const { OriginalFiles } = this.state;
    const currentFiles = this.ModifyObject["Files"] || [];

    console.log("deleteRemovedFiles called", { OriginalFiles, currentFiles });

    if (OriginalFiles && OriginalFiles.length > 0) {
      const currentFileIds = currentFiles
        .filter((f) => f.FileInfo && f.FileInfo.id_data)
        .map((f) => f.FileInfo.id_data);

      const filesToDelete = OriginalFiles.filter(
        (f) =>
          f.FileInfo &&
          f.FileInfo.id_data &&
          !currentFileIds.includes(f.FileInfo.id_data),
      );

      console.log("Files to delete:", filesToDelete);

      for (const file of filesToDelete) {
        console.log("Deleting file:", file.FileInfo.id_data);
        await Helper.BaseCrudHelper.BaseDeleteFile(file.FileInfo.id_data);
      }
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];

    // Delete removed files first
    await this.deleteRemovedFiles();

    if (Value && Value.some((f) => f.File)) {
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
          } else {
            callback && callback({ Success: false });
          }
        },
      );
    } else {
      callback && callback({ Success: true });
    }
  };

  Save = async (callback) => {
    const { EditObject } = this.state;
    const { AdviceId } = this.props;
    if (Object.keys(this.ModifyObject).length > 0) {
      var Data = null;
      if (EditObject && EditObject.id_data) {
        Data = Object.assign({}, this.ModifyObject, {
          id_data: EditObject.id_data,
          AdviceId,
          Files: null,
        });
      } else {
        Data = Object.assign({}, this.ModifyObject, { AdviceId, Files: null });
      }
      await Helper.FollowUpHelper.CustomSave(
        { AdviceId, Data },
        async (resData) => {
          if (resData) {
            if (resData.Success) {
              // Handle file deletions and uploads
              if (this.ModifyObject["Files"] !== undefined) {
                const dataId = resData.Data?.DataId || EditObject?.id_data;
                if (dataId) {
                  this.uploadFile(dataId, callback);
                } else {
                  // Only delete files if no new record is created
                  await this.deleteRemovedFiles();
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
              } else {
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
            } else {
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
          } else {
            callback && callback({ Success: false });
          }
        },
      );
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "No changes to save",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback({ Success: false });
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { Fields } = this.state;
    const { t } = this.props;
    const FileConfig = this.GetConfigField("Files");

    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12} style={{ margin: "10px" }}>
          {Fields ? (
            <div>
              <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("fu_hosp_date")}
              />
              <BaseCheckBox
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("fu_c_comp_code")}
                boxMd={6}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                FullWidth={true}
                Config={this.GetConfigField("fu_c_comp")}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                FullWidth={true}
                Config={this.GetConfigField("fu_history_ill")}
              />
              <BaseField
                Config={this.GetConfigField("fu_m_diag_code")}
                Value={this.GetConfigField("fu_m_diag_code")?.Value}
                FullWidth={true}
                ChangeValue={this.ChangeValue}
                WithLabel={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                FullWidth={true}
                Config={this.GetConfigField("fu_m_diag")}
              />
              <BaseField
                Config={this.GetConfigField("fu_c_diag_code")}
                Value={this.GetConfigField("fu_c_diag_code")?.Value}
                FullWidth={true}
                ChangeValue={this.ChangeValue}
                WithLabel={true}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                FullWidth={true}
                Config={this.GetConfigField("fu_c_diag")}
              />
              <GroupPanel title={t("Vital signs")}>
                <GridContainer>
                  <GridItem xs={12} sm={6} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_pe_vs_heart"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_s_bp"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_d_bp"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("fu_vs_bodyweight")}
                      md={6}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_resp"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("fu_temp")}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_pe_vs_urine"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("fu_vs_height"),
                        Type: "Number",
                      }}
                      md={6}
                    />
                  </GridItem>
                </GridContainer>
              </GroupPanel>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("fu_pe_severity")}
              />
              <GroupPanel title={t("Review of the systems")} level={1}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("heent_ab")}
                    />
                    <div
                      id="heent_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("heent_ab"),
                      }}
                    >
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_heent")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("skin_ab")}
                    />
                    <div
                      id="skin_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("skin_ab"),
                      }}
                    >
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_skin_code")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_skin")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("muscle_ab")}
                    />
                    <div
                      id="muscle_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("muscle_ab"),
                      }}
                    >
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_muscle_code")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_muscle")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("joints_ab")}
                    />
                    <div
                      id="joints_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("joints_ab"),
                      }}
                    >
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_joint_code")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_joints")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("res_ab")}
                    />
                    <div
                      id="res_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("res_ab"),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_resp_llung")}
                      />
                      <div
                        id="fu_pe_resp_llungChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_resp_llung"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_resp_sys_code")}
                        />
                      </div>
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_resp_rlung")}
                      />
                      <div
                        id="fu_pe_resp_rlungChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_resp_rlung"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_resp_sys_code1")}
                        />
                      </div>
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_resp_sys")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("cir_ab")}
                    />
                    <div
                      id="cir_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("cir_ab"),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_loc_mv")}
                      />
                      <div
                        id="fu_pe_loc_mvChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_loc_mv"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_circ_sys_code2")}
                        />
                      </div>
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_loc_ao")}
                      />
                      <div
                        id="fu_pe_loc_aoChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_loc_ao"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_circ_sys_code")}
                        />
                      </div>
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_loc_pv")}
                      />
                      <div
                        id="fu_pe_loc_pvChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_loc_pv"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_circ_sys_code2")}
                        />
                      </div>
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_loc_tv")}
                      />
                      <div
                        id="fu_pe_loc_tvChild"
                        style={{
                          position: "relative",
                          padding: "10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "10px",
                          backgroundColor: colors.background.surfaceAlt,
                          display: this.GetDisplay("fu_pe_loc_tv"),
                        }}
                      >
                        <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("fu_pe_circ_sys_code3")}
                        />
                      </div>
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_circ_sys")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("gas_ab")}
                    />
                    <div
                      id="gas_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("gas_ab"),
                      }}
                    >
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_gast_sys_code")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_gast_sys")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("neph_ab")}
                    />
                    <div
                      id="neph_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("neph_ab"),
                      }}
                    >
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_pe_nephrology_code")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_nephrology")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("oth_ab")}
                    />
                    <div
                      id="oth_abChild"
                      style={{
                        position: "relative",
                        padding: "10px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "10px",
                        backgroundColor: colors.background.surfaceAlt,
                        display: this.GetDisplay("oth_ab"),
                      }}
                    >
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_pe_other")}
                      />
                    </div>
                  </GridItem>
                </GridContainer>
              </GroupPanel>
              <GroupPanel title={t("Tests")} level={1}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("cbcyorn")}
                    />
                    <GroupPanel
                      title={t("Complete Blood Count Test Result")}
                      level={2}
                    >
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_w_blood")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_r_blood")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_hemoglobin")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_hematocrit")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_platelet")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_cbc_esr")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_cbc_other")}
                      />
                    </GroupPanel>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("biochemyorn")}
                    />
                    <GroupPanel title={t("Biochemistry Test Result")} level={2}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_total_protein")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_albumin")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_creatinine")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_mochevin")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_uldegdel")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_got")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_gpt")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_amilase")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_sugar")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_cholesterol")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_sodium")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_potassium")}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_bio_ldg")}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_bio_other")}
                      />
                    </GroupPanel>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("urineyorn")}
                    />
                    <GroupPanel title={t("Urine Test Result")} level={2}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_volume")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_color")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_bulingar")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_khuviin")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_r_blood")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_w_blood")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_rbc_micr")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_wbc_micr")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_bilirubin")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_urobilinogen")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_ketonii")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_protein")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_nitrit")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_sugar")}
                        FullWidth={true}
                      />

                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("fu_urine_ph")}
                        FullWidth={true}
                      />
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField("fu_urine_other")}
                      />
                    </GroupPanel>
                  </GridItem>
                </GridContainer>
              </GroupPanel>
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                FullWidth={true}
                Config={this.GetConfigField("other1")}
              />
              <BaseField
                WithLabel={true}
                Config={{ ...FileConfig }}
                Value={
                  FileConfig && Array.isArray(FileConfig.Value)
                    ? FileConfig.Value
                    : []
                }
                ChangeValue={this.ChangeValue}
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

export default withTranslation(undefined, { withRef: true })(FollowUpForm);
