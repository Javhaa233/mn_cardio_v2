import React, { Component } from "react";
// @mui/material components
import { Box } from "@mui/material";

import Check from "customComponents/Report/EPSAblationTables/Check";

import styles from "assets/jss/material-dashboard-pro-react/custom/EPSAblationStyles.js";

class MainInformation extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }

  render() {
    const { t } = this.props;
    const classes = {
      main: "main",
      body: "body",
      header: "header",
      table: "table",
      tableHeader: t("tableHeader"),
      tdDiv: "tdDiv",
    };

    const sx = {
      "& .main": styles.main,
      "& .body": styles.body,
      "& .header": styles.header,
      "& .table": styles.table,
      "& .tableHeader": styles.tableHeader,
      "& .tdDiv": styles.tdDiv,
    };

    return (
      <Box sx={sx}>
        <div className={classes.main}>
          <div id="divPrint1" className={classes.body}>
            <h5 className={classes.header}>ЭФШ, аблацийн маягт</h5>
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th colSpan={3}>
                      <h5 className={classes.tableHeader}>
                        I. Ерөнхий мэдээлэл
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div>Овог, нэр: ____________________________</div>
                        <div>Регистрийн дугаар : ___________________</div>
                        <div>Төрсөн огноо : 00-00-0000 (өө-сс-оооо)</div>
                        <div>Утас : _____________, _________</div>
                      </div>
                    </td>
                    <td style={{ width: "30%" }}>
                      <div className={classes.tdDiv}>
                        <div>Аймаг/хот : _________________</div>
                        <div>Сум/дүүрэг : ________________</div>
                        <div>Баг/ хороо : _________________</div>
                      </div>
                    </td>
                    <td style={{ width: "30%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div style={{ width: "auto", marginRight: "10px" }}>
                            Хүйс:
                          </div>
                          <div style={{ width: "auto", marginRight: "10px" }}>
                            <Check Check={true} />
                            Эрэгтэй
                          </div>
                          <div style={{ width: "auto" }}>
                            <Check Check={false} />
                            Эмэгтэй
                          </div>
                        </div>
                        <div>Жин : ______</div>
                        <div>Өндөр : _______</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th colSpan={3}>
                      <h5 className={classes.tableHeader}>
                        II. Эмчилгээний мэдээлэл
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div style={{ width: "auto", marginRight: "10px" }}>
                            Эмнэлэг:
                          </div>
                          <div style={{ width: "auto", marginRight: "20px" }}>
                            <Check Check={true} />
                            УГТЭ
                          </div>
                          <div style={{ width: "auto" }}>
                            <Check Check={false} />
                            Бусад
                          </div>
                        </div>
                        <div>
                          Шинжилгээний огноо: 00-00-0000 00:00 (dd-mm-yyyy)
                        </div>
                        <div>Эмч: _____________ </div>
                        <div>Сувилагч: ___________________________</div>
                        <div>Техникч: ____________________________</div>
                      </div>
                    </td>
                    <td style={{ width: "30%" }}>
                      <div className={classes.tdDiv}>
                        <div>Хэвтсэн огноо: 00-00-0000 (өө-сс-оооо)</div>
                        <div>
                          Эмнэлгээс гарсан огноо: 00-00-0000 (өө-сс-оооо)
                        </div>
                        <div>Илгээсэн эмч: ________________</div>
                        <div>Илгээсэн огноо: </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* III. Титмийн архаг хамшинжийн эрсдлийн үнэлгээ / Өвчний өгүүлэмж */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th colSpan={3}>
                      <h5 className={classes.tableHeader}>
                        III. Титмийн архаг хамшинжийн эрсдлийн үнэлгээ / Өвчний
                        өгүүлэмж
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "25%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Артерийн даралт ихсэлт:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "75%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Тийм бол</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм, эмэн эмчилгээгүй
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          2. Тийм, эмэн эмчилгээтэй
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Гиперлипидеми:</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Тийм бол</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          1. Тийм, хоолны дэглэм
                        </div>
                        <div style={{ width: "50%" }}>
                          <Check Check={false} />
                          2. Тийм, эмэн эмчилгээтэй
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Чихрийн шижин:</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr style={{ fontWeight: "500" }}>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Тийм бол </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%", fontWeight: "400" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "33%" }}>
                          <Check Check={false} />
                          1. Тийм, хоолны дэглэм
                        </div>
                        <div style={{ width: "33%" }}>
                          <Check Check={false} />
                          2. Тийм, эмэн эмчилгээтэй
                        </div>
                        <div style={{ width: "33%" }}>
                          <Check Check={false} />
                          3. Тийм, инсулин тарина
                        </div>
                        <div>
                          <Check Check={false} />
                          4. Тийм, уух эм ба инсулин тарина
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Зүрхний дутагдалд орж байсан эсэх :
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Харвалт / TIA:</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Захын судасны өвчин:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Зүрхний бүтцийн эмгэг:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>ЗИӨ:</div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Кардиомиопати:</div>
                      </div>
                    </td>
                    <td style={{ width: "40%" }}>
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
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div>Тийм бол,</div>
                        <div>
                          <Check Check={false} />
                          1. Идиопати
                        </div>
                        <div>
                          <Check Check={false} />
                          2. Гиперторфий
                        </div>
                        <div>
                          <Check Check={false} />
                          3. Архины
                        </div>
                        <div>
                          <Check Check={false} />
                          4. Бусад: _____
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Зүрхний төрөлхийн гажиг:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Митрал хавхлагын пролапс:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                  {/* Tr begin */}
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Хавхлагын гажиг:
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} style={{ width: "80%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ width: "20%" }}>
                          <Check Check={true} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "20%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* tr end */}
                </tbody>
              </table>
            </div>
            {/* End */}
            {/* Begin */}
            <div style={{ marginBottom: "10px" }}>
              <table className={classes.table}>
                <tbody>
                  <tr>
                    <td style={{ width: "25%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>
                          Зүрхний шигдээс:
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "35%" }}>
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
                    <td style={{ width: "40%" }}>
                      <div className={classes.tdDiv}>
                        <div>
                          <div>Тийм бол,</div>
                          <div>
                            <Check Check={false} />
                            1. Удаагүй / {"<"} 1 сараас богино хугацаанд
                          </div>
                          <div>
                            <Check Check={false} />
                            2. Удсан / {">"} 1 сараас урт хугацаа
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>БХ-ын дисплази:</div>
                      </div>
                    </td>
                    <td style={{ width: "20%" }}>
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
                    <td style={{ width: "60%" }}>
                      <div className={classes.tdDiv}>
                        <div></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "20%" }}>
                      <div className={classes.tdDiv}>
                        <div style={{ fontWeight: "500" }}>Бусад:</div>
                      </div>
                    </td>
                    <td style={{ width: "20%" }}>
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
                    <td style={{ width: "60%" }}>
                      <div className={classes.tdDiv}>
                        <div>Тийм бол, тодруул:</div>
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

export default MainInformation;
