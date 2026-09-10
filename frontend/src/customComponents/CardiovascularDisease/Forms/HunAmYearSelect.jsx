import React, { Component } from "react";
import { withTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import SimpleSelect from "customComponents/CardiovascularDisease/Forms/YearSingleSelect";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

class HunAmYearSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Config: props.Config || null,
      Value: new Date().getFullYear() + "",
      Data: props.Config && props.Config.Data ? props.Config.Data : null,
    };
  }

  GetValueObject = () => {
    const { Data, Value } = this.state;
    if (Value) {
      const temp = Data.filter((s) => s === Value);
      if (temp.length === 1) {
        return temp[0];
      }
    }
    return null;
  };

  ChangeValue = (value) => {
    const { Config } = this.state;
    const { ChangeValue } = this.props;
    this.setState({ Value: value });
    Config && ChangeValue && ChangeValue(Config.Name, value);
  };

  render() {
    const { t } = this.props;
    const { GetValueObject } = this;
    const { Config, Data } = this.state;
    return (
      <GridContainer style={{ marginTop: "10px" }}>
        <GridItem xs={12} sm={12} md={12}>
          <SimpleSelect
            Data={Data}
            Value={GetValueObject()}
            ChangeValue={this.ChangeValue}
            Label={Config.Label}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(HunAmYearSelect);
