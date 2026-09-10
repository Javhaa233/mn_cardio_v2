import { useTranslation } from "react-i18next";
import React from "react";
// @material-ui core components
import { FormLabel } from "@mui/material";
// defult components
import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default function JournalICD(props) {
  const { t } = useTranslation();
  const { Data = [], Remove } = props;

  const GetLabels = () => {
    var Labels = [];
    for (var i = 0; i < Data.length; i++) {
      var JournalMonName = Data[i].JournalRef.JournalRefTranslation.Mon
        ? Data[i].JournalRef.JournalRefTranslation.Mon
        : null;
      if (Data[i].JournalRef) {
        var JournalRefId = Data[i].JournalRef.id_data;
        Labels.push(
          <GridContainer
            key={"Container" + i}
            style={{
              border: "1px solid #ccc",
              padding: "2px 10px",
              alignItems: "center",
            }}
          >
            <GridItem xs={10} sm={10} md={10}>
              <FormLabel
                style={{
                  display: "inline-block",
                  width: "100%",
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0px 5px",
                  margin: "0",
                  color: "#2e2e2e",
                  lineHeight: "1.2",
                }}
              >
                {JournalMonName
                  ? Data[i].JournalRef.jr_label.split(" ")[0] +
                    " " +
                    JournalMonName
                  : Data[i].JournalRef.jr_label}
              </FormLabel>
            </GridItem>
            <GridItem xs={2} sm={2} md={2} style={{ textAlign: "right" }}>
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
      <div
        style={{ marginTop: "15px", padding: "5px", border: "1px solid #ccc" }}
      >
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            {GetLabels()}
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
