import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation

// import FormLabel from "@mui/material/FormLabel";
// import Avatar from "@mui/material/Avatar";
// import Divider from "@mui/material/Divider";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseTab from "baseComponents/BaseTab";
import DivLoading from "customComponents/DivLoading";

import MonitoringInfo from "customComponents/PatientPlatform/CardioVascular/MonitoringInfo";
import PatientAdvice from "customComponents/PatientPlatform/OwnVisit/PatientAdvice";
import PatientBodySizeForm from "customComponents/PatientPlatform/OwnVisit/PatientBodySizeForm";
import PatientOwnHistoryForm from "customComponents/PatientPlatform/OwnVisit/PatientOwnHistoryForm";

import Helper from "helper";

// eslint-disable-next-line no-control-regex
const RegistrationNumberRegex = /[^\u0000-\u007F][^\u0000-\u007F][0-9]{8}$/;

class PatientCVD extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: {}, DoctorsProfileData: {}, checkLoading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.PatRegNo = this.LogedUser.UserName;

    this.RegistrationNumberRegex = RegistrationNumberRegex;

    // refs
    this.PatientAdviceRef = createRef();
    this.PatientOwnHistoryFormRef = createRef();
    this.PatientBodySizeFormRef = createRef();
  }

  componentDidMount() {
    this.GetData();
    this.Check();
  }

  GetData = () => {
    const t = this.props.t;
  };

  /**
   * Tender item 6: let the citizen work out their own cardiovascular risk.
   *
   * Re-reads the patient's own history and body measurements first, so the
   * calculation uses whatever they just typed into the other two tabs rather
   * than whatever was loaded when the page opened. The scoring itself is the
   * doctor screen's, via Helper.CVDHelper, so both sides agree.
   */
  CalculateOwnRisk = async () => {
    const { PatRegNo } = this;
    if (!PatRegNo || !this.PatientAdviceRef) return;

    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoringPatient/CheckPatient",
      { PatRegNo },
      (resData) => {
        const d = resData && resData.Success ? resData.Data : null;
        this.PatientAdviceRef.Calculate &&
          this.PatientAdviceRef.Calculate(
            d ? d.History : null,
            d ? d.BodySize : null,
            PatRegNo,
            // the recorded gender/birthday win over parsing the РД
            d ? d.Patient : null,
          );
      },
    );
  };

  // #region Patient monitoring check
  Check = async () => {
    const { PatRegNo } = this;
    this.setState({ checkLoading: true });
    if (PatRegNo) {
      // Api service
      // const ReqData = Helper.BaseCrudHelper.GetRequestData("CVDMonitoring", {});
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoringPatient/CheckPatient",
        { PatRegNo },
        (resData) => {
          if (resData) {
            if (resData.Data && resData.Success) {
              this.setState(
                {
                  Data: resData.Data,
                  DoctorsProfileData: resData.Data.DoctorsProfile,
                  checkLoading: false,
                },
                () => {
                  const Risk = resData.Data.Risk
                    ? resData.Data.Risk.Risk
                    : null;
                  const History = resData.Data.History;
                  const BodySize = resData.Data.BodySize;
                  // this.GetLastData();
                  // this.CVDMonitoringTableRef.SetPatRegNo &&
                  //   this.CVDMonitoringTableRef.SetPatRegNo(resData.Data.PatRegNo);
                  // this.CVDSentPrescriptionTableRef.SetMonitoringId &&
                  //   this.CVDSentPrescriptionTableRef.SetMonitoringId(
                  //     resData.Data.Id
                  //   );
                  this.PatientAdviceRef.CalculateAdvice &&
                    this.PatientAdviceRef.CalculateAdvice(
                      Risk,
                      History,
                      BodySize,
                    );
                  this.PatientOwnHistoryFormRef.SetPatRegNo &&
                    this.PatientOwnHistoryFormRef.SetPatRegNo(
                      PatRegNo,
                      () => {},
                    );
                  this.PatientBodySizeFormRef.SetPatRegNo &&
                    this.PatientBodySizeFormRef.SetPatRegNo(PatRegNo, () => {});
                  // this.CVDInspectionAndManagementRef.SetMonitoringData &&
                  //   this.CVDInspectionAndManagementRef.SetMonitoringData(
                  //     resData.Data
                  //   );
                  // this.CVDAnalyzeRef.SetMonitoringId &&
                  //   this.CVDAnalyzeRef.SetMonitoringId(resData.Data.Id);
                  // this.CalculateRiskRef.SetMonitoringId &&
                  //   this.CalculateRiskRef.SetMonitoringId(resData.Data.Id);
                },
              );
            } else {
              // Nothing found, but the lookup is over - the loader has to stop
              // or it would cover the panel forever.
              this.setState({ checkLoading: false });
              // const Confirm = Helper.BaseCrudHelper.ShowConfirm(
              //   PatRegNo +
              //     "- регистртэй үйлчлүүлэгчийн мэдээлэл бүртгэгдээгүй байна. Шинээр бүртгэх үү?",
              //   () => {
              //     this.setState({ Confirm: null });
              //     this.CreateMonitoring(PatRegNo, (Success) => {
              //       if (Success) {
              //         this.setState({ checkLoading: false });
              //         this.Check(PatRegNo);
              //       }
              //     });
              //   },
              //   () => this.setState({ Confirm: null })
              // );
              // this.setState({ Confirm });
            }
          } else {
            this.setState({ checkLoading: false });
          }
        },
      );
    } else {
      this.setState({ checkLoading: false });
    }
  };
  // #endregion

  // CVDMonitoringPatient

  render() {
    const { PatRegNo } = this;
    const { Data, DoctorsProfileData, checkLoading } = this.state;
    const { t } = this.props;

    if (Data === null) {
      return null;
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <BaseTab
            Tabss={[
              {
                Label: t("Миний үзлэг"),
                TabBody: (
                  <div
                    style={{
                      marginTop: "15px",
                      position: "relative",
                      // The panel is empty until the lookup returns, so reserve
                      // room or the overlay would have nothing to sit on.
                      minHeight: checkLoading ? "120px" : undefined,
                    }}
                  >
                    <MonitoringInfo
                      PatRegNo={PatRegNo}
                      Data={Data}
                      DoctorsProfileData={DoctorsProfileData}
                    />
                    {/* `checkLoading` was tracked but never shown, so the
                        panel just sat empty while the lookup ran. */}
                    {checkLoading && <DivLoading WithoutCard={true} />}
                  </div>
                ),
              },
              {
                Label: t("Зөвлөгөө"),
                TabBody: (
                  <div style={{ marginTop: "15px" }}>
                    <PatientAdvice
                      ref={(ref) => (this.PatientAdviceRef = ref)}
                      CanCalculate={true}
                      onCalculate={this.CalculateOwnRisk}
                    />
                  </div>
                ),
              },
              {
                Label: t("Биеийн хэмжээс"),
                TabBody: (
                  <div style={{ marginTop: "15px" }}>
                    <PatientBodySizeForm
                      ref={(ref) => (this.PatientBodySizeFormRef = ref)}
                      ObjectName="PatientBodySize"
                    />
                  </div>
                ),
              },
              {
                Label: t("Өвчний түүх"),
                TabBody: (
                  <div style={{ marginTop: "15px" }}>
                    <PatientOwnHistoryForm
                      ref={(ref) => (this.PatientOwnHistoryFormRef = ref)}
                      ObjectName="PatientOwnHistory"
                    />
                  </div>
                ),
              },
            ]}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(PatientCVD);
