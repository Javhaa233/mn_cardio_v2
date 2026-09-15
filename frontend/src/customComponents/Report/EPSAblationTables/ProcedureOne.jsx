import React, { Component } from "react";
// @mui/material components
import { Box } from "@mui/material";

import Check from "customComponents/Report/EPSAblationTables/Check";

import styles from "assets/jss/material-dashboard-pro-react/custom/EPSAblationStyles.js";

class ProcedureOne extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }

  render() {
    const classes = {
      main: "main",
      body: "body",
      table: "table",
      tableHeader: "tableHeader",
      tdDiv: "tdDiv",
    };

    const sx = {
      "& .main": styles.main,
      "& .body": styles.body,
      "& .table": styles.table,
      "& .tableHeader": styles.tableHeader,
      "& .tdDiv": styles.tdDiv,
    };

    return (
      <Box sx={sx}>
        <div className={classes.main}>
          <div id="divPrint2" className={classes.body}>
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>
                      <h5 className={classes.tableHeader}>IV. Ажилбар</h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontWeight: "500" }}>
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "35%" }}>Ажилбар:</div>
                        <div style={{ width: "30%" }}>
                          <Check Check={true} />
                          1. Анх удаа
                        </div>
                        <div style={{ width: "35%" }}>
                          <Check Check={false} />
                          2. Давтан
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div>Заалт: (нэгийг сонго)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "30%" }}>
                          <div>
                            <Check Check={false} />
                            1. Нарийн бүрдэлтэй тахикарди
                          </div>
                          <div>
                            <Check Check={false} />
                            2. Синусын зангилааг үнэлэх
                          </div>
                          <div>
                            <Check Check={false} />
                            3. Синкопи, шалтгаан тодорхойгүй
                          </div>
                          <div>
                            <Check Check={false} />
                            4. ВПВ үнэлэх
                          </div>
                        </div>
                        <div style={{ width: "35%" }}>
                          <div>
                            <Check Check={false} />
                            5. Өргөн бүрдэлтэй тахикарди
                          </div>
                          <div>
                            <Check Check={false} />
                            6. Тосгуурын чичиргээн
                          </div>
                          <div>
                            <Check Check={false} />
                            7. Зүрхний гэнэтийн үхлээс аврагдсан
                          </div>
                          <div>
                            <Check Check={false} />
                            8. Тосгуурын жирвэгнээ
                          </div>
                        </div>
                        <div style={{ width: "35%" }}>
                          <div>
                            <Check Check={false} />
                            9. Зүрх дэлсдэг
                          </div>
                          <div>
                            <Check Check={false} />
                            10. Зүрхэн дотрох хориг үнэлэх
                          </div>
                          <div>
                            <Check Check={false} />
                            11. ховдлын тахикарди
                          </div>
                          <div>
                            <Check Check={false} />
                            12. Бусад
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End */}
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <tbody>
                  <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                    <td style={{ width: "30%" }}>
                      <div className={classes.tdDiv}>
                        <div>Хэм алдагдлын эмэн эмчилгээ:</div>
                      </div>
                    </td>
                    <td>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "auto", marginRight: "20px" }}>
                          <Check Check={false} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "auto", marginRight: "20px" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                        <div style={{ width: "auto", marginRight: "20px" }}>
                          <Check Check={false} />
                          9. Мэдэхгүй
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Аденозин
                          </div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Амиодарон
                          </div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Бетахориглогч
                          </div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Кальцийн сувгийн хориглогч
                          </div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Дигиталис
                          </div>
                        </div>
                        <div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Флейканид
                          </div>
                          <div style={{ width: "20%" }}>
                            <Check Check={false} />
                            Пропафенон
                          </div>
                          <div style={{ width: "60%" }}>
                            <Check Check={false} />
                            Бусад:
                            ______________________________________________________
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Үйл ажиллагааны үзүүлэлт: LVEF:
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End */}
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <tbody>
                  <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                    <td colSpan={3}>
                      <div className={classes.tdDiv}>
                        <div>
                          Хэм алдагдлын шалтгаантай өмнө нь ажилбарт орж байсан
                          эсэх
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Хэм алдагдлын мэс заслын эмчилгээ:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "62%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "25%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "25%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Пейсмейкер суулгац:
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div>Тийм бол,</div>
                          <div>
                            <div style={{ width: "50%" }}>
                              <Check Check={true} />
                              1. Нэг хөндийн
                            </div>
                            <div style={{ width: "50%" }}>
                              <Check Check={false} />
                              2. Хоёр хөндийн
                            </div>
                          </div>
                          <div>Суулгасан огноо: _______</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>ICD суулгацтай:</div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          Тийм бол,
                          <br />
                          Суулгасан огноо: __________
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Өмнөх катетр аблаци:
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          Тийм:
                          <br />
                          Хаана :
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Өмнө нь аблаци хийлгэсэн огноо:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "62%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div style={{ width: "25%" }}>0000-00-00</div>
                          <div style={{ width: "75%" }}>Онош</div>
                          <div style={{ width: "25%" }}>0000-00-00</div>
                          <div style={{ width: "75%" }}>Онош</div>
                          <div style={{ width: "25%" }}>0000-00-00</div>
                          <div style={{ width: "75%" }}>Онош</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Бусад:</div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "31%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          Тийм бол, <br /> Огноо: 0000-00-00
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End */}
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <tbody>
                  <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                    <td>
                      <div className={classes.tdDiv}>
                        <div>ЭФШ-ний онош: (тохирохыг сонго)</div>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ fontSize: "11px", fontWeight: "500" }}>
                    <td style={{ width: "38%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "28%" }}>
                          <div>
                            <Check Check={false} />
                            AVNRT
                          </div>
                          <div>
                            <Check Check={false} />
                            AVRT
                          </div>
                          <div>
                            <Check Check={false} />
                            Automatic junctional tachycardia
                          </div>
                          <div>
                            <Check Check={false} />
                            Inappropriate sinus tachycardia
                          </div>
                          <div>
                            <Check Check={false} />
                            Multifocal atrial tachycardia
                          </div>
                          <div>
                            <Check Check={false} />
                            Asympt WPW/at low risk
                          </div>
                        </div>
                        <div style={{ width: "22%" }}>
                          <div>
                            <Check Check={false} />
                            Atrial tachycardia
                          </div>
                          <div>
                            <Check Check={false} />
                            Atrial flutter
                          </div>
                          <div>
                            <Check Check={false} />
                            Atrial fibrillation
                          </div>
                          <div>
                            <Check Check={false} />
                            Sinus node re-entry
                          </div>
                          <div>
                            <Check Check={false} />
                            PJRT
                          </div>
                          <div>
                            <Check Check={false} />
                            Хэвийн
                          </div>
                        </div>
                        <div style={{ width: "28%" }}>
                          <div>
                            <Check Check={false} />
                            Atriofascicular tachycardia
                          </div>
                          <div>
                            <Check Check={false} />
                            Idiopathic RV VT
                          </div>
                          <div>
                            <Check Check={false} />
                            Idiopathic LV VT
                          </div>
                          <div>
                            <Check Check={false} />
                            Idiopathic VF
                          </div>
                          <div>
                            <Check Check={false} />
                            Bundle branch re-entry VT
                          </div>
                          <div>
                            <Check Check={false} />
                            Бусад кардиомиопатийн VT
                          </div>
                        </div>
                        <div style={{ width: "22%" }}>
                          <div>
                            <Check Check={false} />
                            RV dysplasia VT
                          </div>
                          <div>
                            <Check Check={false} />
                            Ischemic VT/VF
                          </div>
                          <div>
                            <Check Check={false} />
                            Sinus node dysfunction
                          </div>
                          <div>
                            <Check Check={false} />
                            Suprahissian block
                          </div>
                          <div>
                            <Check Check={false} />
                            Infrahissian block
                          </div>
                          <div>
                            <Check Check={false} />
                            Бусад:__________
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End */}
          </div>
        </div>
      </Box>
    );
  }
}

export default ProcedureOne;
