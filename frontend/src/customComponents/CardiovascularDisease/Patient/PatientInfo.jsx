import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

import BaseDialog from "customComponents/BaseDialog";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
// import BaseLoading from "customComponents/BaseLoading";
import DivLoading from "customComponents/DivLoading";

import PatientInfoForm from "customComponents/CardiovascularDisease/Patient/PatientInfoForm";
// helper
import Helper from "helper";

export default function PatientInfo(props) {
  const { t } = useTranslation();

  const [PatientInfoData, setPatientInfoData] = useState(null);
  // props Data
  const { LogedUser, PatRegNo, Data, DoctorsProfileData } = props;

  const [Dialog, setDialog] = useState(null);
  const [Alert, setAlert] = useState(null);
  const [InfoLoading, setInfoLoading] = useState(null);

  var Form = useRef();
  var DialogRef = useRef();

  useEffect(() => {
    PatRegNo && GetPatientInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PatRegNo]);

  const GetPatientInfo = async () => {
    setInfoLoading(true);
    if (PatRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/GetPatientInfo",
        { PatRegNo },
        (resData) => {
          resData && setPatientInfoData(resData.Data);
          setInfoLoading(false);
        },
      );
    }
  };

  const FormShow = () => {
    if (PatRegNo) {
      const dialog = (
        <BaseDialog
          ref={(ref) => (DialogRef = ref)}
          Save={() => {
            Form.Save &&
              Form.Save((Success) => {
                if (Success) {
                  setDialog(null);
                  GetPatientInfo();
                }
                DialogRef.setState({ Loading: false });
              });
          }}
          ShowSave={true}
          Close={() => setDialog(null)}
          Title="Нэмэлт мэдээлэл засах"
          Height="410px"
        >
          <PatientInfoForm
            ref={(ref) => (Form = ref)}
            ObjectName="Patient"
            PatRegNo={PatRegNo}
          />
        </BaseDialog>
      );
      setDialog(dialog);
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Хяналтын мэдээлэл дутуу байна",
        false,
        () => setAlert(null),
      );
      setAlert(alert);
    }
  };

  return (
    <div>
      {Dialog}
      {Alert}
      {PatRegNo && (
        <GridContainer>
          <GridItem xs={12} sm={12} md={6}>
            <BaseInfo
              Label="Register"
              Value={
                Data && Data.Patient && Data.Patient.p_registration
                  ? Data.Patient.p_registration
                  : PatRegNo
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="Last name"
              Value={
                Data && Data.Patient && Data.Patient.p_lastname
                  ? Data.Patient.p_lastname
                  : ""
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="First name"
              Value={
                Data && Data.Patient && Data.Patient.p_firstname
                  ? Data.Patient.p_firstname
                  : ""
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="Address"
              Value={
                Data && Data.Patient && Data.Patient.p_address
                  ? Data.Patient.p_address
                  : ""
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            {/* <BaseInfo
              Label="Хаяг"
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              Value={
                (PatientData.DictProvinceCity
                  ? PatientData.DictProvinceCity.name + ", "
                  : "") +
                (PatientData.DictSoumDistrict
                  ? PatientData.DictSoumDistrict.name + ", "
                  : "") +
                (PatientData.DictBagKhoroo
                  ? PatientData.DictBagKhoroo.name
                  : "")
              }
            /> */}
          </GridItem>
          <GridItem xs={12} sm={12} md={6}>
            <BaseInfo
              Label="Date"
              Value={
                Data
                  ? Helper.ObjectHelper.getDateYMD({
                      DateStr: Data.CreateDate,
                    })
                  : null
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="Doctor name"
              Value={DoctorsProfileData ? DoctorsProfileData.firstname : null}
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="Hospital"
              Value={
                DoctorsProfileData
                  ? DoctorsProfileData.Organization
                    ? DoctorsProfileData.Organization.Name
                    : ""
                  : null
              }
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              md={6}
            />
            <BaseInfo
              Label="Address"
              Size="13px"
              LabelWeight="400"
              ValueWeight="300"
              Value={
                DoctorsProfileData
                  ? (DoctorsProfileData.DictProvinceCity
                      ? DoctorsProfileData.DictProvinceCity.name + ", "
                      : "") +
                    (DoctorsProfileData.DictSoumDistrict
                      ? DoctorsProfileData.DictSoumDistrict.name + ", "
                      : "") +
                    (DoctorsProfileData.DictBagKhoroo
                      ? DoctorsProfileData.DictBagKhoroo.name
                      : "")
                  : null
              }
              md={6}
            />
          </GridItem>
          {PatRegNo ? (
            <GridItem xs={12} sm={12} md={12}>
              <div style={{ position: "relative" }}>
                {InfoLoading ? <DivLoading WithoutCard /> : null}
                <div
                  style={{
                    position: "relative",
                    borderTop: "2px solid #ccc",
                    padding: "25px 0 0",
                    margin: "30px 0 0",
                  }}
                >
                  <h4
                    style={{
                      position: "absolute",
                      top: "-12px" /* Position the text vertically centered with the line */,
                      left: "20px",
                      backgroundColor: "white",
                      padding: "0 10px",
                      margin: "0",
                      fontWeight: "500",
                      whiteSpace: "normal",
                      color: "#003366",
                      fontSize: "16px",
                      lineHeight: "1.2",
                      zIndex: 1,
                    }}
                  >
                    {t("Нэмэлт мэдээлэл")}
                  </h4>
                </div>
                {/* <BaseInfo
                Label="Age"
                Value={PatientInfoData ? PatientInfoData.PatAge : ""}
                Size="13px"
                LabelWeight="400"
                ValueWeight="300"
              /> */}
                <BaseInfo
                  Label="Gender"
                  Value={
                    PatientInfoData && PatientInfoData.Gender
                      ? PatientInfoData.Gender.label
                      : ""
                  }
                  Size="13px"
                  LabelWeight="400"
                  ValueWeight="300"
                  md={6}
                />
                <BaseInfo
                  Label="Phone number"
                  Value={PatientInfoData ? PatientInfoData.p_telephone : ""}
                  Size="13px"
                  LabelWeight="400"
                  ValueWeight="300"
                  md={6}
                />
                <BaseInfo
                  Label="Family phone number"
                  Value={PatientInfoData ? PatientInfoData.p_telephone2 : ""}
                  Size="13px"
                  LabelWeight="400"
                  ValueWeight="300"
                  md={6}
                />
                <BaseInfo
                  Label="Ажил эрхлэлтийн байдал"
                  Value={PatientInfoData ? PatientInfoData.p_workplace : null}
                  Size="13px"
                  LabelWeight="400"
                  ValueWeight="300"
                  md={6}
                />
                <BaseInfo
                  Label="Temporary address"
                  Value={
                    PatientInfoData ? PatientInfoData.p_temp_address : null
                  }
                  Size="13px"
                  LabelWeight="400"
                  ValueWeight="300"
                  md={6}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button size="sm" color="warning" onClick={FormShow}>
                    {t("Edit")}
                  </Button>
                </div>
              </div>
            </GridItem>
          ) : null}
        </GridContainer>
      )}
    </div>
  );
}
