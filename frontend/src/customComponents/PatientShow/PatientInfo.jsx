import React, { useState, useEffect, createRef } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "@mui/material/Avatar";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
import DivLoading from "customComponents/DivLoading";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import BaseDialog from "customComponents/BaseDialog";
import PatientForm from "customComponents/Forms/PatientForm";
import PatientAnamnesisForm from "customComponents/Forms/PatientAnamnesisForm";
import customHistory from "customHistory";
import Helper from "helper";

const styles = {
  mainContainer: {
    backgroundColor: "#b2ebf2",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    /* Was a hard `width: 1280px`, which forced a horizontal scrollbar on every
       screen narrower than that - i.e. on every tablet and phone - for a panel
       whose content reflows perfectly well. `maxWidth` keeps the intended
       reading width on a large monitor and lets it shrink below that. */
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    /* FIXED DIMENSIONS FOR CARDS */
    width: "580px",
    height: "650px",
    display: "flex",
    flexDirection: "column",
  },
  cardBody: {
    flex: 1,
    overflowY: "auto", // Allows scrolling inside the card if content is too long
    paddingRight: "5px",
  },
  headerTitle: {
    color: "#009688",
    fontSize: "18px",
    fontWeight: "bold",
    borderBottom: "3px solid #009688",
    display: "inline-block",
    paddingBottom: "5px",
    marginBottom: "20px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "8px",
    backgroundColor: "#bdbdbd",
  },
  editButton: {
    backgroundColor: "#ff9800",
    color: "#fff",
    fontWeight: "bold",
    marginTop: "10px",
    boxShadow: "none",
    width: "100%", // Makes button consistent
  },
};

