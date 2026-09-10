import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// @mui/material components
import { Box } from "@mui/material";
import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";

const styles = {
  body: {
    margin: "0 auto",
    padding: "0 15px 15px",
    fontSize: "14px",
    fontWeight: "400",
    width: "210mm",
    minHeight: "297mm",
  },
};

class PaceMakerOneReport extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }
  componentDidMount() {
    this.GetDetailView();
  }

  GetDetailView = async () => {
    const { Id } = this.props;
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [{ Field: "Id", Value: Id, Op: "Equals" }];
    await Helper.BaseCrudHelper.BaseGetDetailInfo(
      { ObjectName: "PacemakerTblOne", SearchOption },
      (resData) => {
        if (resData && resData.Data) {
          this.setState({ Data: resData.Data });
          this.GetPatientData(resData.Data.pat_id_data);
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

  Print = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    var y = 0;

    for (let i = 1; i <= 14; i++) {
      html2canvas(document.querySelector("#div" + i)).then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 0, 0);

        var imgWidth = 210;
        var heigth = (canvas.height * imgWidth) / canvas.width;

        if (y + heigth <= 295) {
          pdf.addImage(imgData, "JPEG", 4, y);
          y += heigth;
        } else {
          y = 4;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 4, y);
          y += heigth;
        }
        if (i === 14) pdf.save("PaceMakerOneReport.pdf");
      });
    }
  };

  render() {
    const { t } = this.props;
    const { Data, PatientData } = this.state;

    return (
      <div style={{ width: "100%" }}>
        {!Data || !PatientData ? (
          <BaseLoading />
        ) : (
          <div
            style={{
              margin: "0 auto",
              width: "210mm",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          >
            <Box sx={styles.body}>
              <div id="div1" style={{ paddingTop: "25px" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ float: "left" }}>
                    Өвчний түүхийн дугаар: {Data.pat_history_id}{" "}
                  </div>
                  <div style={{ float: "right" }}>
                    Тасаг:{" "}
                    {Data.departmentObj ? Data.departmentObj.Label : null}
                  </div>
                </div>
                <div style={{ width: "100%", textAlign: "center" }}>
                  <h5 style={{ fontSize: "16px", fontWeight: "500" }}>
                    БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭНИЙ ӨМНӨХ ДҮГНЭЛТ
                  </h5>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "2px",
                  }}
                >
                  <div style={{ display: "inline-block", width: "40%" }}>
                    Эцэг/эх/-ийн нэр: {PatientData.p_lastname}
                  </div>
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Нэр: {PatientData.p_firstname}
                  </div>
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Нас:{" "}
                    {PatientData.p_birthday
                      ? new Date().getFullYear() -
                        new Date(PatientData.p_birthday).getFullYear()
                      : ""}
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Хүйс:{" "}
                    {Helper.ObjectHelper.getGenderLabel(PatientData.p_gender)}
                  </div>
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Цусны бүлэг:{" "}
                    {PatientData.blood_typeObj
                      ? PatientData.blood_typeObj.Label
                      : ""}
                  </div>
                </div>
              </div>
              <div id="div2">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  <div>Эмч нарын зөвөлгөөний онош, шийдвэр:</div>
                  <div>{Data.diag_decision}</div>
                </div>
                <div style={{ display: "inline-block", marginBottom: "20px" }}>
                  <div>Зөвлөх эмчийн гарын үсэг: {Data.zuvlukh_emch}</div>
                  <div>Эмчлэгч эмчийн гарын үсэг: {Data.emchlegch_emch}</div>
                  <div>Эмчийн гарын үсэг: {Data.emch}</div>
                </div>
              </div>
              <div id="div3">
                <div>
                  Байнгын пейсмейкер суулгах эмчилгээний үед болон дараа гарч
                  болох эрсдэл, хүндрэл ба авах арга хэмжээ:
                </div>
                <div style={{ marginLeft: "8px", minHeight: "100px" }}>
                  <span
                    style={{
                      marginLeft: "30px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Хүндрэл
                  </span>
                  <div style={{ width: "100%" }}>
                    {Array.isArray(Data.diffsObj)
                      ? Data.diffsObj.map((risk, key) => (
                          <div
                            key={key}
                            style={{ marginBottom: "8px", width: "100%" }}
                          >
                            {risk.Label}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>
              <div id="div4">
                <div
                  style={{
                    marginLeft: "8px",
                    minHeight: "100px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      marginLeft: "30px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Эрсдэл
                  </span>
                  <div style={{ width: "100%" }}>
                    {Array.isArray(Data.risksObj)
                      ? Data.risksObj.map((risk, key) => (
                          <div
                            style={{ marginBottom: "8px", width: "100%" }}
                            key={key}
                          >
                            {risk.Label}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>
              <div id="div5">
                <div style={{ display: "inline-block", marginBottom: "20px" }}>
                  <div>Байнгын пейсмейкер төхөөрөмжийн загварын заалт:</div>
                  <div>
                    {Data.device_modelObj ? Data.device_modelObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div6">
                <div style={{ display: "inline-block", marginBottom: "20px" }}>
                  <div>Байнгын пейсмейкер суулгах эмчилгээний өмнөх онош:</div>
                  <div>{Data.prev_diagnosis}</div>
                </div>
              </div>
              <div id="div7">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    Эмчилгээг төлөвлөгөөт/яаралтай журмаар{" "}
                    {new Date(Data.planned_date).getFullYear()} оны{" "}
                    {new Date(Data.planned_date).getMonth()} сарын{" "}
                    {new Date(Data.planned_date).getDate()}-ны өдөр төлөв.
                  </div>
                </div>
              </div>
              <div id="div8">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>
                    Гардан гүйцэтгэх эмч:
                  </div>
                  <div style={{ float: "left", width: "50%" }}>
                    {Data.operating_emchObj ? Data.operating_emchObj.Label : ""}
                  </div>
                </div>
              </div>
              <div id="div9">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>Туслах эмч:</div>
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.tuslakh_emchObj ? Data.tuslakh_emchObj.Label : ""}
                  </div>
                </div>
              </div>
              <div id="div10">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>
                    Мэс заслын сувилагч:
                  </div>{" "}
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.surgery_nurseObj ? Data.surgery_nurseObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div11">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>Инженер:</div>{" "}
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.engineerObj ? Data.engineerObj.Label : ""}
                  </div>
                </div>
              </div>
              <div id="div12">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>Техникч: </div>
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.technicianObj ? Data.technicianObj.Label : ""}
                  </div>
                </div>
              </div>
              <div id="div13">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>
                    Мэдээгүйжүүлгийн эмч:{" "}
                  </div>
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.anasthesia_emchObj
                      ? Data.anasthesia_emchObj.Label
                      : ""}
                  </div>
                </div>
              </div>
              <div id="div14">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ float: "left", width: "40%" }}>
                    Мэдээгүйжүүлгийн сувилагч:{" "}
                  </div>
                  <div style={{ float: "left", width: "40%" }}>
                    {Data.anasthesia_nurseObj
                      ? Data.anasthesia_nurseObj.Label
                      : ""}
                  </div>
                </div>
              </div>
            </Box>
          </div>
        )}
      </div>
    );
  }
}

export default PaceMakerOneReport;
