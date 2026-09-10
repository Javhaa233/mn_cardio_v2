import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import jsPDF from "jspdf";
// @material-ui/icon components
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

class SuccessPrescription extends Component {
  constructor(props) {
    super(props);
    this.state = { Loading: false };
  }

  PrintPrescription = (callback) => {
    const t = this.props.t;
    var data = this.props.Data;
    var doc = new jsPDF();

    var regno = data.regno ? "-" + data.regno + "" : "";
    var receiptNumber = data.receiptNumber ? "-" + data.receiptNumber + "" : "";
    var receiptDate = data.receiptDate ? "-" + data.receiptDate + "" : "";
    var receiptExpireDate = data.receiptExpireDate
      ? "-" + data.receiptExpireDate + ""
      : "";
    doc.setFont("Roboto-Italic", "normal");
    doc.setFontSize(8);
    doc.text(15, 20, "Регистрийн дугаар");
    doc.text(15, 25, regno);

    doc.text(15, 35, "Жорын дугаар");
    doc.text(15, 40, receiptNumber);

    doc.text(15, 50, "Огноо");
    doc.text(15, 55, receiptDate);

    doc.text(15, 65, "Дуусах огноо");
    doc.text(15, 70, receiptExpireDate);

    doc.save("Prescription.pdf");
    callback && callback();
  };

  render() {
    const { t } = this.props;
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <CheckCircleOutlineIcon
            style={{ color: "#0be000", width: "45px", height: "45px" }}
            fontWeight="fontWeightLight"
          />
          <span
            style={{
              display: "inline-block",
              color: "#0be000",
              fontWeight: "300",
              fontSize: "18px",
              marginTop: "15px",
            }}
          >
            {t("Recipe successfully registered")}
          </span>
        </div>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  SuccessPrescription,
);
