import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation

// @mui/material components
import { Box } from "@mui/material";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import BaseFilesInfo from "customComponents/BaseViewControls/BaseFilesInfo";
import GroupPanel from "customComponents/GroupPanel";

import Helper from "helper";
import { colors } from "@/theme/colors";

const sxStyles = {
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
    color: colors.text.white,
  },
  subDiv: {
    position: "relative",
    padding: "20px 10px 10px",
    border: `1px solid ${colors.border.default}`,
    margin: "20px 0 10px",
    backgroundColor: colors.background.surface,
  },
  subTitle: {
    position: "absolute",
    top: "-25px",
    left: "20px",
    padding: "2px 10px",
    border: `1px solid ${colors.border.default}`,
    backgroundColor: colors.background.primary,
  },
};

class FollowUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: {},
      PatientData: null,
      isLoading: false,
      isLoadingPatient: false,
    };
    this.AdviceId = props.AdviceId || null;
    this.PatientId = props.PatientId || null;
  }

  componentDidMount() {
    this.GetData();
    this.GetPatientData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { AdviceId } = this;
    if (AdviceId) {
      this.setState({ isLoading: true });
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "AdviceId", Value: AdviceId, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "FollowUp", SearchOption },
        (resData) => {
          resData && resData.Success && this.setState({ Data: resData.Data });
          this.setState({ isLoading: false });
        },
      );
    }
  };

  GetPatientData = async () => {
    const { PatientId } = this;
    if (PatientId) {
      this.setState({ isLoadingPatient: true });
      await Helper.PatientShowHelper.GetPatientInfoById(
        PatientId,
        (resData) => {
          resData &&
            resData.Success &&
            this.setState({ PatientData: resData.Data });
          this.setState({ isLoadingPatient: false });
        },
      );
    }
  };

  render() {
    const { t } = this.props;
    const { Data, PatientData, isLoading, isLoadingPatient } = this.state;
    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          {/* Main Information */}
          <Box
            sx={{
              position: "relative",
              textAlign: "center",
              borderTop: `3px double ${colors.border.default}`,
              marginTop: "25px",
              paddingTop: "15px",
              backgroundColor: colors.background.primary,
            }}
          >
            <Box
              component="h5"
              sx={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: colors.background.primary,
                padding: "0 15px",
                fontSize: "14px",
                fontWeight: "400",
                margin: 0,
              }}
            >
              {t("Main Information (read only)")}
            </Box>
            {!isLoadingPatient ? (
              PatientData ? (
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: `1px solid ${colors.border.default}`,
                    margin: "10px 0 10px",
                    backgroundColor: colors.background.surface,
                  }}
                >
                  <BaseArrayInfo
                    Label="Social history coded"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_social_hist_codeObj
                        ? PatientData.p_social_hist_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Social history"
                    Value={PatientData.p_soc_hist}
                    md={4}
                  />
                  <BaseArrayInfo
                    Label="Communicable disease code"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_com_dis_codeObj
                        ? PatientData.p_com_dis_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Major communicable disease"
                    Value={PatientData.p_com_dis}
                    md={4}
                  />
                  <BaseArrayInfo
                    Label="Noncommunicable disease code"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_noncom_dis_codeObj
                        ? PatientData.p_noncom_dis_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Major non-communicable disease"
                    Value={PatientData.p_noncom_dis}
                    md={4}
                  />
                  <BaseArrayInfo
                    Label="Operations coded"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_operations_codeObj
                        ? PatientData.p_operations_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Major operations"
                    Value={PatientData.p_operations}
                    md={4}
                  />
                  <BaseArrayInfo
                    Label="Trauma coded"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_trauma_codeObj
                        ? PatientData.p_trauma_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Major trauma"
                    Value={PatientData.p_trauma}
                    md={4}
                  />
                  <BaseArrayInfo
                    Label="Family history coded"
                    TextField={"Label"}
                    LinedField={"Lined"}
                    Values={
                      PatientData.p_fam_hist_codeObj
                        ? PatientData.p_fam_hist_codeObj
                        : []
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Family history"
                    Value={PatientData.p_fam_hist}
                    md={4}
                  />
                </div>
              ) : (
                <BaseNoData />
              )
            ) : (
              <BaseLoading />
            )}
          </Box>
          {/* Summary */}
          <Box
            sx={{
              position: "relative",
              textAlign: "center",
              borderTop: `3px double ${colors.border.default}`,
              marginTop: "25px",
              paddingTop: "15px",
              backgroundColor: colors.background.primary,
            }}
          >
            <Box
              component="h5"
              sx={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: colors.background.primary,
                padding: "0 15px",
                fontSize: "14px",
                fontWeight: "400",
                margin: 0,
              }}
            >
              {t("Summary")}
            </Box>
            {!isLoading ? (
              Data ? (
                <div>
                  <div
                    style={{
                      position: "relative",
                      padding: "10px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px 0 10px",
                      backgroundColor: colors.background.surface,
                    }}
                  >
                    <BaseInfo
                      Label="Date of visit"
                      Value={Data.date_creation}
                      md={4}
                    />
                    <BaseArrayInfo
                      Label="Chief complaint"
                      TextField={"Label"}
                      LinedField={"Lined"}
                      Values={
                        Data.fu_c_comp_codeObj ? Data.fu_c_comp_codeObj : []
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Comment on chief complaint"
                      Value={Data.fu_c_comp}
                      md={4}
                    />
                    <BaseInfo
                      Label="History of present illness"
                      Value={Data.fu_history_ill}
                      md={4}
                    />
                    <BaseInfo
                      Label="Main diagnosis ICD10"
                      Value={Data.fu_m_diag_code}
                      md={4}
                    />
                    <BaseInfo
                      Label="Comment to main diagnosis"
                      Value={Data.fu_m_diag}
                      md={4}
                    />
                    <BaseInfo
                      Label="Coexisting diagnosis ICD10"
                      Value={Data.fu_c_diag_code}
                      md={4}
                    />
                    <BaseInfo
                      Label="Comment to co-existing diagnosis"
                      Value={Data.fu_c_diag}
                      md={4}
                    />
                  </div>
                  <GroupPanel title={t("Vital signs")} level={2}>
                    <GridContainer style={{ marginTop: "10px" }}>
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo
                          Label="Heart rate"
                          Value={Data.fu_pe_vs_heart}
                          md={4}
                        />
                        <BaseInfo
                          Label="Systolic pressure"
                          Value={Data.fu_s_bp}
                          md={4}
                        />
                        <BaseInfo
                          Label="Diastolic pressure"
                          Value={Data.fu_d_bp}
                          md={4}
                        />
                        <BaseInfo
                          Label="Body weight (kg)"
                          Value={Data.fu_vs_bodyweight}
                          md={4}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo
                          Label="Respiratory rate"
                          Value={Data.fu_resp}
                          md={4}
                        />
                        <BaseInfo
                          Label="Body temperature"
                          Value={Data.fu_temp}
                          md={4}
                        />
                        <BaseInfo
                          Label="24 hour Urine (ml)"
                          Value={Data.fu_pe_vs_urine}
                          md={4}
                        />
                        <BaseInfo
                          Label="Height (meter)"
                          Value={Data.fu_vs_height}
                          md={4}
                        />
                      </GridItem>
                    </GridContainer>
                  </GroupPanel>
                  <BaseInfo
                    Label="Patient severity"
                    Value={
                      Data.fu_pe_severityObj ? Data.fu_pe_severityObj.Label : ""
                    }
                    md={4}
                  />
                  <GroupPanel title={t("Review of the systems")} level={2}>
                    <BaseInfo
                      Label="HEENT status"
                      Value={Data.heent_abObj ? Data.heent_abObj.Label : ""}
                      md={4}
                    />
                    {Data.heent_abObj && Data.heent_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseInfo
                          Label="HEENT"
                          Value={Data.fu_pe_heent}
                          md={4}
                        />
                      </div>
                    ) : null}
                    <BaseInfo
                      Label="Skin status"
                      Value={Data.skin_abObj ? Data.skin_abObj.Label : ""}
                      md={4}
                    />
                    {Data.skin_abObj && Data.skin_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseArrayInfo
                          Label="Skin PE coded"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.fu_pe_skin_codeObj
                              ? Data.fu_pe_skin_codeObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo Label="Skin" Value={Data.fu_pe_skin} md={4} />
                      </div>
                    ) : null}
                    <BaseInfo
                      Label="Muscle status"
                      Value={Data.muscle_abObj ? Data.muscle_abObj.Label : ""}
                      md={4}
                    />
                    {Data.muscle_abObj && Data.muscle_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseArrayInfo
                          Label="Muscle PE coded"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.fu_pe_muscle_codeObj
                              ? Data.fu_pe_muscle_codeObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Muscle"
                          Value={Data.fu_pe_muscle}
                          md={4}
                        />
                      </div>
                    ) : null}
                    <BaseInfo
                      Label="Joints status"
                      Value={Data.joints_abObj ? Data.joints_abObj.Label : ""}
                      md={4}
                    />
                    {Data.joints_abObj && Data.joints_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseArrayInfo
                          Label="Joint PE coded"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.fu_pe_joint_codeObj
                              ? Data.fu_pe_joint_codeObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Joints"
                          Value={Data.fu_pe_joints}
                          md={4}
                        />
                      </div>
                    ) : null}

                    <BaseInfo
                      Label="Respiratory system status"
                      Value={Data.res_abObj ? Data.res_abObj.Label : ""}
                      md={4}
                    />
                    {Data.res_abObj && Data.res_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseInfo
                          Label="Abnormality in left lung"
                          Value={
                            Data.fu_pe_resp_llungObj
                              ? Data.fu_pe_resp_llungObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_resp_llungObj &&
                        Data.fu_pe_resp_llungObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Respiratory PE coded"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_resp_sys_codeObj
                                  ? Data.fu_pe_resp_sys_codeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        ) : null}
                        <BaseInfo
                          Label="Abnormality in right lung"
                          Value={
                            Data.fu_pe_resp_rlungObj
                              ? Data.fu_pe_resp_rlungObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_resp_rlungObj &&
                        Data.fu_pe_resp_rlungObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Respiratory PE Coded1"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_resp_sys_code1Obj
                                  ? Data.fu_pe_resp_sys_code1Obj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        ) : null}

                        <BaseInfo
                          Label="Respiratory system"
                          Value={Data.fu_pe_resp_sys}
                          md={4}
                        />
                      </div>
                    ) : null}

                    <BaseInfo
                      Label="Circulatory system status"
                      Value={Data.cir_abObj ? Data.cir_abObj.Label : ""}
                      md={4}
                    />
                    {Data.cir_abObj && Data.cir_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseInfo
                          Label="Mitral area murmur"
                          Value={
                            Data.fu_pe_loc_mvObj
                              ? Data.fu_pe_loc_mvObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_loc_mvObj &&
                        Data.fu_pe_loc_mvObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Murmurs"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_circ_sys_code2Obj
                                  ? Data.fu_pe_circ_sys_code2Obj
                                  : []
                              }
                              md={4}
                              Clear="both"
                            />
                          </div>
                        ) : null}
                        <BaseInfo
                          Label="Aortic area murmur"
                          Value={
                            Data.fu_pe_loc_aoObj
                              ? Data.fu_pe_loc_aoObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_loc_aoObj &&
                        Data.fu_pe_loc_aoObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Murmur"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_circ_sys_codeObj
                                  ? Data.fu_pe_circ_sys_codeObj
                                  : []
                              }
                              md={4}
                              Clear="both"
                            />
                          </div>
                        ) : null}

                        <BaseInfo
                          Label="Pulmonary area murmur"
                          Value={
                            Data.fu_pe_loc_pvObj
                              ? Data.fu_pe_loc_pvObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_loc_pvObj &&
                        Data.fu_pe_loc_pvObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Murmurs"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_circ_sys_code1Obj
                                  ? Data.fu_pe_circ_sys_code1Obj
                                  : []
                              }
                              md={4}
                              Clear="both"
                            />
                          </div>
                        ) : null}

                        <BaseInfo
                          Label="Tricuspid area murmur"
                          Value={
                            Data.fu_pe_loc_tvObj
                              ? Data.fu_pe_loc_tvObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.fu_pe_loc_tvObj &&
                        Data.fu_pe_loc_tvObj.Value !== "n" ? (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="Murmurs"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.fu_pe_circ_sys_code3Obj
                                  ? Data.fu_pe_circ_sys_code3Obj
                                  : []
                              }
                              md={4}
                              Clear="both"
                            />
                          </div>
                        ) : null}
                        <BaseInfo
                          Label="Circulatory system"
                          Value={Data.fu_pe_circ_sys}
                          md={4}
                        />
                      </div>
                    ) : null}

                    <BaseInfo
                      Label="Gastroenterology system status"
                      Value={Data.gas_abObj ? Data.gas_abObj.Label : ""}
                      md={4}
                    />
                    {Data.gas_abObj && Data.gas_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseArrayInfo
                          Label="Gastrology PE coded"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.fu_pe_gast_sys_codeObj
                              ? Data.fu_pe_gast_sys_codeObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Gastrointestinal system"
                          Value={Data.fu_pe_gast_sys}
                          md={4}
                        />
                      </div>
                    ) : null}

                    <BaseInfo
                      Label="Nephrology system status"
                      Value={Data.neph_abObj ? Data.neph_abObj.Label : ""}
                      md={4}
                    />
                    {Data.neph_abObj && Data.neph_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseArrayInfo
                          Label="Nephrology PE coded"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.fu_pe_nephrology_codeObj
                              ? Data.fu_pe_nephrology_codeObj
                              : []
                          }
                          md={4}
                          Clear="both"
                        />
                        <BaseInfo
                          Label="Nephrology"
                          Value={Data.fu_pe_nephrology}
                          md={4}
                        />
                      </div>
                    ) : null}

                    <BaseInfo
                      Label="Other system status"
                      Value={Data.oth_abObj ? Data.oth_abObj.Label : ""}
                      md={4}
                    />
                    {Data.oth_abObj && Data.oth_abObj.Value === "a" ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "20px 0 10px",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <BaseInfo
                          Label="Other"
                          Value={Data.fu_pe_other}
                          md={4}
                        />
                      </div>
                    ) : null}
                  </GroupPanel>
                  <GroupPanel title={t("Tests")} level={2}>
                    <BaseInfo
                      Label="CBC test"
                      Value={Data.cbcyornObj ? Data.cbcyornObj.Label : ""}
                      md={4}
                    />
                    {Data.cbcyornObj && Data.cbcyornObj.Value === "a" ? (
                      <GroupPanel
                        title={t("Complete Blood Count Test Result")}
                        level={3}
                      >
                        <BaseInfo
                          Label="White blood cell (4-8*10e9/L)"
                          Value={Data.fu_cbc_w_blood}
                          md={4}
                        />
                        <BaseInfo
                          Label="Red blood cell (*10e9/L)"
                          Value={Data.fu_cbc_r_blood}
                          md={4}
                        />
                        <BaseInfo
                          Label="Hemoglobin (g/dL)"
                          Value={Data.fu_cbc_hemoglobin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Hematocrit (%)"
                          Value={Data.fu_cbc_hematocrit}
                          md={4}
                        />
                        <BaseInfo
                          Label="Platelet (*10e9/L)"
                          Value={Data.fu_cbc_platelet}
                          md={4}
                        />
                        <BaseInfo
                          Label="ESR (mm/h)"
                          Value={Data.fu_cbc_esr}
                          md={4}
                        />
                        <BaseInfo
                          Label="Other / Comment"
                          Value={Data.fu_cbc_other}
                          md={4}
                        />
                      </GroupPanel>
                    ) : null}

                    <BaseInfo
                      Label="Biochemistry test"
                      Value={
                        Data.biochemyornObj ? Data.biochemyornObj.Label : ""
                      }
                      md={4}
                    />
                    {Data.biochemyornObj &&
                    Data.biochemyornObj.Value === "a" ? (
                      <GroupPanel
                        title={t("Biochemistry Test Result")}
                        level={3}
                      >
                        <BaseInfo
                          Label="Total protein (g/L)"
                          Value={Data.fu_bio_total_protein}
                          md={4}
                        />
                        <BaseInfo
                          Label="Albumin"
                          Value={Data.fu_bio_albumin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Creatinine"
                          Value={Data.fu_bio_creatinine}
                          md={4}
                        />
                        <BaseInfo
                          Label="Mochevin (mmol/L)"
                          Value={Data.fu_bio_mochevin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Uldegdel azot (mmol/L)"
                          Value={Data.fu_bio_uldegdel}
                          md={4}
                        />
                        <BaseInfo
                          Label="GOT (u/L)"
                          Value={Data.fu_bio_got}
                          md={4}
                        />
                        <BaseInfo
                          Label="GPT (u/L)"
                          Value={Data.fu_bio_gpt}
                          md={4}
                        />
                        <BaseInfo
                          Label="Amilaze (u/L)"
                          Value={Data.fu_bio_amilase}
                          md={4}
                        />
                        <BaseInfo
                          Label="Sugar (mmol/L)"
                          Value={Data.fu_bio_sugar}
                          md={4}
                        />
                        <BaseInfo
                          Label="Cholesterol"
                          Value={Data.fu_bio_cholesterol}
                          md={4}
                        />
                        <BaseInfo
                          Label="Sodium (mmol/L)"
                          Value={Data.fu_bio_sodium}
                          md={4}
                        />
                        <BaseInfo
                          Label="Potassium (mmol/L)"
                          Value={Data.fu_bio_potassium}
                          md={4}
                        />
                        <BaseInfo
                          Label="LDG (u/L)"
                          Value={Data.fu_bio_ldg}
                          md={4}
                        />
                        <BaseInfo
                          Label="Other"
                          Value={Data.fu_bio_other}
                          md={4}
                        />
                      </GroupPanel>
                    ) : null}

                    <BaseInfo
                      Label="Urine test"
                      Value={Data.urineyornObj ? Data.urineyornObj.Label : ""}
                      md={4}
                    />
                    {Data.urineyornObj && Data.urineyornObj.Value === "a" ? (
                      <GroupPanel title={t("Urine Test Result")} level={3}>
                        <BaseInfo
                          Label="Urine volume (ml)"
                          Value={Data.fu_urine_volume}
                          md={4}
                        />
                        <BaseInfo
                          Label="Color"
                          Value={Data.fu_urine_color}
                          md={4}
                        />
                        <BaseInfo
                          Label="Bulingar"
                          Value={Data.fu_urine_bulingar}
                          md={4}
                        />
                        <BaseInfo
                          Label="Khuviin jin (mg/100ml)"
                          Value={Data.fu_urine_khuviin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Red blood cell (RBC/ml)"
                          Value={Data.fu_urine_r_blood}
                          md={4}
                        />
                        <BaseInfo
                          Label="White blood cell (WBC/ml)"
                          Value={Data.fu_urine_w_blood}
                          md={4}
                        />
                        <BaseInfo
                          Label="RBC in microscope (Visual space)"
                          Value={Data.fu_urine_rbc_micr}
                          md={4}
                        />
                        <BaseInfo
                          Label="WBC in microscope (Visual space)"
                          Value={Data.fu_urine_wbc_micr}
                          md={4}
                        />
                        <BaseInfo
                          Label="Bilirubin"
                          Value={Data.fu_urine_bilirubin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Urobilinogen"
                          Value={Data.fu_urine_urobilinogen}
                          md={4}
                        />
                        <BaseInfo
                          Label="Ketonii biy"
                          Value={Data.fu_urine_ketonii}
                          md={4}
                        />
                        <BaseInfo
                          Label="Protein (g/L)"
                          Value={Data.fu_urine_protein}
                          md={4}
                        />
                        <BaseInfo
                          Label="Nitrit (mg/100ml)"
                          Value={Data.fu_urine_nitrit}
                          md={4}
                        />
                        <BaseInfo
                          Label="Sugar"
                          Value={Data.fu_urine_sugar}
                          md={4}
                        />
                        <BaseInfo
                          Label="pH (mg/100ml)"
                          Value={Data.fu_urine_ph}
                          md={4}
                        />
                        <BaseInfo
                          Label="Other"
                          Value={Data.fu_urine_other}
                          md={4}
                        />
                      </GroupPanel>
                    ) : null}
                  </GroupPanel>
                  <BaseInfo
                    Label="Other laboratory test"
                    Value={Data.other1}
                    md={4}
                  />
                  <Box
                    sx={{
                      position: "relative",
                      textAlign: "center",
                      borderTop: `3px double ${colors.border.default}`,
                      marginTop: "25px",
                      paddingTop: "15px",
                      backgroundColor: colors.background.primary,
                    }}
                  >
                    <Box
                      component="h5"
                      sx={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: colors.background.primary,
                        padding: "0 15px",
                        fontSize: "14px",
                        fontWeight: "400",
                        margin: 0,
                      }}
                    >
                      {t("Files")}
                    </Box>
                    <BaseFilesInfo
                      Data={Data.Files ? Data.Files : []}
                      md={4}
                      Label="File attachment"
                    />
                  </Box>
                </div>
              ) : (
                <BaseNoData />
              )
            ) : (
              <BaseLoading />
            )}
          </Box>
        </GridItem>
      </GridContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(FollowUp);
