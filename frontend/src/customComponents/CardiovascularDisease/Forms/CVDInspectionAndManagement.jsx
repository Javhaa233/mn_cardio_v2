import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// pdf
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// @mui/material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
// import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
// @mui/icons-material
import Close from "@mui/icons-material/Close";

import Button from "components/CustomButtons/Button";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseDialog from "customComponents/BaseDialog";
import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";

import CVDManagementForm from "customComponents/CardiovascularDisease/Forms/CVDManagementForm";
import AllDataTable from "customComponents/CardiovascularDisease/Forms/AllDataTable";
import CustomTextArea from "customComponents/CardiovascularDisease/Forms/CustomTextArea";
import JournalICD from "customComponents/CardiovascularDisease/JournalICD";
// helper
import Helper from "helper";

const tableSx = { minWidth: 650 };
const tableRowSx = {
  "& .MuiTableCell-root": { padding: "2px", fontSize: "12px" },
};

class CVDInspectionAndManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SelectedTablets: [],
      refresh: true,
      Dialog: null,
      Alert: null,
      page: 0,
      rowsPerPage: 10,
      Journals: [],
      Loading: false,
      TabletsLoading: false,
    };
    this.MonitoringData = null;
    this.Desc = "";

    // refs
    this.CVDManagementFormRef = createRef();
  }

  componentDidMount = () => {
    const t = this.props.t;
  };

  SetMonitoringData = (MonitoringData) => {
    this.MonitoringData = MonitoringData;
    this.GetDataDiag();
    this.CVDManagementFormRef.SetMonitoringId &&
      this.CVDManagementFormRef.SetMonitoringId(MonitoringData.Id);
  };

  GetDataDiag = async () => {
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetLastDiagnosisData",
      { MonitoringId: this.MonitoringData.Id },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          this.Desc = resData.Data.Comment || "";
          this.setState({ Journals: JSON.parse(resData.Data.MainDiagnosis) });
        }
        this.setState({ EditObject: resData.Data });
      },
    );
  };

  Save = async () => {
    const { Journals } = this.state;

    let alert = null;

    if (this.MonitoringData.Id) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/CreateDiagnosis",
        {
          MonitoringId: this.MonitoringData.Id,
          MainDiagnosis: JSON.stringify(Journals),
          Comment: this.Desc,
        },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  GetRequestData = () => {
    const { Journals, SelectedTablets } = this.state;
    var Tablets = [];
    var Diagnosis = Journals;
    var Desc = this.Desc;

    Tablets = SelectedTablets.map((data) => ({
      name: data.tbltNameInter,
      barCode: data.tbltBarCode,
      desc: data.desc,
      packGroup: data.packGroup,
      dailyCount: data.dailyCount,
      isDiscount: data.isDiscount,
      totalDays: data.totalDays,
      tbltSize: data.tbltSize,
      icdCode: data.diagCode,
      tbltTypeName: data.tbltTypeName,
      tbltId: data.tbltId,
    }));

    return { Diagnosis, Desc, Tablets };
  };

  AdvicePrint = (data) => {
    // Create a temporary hidden element for printing
    const printDiv = document.createElement("div");
    printDiv.style.cssText =
      "position: absolute; left: -9999px; top: 0; background: white; padding: 20px; font-family: Arial, sans-serif;";

    let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 8px; text-align: center; width: 30px;">#</th>
            <th style="padding: 8px; text-align: left;">Эмийн жор</th>
            <th style="padding: 8px; text-align: center;">Өдөрт</th>
            <th style="padding: 8px; text-align: center;">Н/ө</th>
            <th style="padding: 8px; text-align: center;">Н/т</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < data.length; i++) {
      const name =
        (data[i].tbltNameMon || "") +
        (data[i].tbltNameSales || "") +
        (data[i].tbltSizeMixture || "");
      tableHTML += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center;">${i + 1}</td>
          <td style="padding: 8px; text-align: left;">${name}</td>
          <td style="padding: 8px; text-align: center;">${data[i].dailyCount || ""}</td>
          <td style="padding: 8px; text-align: center;">${data[i].totalDays || ""}</td>
          <td style="padding: 8px; text-align: center;">${data[i].tbltSize || ""}</td>
        </tr>
      `;
    }

    tableHTML += "</tbody></table>";
    printDiv.innerHTML = tableHTML;
    document.body.appendChild(printDiv);

    html2canvas(printDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      document.body.removeChild(printDiv);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 20) / imgHeight,
      );
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save("advice.pdf");
    });
  };

  ShowTablets = () => {
    let { Journals, SelectedTablets } = this.state;
    Journals = Journals.filter((e) => {
      return e.JournalRef && typeof e.JournalRef === "object";
    });

    if (Journals.length > 0) {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Эм сонгох"
          >
            <AllDataTable
              AddToTablets={this.AddToTablets}
              Data={SelectedTablets}
              PatRegNo={
                this.MonitoringData ? this.MonitoringData.PatRegNo : null
              }
              Journals={Journals}
              RemoveTablets={this.RemoveTablets}
            />
          </BaseDialog>
        ),
      });
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Онош сонгоогүй байна",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  RemoveJournals = (JournalId) => {
    const { Journals } = this.state;
    var JournalsUpdate = Journals.filter(
      (item) => item.JournalRef.id_data + "" !== JournalId + "",
      1,
    );
    this.setState({ Journals: JournalsUpdate });
  };

  AddJournals = (Journal) => {
    const { Journals } = this.state;
    if (!Journals.some((item) => item.JournalRef.id_data === Journal.id_data)) {
      var JournalsUpdate = Object.assign(
        [],
        [...Journals, { id: null, JournalRef: Journal }],
      );
      this.setState({ Journals: JournalsUpdate });
    } else {
      this.setState({
        Alert: Helper.BaseCrudHelper.ShowAlert(
          "Сонгогдсон утга байна",
          false,
          () => this.setState({ Alert: null }),
        ),
      });
    }
  };

  AddToTablets = (NewTablets) => {
    this.setState({ SelectedTablets: NewTablets });
  };

  RemoveTabletsById = (id) => {
    const { SelectedTablets } = this.state;
    var NewTablets = SelectedTablets;
    var index = NewTablets.indexOf(id);
    NewTablets.splice(index, 1);
    this.RemoveTablets(NewTablets);
  };

  RemoveTablets = (NewTablets) => {
    this.setState({ SelectedTablets: NewTablets });
  };

  render() {
    const { t } = this.props;
    const { CreateSentPrescription } = this.props;
    const { Dialog, Alert, SelectedTablets, page, rowsPerPage, Journals } =
      this.state;
    return (
      <div>
        {Dialog}
        {Alert}
        <div style={{ marginBottom: "35px" }}>
          <h5
            style={{
              margin: 0,
              padding: 0,
              fontWeight: "400",
              marginBottom: "10px",
              borderBottom: "1px solid #2e2e2e",
            }}
          >
            Онош:
          </h5>
          <BaseAutoComplete
            Config={{
              Name: "JournalICD",
              Config: {
                IdField: "id_data",
                TextField: "jr_label",
                MinTextLength: 1,
                SearchUrl: "/CustomDataApi/GetJournalRefData",
              },
            }}
            FullWidth
            ObjectValue={true}
            ObjectSetValue={true}
            ChangeValue={(name, value) => this.AddJournals(value)}
            CustomFilter={{ Type: "ICD" }}
            Variant="outlined"
            HideLabel={true}
          />
          <JournalICD
            Label="ICD10"
            Data={
              Journals
                ? Journals.filter(
                    (s) => s.JournalRef && s.JournalRef.jr_type + "" === "5",
                  )
                : []
            }
            Remove={(JournalId) => {
              this.RemoveJournals(JournalId);
            }}
          />
          <h5
            style={{
              margin: 0,
              padding: 0,
              marginTop: "15px",
              fontWeight: "400",
              marginBottom: "0px",
              color: "#6e6e6e",
              fontSize: "16px",
            }}
          >
            Нэмэлт тайлбар
          </h5>
          <CustomTextArea
            ChangeValue={(Value) => (this.Desc = Value)}
            Value={this.Desc}
          />

          <div>
            <Button
              variant="contained"
              color="success"
              size="sm"
              onClick={this.Save}
              style={{ float: "right" }}
            >
              Онош хадгалах
            </Button>
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div>
          <h5
            style={{
              margin: 0,
              padding: 0,
              fontWeight: "400",
              marginBottom: "10px",
              borderBottom: "1px solid #2e2e2e",
            }}
          >
            Эмийн жагсаалт:
          </h5>
          <TableContainer>
            <Table sx={tableSx} size="small">
              <TableHead>
                <TableRow sx={tableRowSx}>
                  <TableCell width="50px" align="center">
                    #
                  </TableCell>
                  <TableCell align="left">Эмийн нэр</TableCell>
                  <TableCell align="center">Т/Ш</TableCell>
                  <TableCell width="300px" align="center">
                    Тэмдэглэл
                  </TableCell>
                  <TableCell align="center">%-тэй</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SelectedTablets !== null && SelectedTablets.length > 0
                  ? SelectedTablets.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage,
                    ).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell width="50px" align="center">
                          <Button
                            justIcon
                            round
                            color="danger"
                            onClick={() => this.RemoveTabletsById(row)}
                            style={{
                              width: "25px",
                              height: "25px",
                              minWidth: "25px",
                              paddingLeft: "3px",
                              paddingRight: "3px",
                            }}
                          >
                            <Close sx={{ fontSize: 18 }} />
                          </Button>
                        </TableCell>
                        <TableCell align="left">
                          {row.tbltNameInter + "(" + row.tbltSizeMixture + ")"}
                        </TableCell>
                        <TableCell align="center">{row.tbltSize}</TableCell>
                        <TableCell width="300px" align="center">
                          <p style={{ width: "300px", overflowY: "auto" }}>
                            {row.desc}
                          </p>
                        </TableCell>
                        <TableCell align="center">{row.isDiscount}</TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: "15px" }}>
            <Button
              variant="contained"
              color="success"
              onClick={this.ShowTablets}
              // size="sm"
              style={{ padding: "8px 25px" }}
            >
              Нэмэх
            </Button>

            <Button
              variant="contained"
              color="info"
              // size="sm"
              onClick={() => this.AdvicePrint(SelectedTablets)}
              style={{ padding: "8px 25px", marginLeft: "25px" }}
            >
              Хэвлэх
            </Button>
          </div>
          <div>
            <BaseLoadButton
              ButtonText="Жор нэмэх"
              Color="danger"
              onClick={(callback) => {
                CreateSentPrescription &&
                  CreateSentPrescription(() => callback && callback());
              }}
            />
            <div style={{ clear: "both" }}></div>
          </div>
          <CVDManagementForm
            ref={(ref) => (this.CVDManagementFormRef = ref)}
            ObjectName="CVDManagement"
          />
        </div>
      </div>
    );
  }
}

export default CVDInspectionAndManagement;
