import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { CircularProgress } from "@mui/material";
// @mui/icons-material
import SaveIcon from "@mui/icons-material/Save";
// default components
// import GridContainer from "components/Grid/GridContainer";
// import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
// import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import BaseField from "baseComponents/BaseField";
// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

class VascularDiseaseTreatmentForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DiseaseId: null };
  }

  componentDidMount() {
    super.componentDidMount();
    const { ObjectName } = this.props;
    process.env.NODE_ENV === "development" && console.log({ ObjectName });
  }

  SetId = (Id) => {
    this.setState({ DiseaseId: Id }, () => {
      this.GetFormConfig();
    });
  };

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
    const noChildDiv = document.getElementById(Field + "NoChild");
    if (childDiv) {
      if (Value === "a" || Value === "y" || Value === "1")
        childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }
    if (noChildDiv) {
      if (Value === "n") noChildDiv.style.display = "block";
      else noChildDiv.style.display = "none";
    }

    if (Field === "sudas_telegch_em_check" || Field === "emchilgee_check") {
      const childDivs = document.querySelector("#" + Field + "Childs");
      if (childDivs) {
        const childs = childDivs.children;
        for (let i = 0; i < childs.length; i++) {
          if (childs[i]) {
            if (Array.isArray(Value)) {
              childs[i].style.display = Value.includes(
                childs[i].id.replace(Field + "Child-", ""),
              )
                ? "block"
                : "none";
            } else {
              childs[i].style.display =
                Value === childs[i].id.replace(Field + "Child-", "")
                  ? "block"
                  : "none";
            }
          }
        }
      }
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "a" || Value === "y" || Value === "1") return "block";
    else return "none";
  };

  GetNoDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "n") return "block";
    else return "none";
  };

  GetValueDisplay = (Field, Val) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Array.isArray(Value))
      return Value.includes(Val + "") ? "block" : "none";
    else return Value + "" === Val + "" ? "block" : "none";
  };

  GetData = async () => {
    const { ObjectName, DiseaseId } = this.state;
    if (DiseaseId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "DiseaseId", Op: "Equals", Value: DiseaseId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData && resData.Success)
            this.setState({
              EditObject: Object.assign({}, resData.Data),
              isLoading: false,
            });
          else this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Save = async () => {
    const { ObjectName, EditObject, DiseaseId } = this.state;

    let alert = null;
    if (DiseaseId === null) {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Судасны эмгэгийн ерөнхий үзлэг үүсгээгүй байна",
        false,
        () => this.setState({ Alert: null, saveLoading: false }),
      );
      this.setState({ Alert: alert });
    } else {
      if (Object.keys(this.ModifyObject).length > 0) {
        let Data = null;
        if (EditObject && EditObject.Id) {
          Data = { ...this.ModifyObject, Id: EditObject.Id, Files: null };
          await Helper.BaseCrudHelper.BaseUpdate(
            { ObjectName, Data },
            (resData) => {
              if (resData) {
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => this.setState({ Alert: null, saveLoading: false }),
                );
                this.setState({ Alert: alert });
              }
            },
          );
        } else {
          Data = { ...this.ModifyObject, DiseaseId, Files: null };
          await Helper.BaseCrudHelper.BaseCreate(
            { ObjectName, Data },
            (resData) => {
              if (resData) {
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => this.setState({ Alert: null, saveLoading: false }),
                );
                this.setState({ Alert: alert });
              }
            },
          );
        }
      } else {
        alert = Helper.BaseCrudHelper.ShowAlert(
          "Information is missing",
          false,
          () => this.setState({ Alert: null, saveLoading: false }),
        );
        this.setState({ Alert: alert });
      }
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
    if (Value) {
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
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { Fields, saveLoading } = this.state;
    const { t, classes } = this.props;

    return (
      <div>
        {Fields ? (
          <div>
            <div style={{ minHeight: "50px" }}>
              <div
                style={{
                  float: "right",
                  position: "relative",
                  display: "inline",
                }}
              >
                <Button
                  color="success"
                  size="sm"
                  startIcon={<SaveIcon />}
                  onClick={() => {
                    this.setState({ saveLoading: true });
                    this.Save();
                  }}
                  disabled={saveLoading}
                >
                  {t("Save")}
                </Button>
                {saveLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "green",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            </div>
            {/* <h4 className={classes.divSubHeader}>{t("Эмчилгээ")}</h4> */}
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("АХФС/ АРХ/ АРНС зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("emchilgee_check")}
              />
              <div id="emchilgee_checkChilds">
                <div
                  id="emchilgee_checkChild-2"
                  className={classes.childDiv}
                  style={{
                    display: this.GetValueDisplay("emchilgee_check", 2),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("axpc_nershil")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("axpc_other")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("axpc_tun")}
                  />
                </div>
                <div
                  id="emchilgee_checkChild-3"
                  className={classes.childDiv}
                  style={{
                    display: this.GetValueDisplay("emchilgee_check", 3),
                  }}
                >
                  <div className={classes.borderSubDiv}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("apc_nershil")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      FullWidth={true}
                      Config={this.GetConfigField("apc_other")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("apc_tun")}
                    />
                  </div>
                  <div className={classes.borderSubDiv}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("aphc_tun")}
                    />
                  </div>
                </div>

                <div
                  id="emchilgee_checkChild-1"
                  className={classes.childDiv}
                  style={{
                    display: this.GetValueDisplay("emchilgee_check", 1),
                  }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("emchilgee_notcheck")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("emchilgee_other")}
                  />
                </div>
              </div>
            </div>

            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Бета хориглогч зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_beta_horiglogch")}
              />
              {/* yes */}
              <div
                id="is_beta_horiglogchChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_beta_horiglogch") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("beta_horiglogch_nershil")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("beta_horiglogch_other")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("beta_horiglogch_tun")}
                />
              </div>
              {/* no */}
              <div
                id="is_beta_horiglogchNoChild"
                className={classes.childDiv}
                style={{ display: this.GetNoDisplay("is_beta_horiglogch") }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("not_beta_shaltgaan")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("not_beta_other")}
                />
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Минералокортикоид рецепторын антагонист зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_mra")}
              />
              {/* yes */}
              {/* yes */}
              <div
                id="is_mraChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_mra") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("mra_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("mra_tun")}
                />
              </div>
              {/* no */}
              <div
                id="is_mraNoChild"
                className={classes.childDiv}
                style={{ display: this.GetNoDisplay("is_mra") }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("mra_notcheck")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("mra_notcheck_other")}
                />
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("SGLT2 саатуулагч зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_sglt2")}
              />
              {/* yes */}
              <div
                id="is_sglt2Child"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_sglt2") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sglt2_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sglt2_tun")}
                />
              </div>
              {/* no */}
              <div
                id="is_sglt2NoChild"
                className={classes.childDiv}
                style={{ display: this.GetNoDisplay("is_sglt2") }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sglt2_notcheck")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("sglt2_notcheck_other")}
                />
              </div>
            </div>

            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Антиагрегант зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_antiagregant")}
              />
              {/* yes */}
              <div
                id="is_antiagregantChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_antiagregant") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("vd_antiagregant_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("vd_antiagregant_other")}
                />
                <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antiagregant_em_ner")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vd_antiagregant_tun")}
                  />
                </div>
                <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antiagregant_em_ner1")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vd_antiagregant_tun1")}
                  />
                </div>
                <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antiagregant_em_ner2")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vd_antiagregant_tun2")}
                  />
                </div>
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Антиагрегант зөвлөсөн эсэх")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_antikoagulyant")}
              />
              {/* yes */}
              <div
                id="is_antikoagulyantChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_antikoagulyant") }}
              >
                <div className={classes.borderSubDiv}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vd_antikoagulyant_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antikoagulyant_other")}
                  />

                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vd_antikoagulyant_tun")}
                  />
                </div>
                {/* <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antikoagulyant_em_ner")}
                  />
                </div> */}
                {/* <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antikoagulyant_em_ner1")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    
                    Config={this.GetConfigField("vd_antikoagulyant_tun1")}
                  />
                </div>
                <div className={classes.borderSubDiv}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("vd_antikoagulyant_em_ner2")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    
                    Config={this.GetConfigField("vd_antikoagulyant_tun2")}
                  />
                </div> */}
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Шээс хөөх эмүүд")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_shees_huuh_em")}
              />
              {/* yes */}
              <div
                id="is_shees_huuh_emChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_shees_huuh_em") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("shees_huuh_em_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("shees_huuh_em_other")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("shees_huuh_em_tun")}
                />
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Липид бууруулах эмүүд")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_lipid_buuruulah")}
              />
              {/* yes */}
              <div
                id="is_lipid_buuruulahChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_lipid_buuruulah") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lipid_buuruulah_em_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Config={this.GetConfigField("lipid_buuruulah_em_other")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lipid_buuruulah_em_tun")}
                />
              </div>
            </div>
            <div className={classes.borderSubDiv}>
              {/* <h3 className={classes.divSubHeader}>
          {t("Судас тэлэгч эмүүд")}
        </h3> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_sudas_telegch")}
              />
              {/* yes */}
              <div
                id="is_sudas_telegchChild"
                className={classes.childDiv}
                style={{ display: this.GetDisplay("is_sudas_telegch") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sudas_telegch_em_check")}
                />
                <div id="sudas_telegch_em_checkChilds">
                  <div
                    id="sudas_telegch_em_checkChild-1"
                    className={classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "sudas_telegch_em_check",
                        1,
                      ),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("sudas_telegch_em_tun")}
                    />
                  </div>
                  <div
                    id="sudas_telegch_em_checkChild-2"
                    className={classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "sudas_telegch_em_check",
                        2,
                      ),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("sudas_telegch_em_tun2")}
                    />
                  </div>
                  <div
                    id="sudas_telegch_em_checkChild-3"
                    className={classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "sudas_telegch_em_check",
                        3,
                      ),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("sudas_telegch_em_tun3")}
                    />
                  </div>
                </div>
              </div>
            </div>
            <BaseTextArea
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hyanalt")}
            />
            <BaseTextArea
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("notes")}
            />
          </div>
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  };
}

VascularDiseaseTreatmentForm.defaultProps = {
  classes: customFormStyles,
};

export default withTranslation(undefined, { withRef: true })(
  VascularDiseaseTreatmentForm,
);
