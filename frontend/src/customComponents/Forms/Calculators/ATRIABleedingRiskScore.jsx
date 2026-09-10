import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemSecondaryAction,
} from "@mui/material";
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CalculatorScoreCard from "customComponents/CalculatorScoreCard";
import CalculatorOption from "customComponents/CalculatorOption";
import CalculatorSelect from "customComponents/Forms/Calculators/CalculatorSelect";
// helper
import Helper from "helper";

class ATRIABleedingRiskScore extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Points: 0, Values: [], SexPoint: 0 };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  Save = async (callback) => {
    const t = this.props.t;
    const { PatientId } = this.props;
    const { Points } = this.state;

    if (PatientId && Points) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "Calculator",
          Data: {
            patient_id: PatientId,
            score: Points,
            calculator: "ATRIA Bleeding Risk Score",
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

  SetValue = (Value, Point) => {
    const { Values, Points, SexPoint } = this.state;

    if (Value === "Sex") {
      const diff = Point - SexPoint;
      this.setState({ SexPoint: Point, Points: Points + diff });
      return;
    }

    var NewValues = Values;
    var temp = NewValues.filter((s) => s + "" === Value + "");
    if (temp.length === 1) {
      NewValues.splice(Values.indexOf(Value), 1);
      this.setState({ Values: NewValues, Points: Points - Point });
    } else {
      NewValues.push(Value);
      this.setState({ Values: NewValues, Points: Points + Point });
    }
  };

  GetSelected = (Value) => {
    const { Values } = this.state;
    return Values.filter((s) => s + "" === Value + "").length > 0;
  };

  render() {
    const { Alert, Points } = this.state;
    const { t } = this.props;
    return (
      <div>
        {Alert}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={9}>
            {/* <Typography
              component="span"
              variant="h6"
              style={{
                display: "inline",
              }}
              color="textPrimary"
            >
              {t("ATRIA Bleeding Risk Score")}
            </Typography> */}

            <List
              style={{ paddingTop: "0", paddingBottom: "0" }}
              component="nav"
              dense
            >
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
                onClick={() => this.SetValue("1", 3)}
                label={t("Anemia")}
                secondaryLabel={t(
                  "Hgb < 13 g/dL (Male) Hgb < 12 g/dL (Female)",
                )}
                points="3"
              />
              <Divider sx={{ my: 0 }} />

              <CalculatorOption
                selected={this.GetSelected("2")}
                onClick={() => this.SetValue("2", 3)}
                label={t("Severe Renal Disease")}
                secondaryLabel={t("GFR <30 mL/min or dialysis-dependent")}
                points="3"
              />
              <Divider sx={{ my: 0 }} />

              <CalculatorOption
                selected={this.GetSelected("3")}
                onClick={() => this.SetValue("3", 2)}
                label={t("Age >= 75 years")}
                points="2"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("4")}
                onClick={() => this.SetValue("4", 1)}
                label={t("Any Prior Hemorrhage Diagnosis")}
                secondaryLabel={t("Ex: GI bleed, intracranial hemorrhage")}
                points="1"
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorOption
                selected={this.GetSelected("5")}
                onClick={() => this.SetValue("5", 1)}
                label={t("Hypertension History")}
                points="1"
              />
            </List>
          </GridItem>
          <GridItem xs={12} md={3}>
            <CalculatorScoreCard points={Points} />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  ATRIABleedingRiskScore,
);
