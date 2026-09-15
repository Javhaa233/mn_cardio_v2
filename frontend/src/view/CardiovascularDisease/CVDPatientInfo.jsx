import { withTranslation } from "react-i18next";
import customHistory from "customHistory";
import React, { Component, createRef } from "react";
// translation
// @mui/icons-material

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import BaseAccordion from "customComponents/BaseAccordion";
import BaseLoadButton from "customComponents/BaseLoadButton";
import DivLoading from "customComponents/DivLoading";
import PatientCheck from "customComponents/CardiovascularDisease/PatientCheck";

import PatientInfo from "customComponents/CardiovascularDisease/Patient/PatientInfo";

import CVDMonitoringTable from "customComponents/CardiovascularDisease/Tables/CVDMonitoringTable";
import CVDInspectionTable from "customComponents/CardiovascularDisease/Tables/CVDInspectionTable";
import CVDSentPrescriptionTable from "customComponents/CardiovascularDisease/Tables/CVDSentPrescriptionTable";
import CVDHistoryForm from "customComponents/CardiovascularDisease/Forms/CVDHistoryForm";
import CVDBodySizeForm from "customComponents/CardiovascularDisease/Forms/CVDBodySizeForm";
import CalculateRisk from "customComponents/CardiovascularDisease/CalculateRisk";
import CVDControlAndTransitionForm from "customComponents/CardiovascularDisease/Forms/CVDControlAndTransitionForm";
import CVDTakeControlForm from "customComponents/CardiovascularDisease/Forms/CVDTakeControlForm";
import CVDInspectionAndManagement from "customComponents/CardiovascularDisease/Forms/CVDInspectionAndManagement";
import CVDAnalyze from "customComponents/CardiovascularDisease/Forms/CVDAnalyze";
import SuccessPrescription from "customComponents/CardiovascularDisease/SuccessPrescription.jsx";
import CreatePatientForm from "customComponents/CardiovascularDisease/Patient/CreatePatientForm";
// helper
import Helper from "helper";

// eslint-disable-next-line no-control-regex
const RegistrationNumberRegex = /[^\u0000-\u007F][^\u0000-\u007F][0-9]{8}$/;

class CVDPatientInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PatRegNo: null,
      Alert: null,
      Data: null,
      PrescriptionData: null,
      DoctorsProfileData: null,
      DialogData: null,
      CreateDialogData: null,
      Confirm: null,
      isChanged: "false",
      isSavedBodySize: false,
      isSavedHistory: false,
      checkLoading: false,
    };

    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.RegistrationNumberRegex = RegistrationNumberRegex;

    // refs
    this.DialogRef = createRef();
    this.CreateDialogRef = createRef();

    this.CVDMonitoringTableRef = createRef();
    this.CVDInspectionTableRef = createRef();

    this.CVDHistoryFormRef = createRef();
    this.CVDBodySizeFormRef = createRef();
    this.CalculateRiskRef = createRef();
    this.CVDInspectionAndManagementRef = createRef();

    // Bind the GetRisk method
    this.GetRisk = this.GetRisk.bind(this);
    this.CVDControlAndTransitionFormRef = createRef();
    this.CVDTakeControlFormRef = createRef();
    this.CVDAnalyzeRef = createRef();
    this.CreatePatientFormRef = createRef();
    this.CVDSentPrescriptionTableRef = createRef();
    this.SuccessPrescriptionRef = createRef();
  }

  setLevelNull = () => {
    const t = this.props.t;
    const ref = this.CalculateRiskRef.current;
    if (ref) {
      const instance = ref.getWrappedInstance ? ref.getWrappedInstance() : ref;
      instance && instance.setLevelNull && instance.setLevelNull();
    }
  };

  GetRisk = () => {
    console.log("GetRisk called");
    console.log("CalculateRiskRef:", this.CalculateRiskRef);
    console.log("CalculateRiskRef.current:", this.CalculateRiskRef.current);

    const CVDHistoryData =
      this.CVDHistoryFormRef.current &&
      this.CVDHistoryFormRef.current.IsValidated &&
      this.CVDHistoryFormRef.current.IsValidated();
    console.log("CVDHistoryData:", CVDHistoryData);

    const CVDBodySizeData =
      this.CVDBodySizeFormRef.current &&
      this.CVDBodySizeFormRef.current.IsValidated &&
      this.CVDBodySizeFormRef.current.IsValidated();
    console.log("CVDBodySizeData:", CVDBodySizeData);

    // For components with { withRef: true }, access via getWrappedInstance()
    let calculateRiskRef = this.CalculateRiskRef.current;

    // Try to get the wrapped instance if using withRef: true
    if (calculateRiskRef && calculateRiskRef.getWrappedInstance) {
      console.log("Getting wrapped instance...");
      calculateRiskRef = calculateRiskRef.getWrappedInstance();
    }

    console.log("calculateRiskRef:", calculateRiskRef);

    if (calculateRiskRef && calculateRiskRef.Calculate) {
      console.log("Calling Calculate method");
      calculateRiskRef.Calculate(CVDHistoryData, CVDBodySizeData);
    } else {
      console.error("CalculateRiskRef or Calculate method not available", {
        ref: calculateRiskRef,
        hasCalculate: calculateRiskRef && calculateRiskRef.Calculate,
      });
    }
  };

  componentDidMount() {
    // See the note in PatientShow: a lazily-loaded page can mount after the
    // active tab has changed, so it must read its OWN url, not the address bar.
    const PatRegNo = Helper.BaseHelper.getUrlParam(
      decodeURI(this.props.TabHref || document.location.href),
      "PatRegNo",
    );

    let alert = null;
    if (PatRegNo) {
      if (this.RegistrationNumberRegex.test(PatRegNo)) {
        this.setState({ PatRegNo });
        this.Check(PatRegNo);
      } else {
        alert = Helper.BaseCrudHelper.ShowAlert(
          "Регистрийн дугаар буруу байна",
          false,
          () => this.setState({ Alert: null }),
        );
        this.setState({ Alert: alert });
      }
    }
    // else {
    //   alert = Helper.BaseCrudHelper.ShowAlert(
    //     "Регистрийн дугаар оруулна уу",
    //     true,
    //     () => this.setState({ Alert: null })
    //   );
    //   this.setState({ Alert: alert });
    // }
  }

  // #region Patient monitoring check
  Check = async (PatRegNo) => {
    this.setState({ checkLoading: true });
    if (PatRegNo) {
      // Api service
      // const ReqData = Helper.BaseCrudHelper.GetRequestData("CVDMonitoring", {});
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CheckPatient",
        { PatRegNo },
        (resData) => {
          if (resData && resData.Data && resData.Success) {
            this.setState(
              {
                PatRegNo,
                Data: resData.Data,
                DoctorsProfileData: resData.Data.DoctorsProfile,
                checkLoading: false,
              },
              () => {
                this.CVDMonitoringTableRef.current &&
                  this.CVDMonitoringTableRef.current.SetPatRegNo &&
                  this.CVDMonitoringTableRef.current.SetPatRegNo(
                    resData.Data.PatRegNo,
                  );
                this.CVDInspectionTableRef.current &&
                  this.CVDInspectionTableRef.current.SetPatRegNo &&
                  this.CVDInspectionTableRef.current.SetPatRegNo(
                    resData.Data.PatRegNo,
                  );
                this.CVDSentPrescriptionTableRef.current &&
                  this.CVDSentPrescriptionTableRef.current.SetMonitoringId &&
                  this.CVDSentPrescriptionTableRef.current.SetMonitoringId(
                    resData.Data.Id,
                  );
                this.CVDHistoryFormRef.current &&
                  this.CVDHistoryFormRef.current.SetMonitoringId &&
                  this.CVDHistoryFormRef.current.SetMonitoringId(
                    resData.Data.Id,
                  );
                this.CVDBodySizeFormRef.current &&
                  this.CVDBodySizeFormRef.current.SetMonitoringId &&
                  this.CVDBodySizeFormRef.current.SetMonitoringId(
                    resData.Data.Id,
                  );
                this.CVDInspectionAndManagementRef.current &&
                  this.CVDInspectionAndManagementRef.current
                    .SetMonitoringData &&
                  this.CVDInspectionAndManagementRef.current.SetMonitoringData(
                    resData.Data,
                  );
                this.CVDAnalyzeRef.current &&
                  this.CVDAnalyzeRef.current.SetMonitoringId &&
                  this.CVDAnalyzeRef.current.SetMonitoringId(resData.Data.Id);
                if (this.CalculateRiskRef.current) {
                  const instance = this.CalculateRiskRef.current
                    .getWrappedInstance
                    ? this.CalculateRiskRef.current.getWrappedInstance()
                    : this.CalculateRiskRef.current;
                  instance &&
                    instance.SetMonitoringId &&
                    instance.SetMonitoringId(resData.Data.Id);
                }
              },
            );
          } else {
            const Confirm = Helper.BaseCrudHelper.ShowConfirm(
              PatRegNo +
                "- регистртэй үйлчлүүлэгчийн мэдээлэл бүртгэгдээгүй байна. Шинээр бүртгэх үү?",
              () => {
                this.setState({ Confirm: null });
                this.CreateMonitoring(PatRegNo, (Success) => {
                  if (Success) {
                    this.setState({ checkLoading: false });
                    this.Check(PatRegNo);
                  }
                });
              },
              () => this.setState({ Confirm: null }),
            );
            // The lookup is over even though it found nothing - clear the
            // loader, otherwise it would spin behind the confirm dialog.
            this.setState({ Confirm, checkLoading: false });
          }
        },
      );
    } else {
      this.setState({ checkLoading: false });
    }
  };
  // #endregion

  // Create New Monitoring
  CreateMonitoring = async (PatRegNo, callback) => {
    let alert = null;
    if (PatRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreateMonitoring",
        { PatRegNo },
        (resData) => {
          if (resData && resData.Success) {
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
            this.CustomCreatePatient(PatRegNo, (Success) => {
              Success && callback && callback(Success);
            });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл дутуу байна",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  // #region Create History
  CreateHistory = async (Status, callback) => {
    const { Data, PatRegNo } = this.state;

    const CVDHistoryData =
      this.CVDHistoryFormRef.current &&
      this.CVDHistoryFormRef.current.IsValidated &&
      this.CVDHistoryFormRef.current.IsValidated();
    const CVDBodySizeData =
      this.CVDBodySizeFormRef.current &&
      this.CVDBodySizeFormRef.current.IsValidated &&
      this.CVDBodySizeFormRef.current.IsValidated();

    let CVDRiskData = null;
    if (this.CalculateRiskRef.current) {
      const instance = this.CalculateRiskRef.current.getWrappedInstance
        ? this.CalculateRiskRef.current.getWrappedInstance()
        : this.CalculateRiskRef.current;
      CVDRiskData = instance && instance.IsValidated && instance.IsValidated();
    }

    let alert = null;
    if (CVDHistoryData && CVDBodySizeData && CVDRiskData) {
      const MonitoringId = Data ? Data.Id : null;
      const OldStatus = Data ? Data.Status : null;
      if (MonitoringId) {
        const ReqData = {
          MonitoringId,
          OldStatus,
          Status: Status,
          CVDHistoryData,
          CVDBodySizeData,
          CVDRiskData,
        };
        await Helper.BaseCrudHelper.CallService(
          "/CVDMonitoring/CreateHistory",
          ReqData,
          (resData) => {
            if (resData) {
              this.setState({ Alert: null });
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback();
                  if (Status === "expired") {
                    customHistory.push("/admin/CVDMonitoringList");
                  }
                },
              );
              this.setState({ Alert: alert });
              resData.Success && this.Check(PatRegNo);
            }
          },
        );
      }
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("Эрсдэл тооцно уу", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };
  // #endregion

  // Jor burtgeh service
  CreateSentPrescription = async (callback) => {
    // this.ShowSuccessPrescription();
    // callback && callback();
    // return;
    const { Data } = this.state;
    const MonitoringId = Data ? Data.Id : null;
    const PatRegNo = Data ? Data.PatRegNo : null;
    var BodySizeData = {};

    const { Diagnosis, Desc, Tablets } =
      this.CVDInspectionAndManagementRef.current &&
      this.CVDInspectionAndManagementRef.current.GetRequestData &&
      this.CVDInspectionAndManagementRef.current.GetRequestData();
    BodySizeData =
      this.CVDBodySizeFormRef.current &&
      this.CVDBodySizeFormRef.current.IsValidated &&
      this.CVDBodySizeFormRef.current.IsValidated();
    //
    const IsSmoke =
      this.CVDHistoryFormRef.current &&
      this.CVDHistoryFormRef.current.GetIsSmoke &&
      this.CVDHistoryFormRef.current.GetIsSmoke();

    let alert = null;
    if (MonitoringId && PatRegNo && Tablets.length > 0) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreateSentPrescription",
        {
          MonitoringId,
          PatRegNo,
          Diagnosis,
          Desc,
          Tablets,
          BodySizeData,
          IsSmoke,
        },
        (resData) => {
          if (resData) {
            if (resData.Success && resData.Data) {
              this.CVDSentPrescriptionTableRef.current &&
                this.CVDSentPrescriptionTableRef.current.SetMonitoringId &&
                this.CVDSentPrescriptionTableRef.current.SetMonitoringId(
                  resData.Data.MonitoringId,
                );
              this.setState({ PrescriptionData: resData.Data });
              this.ShowSuccessPrescription();
            } else {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => this.setState({ Alert: null }),
              );
              this.setState({ Alert: alert });
            }
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Жор бичихэд шаардлагатай мэдээлэл дутуу байна",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
    callback && callback();
  };

  // Jor amjillttai uusgesen bol garch ireh dialog
  ShowSuccessPrescription = (callback) => {
    const { PrescriptionData } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Title="Жор бүртгэсэн мэдээлэл"
          Width="360px"
          Print={() => {
            this.SuccessPrescriptionRef.current &&
              this.SuccessPrescriptionRef.current.PrintPrescription &&
              this.SuccessPrescriptionRef.current.PrintPrescription(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          ShowSave={false}
          ShowPrint={true}
          Close={() => {
            this.setState({ DialogData: null });
            callback && callback();
          }}
        >
          <SuccessPrescription
            ref={this.SuccessPrescriptionRef}
            Data={PrescriptionData}
          />
        </BaseDialog>
      ),
    });
  };

  // #region Create Patient Form
  CustomCreatePatient = (PatRegNo, callback) => {
    if (PatRegNo) {
      this.setState({
        CreateDialogData: (
          <BaseDialog
            ref={(ref) => (this.CreateDialogRef = ref)}
            Title="Иргэн үүсгэх"
            Width="460px"
            Save={(stopLoading) => {
              if (
                this.CreatePatientFormRef.current &&
                this.CreatePatientFormRef.current.Save
              ) {
                this.CreatePatientFormRef.current.Save((Success) => {
                  if (Success) {
                    this.setState({ CreateDialogData: null });
                    callback && callback(Success);
                  }
                  stopLoading && stopLoading();
                });
              }
            }}
            ShowSave={true}
            Close={() => {
              this.setState({ CreateDialogData: null });
              callback && callback();
            }}
          >
            <CreatePatientForm
              ref={this.CreatePatientFormRef}
              ObjectName="Patient"
              PatRegNo={PatRegNo}
            />
          </BaseDialog>
        ),
      });
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний РД олдсонгүй",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  // #endregion

  // #region Show Dialog
  // Take Control Form show
  TakeControlForm = (callback) => {
    const { Data } = this.state;
    let CVDRiskData = null;
    if (this.CalculateRiskRef.current) {
      const instance = this.CalculateRiskRef.current.getWrappedInstance
        ? this.CalculateRiskRef.current.getWrappedInstance()
        : this.CalculateRiskRef.current;
      CVDRiskData = instance && instance.IsValidated && instance.IsValidated();
    }
    if (CVDRiskData && Data && Data.Id) {
      this.setState({
        DialogData: (
          <BaseDialog
            ref={(ref) => (this.DialogRef = ref)}
            Title="Хяналтанд авах"
            Save={(stopLoading) => {
              this.CVDTakeControlFormRef.current &&
                this.CVDTakeControlFormRef.current.Save &&
                this.CVDTakeControlFormRef.current.Save((Success) => {
                  if (Success) {
                    this.CreateHistory("activated", () => {
                      this.setState({ DialogData: null });
                      callback && callback(null);
                    });
                  }
                  stopLoading && stopLoading();
                });
            }}
            ShowSave={true}
            Close={() => {
              this.setState({ DialogData: null });
              callback && callback();
            }}
          >
            <CVDTakeControlForm
              ref={this.CVDTakeControlFormRef}
              ObjectName="CVDControlAndTransition"
              DataId={Data.Id}
            />
          </BaseDialog>
        ),
      });
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Эрсдэл тооцно уу",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  // Form dialog show
  FormShow = (callback) => {
    const { Data } = this.state;
    let CVDRiskData = null;
    if (this.CalculateRiskRef.current) {
      const instance = this.CalculateRiskRef.current.getWrappedInstance
        ? this.CalculateRiskRef.current.getWrappedInstance()
        : this.CalculateRiskRef.current;
      CVDRiskData = instance && instance.IsValidated && instance.IsValidated();
    }
    if (CVDRiskData && Data && Data.Id) {
      this.setState({
        DialogData: (
          <BaseDialog
            ref={(ref) => (this.DialogRef = ref)}
            Title="Хяналтаас гаргах"
            Save={(stopLoading) => {
              this.CVDControlAndTransitionFormRef.current &&
                this.CVDControlAndTransitionFormRef.current.Save &&
                this.CVDControlAndTransitionFormRef.current.Save((Success) => {
                  if (Success) {
                    this.setState({ DialogData: null });
                    callback && callback();
                    customHistory.push("/admin/CVDMonitoringList");
                  }
                  stopLoading && stopLoading();
                });
            }}
            ShowSave={true}
            Close={() => {
              this.setState({ DialogData: null });
              callback && callback();
            }}
          >
            <CVDControlAndTransitionForm
              ref={this.CVDControlAndTransitionFormRef}
              ObjectName="CVDControlAndTransition"
              DataId={Data.Id}
            />
          </BaseDialog>
        ),
      });
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Эрсдэл тооцно уу",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  // #endregion

  render() {
    const { t } = this.props;
    const {
      PatRegNo,
      DialogData,
      CreateDialogData,
      Confirm,
      Alert,
      Data,
      DoctorsProfileData,
      checkLoading,
    } = this.state;

    return (
      <div>
        {DialogData}
        {CreateDialogData}
        {Confirm}
        {Alert}
        <GridContainer spacing={2}>
          <GridItem xs={12} md={7}>
            <UniCard title={t("Patient Info")} padding={15}>
              <PatientCheck />
              {/* The panel used to be unmounted while the lookup ran, so it
                  vanished and reappeared. Keep it mounted and overlay the
                  in-card loader instead. */}
              <div
                style={{
                  marginTop: "10px",
                  position: "relative",
                  // Before the first lookup succeeds the panel renders empty,
                  // so reserve room or the overlay would have nothing to sit on.
                  minHeight: checkLoading ? "120px" : undefined,
                }}
              >
                <PatientInfo
                  LogedUser={this.LogedUser}
                  PatRegNo={PatRegNo}
                  Data={Data}
                  DoctorsProfileData={DoctorsProfileData}
                />
                {checkLoading && <DivLoading WithoutCard={true} />}
              </div>
              {Data && PatRegNo ? (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    {/* 2. ЗСӨ-ний түүх */}
                    <BaseAccordion Title="2. ЗСӨ-ний түүх">
                      <CVDHistoryForm
                        ref={this.CVDHistoryFormRef}
                        ObjectName="CVDHistory"
                        setLevelNull={this.setLevelNull}
                      />
                    </BaseAccordion>
                    {/* 3. Биеийн хэмжээс */}
                    <BaseAccordion Title="3. Биеийн хэмжээс">
                      <CVDBodySizeForm
                        ref={this.CVDBodySizeFormRef}
                        ObjectName="CVDBodySize"
                        setLevelNull={this.setLevelNull}
                      />
                    </BaseAccordion>
                    {/* 4. ЗӨС-ний 10 жилийн эрсдэл */}
                    <BaseAccordion Title="4. ЗӨС-ний 10 жилийн эрсдэл">
                      <div>
                        <CalculateRisk
                          ref={this.CalculateRiskRef}
                          PatRegNo={Data.PatRegNo}
                          Patient={Data.Patient}
                          GetRisk={this.GetRisk}
                        />
                      </div>

                      {Data.Status === "activated" && (
                        <div>
                          <BaseLoadButton
                            ButtonText="Хяналтанд үзлэг нэмэх"
                            Color="success"
                            Float="left"
                            onClick={(callback) => {
                              this.CreateHistory(
                                "activated",
                                () => callback && callback(),
                              );
                            }}
                          />
                          <BaseLoadButton
                            ButtonText="Хяналтнаас гаргах"
                            Color="danger"
                            Float="left"
                            onClick={(callback) => {
                              this.FormShow(() => callback && callback());
                            }}
                          />
                        </div>
                      )}
                      {Data.Status === "inactive" && (
                        <div>
                          <BaseLoadButton
                            ButtonText="Хяналтанд авах"
                            Color="success"
                            Float="left"
                            onClick={(callback) => {
                              this.TakeControlForm(
                                () => callback && callback(),
                              );
                            }}
                          />
                          <BaseLoadButton
                            ButtonText="Дуусгах"
                            Color="danger"
                            Float="left"
                            onClick={(callback) => {
                              this.CreateHistory(
                                "expired",
                                () => callback && callback(),
                              );
                            }}
                          />
                        </div>
                      )}
                    </BaseAccordion>
                    {Data.Status === "activated" ? (
                      <div>
                        {/* 5. Үзлэг ба менежментийн төлөвлөгөө */}
                        <BaseAccordion Title="5. Үзлэг ба менежментийн төлөвлөгөө">
                          <CVDInspectionAndManagement
                            ref={this.CVDInspectionAndManagementRef}
                            CreateSentPrescription={(callback) => {
                              this.CreateSentPrescription(
                                () => callback && callback(),
                              );
                            }}
                          />
                        </BaseAccordion>
                      </div>
                    ) : null}
                    {
                      //
                      //   {/* 6. Хяналт, шилжилт хөдөлгөөн */}
                      //   <BaseAccordion Title="6. Хяналт, шилжилт хөдөлгөөн">
                      //     <CVDControlAndTransitionForm
                      //       ObjectName="CVDControlAndTransition"
                      //       ref={(ref) =>
                      //         (this.CVDControlAndTransitionFormRef = ref)
                      //       }
                      //     />
                      //     <BaseLoadButton
                      //       ButtonText="Хяналтнаас гаргах"
                      //       onClick={async (callback) => {
                      //         this.CVDControlAndTransitionFormRef &&
                      //           (await this.CVDControlAndTransitionFormRef.Save(
                      //             (resData) => {
                      //               if (resData && resData.Success) {
                      //                 this.Check(PatRegNo);
                      //               }
                      //               callback();
                      //             }
                      //           ));
                      //       }}
                      //     />
                      //   </BaseAccordion>
                    }
                  </GridItem>
                </GridContainer>
              ) : null}
            </UniCard>
          </GridItem>
          {/* 7. Анализ */}
          <GridItem xs={12} md={5}>
            {/* Was a Creative Tim Card whose empty body padding left a blank
                band above the accordion. */}
            <UniCard
              showHeader={false}
              padding={12}
              cardStyle={{
                height: "auto",
                flex: "0 0 auto",
                marginBottom: "16px",
              }}
              cardBodyStyle={{ overflow: "visible" }}
            >
              <BaseAccordion Title="Анализ">
                <CVDAnalyze ref={this.CVDAnalyzeRef} Id="CurrentChart" />
              </BaseAccordion>
            </UniCard>
            <CVDSentPrescriptionTable
              ref={this.CVDSentPrescriptionTableRef}
              CustomRender={true}
              style={{ marginBottom: "20px" }}
            />

            <CVDMonitoringTable
              ref={this.CVDMonitoringTableRef}
              ObjectName="CVDMonitoring"
              CustomRender={true}
              style={{ marginBottom: "20px" }}
            />
            <CVDInspectionTable
              ref={this.CVDInspectionTableRef}
              CustomRender={true}
              ObjectName="vwCVDInspection"
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CVDPatientInfo);
