import React, { Component } from "react";
// @mui/material components
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

class EditCommentForm extends Component {
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
    if (Save && rowdata) {
      try {
        const result = await Save({ RowData: rowdata, Text });
        console.log("Save result:", result);
        return result;
      } catch (error) {
        console.error("Error saving comment:", error);
        return false;
      }
    }
    return false;
  };

  render() {
    const { Text } = this.state;
    return (
      <GridContainer style={{ margin: "0 -15px" }}>
        <GridItem xs={12} sm={12} md={12}>
          <BaseTextArea
            Value={Text}
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

export default EditCommentForm;
