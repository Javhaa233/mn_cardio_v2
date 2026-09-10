import React, { Component } from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import IcdTable from "customComponents/PatientShow/NationalRegistry/IcdTable";

class IcdList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          <IcdTable />
        </GridItem>
      </GridContainer>
    );
  }
}

export default IcdList;
