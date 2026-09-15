import React, { useState, useEffect, createRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Avatar from "@mui/material/Avatar";
// @mui/icons-material
import EditIcon from "@mui/icons-material/Edit";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
// custom components
import UniCard from "customComponents/UniCard";
import DivLoading from "customComponents/DivLoading";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import BaseDialog from "customComponents/BaseDialog";
import PatientForm from "customComponents/Forms/PatientForm";
import PatientAnamnesisForm from "customComponents/Forms/PatientAnamnesisForm";
// theme
import { colors } from "@/theme/colors";
// history
import customHistory from "customHistory";
// helper
import Helper from "helper";

// The card sticks to the viewport and scrolls inside itself, so the whole
// patient block always fits on screen next to the examination history.
const CARD_MAX_HEIGHT = "calc(100vh - 150px)";

/**
 * PatientInfo Component
 *
 * A functional component for displaying patient information.
 * This is a migrated version from the original class component.
 *
 * Layout: one card designed for a narrow (1/3 width) column. "Anamnesis"
 * is nested inside the "Patient Info" card as its own panel, so the
 * examination history tabs can sit beside the whole block.
 */
const PatientInfo = ({ RegisterNo: propRegisterNo, GetData, style }) => {
  // State
  const [data, setData] = useState(null);
  const [dialogData, setDialogData] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [registerNo, setRegisterNo] = useState(propRegisterNo || null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Refs
  const patientDialogRef = createRef();
  const patientForm = createRef();
  const patientAnamnesisForm = createRef();
  const patientAnamnesisDialogRef = createRef();

  const { t } = useTranslation();

  useEffect(() => {
    setRegisterNo(propRegisterNo || null);
  }, [propRegisterNo]);

  // Fetch data when component mounts or RegisterNo changes
  useEffect(() => {
    if (registerNo) {
      GetDataAndSetPatient(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerNo]);

  const GetDataAndSetPatient = async (setPatientId) => {
    setLoadingPatient(true);
    if (registerNo) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Value: registerNo, Op: "Equals" },
      ];
      await Helper.PatientShowHelper.SearchPatient(SearchOption, (resData) => {
        if (resData && resData.Success) {
          setData(resData.Data);
          setLoadingPatient(false);

          if (resData.Data && resData.Data.id_data) {
            if (GetData && setPatientId === true) {
              GetData(resData.Data.id_data);
            }
          } else {
            setConfirm(
              Helper.BaseCrudHelper.ShowConfirm(
                registerNo +
                  t(
                    "Patient with this registration number is not registered. Create new?",
                  ),
                () => {
                  setConfirm(null);
                  patientFormShow(registerNo);
                },
                () => {
                  setConfirm(null);
                  customHistory.push("/admin/AdviceHome");
                },
              ),
            );
          }
        }
      });
    }
  };

  const patientFormShow = (registerNo) => {
    if (registerNo) {
      setDialogData(
        <BaseDialog
          ref={patientDialogRef}
          Close={() => setDialogData(null)}
          Save={(stopLoading) => {
            if (patientForm.current && patientForm.current.Save) {
              patientForm.current.Save((Success) => {
                if (Success) {
                  setDialogData(null);
                  GetDataAndSetPatient(true);
                }
                stopLoading && stopLoading();
              });
            }
          }}
          ShowSave={true}
          Title={t("Patient")}
        >
          <PatientForm
            ref={patientForm}
            ObjectName="Patient"
            PatientId={data ? data.id_data : null}
            RegisterNo={registerNo}
          />
        </BaseDialog>,
      );
    }
  };

  const patientAnamnesisFormShow = (registerNo) => {
    if (registerNo) {
      setDialogData(
        <BaseDialog
          ref={patientAnamnesisDialogRef}
          Close={() => setDialogData(null)}
          Save={(stopLoading) => {
            if (
              patientAnamnesisForm.current &&
              patientAnamnesisForm.current.Save
            ) {
              patientAnamnesisForm.current.Save((Success) => {
                if (Success) {
                  setDialogData(null);
                  GetDataAndSetPatient(true);
                }
                stopLoading && stopLoading();
              });
            }
          }}
          ShowSave={true}
          Title={t("Patient anamnesis")}
        >
          <PatientAnamnesisForm
            ref={patientAnamnesisForm}
            ObjectName="Patient"
            RegisterNo={registerNo}
            PatientId={data ? data.id_data : null}
          />
        </BaseDialog>,
      );
    }
  };

  // --- small presentational helpers, local to this card ---

  const SectionTitle = ({ children }) => (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        color: colors.label.secondary,
        margin: "14px 0 5px 0",
      }}
    >
      {children}
    </div>
  );

  const InfoRow = (Label, Value, md = 5) => (
    <BaseInfo
      Label={Label}
      Value={Value}
      Size="12px"
      LabelWeight="400"
      ValueWeight="300"
      Left
      md={md}
    />
  );

  const ArrayRow = (Label, Values, md = 7) => (
    <BaseArrayInfo
      Label={Label}
      Values={Values || []}
      TextField="Label"
      md={md}
      Size="12px"
      LabelWeight="400"
      ValueWeight="300"
    />
  );

  // Анамнез - Өвчтөний мэдээлэл картын дотор байрлах хэсэг
  const InnerPanel = ({ title, children }) => (
    <div
      style={{
        marginTop: "18px",
        border: "1px solid " + colors.background.tertiary,
        borderRadius: "3px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          fontSize: "13px",
          fontWeight: 500,
          color: colors.text.primary,
          backgroundColor: colors.background.secondary,
          borderBottom: "1px solid " + colors.background.tertiary,
        }}
      >
        {title}
      </div>
      <div style={{ padding: "10px 12px 12px 12px" }}>{children}</div>
    </div>
  );

  const EditButton = ({ onClick, disabled = false }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "12px",
      }}
    >
      <Button
        variant="contained"
        color="warning"
        style={{
          boxShadow: "none",
          textTransform: "none",
          borderRadius: "3px",
          margin: 0,
        }}
        disabled={disabled}
        size="sm"
        onClick={onClick}
      >
        <EditIcon />
        {t("Edit")}
      </Button>
    </div>
  );

  return (
    <div style={{ position: "sticky", top: "10px", ...style }}>
      {confirm}
      <GridContainer spacing={2}>
        {/* Өвчтөний мэдээлэл */}
        <GridItem xs={12} sm={12} md={12}>
          <div style={{ position: "relative" }}>
            {loadingPatient ? <DivLoading /> : null}
            {dialogData}
            <UniCard
              title={t("Patient Info")}
              color="info"
              cardStyle={{
                margin: "0px 0px 16px 0px",
                maxHeight: CARD_MAX_HEIGHT,
              }}
              cardBodyStyle={{
                overflowY: "auto",
                overflowX: "hidden",
                scrollbarWidth: "thin",
              }}
            >
              {data ? (
                <div>
                  {/* Identity header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid " + colors.background.tertiary,
                    }}
                  >
                    <Avatar
                      src={
                        data.Files && data.Files.length > 0
                          ? data.Files[0].FileSrc
                          : null
                      }
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "3px",
                        flexShrink: 0,
                      }}
                      variant="square"
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          lineHeight: 1.3,
                          color: colors.text.primary,
                          wordBreak: "break-word",
                        }}
                      >
                        {[data.p_lastname, data.p_firstname]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: colors.text.secondary,
                          marginTop: "3px",
                        }}
                      >
                        {t("Registration number")}: {registerNo || "-"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: colors.text.secondary,
                          marginTop: "2px",
                        }}
                      >
                        {[
                          // The option label is the English source key; the
                          // rows below translate it, this summary line did not.
                          data.p_genderObj
                            ? t(data.p_genderObj.Label + "")
                            : null,
                          data.p_age ? data.p_age + " " + t("Age") : null,
                          data.blood_typeObj ? data.blood_typeObj.Label : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>

                  <SectionTitle>{t("Personal information")}</SectionTitle>
                  {InfoRow(t("First name"), data.p_firstname)}
                  {InfoRow(t("Last name"), data.p_lastname)}
                  {InfoRow(
                    t("Gender"),
                    data.p_genderObj ? data.p_genderObj.Label : "",
                  )}
                  {InfoRow(t("Date of birth"), data.p_birthday)}
                  {InfoRow(t("Age"), data.p_age)}
                  {InfoRow(
                    t("Marriage"),
                    data.p_is_marriedObj ? data.p_is_marriedObj.Label : "",
                  )}
                  {InfoRow(
                    t("Ethnicity"),
                    data.p_ethnicityObj
                      ? data.p_ethnicityObj.Value + "" === "6"
                        ? data.p_ethnicity_other
                        : data.p_ethnicityObj.Label
                      : "",
                  )}
                  {InfoRow(
                    t("Blood type"),
                    data.blood_typeObj ? data.blood_typeObj.Label : "",
                  )}

                  <SectionTitle>{t("Address and contact")}</SectionTitle>
                  {InfoRow(
                    t("Province/City"),
                    data.addr_prov_cityObj ? data.addr_prov_cityObj.name : "",
                  )}
                  {InfoRow(
                    t("Soum/District"),
                    data.addr_soum_distObj ? data.addr_soum_distObj.name : "",
                  )}
                  {InfoRow(
                    t("Bag/Khoroo"),
                    data.DictBagKhoroo ? data.DictBagKhoroo.name : "",
                  )}
                  {InfoRow(t("Phone number 1"), data.p_telephone)}
                  {InfoRow(t("Phone number 2"), data.p_telephone2)}

                  <SectionTitle>{t("Work and education")}</SectionTitle>
                  {InfoRow(
                    t("Employment"),
                    data.p_employeementObj ? data.p_employeementObj.Label : "",
                  )}
                  {InfoRow(
                    t("Education"),
                    data.p_educationObj ? data.p_educationObj.Label : "",
                  )}
                  {InfoRow(t("Workplace"), data.p_workplace)}

                  <EditButton onClick={() => patientFormShow(registerNo)} />

                  {/* Анамнез */}
                  <InnerPanel title={t("Anamnesis")}>
                    <SectionTitle>{t("Social history")}</SectionTitle>
                    {ArrayRow(
                      t("Social history coded"),
                      data.p_social_hist_codeObj,
                    )}
                    {InfoRow(
                      t("Social history"),
                      data.p_soc_hist ? data.p_soc_hist : [],
                      7,
                    )}

                    <SectionTitle>{t("Diseases")}</SectionTitle>
                    {ArrayRow(
                      t("Communicable disease code"),
                      data.p_com_dis_codeObj,
                    )}
                    {InfoRow(
                      t("Major communicable disease"),
                      data.p_com_dis ? data.p_com_dis : [],
                      7,
                    )}
                    {ArrayRow(
                      t("Noncommunicable disease code"),
                      data.p_noncom_dis_codeObj,
                    )}
                    {InfoRow(
                      t("Major non-communicable disease"),
                      data.p_noncom_dis ? data.p_noncom_dis : [],
                      7,
                    )}

                    <SectionTitle>{t("Operations and trauma")}</SectionTitle>
                    {ArrayRow(t("Operations coded"), data.p_operations_codeObj)}
                    {InfoRow(
                      t("Major operations"),
                      data.p_operations ? data.p_operations : [],
                      7,
                    )}
                    {ArrayRow(t("Trauma coded"), data.p_trauma_codeObj)}
                    {InfoRow(
                      t("Major trauma"),
                      data.p_trauma ? data.p_trauma : [],
                      7,
                    )}

                    <SectionTitle>{t("Family history")}</SectionTitle>
                    {ArrayRow(
                      t("Family history coded"),
                      data.p_fam_hist_codeObj,
                    )}
                    {InfoRow(
                      t("Family history"),
                      data.p_fam_hist ? data.p_fam_hist : [],
                      7,
                    )}

                    <EditButton
                      disabled={data.id_data ? false : true}
                      onClick={() => patientAnamnesisFormShow(registerNo)}
                    />
                  </InnerPanel>
                </div>
              ) : null}
            </UniCard>
          </div>
        </GridItem>
      </GridContainer>
    </div>
  );
};

export default PatientInfo;
