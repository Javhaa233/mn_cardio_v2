import React, { Component } from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import SimpleSelect from "customComponents/CardiovascularDisease/Forms/SimpleSelect";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

class HunAmAddrSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Config: props.Config || null,
      Value: props.Value || null,
      Data: [],
    };
  }

  GetValueObject = () => {
    const { Data, Value } = this.state;
    if (Value) {
      let temp = Data.filter((s) => s["id_data"] === Value);
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
    ChangeValue && ChangeValue(Config.Name, value);
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
            ChangeValue={(val) => this.ChangeValue(val)}
            Label={Config.Label}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(HunAmAddrSelect);
