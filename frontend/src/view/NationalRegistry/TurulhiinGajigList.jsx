import React, { Component } from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import TurulhiinGajigTable from "customComponents/PatientShow/NationalRegistry/TurulhiinGajigTable";

class TurulhiinGajigList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          <TurulhiinGajigTable />
        </GridItem>
      </GridContainer>
    );
  }
}

export default TurulhiinGajigList;
