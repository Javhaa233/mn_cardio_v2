import React, { Component } from "react";

import UniCard from "customComponents/UniCard";
import CVDHunAmForm from "customComponents/CardiovascularDisease/Forms/CVDHunAmForm";
import CVDDrugForm from "customComponents/CardiovascularDisease/Forms/CVDDrugForm";

class CVDMonitoringList extends Component {
  render() {
    return (
      <div>
        <UniCard
          title={"Харьяалагдах хүн амын тоо"}
          color="rose"
          cardStyle={{ height: "auto", flex: "none" }}
          cardBodyStyle={{ maxHeight: "400px", overflow: "auto", flex: "none" }}
        >
          <CVDHunAmForm />
        </UniCard>
        <div style={{ height: "20px" }}></div>
        <UniCard
          title={"ЗСӨ/ЧШ-гийн дараах үндсэн эмийн тоо"}
          color="rose"
          cardStyle={{ height: "auto", flex: "none" }}
          cardBodyStyle={{ maxHeight: "400px", overflow: "auto", flex: "none" }}
        >
          <CVDDrugForm ObjectName="CVDDrugBalance" />
        </UniCard>
      </div>
    );
  }
}

export default CVDMonitoringList;
