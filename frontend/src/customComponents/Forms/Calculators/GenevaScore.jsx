import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  ListItemSecondaryAction,
} from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CardBody from "components/Card/CardBody";
// custom components
import BaseField from "baseComponents/BaseField";
import CalculatorScoreCard from "customComponents/CalculatorScoreCard";
import CalculatorOption from "customComponents/CalculatorOption";
import CalculatorSelect from "customComponents/Forms/Calculators/CalculatorSelect";
// helper
import Helper from "helper";

class GenevaScore extends Component {
  constructor(props) {
    super(props);
    this.state = { Values: [], Alert: null };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  Save = async (callback) => {
    const t = this.props.t;
    const { PatientId } = this.props;
    const Points = this.GetPoint();
    if (Points) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "Calculator",
          Data: {
            patient_id: PatientId,
            score: Points,
            ref: "In the setting of concern for possible PE:  The patient is considered low risk (Score 0-3), <10% incidence of PE. The patient is considered intermediate risk (Score 4-10)  If d-dimer testing is negative consider stopping workup. If d-dimer testing is posi",
            calculator: "Geneva Score (Revised) for Pulmonary Embolism",
            user_id: this.LogedUser.Id,
          },
        },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  GetPoint = () => {
    const { Values } = this.state;
    var Point = 0;
    Values.forEach((element) => {
      Point += parseInt(element.Point);
    });
    return Point;
  };

  SetValue = (Value, Point) => {
    const { Values } = this.state;
    var NewValues = Values;
    if (Value === "HeartRate" || Value === "Sex") {
      NewValues = NewValues.filter((s) => s.Value !== Value);
      NewValues.push({ Value, Point: Point });
    } else {
      var temp = NewValues.filter((s) => s.Value + "" === Value + "");
      if (temp.length === 1) {
        NewValues = NewValues.filter((s) => s.Value !== Value);
      } else {
        NewValues.push({ Value, Point: Point });
      }
    }
    this.setState({ Values: NewValues });
  };

  GetSelected = (Value) => {
    const { Values } = this.state;
    return Values.filter((s) => s.Value + "" === Value + "").length > 0;
  };

  render() {
    const { t } = this.props;
    const { Alert } = this.state;
    return (
      <div>
        {Alert}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12}>
            <div
              style={{
                backgroundColor: "#fff9c4",
                padding: "12px 16px",
                borderRadius: "4px",
                marginBottom: "12px",
                border: "1px solid #f9a825",
              }}
            >
              <Typography
                component="span"
                variant="body2"
                style={{ display: "inline", fontWeight: 500 }}
                color="textPrimary"
              >
                {t("In the setting of concern for possible PE")}
              </Typography>
              <ul
                style={{
                  padding: "0",
                  paddingLeft: "10px",
                  margin: "0",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                <li>
                  {t(
                    "The patient is considered low risk (Score 0-3), < 10% incidence of PE.",
                  )}
                </li>
                <li>
                  {t(
                    "The patient is considered intermediate risk (Score 4-10)",
                  )}
                  <ul style={{ paddingLeft: "15px" }}>
                    <li>
                      {t(
                        "If d-dimer testing is negative consider stopping workup.",
                      )}
                    </li>
                    <li>
                      {t("If d-dimer testing is positive consider CT and US")}
                      <ul style={{ paddingLeft: "15px" }}>
                        <li>
                          {t(
                            "If CT is inconclusive consider V/Q scan or angiography",
                          )}
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  {t(
                    "If the patient is considered high risk (score 11+) (> 60%incidence of PE) consider CT and US",
                  )}
                  <ul style={{ paddingLeft: "15px" }}>
                    <li>{t("If imaging is negative consider angiography")}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </GridItem>
          <GridItem xs={12} md={9}>
            {/* <Typography
              component="span"
              variant="h4"
              style={{
                display: "inline",
                margin: "20px",
              }}
              color="textPrimary"
            >
              CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk
            </Typography> */}

            <List style={{ paddingTop: "0", paddingBottom: "0" }} dense>
              <CalculatorSelect
                label="Sex"
                name="Sex"
                onChange={this.SetValue}
                options={[
                  { Id: "0", Name: "Male (0 point)" },
                  { Id: "1", Name: "Female (1 point)" },
                ]}
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("1")}
                onClick={() => this.SetValue("1", 1)}
                label={t("Age > 65")}
                points="1"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("2")}
                onClick={() => this.SetValue("2", 3)}
                label={t("Previous DVT or PE")}
                points="3"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("3")}
                onClick={() => {
                  this.SetValue("3", 2);
                }}
                label={t(
                  "Surgery (under general anesthesia) or lower limb fracture in past month",
                )}
                points="2"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("4")}
                onClick={() => this.SetValue("4", 2)}
                label={t("Active malignant condition")}
                secondaryLabel={t(
                  "Solid or hematologic malignant condition, currently active or considered cured < 1 year",
                )}
                points="2"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("5")}
                onClick={() => this.SetValue("5", 3)}
                label="Unilateral lower limb pain"
                secondaryLabel={<>{""}</>}
                points="3"
              />
              <Divider sx={{ my: 0 }} />

              <CalculatorOption
                selected={this.GetSelected("6")}
                onClick={() => this.SetValue("6", 2)}
                label={t("Hemoptysis")}
                secondaryLabel={<>{""}</>}
                points="2"
              />
              <Divider sx={{ my: 0 }} />

              <CalculatorSelect
                label="Heart rate"
                name="HeartRate"
                onChange={this.SetValue}
                options={[
                  { Id: "0", Name: "< 75 (0 point)" },
                  { Id: "3", Name: "75-94 (3 point)" },
                  { Id: "5", Name: "=>95 (5 point)" },
                ]}
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("7")}
                onClick={() => this.SetValue("7", 4)}
                label={t("Pain on limb palpation")}
                points="4"
              />
            </List>
          </GridItem>

          <GridItem xs={12} md={3}>
            <CalculatorScoreCard points={this.GetPoint()} />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(GenevaScore);
