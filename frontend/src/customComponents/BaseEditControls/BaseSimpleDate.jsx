import React, { useState } from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import Datetime from "customComponents/DateTime";

import Helper from "helper";

export default function BaseSimpleDate(props) {
  const { Config = null, ChangeValue } = props;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : Helper.ObjectHelper.getDateYMD(),
  );

  return (
    <GridContainer style={{ marginTop: "5px" }}>
      <GridItem xs={12} sm={6} md={12}>
        <Datetime
          Value={Value}
          ChangeValue={(Value) => {
            setValue(Value);
            Config && ChangeValue && ChangeValue(Config.Name, Value);
          }}
        />
      </GridItem>
    </GridContainer>
  );
}
