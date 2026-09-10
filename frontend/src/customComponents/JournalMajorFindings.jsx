import React from "react";
import { FormLabel } from "@mui/material";

import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default function JournalMajorFindings(props) {
  const { Data = [], md = 3, Label = "", Remove } = props;

  const GetLabels = () => {
    var Labels = [];
    for (var i = 0; i < Data.length; i++) {
      if (Data[i].JournalRef) {
        var JournalRefId = Data[i].JournalRef.id_data;
        Labels.push(
          <GridContainer
            key={"Container " + i}
            style={{
              marginBottom: "0",
              borderBottom: i === Data.length - 1 ? "none" : "1px solid #eee",
              paddingBottom: "4px",
              paddingTop: i === 0 ? "0" : "4px",
            }}
          >
            <GridItem xs={10} sm={10} md={10}>
              <FormLabel
                style={{
                  clear: "both",
                  float: "left",
                  fontSize: "16px",
                  fontWeight: "400",
                  lineHeight: "1.428571429",
                  wordWrap: "break-word",
                  overflow: "hidden",
                  padding: "0 0 0 5px",
                  margin: "0",
                }}
              >
                {Data[i].JournalRef.jr_label}
              </FormLabel>
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
                value={JournalRefId}
                onClick={(event) => Remove && Remove(event.currentTarget.value)}
              >
                <i className={"fa fa-times"} />
              </Button>
            </GridItem>
          </GridContainer>,
        );
      }
    }

    return Labels;
  };

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
          {GetLabels()}
        </GridItem>
      </GridContainer>
    );
  }
}
