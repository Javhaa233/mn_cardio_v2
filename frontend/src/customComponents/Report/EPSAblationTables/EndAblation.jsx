import React, { Component } from "react";
// @mui/material components
import { Box } from "@mui/material";

import Check from "customComponents/Report/EPSAblationTables/Check";

import styles from "assets/jss/material-dashboard-pro-react/custom/EPSAblationStyles.js";

class EPSAblation extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }

  render() {
    const { t } = this.props;
    const classes = {
      main: "main",
      body: "body",
      table: "table",
      tableHeader: t("tableHeader"),
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
          <div id="divPrint4" className={classes.body}>
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>
                      <h5 className={classes.tableHeader}>
                        V. Ажилбарын үеийн хүндрэл
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className={classes.tdDiv}>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                            Үгүй
                          </div>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                            Гиссийн хөлийн шинэ хориг
                          </div>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                            Зүрхний тампонад
                          </div>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                          </div>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ width: "18%" }}>
                            <Check Check={false} />
                            Зүрхний шигдээс
                          </div>
                          <div style={{ width: "32%" }}>
                            <Check Check={false} />
                            Ажилбартай холбоотой нас баралт
                          </div>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                            Бусад хэм алдагдал
                          </div>
                          <div style={{ width: "25%" }}>
                            <Check Check={false} />
                            Бусад: __________
                          </div>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ width: "50%" }}>
                            <Check Check={false} />
                            Эргэшгүй 1,2,3 зэргийн AV хориг
                          </div>
                          <div style={{ width: "50%" }}>
                            <Check Check={false} />
                            Судасны гэмтэл: ____________
                          </div>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ width: "50%" }}>
                            <div style={{ marginRight: "4px", width: "auto" }}>
                              Хэсэг:
                            </div>
                            <div style={{ marginRight: "4px", width: "auto" }}>
                              <Check Check={false} />
                              AV зангилаа
                            </div>
                            <div style={{ marginRight: "4px", width: "auto" }}>
                              <Check Check={false} />
                              Зангилааны доорх
                            </div>
                            <div style={{ marginRight: "4px", width: "auto" }}>
                              <Check Check={false} />
                              Үл мэдэгдэх
                            </div>
                          </div>
                          <div style={{ width: "50%" }}>
                            <Check Check={false} />
                            Intervention: Surgical Intervention Цус юүлэх
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
                <thead>
                  <tr>
                    <th colSpan={3}>
                      <h5 className={classes.tableHeader}>
                        VI. Эмнэлгээс гарах
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                    <td>
                      <div className={classes.tdDiv}>
                        <div>Байдал:</div>
                      </div>
                    </td>
                    <td>
                      <div className={classes.tdDiv}>
                        <div>Эмнэлгээс гарах үеийн эмчилгээ:</div>
                      </div>
                    </td>
                    <td>
                      <div className={classes.tdDiv}>
                        <div>Эмнэлгээс гарахад зөвлөсөн эмчилгээ</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "23%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <Check Check={false} />
                          1. Эдгэрсэн
                        </div>
                        <div>
                          <Check Check={false} />
                          2. Сайжирсан
                        </div>
                        <div>
                          <Check Check={false} />
                          3. Хэвэндээ
                        </div>
                        <div>
                          <Check Check={false} />
                          4. Нас барсан
                        </div>
                        <div> ______ - __ - __</div>
                        <div>Нас баралтын шалтгаан: ___________________</div>
                      </div>
                    </td>
                    <td style={{ width: "28%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <Check Check={false} />
                          Шаардлагагүй
                        </div>
                        <div>
                          <Check Check={false} />
                          Хэм алдагдын эмэн эмчилгээ
                        </div>
                        <div>
                          <Check Check={false} />
                          Байнгын пейсмейкер суулгац
                        </div>
                        <div>
                          <Check Check={false} />
                          ICD
                        </div>
                        <div>
                          <Check Check={false} />
                          Хэм алдагдлын мэс заслын эмчилгээ
                        </div>
                        <div>
                          <Check Check={false} />
                          Бусад: ____________
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "49%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "40%" }}>
                          <div>
                            <Check Check={false} />
                            Үгүй{" "}
                          </div>
                          <div>
                            <Check Check={false} />
                            Амиодарон
                          </div>
                          <div>
                            <Check Check={false} />
                            Аспирин
                          </div>
                          <div>
                            <Check Check={false} />
                            Бетахориглогч
                          </div>
                          <div>
                            <Check Check={false} />
                            Дигиталис
                          </div>
                          <div>
                            <Check Check={false} />
                            Соталол
                          </div>
                          <div>
                            <Check Check={false} />
                            Варфарин{" "}
                          </div>
                        </div>
                        <div
                          style={{
                            width: "60%",
                          }}
                        >
                          <div>
                            <Check Check={false} />
                            Флейканид
                          </div>
                          <div>
                            <Check Check={false} />
                            Прокайнамид
                          </div>
                          <div>
                            <Check Check={false} />
                            Пропафенон
                          </div>
                          <div>
                            <Check Check={false} />
                            Кальцийн сувгийн хориглогч
                          </div>
                          <div>
                            <Check Check={false} />
                            Хинидин
                          </div>
                          <div>
                            <Check Check={false} />
                            Дизопирамид
                          </div>
                          <div>
                            <Check Check={false} />
                            Бусад
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

export default EPSAblation;
