import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
import i18n from "i18next";

import Divider from "@mui/material/Divider";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import BaseFilesInfo from "customComponents/BaseViewControls/BaseFilesInfo";
import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";

class Visit extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: {}, isLoading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ isLoading: true });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "id_data",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.PatientShowHelper.GetVisits(SearchOption, (resData) => {
        if (
          resData &&
          resData.Success &&
          resData.Data &&
          resData.Data.length === 1
        ) {
          this.setState({ Data: resData.Data[0], isLoading: false });
        } else {
          this.setState({ isLoading: false });
        }
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;

    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/Visit/PrintReport",
          Data: { Id: DataId, Language: i18n.language },
          FileName: "Visit.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  render() {
    const { isLoading, Data, Alert } = this.state;
    const { t } = this.props;
    if (isLoading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data && (
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Date of visit")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;{Data.visit_date || ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right", marginRight: "40px" }}>
                      <UserDialogLink UserId={Data.id || null}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          &nbsp;{Data.user_mod || ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
                <BaseInfo
                  Label="Type exam 1"
                  Value={Data.type_exam1Obj ? Data.type_exam1Obj.Label : null}
                  md={6}
                />
                <BaseInfo
                  Label="Type exam 2"
                  Value={Data.type_exam2Obj ? Data.type_exam2Obj.Label : null}
                  md={6}
                />
                <BaseInfo
                  Label="Disease"
                  Value={Data.diseaseObj ? Data.diseaseObj.Label : null}
                  md={6}
                />
                <BaseInfo
                  Label="Referred by"
                  Value={
                    Data.referred_by_13aObj
                      ? Data.referred_by_13aObj.Label
                      : null
                  }
                  md={6}
                />
                <BaseArrayInfo
                  Label="Chief complaint"
                  TextField={"Label"}
                  LinedField={"Lined"}
                  Values={
                    Data.chief_complaintObj ? Data.chief_complaintObj : []
                  }
                  md={6}
                />
                <BaseInfo
                  Label="Other chief complaint"
                  Value={Data.other_chief_complaint || ""}
                  md={6}
                />
                <BaseInfo
                  Label="Visit note"
                  Value={Data.Notes || ""}
                  sm={4}
                  md={6}
                />
                <BaseInfo
                  Label="Systolic pressure"
                  Value={Data.s_bp || ""}
                  md={6}
                />
                <BaseInfo
                  Label="Diastolic pressure"
                  Value={Data.d_bp || ""}
                  md={6}
                />

                <BaseInfo
                  Label="Heart rate"
                  Value={Data.pe_vs_heart || ""}
                  md={6}
                />

                <BaseInfo
                  Label="Paralysis"
                  Value={Data.paralysisObj ? Data.paralysisObj.Label : null}
                  md={6}
                />

                <BaseInfo Label="INR" Value={Data.inr || ""} sm={4} md={6} />

                <BaseInfo
                  Label="Weight"
                  Value={Data.weight || ""}
                  sm={4}
                  md={6}
                />

                <BaseInfo
                  Label="Main diagnosis"
                  Value={Data.main_diagnosis || ""}
                  md={6}
                />
                {/* 
            
                    <BaseInfo
                      Label="Main diagnosis (Rus)"
                      Value={Data.main_diagnosis_ru}
                    />
              
                    <BaseInfo
                      Label="Main diagnosis (Mon)"
                      Value={Data.main_diagnosis_mn}
                    /> 
                  */}

                <BaseInfo
                  Label="Comment to main diagnosis"
                  Value={Data.main_diagnosis_notes || ""}
                  md={6}
                />

                <BaseArrayInfo
                  Label="ICD10"
                  LinedField="IsDelete"
                  IsNewField="IsNew"
                  TextField="JournalRef.jr_label"
                  Values={
                    Data.Journals
                      ? Data.Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "5",
                        ).sort(Helper.ObjectHelper.ArraySort("IsDelete"))
                      : []
                  }
                  Clear="both"
                  md={6}
                />

                <BaseArrayInfo
                  Label="Major findings"
                  LinedField="IsDelete"
                  IsNewField="IsNew"
                  TextField="JournalRef.jr_label"
                  Values={
                    Data.Journals
                      ? Data.Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "4",
                        ).sort(Helper.ObjectHelper.ArraySort("IsDelete"))
                      : []
                  }
                  md={6}
                />

                <BaseArrayInfo
                  Label="Treatment"
                  LinedField="IsDelete"
                  IsNewField="IsNew"
                  TextField="JournalRef.jr_label"
                  Values={
                    Data.Journals
                      ? Data.Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "1",
                        ).sort(Helper.ObjectHelper.ArraySort("IsDelete"))
                      : []
                  }
                  Clear="both"
                  md={6}
                />

                <BaseArrayInfo
                  Label="Referral"
                  LinedField="IsDelete"
                  IsNewField="IsNew"
                  TextField="JournalRef.jr_label"
                  Values={
                    Data.Journals
                      ? Data.Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "3",
                        ).sort(Helper.ObjectHelper.ArraySort("IsDelete"))
                      : []
                  }
                  Clear="both"
                  md={6}
                />

                <BaseArrayInfo
                  Label="Procedures"
                  LinedField="IsDelete"
                  IsNewField="IsNew"
                  TextField="JournalRef.jr_label"
                  Values={
                    Data.Journals
                      ? Data.Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "2",
                        ).sort(Helper.ObjectHelper.ArraySort("IsDelete"))
                      : []
                  }
                  Clear="both"
                  md={6}
                />

                <BaseFilesInfo
                  Data={Data && Data.Files ? Data.Files : []}
                  Label="File attachment"
                  md={6}
                />
              </GridItem>
            </GridContainer>
          )}
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(Visit);
