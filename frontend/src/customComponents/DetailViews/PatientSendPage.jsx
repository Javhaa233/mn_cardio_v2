import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// translation
import Box from "@mui/material/Box";

import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";

const bodySx = {
  margin: "0 auto",
  padding: "15px",
  fontSize: "14px",
  fontWeight: "400",
  width: "210mm",
  minHeight: "297mm",
};

const rowSx = {
  display: "flex",
  width: "100%",
  alignItems: "center",
};

class PatientSendPage extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: {}, isLoading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ isLoading: true });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "PatientSendPage", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Print = (callback) => {
    let alert = null;
    html2canvas(document.querySelector("#divToPrint")).then((canvas) => {
      const image = { type: "png", quality: 100 };
      const margin = [0.5, 0.5];
      // const filename = "myfile.pdf";

      var imgWidth = 8.5;
      var pageHeight = 11;

      var innerPageWidth = imgWidth - margin[0] * 2;
      var innerPageHeight = pageHeight - margin[1] * 2;

      var pxFullHeight = canvas.height;
      var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
      var nPages = Math.ceil(pxFullHeight / pxPageHeight);

      // eslint-disable-next-line no-redeclare
      var pageHeight = innerPageHeight;

      var pageCanvas = document.createElement("canvas");
      var pageCtx = pageCanvas.getContext("2d");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pxPageHeight;

      var pdf = new jsPDF("p", "in", [8.5, 11]);

      for (var page = 0; page < nPages; page++) {
        if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
          pageCanvas.height = pxFullHeight % pxPageHeight;
          pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
        }

        var w = pageCanvas.width;
        var h = pageCanvas.height;
        pageCtx.fillStyle = "white";
        pageCtx.fillRect(0, 0, w, h);
        pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

        if (page > 0) pdf.addPage();
        // debugger;
        var imgData = pageCanvas.toDataURL(
          "image/" + image.type,
          image.quality,
        );
        pdf.addImage(
          imgData,
          image.type,
          margin[1],
          margin[0],
          innerPageWidth,
          pageHeight,
        );
      }

      pdf.save("PatientSendPage.pdf");
      //   document.body.appendChild(canvas); // if you want see your screenshot in body.
      //   // const imgData = canvas.toDataURL("image/png");
      //   // const pdf = new jsPDF();
      //   // pdf.addImage(imgData, "PNG", 0, 0);
      //   // pdf.save("OutPatientInfo.pdf");

      //   const imgWidth = 190;
      //   const pageHeight = 297;
      //   const imgHeight = (canvas.height * imgWidth) / canvas.width;
      //   let heightLeft = imgHeight;
      //   let position = 0;

      //   heightLeft -= pageHeight;
      //   const doc = new jsPDF("p", "mm", "a4");

      //   doc.addImage(
      //     canvas,
      //     "PNG",
      //     10,
      //     position + 10,
      //     imgWidth,
      //     imgHeight,
      //     "",
      //     "FAST"
      //   );
      //   while (heightLeft >= 0) {
      //     position = heightLeft - imgHeight;
      //     doc.addPage();
      //     doc.addImage(
      //       canvas,
      //       "PNG",
      //       10,
      //       position + 10,
      //       imgWidth,
      //       imgHeight,
      //       "",
      //       "FAST"
      //     );
      //     heightLeft -= pageHeight;
      //   }
      // doc.save("OutPatientInfo.pdf");
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

  customRender = () => {
    const { isLoading, Data, Alert } = this.state;

    if (isLoading) {
      return <BaseLoading />;
    } else {
      if (Data) {
        if (Data.type === "to_hospital") {
          return (
            <div>
              {Alert}
              {Data && (
                <div
                  style={{
                    margin: "0 auto",
                    width: "210mm",
                    border: "1px solid #ccc",
                  }}
                >
                  <Box id="divToPrint" sx={bodySx}>
                    <Box sx={rowSx}>
                      <div style={{ width: "50%" }}>
                        Эмнэлгийн нэр: _______________________
                      </div>
                      <div style={{ width: "50%", textAlign: "right" }}>
                        Эрүүл мэндийн сайдын 2019 оны 12 дугаар сарын 30-ны
                        өдрийн А/611 дүгээр тшуаалын арван нэгдүгээр хавсралт
                        <br />
                        <strong>Эрүүл мэндийн бүртгэлийн маягт АМ-13А</strong>
                      </div>
                    </Box>

                    {/*  */}
                    <Box sx={rowSx}>
                      <div style={{ width: "33%" }}>Бүртгэлийн код</div>
                      <div style={{ width: "34%" }}>РД</div>
                      <div style={{ width: "33%" }}>ЭМД</div>
                    </Box>

                    {/*  */}
                    <div>
                      <h3>Эмнэлэгт өвчтөн илгээх хуудас</h3>
                    </div>
                  </Box>
                </div>
              )}
            </div>
          );
        } else if (Data.type === "from_hospital") {
          return (
            <div>
              {Alert}
              {Data && (
                <div
                  style={{
                    margin: "0 auto",
                    width: "210mm",
                    border: "1px solid #ccc",
                  }}
                >
                  <Box id="divToPrint" sx={bodySx}>
                    <Box sx={rowSx}>
                      <div style={{ width: "50%" }}></div>
                      <div style={{ width: "50%", textAlign: "right" }}>
                        Эрүүл мэндийн сайдын 2019 оны 12 дугаар сарын 30-ны
                        өдрийн А/611 дүгээр тшуаалын арван нэгдүгээр хавсралт
                        <br />
                        <strong>Эрүүл мэндийн бүртгэлийн маягт АМ-13Б</strong>
                      </div>
                    </Box>

                    {/*  */}
                    <Box sx={rowSx}>
                      <div style={{ width: "33%" }}>Бүртгэлийн код</div>
                      <div style={{ width: "34%" }}>РД</div>
                      <div style={{ width: "33%" }}>ЭМД</div>
                    </Box>

                    {/*  */}
                    <div>
                      <h3>Эмнэлгээс өвчтөн илгээх хуудас</h3>
                    </div>
                  </Box>
                </div>
              )}
            </div>
          );
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  };

  render() {
    const { t } = this.props;
    return this.customRender();
  }
}

export default withTranslation(undefined, { withRef: true })(PatientSendPage);
