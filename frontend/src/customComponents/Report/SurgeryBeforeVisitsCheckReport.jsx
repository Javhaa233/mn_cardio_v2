import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import SurgeryTable from "customComponents/Report/SurgeryTable";

import Helper from "helper";

class SurgeryBeforeVisitsCheckReport extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null, Alert: null };
  }

  GetDetailView = async () => {
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [{ Field: "Id", Value: "2", Op: "Equals" }];
    await Helper.BaseCrudHelper.BaseGetDetailInfo(
      { ObjectName: "PacemakerTblTwo", SearchOption },
      (resData) => {
        if (resData && resData.Data) {
          this.setState({ Data: resData.Data });
          this.GetPatientData(resData.Data.PatientId);
        }
      },
    );
  };

  GetPatientData = async (PatientId) => {
    if (PatientId) {
      await Helper.PatientShowHelper.GetPatientInfoById(
        PatientId,
        (resData) =>
          resData &&
          resData.Success &&
          this.setState({ PatientData: resData.Data }),
      );
    }
  };

  Print = (callback) => {
    let alert = null;
    html2canvas(document.querySelector("#divToPrint")).then((canvas) => {
      document.body.appendChild(canvas); // if you want see your screenshot in body.

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("landscape", "px", "a4");
      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("SurgeryBeforeChecks.pdf");

      // alert
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Successfully printed",
        true,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    });
  };

  render() {
    const { t } = this.props;
    const { Alert } = this.state;

    return (
      <div>
        {Alert}
        <div style={{ width: "100%" }}>
          <div id="my_mm" style={{ height: "1mm", display: "none" }}></div>
          <div
            style={{
              margin: "0 auto",
              width: "910px",
              height: "645px",
              // width: "297mm",
              // height: "210mm",
              border: "1px solid #ccc",
            }}
          >
            <div id="divToPrint" style={{ display: "flex", margin: "0" }}>
              <SurgeryTable />
              <SurgeryTable />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default SurgeryBeforeVisitsCheckReport;
