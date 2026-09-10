import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseCustomTextField from "customComponents/BaseEditControls/BaseCustomTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// helper
import Helper from "helper";

class PaceMakerTwoForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      diffsObj: null,
      risksObj: null,
      Dialog: null,
      NoData: false,
    };

    this.PacemakerTblOne = null;
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
    const childDiv = document.getElementById(Field + "Div");
    if (childDiv) {
      if (Value === "other") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "other") return "block";
    else return "none";
  };

  GetData = async () => {
    const { ObjectName } = this.state;
    const { StayId } = this.props;
    let { PacemakerTblOne } = this;

    if (StayId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "stay_id_data", Op: "Equals", Value: StayId },
      ];

      this.setState({ NoData: true });
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName, SearchOption },
        async (resData) => {
          if (resData && resData.Success && resData.Data) {
            PacemakerTblOne = resData.Data;
            this.setState({
              diffsObj: PacemakerTblOne.diffsObj,
              risksObj: PacemakerTblOne.risksObj,
              NoData: false,
            });

            var tempDiffs = [];
            var tempRisks = [];
            if (PacemakerTblOne.LookUpData.length > 0) {
              PacemakerTblOne.LookUpData.forEach((element) => {
                if (element.id_question === "diffs") {
                  tempDiffs.push(element.value);
                } else if (element.id_question === "risks") {
                  tempRisks.push(element.value);
                }
              });
            }
            this.ModifyObject = {
              tbl_one_id: PacemakerTblOne.Id,
              pat_history_id: PacemakerTblOne.pat_history_id,
              department: PacemakerTblOne.department,
              diffs: tempDiffs,
              risks: tempRisks,
            };
            process.env.NODE_ENV === "development" &&
              console.log({ ModifyObject: this.ModifyObject });

            await Helper.BaseCrudHelper.BaseGetDetailInfo(
              { ObjectName, SearchOption },
              (resData) => {
                if (resData && resData.Success) {
                  if (resData.Data === null) {
                    this.setState({
                      EditObject: {
                        pat_history_id: PacemakerTblOne.pat_history_id,
                        department: PacemakerTblOne.department,
                      },
                      isLoading: false,
                    });
                    // this.setState({ EditObject: null, isLoading: false });
                  }
                  if (resData.Data) {
                    this.setState({
                      EditObject: Object.assign(
                        {},
                        { ...resData.Data, diffs: tempDiffs, risks: tempRisks },
                      ),
                      isLoading: false,
                    });
                  }
                }
              },
            );
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  SaveAndConfirm = (callback) => {
    const confirmAlert = Helper.BaseCrudHelper.ShowConfirm(
      "Хэвлэх үү?",
      () => {
        this.setState({ Alert: null });
        this.Print(() => callback && callback());
      },
      () => {
        this.setState({ Alert: null });
        callback && callback();
      },
    );
    this.setState({ Alert: confirmAlert });
  };

  Save = async (callback) => {
    const { PatientId, StayId } = this.props;
    const { ObjectName, EditObject, NoData } = this.state;

    let alert = null;
    if (
      ObjectName &&
      Object.keys(this.ModifyObject).length > 0 &&
      PatientId &&
      StayId
    ) {
      var Data = null;
      if (EditObject && EditObject.Id) {
        Data = { ...this.ModifyObject, Id: EditObject.Id };
      } else {
        Data = {
          ...this.ModifyObject,
          pat_id_data: PatientId,
          stay_id_data: StayId,
        };
      }

      await Helper.PacemakerHelper.CustomSavePacemakerTwo(
        { ObjectName, Data: Data },
        (resData) => {
          if (resData && resData.Data) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({
                  Alert: null,
                  EditObject: { Id: resData.Data.DataId },
                });
                this.SaveAndConfirm(callback);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        !NoData ? "Information is missing" : "Pacemaker 1 бүртгээгүй байна",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  Print = async (callback) => {
    const { EditObject } = this.state;

    let alert = null;
    if (EditObject && EditObject.Id) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/PacemakerTwo/PrintReport",
          Data: { Id: EditObject.Id },
          FileName: "PaceMakerTwoReport.pdf",
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

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, Dialog, diffsObj, risksObj, NoData } = this.state;
    return (
      <div>
        {Dialog}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} sm={12} md={12}>
            {Fields ? (
              NoData ? (
                <BaseNoData Text="Pacemaker 1 бүртгээгүй байна" />
              ) : (
                <div>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pat_history_id")}
                    Disabled
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("department")}
                    Disabled
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("treatment_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("treatment_result")}
                    FullWidth={true}
                  />
                  <BaseArrayInfo
                    Label="Гарч болох хүндрэлүүд"
                    TextField="Label"
                    Values={diffsObj}
                    LabelWeight="400"
                    ValueWeight="300"
                    LabelColor="#75736c"
                    Clear="both"
                  />
                  <BaseArrayInfo
                    Label="Гарч болох эрсдэлүүд"
                    TextField="Label"
                    Values={risksObj}
                    LabelWeight="400"
                    ValueWeight="300"
                    LabelColor="#75736c"
                    Clear="both"
                  />
                  {/* <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("diffs")}
                />
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("risks")}
                /> */}
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("possible_adds")}
                    FullWidth={true}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("possible_other")}
                    FullWidth={true}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("advantage")}
                    FullWidth={true}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("anesthesia")}
                    FullWidth={true}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("qfrom_pat")}
                    FullWidth={true}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("afrom_pat")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("doc_phone")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("doc_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pat_name")}
                    FullWidth={true}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "20px 10px 10px",
                      border: "1px solid #ccc",
                      margin: "25px 0",
                      backgroundColor: "#f2fbff",
                    }}
                  >
                    <h3
                      style={{
                        position: "absolute",
                        top: "-35px",
                        left: "15px",
                        padding: "0 10px",
                        backgroundColor: "#FFF",
                        border: "1px solid #ccc",
                        color: "#3C4858",
                        textDecoration: "none",
                        fontSize: "18px",
                      }}
                    >
                      Хэрэв үйлчлүүлэгч гарын үсэг зурах эрхзүйн чадамжгүй бол
                    </h3>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("guardian_name")}
                      FullWidth={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("guardian_rel")}
                      FullWidth={true}
                    />

                    <BaseSelect
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("outlawed_reason")}
                      FullWidth={true}
                    />
                    <div
                      id="outlawed_reasonDiv"
                      style={{
                        display: this.GetDisplay("outlawed_reason"),
                      }}
                    >
                      <GridContainer>
                        <GridItem xs={12} sm={6} md={3}></GridItem>
                        <GridItem xs={12} sm={6} md={9}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("otherOutlawedReason")}
                            NoLabel={true}
                            FullWidth={true}
                          />
                        </GridItem>
                      </GridContainer>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      padding: "20px 10px 10px",
                      border: "1px solid #ccc",
                      margin: "25px 0",
                      backgroundColor: "#fff2f2",
                    }}
                  >
                    <h3
                      style={{
                        position: "absolute",
                        top: "-35px",
                        left: "15px",
                        padding: "0 10px",
                        backgroundColor: "#FFF",
                        border: "1px solid #ccc",
                        color: "#3C4858",
                        textDecoration: "none",
                        fontSize: "18px",
                      }}
                    >
                      Хэрэв үйлчлүүлэгч жирэмсэн бол
                    </h3>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("husband_name")}
                      FullWidth={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("reject_reason")}
                      FullWidth={true}
                    />
                  </div>
                </div>
              )
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default PaceMakerTwoForm;
