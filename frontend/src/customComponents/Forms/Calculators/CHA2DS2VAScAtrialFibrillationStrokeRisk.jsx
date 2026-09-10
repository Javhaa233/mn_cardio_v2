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

class CHA2DS2VAScAtrialFibrillationStrokeRisk extends Component {
  constructor(props) {
    super(props);
    this.state = { Values: [], Alert: null };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  Save = async (callback) => {
    const t = this.props.t;
    const { PatientId } = this.props;
    var Points = this.GetPoint();
    if (Points && PatientId) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "Calculator",
          Data: {
            patient_id: PatientId,
            score: Points,
            ref: "One recommendation suggests a  - 0 score is “low” risk and may not require anticoagulation; a  - 1 score is “low-moderate” risk and should consider antiplatelet or anticoagulation, and score  - 2 or greater is “moderate-high” risk and should o",
            calculator:
              "CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk",
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
    if (Value === "Age" || Value === "Sex") {
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
                {t("One recommendation suggests")}
              </Typography>
              <ul
                style={{
                  padding: "0",
                  paddingLeft: "15px",
                  margin: "0",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                <li>
                  {t(
                    '0 score is "low" risk and may not require anticoagulation;',
                  )}
                </li>
                <li>
                  {t(
                    '1 score is "low-moderate" risk and should consider antiplatelet or anticoagulation,',
                  )}
                </li>
                <li>
                  {t(
                    'score - 2 or greater is "moderate-high" risk and should otherwise be an anticoagulation candidate.',
                  )}
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
                label="Age"
                name="Age"
                onChange={this.SetValue}
                options={[
                  { Id: "0", Name: "<65 (0 point)" },
                  { Id: "1", Name: "65-74 (1 point)" },
                  { Id: "2", Name: ">=75 (2 point)" },
                ]}
              />
              <Divider sx={{ my: 0 }} />
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
                label={t("Congestive heart failure history")}
                points="1"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("2")}
                onClick={() => this.SetValue("2", 1)}
                label={t("Hypertension history")}
                points="1"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("3")}
                onClick={() => this.SetValue("3", 2)}
                label={t("Stroke/TIA/Thromboembolism history")}
                points="2"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("4")}
                onClick={() => this.SetValue("4", 1)}
                label={t("Vascular disease history")}
                points="1"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("5")}
                onClick={() => this.SetValue("5", 1)}
                label={t("Diabetes history")}
                secondaryLabel={<>{""}</>}
                points="1"
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

export default withTranslation(undefined, { withRef: true })(
  CHA2DS2VAScAtrialFibrillationStrokeRisk,
);
