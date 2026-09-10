import React, { Component } from "react";

import { withTranslation } from "react-i18next";
import FormLabel from "@mui/material/FormLabel";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import SimpleSelect from "customComponents/Register/SimpleSelect";

class SingleSelect extends Component {
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
    if (Value && Array.isArray(Value)) {
      const temp = Data.filter((s) => s["id_data"] === Value);
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
    const { Config, Data } = this.state;

    return (
      <GridContainer style={{ marginTop: "10px" }}>
        <GridItem xs={12} sm={12} md={4}>
          <FormLabel
            sx={{
              color: "#75736c",
              cursor: "pointer",
              display: "inline-flex",
              fontSize: "14px",
              lineHeight: 1,
              fontWeight: "400",
              paddingTop: "20px",
              marginRight: "0",
              textAlign: "left",
              float: { lg: "right" },
            }}
          >
            {Config.Label ? t(Config.Label + "") + ":" : ""}
          </FormLabel>
        </GridItem>
        <GridItem xs={12} sm={12} md={8}>
          <SimpleSelect
            Data={Data}
            Value={this.GetValueObject()}
            ChangeValue={(val) => {
              this.ChangeValue(val);
            }}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(SingleSelect);
