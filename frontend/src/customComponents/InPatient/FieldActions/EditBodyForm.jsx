import React, { Component } from "react";
// @mui/material components
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

class EditBodyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Text:
        props.rowdata && props.Field && props.rowdata[props.Field]
          ? props.rowdata[props.Field]
          : "",
    };
  }

  Save = async () => {
    const { rowdata, Save } = this.props;
    const { Text } = this.state;
    if (Save && rowdata) await Save({ RowData: rowdata, Text });
  };

  render() {
    const { Text } = this.state;
    return (
      <GridContainer style={{ margin: "0 -15px" }}>
        <GridItem xs={12} sm={12} md={12}>
          <BaseTextArea
            Value={Text}
            Rows={6}
            ChangeValue={(name, value) => this.setState({ Text: value })}
            Config={{ Label: "" }}
            WithLabel={false}
            md={12}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default EditBodyForm;
