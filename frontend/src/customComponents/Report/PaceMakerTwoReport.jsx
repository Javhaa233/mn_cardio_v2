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
  list: {
    paddingLeft: "30px",
    listStyle: "none",
    "& > li": {
      margin: 0,
      marginBottom: "1em",
      paddingLeft: "1.5em",
      position: "relative",
      "&::after": {
        content: "''",
        height: ".4em",
        width: ".4em",
        backgroundColor: "#000",
        display: "block",
        position: "absolute",
        transform: "rotate(45deg)",
        top: ".75em",
        left: 0,
      },
    },
  },
};

class PaceMakerTwoReport extends Component {
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
        { ObjectName: "PacemakerTblTwo", SearchOption },
        (resData) => {
          if (resData && resData.Data) {
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
        (resData) => {
          resData &&
            resData.Success &&
            this.setState({ PatientData: resData.Data });
        },
      );
    }
  };

  Print = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    var y = 0;
    for (let i = 1; i <= 22; i++) {
      html2canvas(document.querySelector("#div" + i)).then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 0, 0);
        var imgWidth = 210;
        var heigth = (canvas.height * imgWidth) / canvas.width;

        if (y + heigth <= 285) {
          pdf.addImage(imgData, "JPEG", 4, y);
          y += heigth;
        } else {
          y = 4;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 4, y);
          y += heigth;
        }
        if (i === 22) pdf.save("PaceMakerTwoReport.pdf");
      });
    }
  };

  render() {
    const { t } = this.props;
    const { Data, PatientData } = this.state;

    return (
      <div
        style={{
          margin: "0 auto",
          width: "210mm",
          border: "1px solid #ccc",
        }}
      >
        {!Data || !PatientData ? (
          <BaseLoading />
        ) : (
          <Box sx={styles.body}>
            <div id="div1">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "5px",
                  paddingTop: "15px",
                }}
              >
                <div style={{ float: "left" }}>
                  Өвчний түүхийн дугаар ……………...
                </div>
                <div style={{ float: "right" }}>Тасаг ………………….</div>
              </div>
              <div style={{ width: "100%", textAlign: "center" }}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    padding: "0 10%",
                  }}
                >
                  БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭ ХИЙЛГЭХ ТУХАЙ ЗӨВШӨӨРЛИЙН
                  ХУУДАС
                </h5>
              </div>

              <div style={{ width: "100%", marginBottom: "5px" }}>
                <div>
                  (Иргэний түүх/иргэний эрүүл мэндийн дэвтэрт хавсаргана)
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <h5 style={{ fontSize: "16px", fontWeight: "500" }}>
                  А/ МЭДЭЭЛЛИЙН ХУУДАС
                </h5>
              </div>
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>Санал болгож буй эмчилгээний нэр</div>
                <div>{Data.treatment_name}</div>
              </div>
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>
                  Санал болгож буй эмчилгээний үр дүн (эмнэл зүйн туршлагын дүн,
                  нотолгоонд тулгуурлан тулгуурлан бүрэн эдгэрэлт, сайжралт,
                  эндэгдэл, хүндрэлийн магадлалыг хувиар илэрхийлэн
                  ойлгомжтойгоор тайлбарлана:{" "}
                </div>
                <div>{Data.treatment_result}</div>
              </div>
            </div>
            <div id="div2">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div style={{ width: "100%", marginBottom: "5px" }}>
                  Гарч болох эрсдэлүүд (эрсдэлүүдийг нэг бүрчлэн дурьдана):{" "}
                </div>
                {Array.isArray(Data.risksObj)
                  ? Data.risksObj.map((risk, key) => (
                      <div
                        key={key}
                        style={{
                          fontSize: "15px",
                          width: "100%",
                          margin: "0 0 8px 12px",
                        }}
                      >
                        {risk.Label}
                      </div>
                    ))
                  : null}
              </div>
            </div>
            <div id="div3">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div style={{ width: "100%", marginBottom: "5px" }}>
                  Гарч болох хүндрэлүүд (хүндрэлүүдийг нэг бүрчлэн дурьдана):
                </div>
                {Array.isArray(Data.diffsObj)
                  ? Data.diffsObj.map((diff, key) => (
                      <div
                        key={key}
                        style={{
                          fontSize: "15px",
                          width: "100%",
                          margin: "0 0 8px 12px",
                        }}
                      >
                        {diff.Label}
                      </div>
                    ))
                  : null}
              </div>
            </div>
            <div id="div4">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>
                  Тухайн эмчилгээний үед хийгдэж болох нэмэлт ажилбарууд
                  (ажилбаруудыг нэг бүрчлэн дурьдана):
                </div>
                <div>{Data.possible_adds}</div>
              </div>
            </div>
            <div id="div5">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>
                  Тухайн эмчилгээг орлуулж болох эмчилгээний бусад аргууд (бусад
                  аргуудыг дурьдана):
                </div>
                <div>{Data.possible_other}</div>
              </div>
            </div>
            <div id="div6">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>Санал болгож буй эмчилгээний давуу тал:</div>
                <div>{Data.advantage}</div>
              </div>
            </div>
            <div id="div7">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>
                  Санал болгож буй эмчилгээний үед хийгдэх мэдээгүйжүүлэлт:{" "}
                </div>
                <div>{Data.anesthesia}</div>
              </div>
            </div>
            <div id="div8">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>Үйлчлүүлэгчээс тавьсан асуулт: </div>
                <div>{Data.qfrom_pat}</div>
              </div>
            </div>
            <div id="div9">
              <div style={{ display: "inline-block", marginBottom: "10px" }}>
                <div>Дээрх асуултын хариулт (товч): </div>
                <div>{Data.afrom_pat}</div>
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
                <div>Эмчтэй холбоо барих утас: {Data.doc_phone}</div>
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Би үйлчлүүлэгчдээ дээрх мэдээллүүдийг дэлгэрэнгүй, энгийн
                  ойлгомжтой хэллэгээр тайлбарлаж өгсөн болно.{" "}
                </div>
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Эмчийн гарын үсэг:{" "}
                  {Data.doc_nameObj ? Data.doc_nameObj.Label : ""}
                </div>
              </div>
            </div>
            <div id="div11">
              <div style={{ width: "100%", marginBottom: "5px" }}>
                <h5 style={{ fontSize: "16px", fontWeight: "500" }}>
                  Б/ ҮЙЛЧЛҮҮЛЭГЧИЙН ЗӨВШӨӨРӨЛ:
                </h5>
              </div>
              <div>
                <Box component="ul" sx={styles.list}>
                  <li>
                    Эмчийн санал болгож буй мэс ажилбарыг дээрх мэдээ
                    алдуулалтаар хийлгэхийг БИ ЗӨВШӨӨРЧ БАЙНА. Түүнчлэн гэмтсэн
                    эд, эрхтэний хэсэг болон эд эрхтэнийг журмын дагуу устгахыг
                    тус эмнэлэгт зөвшөөрч байна.
                  </li>
                  <li>
                    Мэс ажилбарын үр дүн, гарч болох хүндрэл, эрсдэл, нэмэлт
                    ажилбарууд, орлуулж болох эмчилгээний талаар БИ ТОДОРХОЙ
                    МЭДЭЭЛЭЛ АВСАН БОЛНО.
                  </li>
                </Box>
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
                <div>Үйлчлүүлэгчийн гарын үсэг: {Data.pat_name}</div>
              </div>
            </div>
            <div id="div13">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>Үйлчлүүлэгч гарын үсэг зурах эрх зүйн чадамжгүй бол: </div>
              </div>
            </div>
            <div id="div14">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Асран хамгаалагч/харгалзан дэмжигчийн гарын үсэг:{" "}
                  {Data.guardian_name}
                </div>
              </div>
            </div>
            <div id="div15">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>Үйлчлүүлэгчтэй холбоотой эсэх: {Data.guardian_rel}</div>
              </div>
            </div>
            <div id="div16">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>Үйлчлүүлэгч эрх зүйн чадамжгүй байгаа шалтгаан:</div>
                <div>[ ] Насанд хүрээгүй </div>
                <div>[ ] Ухаангүй </div>
                <div>[ ] Сэтгэцийн эмгэгтэй </div>
                <div>
                  [ ] Бусад (тайлбарлана уу)
                  ……..……..……..……..……..……..……..…………………………...
                </div>
              </div>
            </div>
            <div id="div17">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontStyle: "italic" }}>
                  Хэрэв өвчтөн жирэмсэн тохиолдолд:
                </span>
              </div>
            </div>
            <div id="div18">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Миний эхнэрийн хийлгэхээр зөвшөөрсөн эмчилгээг би зөвшөөрч
                  байна.
                </div>
              </div>
            </div>
            <div id="div19">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>Нөхрийн гарын үсэг: {Data.husband_name}</div>
              </div>
            </div>
            <div id="div20">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Хэрэв нөхөр (асран хамгаалагч/харгалзан дэмжигч) нь
                  зөвшөөрөхгүй бол тайлбарлана уу.
                </div>
                <div>{Data.reject_reason}</div>
              </div>
            </div>
            <div id="div21">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div>
                  Энэхүү зөвшөөрлийн хуудасны загварыг 2 хувь үйлдсэн болно.
                </div>
              </div>
            </div>
            <div id="div22">
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                <div>Огноо: ….... он ….. сар ….. өдөр</div>
              </div>
            </div>
          </Box>
        )}
      </div>
    );
  }
}
export default PaceMakerTwoReport;
