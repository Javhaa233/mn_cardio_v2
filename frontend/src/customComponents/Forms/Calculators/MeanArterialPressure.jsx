import React, { Component } from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { List, Divider } from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import CalculatorScoreCard from "customComponents/CalculatorScoreCard";
import CalculatorSelect from "customComponents/Forms/Calculators/CalculatorSelect";
import CalculatorInput from "customComponents/Forms/Calculators/CalculatorInput";
// helper
import Helper from "helper";

class MeanArterialPressure extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, DBP: 0, SBP: 0, Values: [] };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  Save = async (callback) => {
    const { PatientId } = this.props;
    var Points = this.GetPoint();
    if (Points) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "Calculator",
          Data: {
            patient_id: PatientId,
            score: Points,
            calculator: "Mean arterial pressure (MAP)",
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
    } else {
      callback && callback(false);
    }
  };

  GetPoint = () => {
    const { DBP, SBP, Values } = this.state;
    const sbp = Helper.ObjectHelper.GetFloat(SBP + "");
    const dbp = Helper.ObjectHelper.GetFloat(DBP + "");
    let Point = (1 / 3) * sbp + (2 / 3) * dbp;

    Values.forEach((element) => {
      Point += parseInt(element.Point || 0);
    });

    return Helper.ObjectHelper.GetBvhel(Point.toFixed(2) + "");
  };

  SetValue = (Value, Point) => {
    if (Value === "SBP" || Value === "DBP") {
      this.setState({ [Value]: Point });
    } else {
      const { Values } = this.state;
      var NewValues = Values;
      NewValues = NewValues.filter((s) => s.Value !== Value);
      NewValues.push({ Value, Point: Point });
      this.setState({ Values: NewValues });
    }
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
        <GridContainer sx={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={9}>
            <List sx={{ paddingTop: "0", paddingBottom: "0" }} dense>
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
              <CalculatorInput
                label="Systolic blood pressure"
                name="SBP"
                onChange={this.SetValue}
              />
              <Divider sx={{ my: 0 }} />
              <CalculatorInput
                label="Diastolic blood pressure"
                name="DBP"
                onChange={this.SetValue}
              />
              <Divider sx={{ my: 0 }} />
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
  MeanArterialPressure,
);
