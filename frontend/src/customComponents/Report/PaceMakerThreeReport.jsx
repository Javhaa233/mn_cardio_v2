import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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

class PaceMakerThreeReport extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }
  componentDidMount() {
    this.GetDetailView();
  }

  GetDetailView = async () => {
    const { DataId } = this.props;
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [{ Field: "Id", Value: DataId, Op: "Equals" }];

      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "PacemakerTblThree", SearchOption },
        (resData) => {
          if (resData && resData.Data) {
            localStorage.setItem(
              "PacemakerTblThree",
              JSON.stringify(resData.Data, 0, 4),
            );
            this.setState({ Data: resData.Data });
            this.GetPatientData(resData.Data.pat_id_data);
          }
        },
      );
    }
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

    for (let i = 1; i <= 13; i++) {
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
        if (i === 13) pdf.save("PaceMakerThreeReport.pdf");
      });
    }
  };

  render() {
    const { t } = this.props;
    const { Data, PatientData } = this.state;

    return (
      <div>
        {!Data || !PatientData ? (
          <BaseLoading />
        ) : (
          <div
            style={{
              margin: "0 auto",
              width: "210mm",
              border: "1px solid #ccc",
            }}
          >
            <Box sx={styles.body}>
              <div id="div1">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                    paddingTop: "15px",
                  }}
                >
                  <div style={{ float: "left" }}>
                    Өвчний түүхийн дугаар ……………...{" "}
                  </div>
                  <div style={{ float: "right" }}>Тасаг ………………….</div>
                </div>
                <div style={{ width: "100%", textAlign: "center" }}>
                  <h5 style={{ fontSize: "16px", fontWeight: "500" }}>
                    БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭНИЙ ТЭМДЭГЛЭЛ
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
                    РД: {PatientData.p_registration}
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Хүйс:
                    {Helper.ObjectHelper.getGenderLabel(
                      PatientData.p_gender,
                    )}{" "}
                  </div>
                  <div style={{ display: "inline-block", width: "30%" }}>
                    Нас:
                    {PatientData.p_birthday
                      ? new Date().getFullYear() -
                        new Date(PatientData.p_birthday).getFullYear()
                      : ""}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div>Төлөвлөсөн эмчилгээний нэр:</div>
                    <div>{Data.treatment_name}</div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div>Клиник оношийн үндэслэл</div>
                    <div>{Data.clinical_diagnosis}</div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      Эхэлсэн: {new Date(Data.started_date).getFullYear()} он{" "}
                      {new Date(Data.started_date).getMonth()} сар{" "}
                      {new Date(Data.started_date).getDate()} өдөр{" "}
                      {Data.started_hour ? Data.started_hour : "00"} цаг{" "}
                      {Data.started_min ? Data.started_min : "00"} мин
                    </div>
                    <div>
                      Үргэлжилсэн: {Data.dur_hour ? Data.dur_hour : "00"} цаг{" "}
                      {Data.dur_min ? Data.dur_min : "00"} мин
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div>Байнгын пейсмейкер суулгах эмчилгээний бичлэг:</div>
                    <div>{Data.scriptum}</div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <div style={{ marginRight: "20px" }}>
                        Рентген тун: {Data.xray_dose}{" "}
                      </div>
                      <div>Рентген хугацаа: {Data.xray_time}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <div style={{ marginRight: "10px" }}>Пейсмейкер:</div>
                      <div style={{ marginRight: "10px" }}>
                        Загвар: {Data.pm_model}{" "}
                      </div>
                      <div style={{ marginRight: "10px" }}>
                        Сери: {Data.pm_serial}{" "}
                      </div>
                      <div style={{ marginRight: "10px" }}>
                        Байрлал: {Data.pm_pos}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ float: "left", width: "20%" }}>
                      Баруун тосгуур:
                    </div>
                    <div style={{ float: "left", width: "66%" }}>
                      <div style={{ float: "left", width: "50%" }}>
                        Загвар: {Data.bt_model}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Сери: {Data.bt_model}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Байрлал: {Data.bt_pos}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Мэдрэмж: {Data.bt_sens}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Босго хүч: {Data.bt_pow}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Эсэргүүцэл: {Data.bt_res}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ float: "left", width: "20%" }}>
                      Баруун ховдол:
                    </div>
                    <div style={{ float: "left", width: "66%" }}>
                      <div style={{ float: "left", width: "50%" }}>
                        Загвар: {Data.bh_model}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Сери: {Data.bh_model}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Байрлал: {Data.bh_pos}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Мэдрэмж: {Data.bh_sens}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Босго хүч: {Data.bh_pow}
                      </div>
                      <div style={{ float: "left", width: "50%" }}>
                        Эсэргүүцэл: {Data.bh_res}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="div2">
                <div style={{ display: "inline-block", marginBottom: "10px" }}>
                  <div>
                    Байнгын пейсмейкер суулгах эмчилгээний үед авсан эдийн болон
                    бусад шинжилгээ:
                  </div>
                  <div>{Data.biopsy_and_other}</div>
                </div>
                <div style={{ display: "inline-block", marginBottom: "10px" }}>
                  <div>
                    Байнгын пейсмейкер суулгах эмчилгээний үед шархны арчдас
                    авсан эсэх:
                  </div>
                  <div>
                    {Data.about_woundObj ? Data.about_woundObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div3">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    Байнгын пейсмейкер суулгах эмчилгээний дараах онош: Ds:
                  </div>
                  <div>{Data.after_diagnosis}</div>
                </div>
              </div>
              <div id="div4">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Мэдээгүйжүүлэлтийн хэлбэр:</div>
                  <div>{Data.anes_type}</div>
                </div>
                <div style={{ display: "inline-block", marginBottom: "10px" }}>
                  Байнгын пейсмейкер суулгах эмчилгээ:{" "}
                  {Data.pm_condObj ? Data.pm_condObj.Label : ""}
                  {/* Цэвэр / Бохир */}
                </div>
              </div>
              <div id="div5">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Оёдол тавьсан утас:</div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginLeft: "60px",
                    }}
                  >
                    <div>Бэхэлгээнд: {Data.wire_fix}</div>
                    <div>Арьсны дор: {Data.wire_under}</div>
                    <div>Арьсанд: {Data.wire_skin}</div>
                  </div>
                </div>
              </div>
              <div id="div6">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    Эмчилгээний өмнө хэрэглэсэн антибиотек: {Data.ab_before}
                  </div>
                  <div>
                    Эмчилгээний үед хэрэглэсэн антибиотек: {Data.ab_during}
                  </div>
                  <div>
                    Эмчилгээний дараа хэрэглэсэн антибиотек: {Data.ab_after}
                  </div>
                </div>
              </div>
              <div id="div7">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Гардан гүйцэтгэсэн эмч:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1.
                    {Data.operating_emchObj
                      ? Data.operating_emchObj.Label
                      : null}
                  </div>
                  <div style={{ marginLeft: "30px" }}>
                    2.{" "}
                    {Data.support_emchObj ? Data.support_emchObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div8">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Сувилагч:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1. {Data.surg_nurseObj ? Data.surg_nurseObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div9">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Инженер:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1. {Data.engineerObj ? Data.engineerObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div10">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Техникч:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1. {Data.technicianObj ? Data.technicianObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div11">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Мэдээгүйжүүлэгч эмч:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1. {Data.anes_emchObj ? Data.anes_emchObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div12">
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>Мэдээгүйжүүлгийн сувилагч:</div>
                  <div style={{ marginLeft: "30px" }}>
                    1. {Data.anes_nurseObj ? Data.anes_nurseObj.Label : null}
                  </div>
                </div>
              </div>
              <div id="div13">
                <div style={{ display: "flex", width: "100%" }}>
                  Эмчлэгч эмч: {Data.emchObj ? Data.emchObj.Label : null}
                </div>
              </div>
            </Box>
          </div>
        )}
      </div>
    );
  }
}

export default PaceMakerThreeReport;
