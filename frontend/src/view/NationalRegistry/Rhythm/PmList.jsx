import React, { Component } from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import PmTable from "customComponents/PatientShow/NationalRegistry/PmTable";

class PmList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          <PmTable />
        </GridItem>
      </GridContainer>
    );
  }
}

export default PmList;