const PatientInfo = ({ RegisterNo: propRegisterNo, GetData }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [dialogData, setDialogData] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [registerNo, setRegisterNo] = useState(propRegisterNo || null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const patientDialogRef = createRef();
  const patientForm = createRef();
  const patientAnamnesisForm = createRef();
  const patientAnamnesisDialogRef = createRef();

  const GetDataAndSetPatient = async (setPatientId) => {
    setLoadingPatient(true);
    if (registerNo) {
      let SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Value: registerNo, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "Patient", SearchOption },
        (resData) => {
          if (resData && resData.Success) {
            setData(resData.Data);
            setLoadingPatient(false);
            if (GetData && setPatientId === true && resData.Data?.id_data)
              GetData(resData.Data.id_data);
          }
        },
      );
    }
  };

  useEffect(() => {
    if (!registerNo) return;

    let cancelled = false;

    const fetchPatient = async () => {
      setLoadingPatient(true);
      const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Value: registerNo, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "Patient", SearchOption },
        (resData) => {
          if (cancelled) return;
          if (resData && resData.Success) {
            setData(resData.Data);
            setLoadingPatient(false);
            if (GetData && resData.Data?.id_data) GetData(resData.Data.id_data);
          }
        },
      );
    };

    fetchPatient();

    return () => {
      cancelled = true;
    };
  }, [registerNo, GetData]);

  const patientFormShow = (regNo) => {
    setDialogData(
      <BaseDialog
        ref={patientDialogRef}
        Close={() => setDialogData(null)}
        ShowSave={true}
        Title="Patient"
        Save={(stopLoading) => {
          patientForm.current?.Save((Success) => {
            if (Success) {
              setDialogData(null);
              GetDataAndSetPatient(true);
            }
            stopLoading && stopLoading();
          });
        }}
      >
        <PatientForm
          ref={patientForm}
          PatientId={data?.id_data}
          RegisterNo={regNo}
        />
      </BaseDialog>,
    );
  };

  const patientAnamnesisFormShow = (regNo) => {
    setDialogData(
      <BaseDialog
        ref={patientAnamnesisDialogRef}
        Close={() => setDialogData(null)}
        ShowSave={true}
        Title="Patient Anamnesis"
        Save={(stopLoading) => {
          patientAnamnesisForm.current?.Save((Success) => {
            if (Success) {
              setDialogData(null);
              GetDataAndSetPatient(true);
            }
            stopLoading && stopLoading();
          });
        }}
      >
        <PatientAnamnesisForm
          ref={patientAnamnesisForm}
          PatientId={data?.id_data}
          RegisterNo={regNo}
        />
      </BaseDialog>,
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {confirm}
      {loadingPatient && <DivLoading />}
      {dialogData}

      {data ? (
        <div style={styles.mainContainer}>
          <GridContainer style={{ justifyContent: "center" }}>
            {/* Column 1: Patient Info Card */}
            <GridItem style={{ marginRight: "20px" }}>
              <div style={styles.card}>
                <div style={styles.headerTitle}>{t("Иргэний мэдээлэл")}</div>
                <div style={styles.cardBody}>
                  <GridContainer spacing={2}>
                    <GridItem
                      xs={4}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Avatar
                        variant="square"
                        style={styles.avatar}
                        src={data.Files?.[0]?.FileSrc}
                      />
                    </GridItem>
                    <GridItem xs={8}>
                      <BaseInfo
                        Label="Нэр"
                        Value={data.p_firstname}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Овог"
                        Value={data.p_lastname}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Хүйс"
                        Value={Helper.ObjectHelper.getGenderLabel(
                          data.p_genderObj?.Value || data.p_genderObj?.Label,
                        )}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Төрсөн огноо"
                        Value={data.p_birthday}
                        Left
                        md={6}
                      />
                      <BaseInfo Label="Нас" Value={data.p_age} Left md={6} />
                      <BaseInfo
                        Label="Гэрлэлт"
                        Value={data.p_is_marriedObj?.Label}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Яс үндэс"
                        Value={
                          data.p_ethnicityObj?.Value === "6"
                            ? data.p_ethnicity_other
                            : data.p_ethnicityObj?.Label
                        }
                        Left
                        md={6}
                      />
                    </GridItem>
                    <GridItem xs={6}>
                      <BaseInfo
                        Label="Аймаг/Хот"
                        Value={data.addr_prov_cityObj?.name}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Сум/Дүүрэг"
                        Value={data.addr_soum_distObj?.name}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Баг/Хороо"
                        Value={data.DictBagKhoroo?.name}
                        Left
                        md={6}
                      />
                    </GridItem>
                    <GridItem xs={6}>
                      <BaseInfo
                        Label="Утасны №1"
                        Value={data.p_telephone}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Цусны бүлэг"
                        Value={data.blood_typeObj?.Label}
                        Left
                        md={6}
                      />
                      <BaseInfo
                        Label="Боловсрол"
                        Value={data.p_educationObj?.Label}
                        Left
                        md={6}
                      />
                    </GridItem>
                  </GridContainer>
                </div>
                <Button
                  variant="contained"
                  style={styles.editButton}
                  onClick={() => patientFormShow(registerNo)}
                >
                  {t("ЗАСВАРЛАХ")}
                </Button>
              </div>
            </GridItem>

            {/* Column 2: Anamnesis Card */}
            <GridItem style={{ marginLeft: "20px" }}>
              <div style={styles.card}>
                <div style={styles.headerTitle}>{t("Анамнез")}</div>

                <div style={styles.cardBody}>
                  <BaseArrayInfo
                    Label="Social history coded"
                    Values={data.p_social_hist_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo
                    Label="Social history"
                    Value={data.p_soc_hist}
                    md={6}
                  />
                  <BaseArrayInfo
                    Label="Communicable disease code"
                    Values={data.p_com_dis_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo
                    Label="Major communicable disease"
                    Value={data.p_com_dis}
                    md={6}
                  />
                  <BaseArrayInfo
                    Label="Noncommunicable disease code"
                    Values={data.p_noncom_dis_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo
                    Label="Major non-communicable disease"
                    Value={data.p_noncom_dis}
                    md={6}
                  />
                  <BaseArrayInfo
                    Label="Operations coded"
                    Values={data.p_operations_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo
                    Label="Major operations"
                    Value={data.p_operations}
                    md={6}
                  />
                  <BaseArrayInfo
                    Label="Trauma coded"
                    Values={data.p_trauma_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo Label="Major trauma" Value={data.p_trauma} md={6} />
                  <BaseArrayInfo
                    Label="Family history coded"
                    Values={data.p_fam_hist_codeObj || []}
                    TextField="Label"
                    md={6}
                  />
                  <BaseInfo
                    Label="Family history"
                    Value={data.p_fam_hist}
                    md={6}
                  />
                </div>

                <Button
                  variant="contained"
                  style={styles.editButton}
                  onClick={() => patientAnamnesisFormShow(registerNo)}
                >
                  {t("ЗАСВАРЛАХ")}
                </Button>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      ) : null}
    </div>
  );
};

export default PatientInfo;
