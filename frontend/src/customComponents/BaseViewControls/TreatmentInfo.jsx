import React from "react";
import { useTranslation } from "react-i18next";
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import Helper from "helper";

export default function TreatmentInfo(props) {
  const { t } = useTranslation();

  const {
    Label = "",
    md = 3,
    Left = false,
    LabelColor = "rgba(0, 0, 0, 0.8)",
    Size = "14px",
    LabelWeight = "300",
    padding = "4px 0",
    margin = "4px 0",
    Clear = "none",
    ValueColor = "rgba(0, 0, 0, 0.8)",
    ValueWeight = "400",
    Values = [],
    LinedField = false,
    IsNewField = false,
  } = props;

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={md} style={{ padding: "0 3px" }}>
        <FormLabel
          style={{
            display: "flex",
            justifyContent: Left ? "flex-start" : "flex-end",
            color: LabelColor,
            fontSize: Size,
            fontWeight: LabelWeight,
            lineHeight: "1.428571429",
            padding: padding,
            margin: margin,
            textAlign: Left ? "left" : "right",
            width: "100%",
          }}
        >
          {Label ? t(Label + "") + ":" : ""}
        </FormLabel>
      </GridItem>

      <GridItem xs={12} sm={12} md={12 - md} style={{ padding: "0 3px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            paddingLeft: "24px",
            textAlign: "left",
          }}
        >
          {Array.isArray(Values) && Values.length > 0
            ? Values.map((Value, Index) => {
                // Check if the Value object and necessary fields are defined
                if (!Value) return null; // If Value is undefined or null, skip rendering

                // Try to get the necessary values from the object, if not available use a fallback
                let StrVal =
                  Helper.ObjectHelper.getValue(Value, "j_label") ||
                  Helper.ObjectHelper.getValue(Value, "JournalRef.jr_label") ||
                  ""; // default to empty string if undefined

                // If StrVal is still empty after the check, skip this value
                if (!StrVal) return null;

                // Add "NEW" label if IsNewField is defined and has a value
                const NewText =
                  IsNewField && Value[IsNewField] ? " - " + t("NEW") : "";

                return (
                  <FormLabel
                    key={Index}
                    style={{
                      clear: Clear,
                      color: ValueColor,
                      fontSize: Size,
                      fontWeight: ValueWeight,
                      lineHeight: "1.428571429",
                      padding: padding,
                      textDecoration:
                        LinedField && Value[LinedField]
                          ? "line-through"
                          : "none",
                      margin: margin,
                      marginRight: "8px",
                    }}
                  >
                    {StrVal + "\u00A0" + NewText}
                    {Index < Values.length - 1 && Clear === "none"
                      ? ",\u00A0"
                      : ""}
                  </FormLabel>
                );
              })
            : null}
        </div>
      </GridItem>
    </GridContainer>
  );
}
