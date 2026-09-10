import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Button from "components/CustomButtons/Button";

//
import MainInformation from "customComponents/Report/EPSAblationTables/MainInformation";
import ProcedureOne from "customComponents/Report/EPSAblationTables/ProcedureOne";
import ProcedureTwo from "customComponents/Report/EPSAblationTables/ProcedureTwo";
import EndAblation from "customComponents/Report/EPSAblationTables/EndAblation";

class EPSAblation extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }

  Print = () => {
    const pdf = new jsPDF();
    for (let i = 1; i <= 4; i++) {
      html2canvas(document.querySelector("#divPrint" + i)).then((canvas) => {
        document.body.appendChild(canvas); // if you want see your screenshot in body.
        const imgData = canvas.toDataURL("image/png", 0, 0);
        pdf.addImage(imgData, "JPEG", 0, 0);
        if (i === 4) pdf.save("Ablation.pdf");
        else pdf.addPage();
      });
    }
  };

  render() {
    return (
      <div style={{ width: "100%" }}>
        <div>
          <Button simple size="sm" onClick={this.Print} color="primary">
            PDF Download
          </Button>
        </div>
        <MainInformation />
        <ProcedureOne />
        <ProcedureTwo />
        <EndAblation />
      </div>
    );
  }
}

export default EPSAblation;
