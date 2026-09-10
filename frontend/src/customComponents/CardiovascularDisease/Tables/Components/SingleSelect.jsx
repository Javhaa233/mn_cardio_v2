import React, { Component } from "react";
import { withTranslation } from "react-i18next";
// custom components
import SimpleSelect from "customComponents/CardiovascularDisease/Tables/Components/SimpleSelect";

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
    if (Value) {
      var temp = Data.filter((s) => s["id_data"] === Value);
      if (temp.length === 1) return temp[0];
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
      <SimpleSelect
        Data={Data}
        Value={this.GetValueObject()}
        ChangeValue={(val) => this.ChangeValue(val)}
        PlaceHolder={Config.Label ? t(Config.Label + "") : ""}
      />
    );
  }
}

export default withTranslation(undefined, { withRef: true })(SingleSelect);
