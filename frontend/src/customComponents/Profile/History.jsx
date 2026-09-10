import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import UserActionHistoryTable from "customComponents/Profile/UserActionHistoryTable";

export default function History() {
  return (
    <GridContainer style={{ width: "100%" }}>
      <GridItem xs={12} md={12}>
        <UserActionHistoryTable
          ObjectName="vwUserActionHistory"
          CustomRender={true}
        />
      </GridItem>
    </GridContainer>
  );
}
