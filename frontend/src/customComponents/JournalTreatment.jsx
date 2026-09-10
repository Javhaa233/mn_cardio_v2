import React, { Component } from "react";
import { FormLabel } from "@mui/material";

import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

class JournalTreatment extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: props.Data || [], Render: false };
  }

  ChangeLabel = (JournalRefId, Label) => {
    process.env.NODE_ENV === "development" && console.log({ JournalRefId });
    const { Data } = this.state;
    var ChangedData = Data;
    var Temp = ChangedData.filter(
      (s) => s.JournalRef && s.JournalRef.id_data + "" === JournalRefId + "",
    );
    if (Temp.length === 1) {
      Temp[0].j_label = Label;
      Temp[0].JournalRef.jr_label = Label;
    }
    this.setState({ Data: ChangedData });
    process.env.NODE_ENV === "development" && console.log({ ChangedData });
  };

  AddData = (Value) => {
    const { Data } = this.state;
    this.setState({ Data: [...Data, Value] });
  };

  Remove = (JournalId) => {
    const { Remove } = this.props;
    const { Data } = this.state;
    var ChangedData = Data.filter(
      (item) => item.JournalRef.id_data + "" !== JournalId + "",
      1,
    );
    this.setState({ Data: ChangedData });
    Remove && Remove(JournalId);
  };

  GetValue = () => this.state.Data;

  GetTextFields = () => {
    const { Data } = this.state;
    const { FullWidth = false } = this.props;

    let TextFields = [];
    Data.forEach((Row, index) => {
      if (Row.JournalRef) {
        // var JournalRefId = Row.JournalRef.id_data;
        TextFields.push(
          <GridContainer
            key={"Container" + index}
            style={{
              marginBottom: "0",
              borderBottom:
                index === Data.length - 1 ? "none" : "1px solid #eee",
              paddingBottom: "0px",
              paddingTop: index === 0 ? "0" : "0px",
            }}
          >
            <GridItem xs={10} sm={10} md={10}>
              <textarea
                rows={2}
                value={Row.j_label || Row.JournalRef.jr_label}
                onChange={(event) =>
                  this.ChangeLabel(
                    Row.JournalRef.id_data + "",
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "0",
                  border: "1px solid #eee",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  color: "#495057",
                  backgroundColor: "#fff",
                  resize: "vertical",
                  outline: "none",
                  display: "block",
                  margin: "0",
                }}
              />
            </GridItem>
            <GridItem
              xs={2}
              sm={2}
              md={2}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button
                justIcon
                color="danger"
                simple
                onClick={() => this.Remove(Row.JournalRef.id_data + "")}
              >
                <i className={"fa fa-times"} />
              </Button>
            </GridItem>
          </GridContainer>,
        );
      }
    });

    return TextFields;
  };

  render() {
    const { md = 3, Label = "" } = this.props;
    const { Data } = this.state;

    if (Data.length === 0) {
      return null;
    } else {
      return (
        <GridContainer
          style={{
            margin: "0",
            width: "100%",
            border: "1px solid #eee",
            marginBottom: "5px",
          }}
        >
          <GridItem
            xs={12}
            md={md}
            style={{
              backgroundColor: "#eff9fe",
              borderRight: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "0 10px",
            }}
          >
            <FormLabel
              style={{
                color: "#75736c",
                fontSize: "14px",
                fontWeight: "400",
                textAlign: "left",
                padding: 0,
                margin: 0,
              }}
            >
              {Label}:
            </FormLabel>
          </GridItem>
          <GridItem
            xs={12}
            md={12 - md}
            style={{
              padding: "0",
              backgroundColor: "#fff",
            }}
          >
            {this.GetTextFields()}
          </GridItem>
        </GridContainer>
      );
    }
  }
}

export default JournalTreatment;
