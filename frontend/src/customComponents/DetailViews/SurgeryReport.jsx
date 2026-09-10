import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

export default function SurgeryReport(props) {
  const { t } = useTranslation();
  const { DataId = null } = props;

  const [Data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetData = async () => {
    setIsLoading(true);
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "id_data",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "CardiacSurgeryReport", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            setData(Object.assign({}, resData.Data));
          setIsLoading(false);
        },
      );
    } else {
      setIsLoading(false);
    }
  };

  const GetTabs = () => {
    var Tabs = [];
    if (Data) {
      Tabs.push({
        tabButton: "Page 1",
        tabContent: (
          <div>
            <GroupPanel title={t("Hospitalisation")}>
              <BaseInfo
                Label="Date-of-admission"
                Value={Data.date_of_admission}
                md={4}
              />
              <BaseInfo
                Label="Date-of-operation"
                Value={Data.date_of_operation}
                md={4}
              />
              <BaseInfo
                Label="Date-of-discharge / Date-of-death"
                Value={Data.date_of_discharge_death}
                md={4}
              />
            </GroupPanel>
            <GroupPanel title={t("Cardiac history")}>
              <BaseInfo
                Label="Angina (CCS class)"
                Value={Data.anginaObj ? Data.anginaObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Dyspnoea (NYHA grade)"
                Value={Data.dyspnoeaObj ? Data.dyspnoeaObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Number of previous myocardial infarctions"
                Value={
                  Data.nb_prev_myo_infarctionObj
                    ? Data.nb_prev_myo_infarctionObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Most recent myocardial infarction"
                Value={
                  Data.most_rcnt_myo_infarctionObj
                    ? Data.most_rcnt_myo_infarctionObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Congestive heart failure"
                Value={
                  Data.congestive_heart_failureObj
                    ? Data.congestive_heart_failureObj.Label
                    : ""
                }
                md={4}
              />
            </GroupPanel>
            <GroupPanel title={t("Previous interventions")}>
              <BaseInfo
                Label="Previous PCI"
                Value={Data.prev_pciObj ? Data.prev_pciObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Previous cardiac, vascular or thoracic surgery"
                Value={Data.date_last_pci}
                md={4}
              />
              <BaseArrayInfo
                Label="Date of last PCI"
                Values={Data.prev_surgeryObj ? Data.prev_surgeryObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
              />
              <BaseInfo
                Label="Date of last cardiac surgery"
                Value={Data.date_last_sur}
                md={4}
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 2",
        tabContent: (
          <div>
            <GroupPanel title={t("Pre-operative risk factors")}>
              <BaseInfo Label="Weight" Value={Data.weight} md={4} />
              <BaseInfo Label="Height" Value={Data.height} md={4} />
              <BaseInfo
                Label="Smoking history"
                Value={
                  Data.smoking_historyObj ? Data.smoking_historyObj.Label : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Diabetes treatment"
                Value={
                  Data.diab_treatmentObj ? Data.diab_treatmentObj.Label : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Hypertension"
                Value={Data.hypertensionObj ? Data.hypertensionObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Hypercholesterolaemia"
                Value={
                  Data.hypercholesterolaemiaObj
                    ? Data.hypercholesterolaemiaObj.Label
                    : ""
                }
                md={4}
              />
              <BaseArrayInfo
                Label="Renal"
                Values={Data.renalObj ? Data.renalObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseInfo
                Label="Last pre-operative creatinine"
                Value={Data.last_preo_creatine}
                md={4}
              />
              <BaseInfo
                Label="Chronic lung disease"
                Value={
                  Data.chr_lung_diseaseObj ? Data.chr_lung_diseaseObj.Label : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Extra-cardiac arteriopathy"
                Value={
                  Data.ext_card_arteriopathyObj
                    ? Data.ext_card_arteriopathyObj.Label
                    : ""
                }
                md={4}
              />
              <BaseArrayInfo
                Label="Cerebrovascular disease type"
                Values={
                  Data.cerebvas_disease_typeObj
                    ? Data.cerebvas_disease_typeObj
                    : []
                }
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseInfo
                Label="Neurological dysfunction"
                Value={
                  Data.neuro_dysfunctionObj
                    ? Data.neuro_dysfunctionObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Carotid bruits"
                Value={
                  Data.carotid_bruitsObj ? Data.carotid_bruitsObj.Label : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Pre-operative heart rhythm"
                Value={
                  Data.preo_heart_rhythmObj
                    ? Data.preo_heart_rhythmObj.Label
                    : ""
                }
                md={4}
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 3",
        tabContent: (
          <div>
            <GroupPanel
              title={t("Pre-operative haemodynamics and catheterisation")}
            >
              <BaseArrayInfo
                Label="Left- or right-heart catheterisation"
                Values={
                  Data.left_right_heart_cathObj
                    ? Data.left_right_heart_cathObj
                    : []
                }
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
              />
              <BaseInfo
                Label="Date of last catheterisation"
                Value={Data.date_last_cath}
                md={4}
              />
              <BaseInfo
                Label="Number of diseased coronary vessels"
                Value={
                  Data.nb_dis_cor_vessObj ? Data.nb_dis_cor_vessObj.Label : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Left main stem disease"
                Value={Data.lms_diseaseObj ? Data.lms_diseaseObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Ejection fraction category"
                Value={Data.ef_categoryObj ? Data.ef_categoryObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Ejection fraction value"
                Value={Data.ef_value}
                md={4}
              />
              <BaseInfo Label="PA systolic" Value={Data.pa_systolic} md={4} />
              <BaseInfo Label="AV gradient" Value={Data.av_gradient} md={4} />
              <BaseInfo Label="LVEDP" Value={Data.lvedp} md={4} />
              <BaseInfo
                Label="Mean PAWP / LA"
                Value={Data.mean_pawp_la}
                md={4}
              />
            </GroupPanel>
            <GroupPanel title={t("Pre-operative status and support")}>
              <BaseInfo
                Label="IV nitrates / heparin of any kind"
                Value={
                  Data.iv_nit_hep_any_kindObj
                    ? Data.iv_nit_hep_any_kindObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="IV inotropes"
                Value={Data.iv_inotropesObj ? Data.iv_inotropesObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Ventilated"
                Value={Data.ventilatedObj ? Data.ventilatedObj.Label : ""}
                md={4}
              />
              <BaseInfo
                Label="Cardiogenic shock"
                Value={Data.cardio_shockObj ? Data.cardio_shockObj.Label : ""}
                md={4}
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 4",
        tabContent: (
          <div>
            <GroupPanel title={t("Operation")}>
              <BaseInfo
                Label="Procedure group"
                Value={
                  Data.procedure_groupObj ? Data.procedure_groupObj.Label : ""
                }
                md={4}
              />
            </GroupPanel>
            <GroupPanel title={t("Coronary surgery")}>
              <BaseInfo
                Label="DCAs - arterial conduits"
                Value={Data.dca_art_conduit}
                md={4}
              />
              <BaseInfo
                Label="DCAs - venous conduits"
                Value={Data.dca_ven_conduit}
                md={4}
              />
              <BaseArrayInfo
                Label="Artery / Arteries used as grafts"
                Values={Data.art_used_graftsObj ? Data.art_used_graftsObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 5",
        tabContent: (
          <div>
            <GroupPanel title="Valve surgery">
              <CustomContainer NoDivBorder>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label="Aortic valve"
                    Weight="500"
                    Color="#f54242"
                    Size="15px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label="Mitral valve"
                    Weight="500"
                    Color="#f54242"
                    Size="15px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label="Tricuspid valve"
                    Color="#f54242"
                    Weight="500"
                    Size="15px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label="Pulmonary valve"
                    Color="#f54242"
                    Weight="500"
                    Size="15px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer NoDivBorder Label="Stenosis" MarginTop="10px">
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.stenosis_avObj ? Data.stenosis_avObj.Label : ""}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.stenosis_mvObj ? Data.stenosis_mvObj.Label : ""}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.stenosis_tvObj ? Data.stenosis_tvObj.Label : ""}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.stenosis_pvObj ? Data.stenosis_pvObj.Label : ""}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Insufficiency"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.insufficiency_avObj
                        ? Data.insufficiency_avObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.insufficiency_mvObj
                        ? Data.insufficiency_mvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.insufficiency_tvObj
                        ? Data.insufficiency_tvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.insufficiency_pvObj
                        ? Data.insufficiency_pvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Explant type"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.explant_type_avObj
                        ? Data.explant_type_avObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.explant_type_mvObj
                        ? Data.explant_type_mvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.explant_type_tvObj
                        ? Data.explant_type_tvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.explant_type_pvObj
                        ? Data.explant_type_pvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Native valve pathology"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.nat_val_path_av}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.nat_val_path_mv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.nat_val_path_tv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.nat_val_path_pv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Reason for repeat valve surgery"
                MarginTop="10px"
                style={{ marginTop: "30px" }}
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.rsn_rpt_vlv_sur_avObj
                        ? Data.rsn_rpt_vlv_sur_avObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.rsn_rpt_vlv_sur_mvObj
                        ? Data.rsn_rpt_vlv_sur_mvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.rsn_rpt_vlv_sur_tvObj
                        ? Data.rsn_rpt_vlv_sur_tvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.rsn_rpt_vlv_sur_pvObj
                        ? Data.rsn_rpt_vlv_sur_pvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Valve procedure"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.valve_proc_avObj ? Data.valve_proc_avObj.Label : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.valve_proc_mvObj ? Data.valve_proc_mvObj.Label : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.valve_proc_tvObj ? Data.valve_proc_tvObj.Label : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.valve_proc_pvObj ? Data.valve_proc_pvObj.Label : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Implant type"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.implant_type_avObj
                        ? Data.implant_type_avObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.implant_type_mvObj
                        ? Data.implant_type_mvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.implant_type_tvObj
                        ? Data.implant_type_tvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={
                      Data.implant_type_pvObj
                        ? Data.implant_type_pvObj.Label
                        : ""
                    }
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Implant code"
                MarginTop="10px"
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.implant_code_av}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.implant_code_mv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.implant_code_tv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.implant_code_pv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
              <CustomContainer
                NoDivBorder
                Label="Valve / ring size"
                MarginTop="10px"
                style={{ marginTop: "30px" }}
              >
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.valve_ring_size_av}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.valve_ring_size_mv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.valve_ring_size_tv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
                <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
                  <BaseLabel
                    Label={Data.valve_ring_size_pv}
                    Weight="400"
                    MarginTop="5px"
                  />
                </GridItem>
              </CustomContainer>
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 6",
        tabContent: (
          <div>
            <GroupPanel title={t("Other procedures")}>
              <BaseArrayInfo
                Label="Other cardiac procedures detail"
                Values={
                  Data.oth_car_proc_detObj ? Data.oth_car_proc_detObj : []
                }
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseArrayInfo
                Label="Other non-cardiac procedures detail"
                Values={
                  Data.oth_non_car_proc_detObj
                    ? Data.oth_non_car_proc_detObj
                    : []
                }
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseArrayInfo
                Label="Segments of the aorta"
                Values={Data.seg_aortaObj ? Data.seg_aortaObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseArrayInfo
                Label="Aortic procedure"
                Values={Data.aortic_procObj ? Data.aortic_procObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 7",
        tabContent: (
          <div>
            <GroupPanel title={t("Perfusion and myocardial protection")}>
              <BaseInfo
                Label="Cardiopulmonary bypass"
                Value={
                  Data.cardiopulmonary_bypassObj
                    ? Data.cardiopulmonary_bypassObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo Label="Bypass time" Value={Data.bypass_time} md={4} />
              <BaseInfo
                Label="Cumulative cross-clamp time"
                Value={Data.cumulative_cross_clamp_time}
                md={4}
              />
              <BaseInfo
                Label="Total circulatory arrest time"
                Value={Data.total_circulatory_arrest_time}
                md={4}
              />
            </GroupPanel>
          </div>
        ),
      });
      Tabs.push({
        tabButton: "Page 8",
        tabContent: (
          <div>
            <GroupPanel title={t("Post-operative complications")}>
              <BaseArrayInfo
                Label="Re-operation"
                Values={Data.re_operationObj ? Data.re_operationObj : []}
                TextField={"Label"}
                LinedField={"Lined"}
                md={4}
                Clear="both"
              />
              <BaseInfo
                Label="New post-operative stroke"
                Value={
                  Data.new_post_operative_strokeObj
                    ? Data.new_post_operative_strokeObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="New post-operative dialysis"
                Value={
                  Data.new_post_operative_dialysisObj
                    ? Data.new_post_operative_dialysisObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Multi-system failure"
                Value={
                  Data.multi_system_failureObj
                    ? Data.multi_system_failureObj.Label
                    : ""
                }
                md={4}
              />
            </GroupPanel>
            <GroupPanel title={t("Discharge details")}>
              <BaseInfo
                Label="Destination on discharge"
                Value={
                  Data.destination_on_dischargeObj
                    ? Data.destination_on_dischargeObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Patient status at discharge"
                Value={
                  Data.patient_status_dischargeObj
                    ? Data.patient_status_dischargeObj.Label
                    : ""
                }
                md={4}
              />
              <BaseInfo
                Label="Primary cause of death"
                Value={
                  Data.primary_cause_deathObj
                    ? Data.primary_cause_deathObj.Label
                    : ""
                }
                md={4}
              />
            </GroupPanel>
          </div>
        ),
      });
    }
    return Tabs;
  };

  if (isLoading) {
    return <BaseLoading />;
  } else {
    return (
      <div style={{ height: "100%" }}>
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <GridContainer
            style={{ width: "calc(100% - 30px)", flex: "0 0 auto" }}
          >
            <GridItem xs={12} sm={12} md={12}>
              <GridContainer style={{ margin: "15px 0" }}>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "left" }}>
                    {t("Date")}: {"\u00A0"}
                    <span style={{ fontWeight: "400" }}>
                      &nbsp;{Data ? Data.date_creation : ""}
                    </span>
                  </div>
                </GridItem>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "right" }}>
                    <UserDialogLink UserId={Data ? Data.id : null}>
                      {t("Doctor")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        {Data ? Data.user_mod : ""}
                      </span>
                    </UserDialogLink>
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
              <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                The European Association for Cardio-Thoracic Surgery Adult
                Cardiac Surgical Database Version 1.0
              </h4>
            </GridItem>
          </GridContainer>
          <GridContainer
            style={{
              margin: "0",
              width: "100%",
              flex: "1 1 auto",
              minHeight: 0,
            }}
          >
            <GridItem xs={12} sm={12} md={12} style={{ height: "100%" }}>
              <CustomTab vertical hasMany fillHeight tabs={GetTabs()} />
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}
