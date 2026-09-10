import React, { Component } from "react";
// @mui/material components
import { Box } from "@mui/material";

import Check from "customComponents/Report/EPSAblationTables/Check";

import styles from "assets/jss/material-dashboard-pro-react/custom/EPSAblationStyles.js";

class ProcedureTwo extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, PatientData: null };
  }

  render() {
    // const { Data, PatientData } = this.state;

    return (
      <Box sx={styles.main}>
        <Box id="divPrint3" sx={styles.body}>
          {/* Begin */}
          <div style={{ marginBottom: "10px" }}>
            <Box component="table" sx={styles.table}>
              <tbody>
                <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>Inducible Arrhythmias in Laboratory</div>
                    </Box>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div style={{ width: "25%" }}>
                        <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                          <Check Check={false} />
                          Сэдээгдээгүй
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            AVNRT
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Slow-fast</li>
                            <li>Fast-slow</li>
                            <li>Slow-slow</li>
                          </ol>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            Atrial Fibrillation
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Paroxysmal</li>
                            <li>Persistent</li>
                            <li>Permanent</li>
                          </ol>
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          <Check Check={false} />
                          Бусад:
                        </div>
                      </div>
                      <div style={{ width: "25%", height: "100%" }}>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            AVRT
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Orthodromic</li>
                            <li>PJRT</li>
                            <li>Multiple</li>
                            <li>Antidromic</li>
                            <li>Atriofascicular</li>
                          </ol>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            Atrial Flutter
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Typical clockwise</li>
                            <li>Typical, counterclockwise</li>
                            <li>Atypical</li>
                          </ol>
                        </div>
                      </div>
                      <div style={{ width: "25%" }}>
                        <div style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            Atrial Tachycardia
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Automatic</li>
                            <li>Re-entrant</li>
                            <li>Focal</li>
                            <li>Non-focal</li>
                            <li>Үл танигдах</li>
                          </ol>
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          <Check Check={false} />
                          Ventricular Fibrillation
                        </div>
                      </div>
                      <div style={{ width: "25%" }}>
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            <Check Check={false} />
                            Ventricular Tachycardia
                          </div>
                          <ol style={{ margin: "0" }}>
                            <li>Automatic</li>
                            <li>Re-entrant</li>
                            <li>Үл танигдах</li>
                          </ol>
                        </div>
                      </div>
                    </Box>
                  </td>
                </tr>
              </tbody>
            </Box>
          </div>
          {/* End */}
          {/* Begin */}
          <div style={{ marginBottom: "10px" }}>
            <Box component="table" sx={styles.table}>
              <tbody>
                <tr style={{ fontWeight: "500" }}>
                  <td colSpan={5} style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div style={{ width: "30%" }}>Аблаци хийсэн:</div>
                      <div style={{ width: "70%" }}>
                        <div style={{ width: "30%" }}>
                          <Check Check={false} />
                          0. Үгүй
                        </div>
                        <div style={{ width: "30%" }}>
                          <Check Check={false} />
                          1. Тийм
                        </div>
                      </div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>Аблацийн хэлбэр</Box>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Box sx={styles.tdDiv}>#1</Box>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Box sx={styles.tdDiv}>#2</Box>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Box sx={styles.tdDiv}>#3</Box>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Box sx={styles.tdDiv}>#4</Box>
                  </td>
                </tr>
              </tbody>
            </Box>
          </div>
          {/* End */}
          {/* Begin */}
          <div style={{ marginBottom: "10px" }}>
            <Box component="table" sx={styles.table}>
              <tbody>
                <tr style={{ fontWeight: "500" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>1. АВ зангилааны бүрэн аблаци</div>
                      <div>2. Тосгуурын чичиргээнийаблаци</div>
                      <div>3. Тосгуурын тахикардийн аблаци</div>
                      <div>4. AVNRT Удаан замын аблаци</div>
                      <div>5. AVNRT Түргэн замын аблаци</div>
                      <div>6. LVVT аблаци</div>
                      <div>7. RVVT аблаци</div>
                      <div>8. Нэмэлт замын аблаци</div>
                      <div>9. Sinus node modification</div>
                      <div>10. Голомтот ТЖ аблаци</div>
                      <div>11. PVC аблаци</div>
                      <div>12. Бусад аблаци</div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>Аблацийн эцсийн үр дүн</div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>1. Амжилттай</div>
                      <div>2. Голомтын эсвэл хажуугийн замын модификаци</div>
                      <div>3. Амжилтгүй</div>
                      <div>4. Аблаци хийгдээгүй</div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                  <td colSpan={5}>
                    <Box sx={styles.tdDiv}>
                      <div>Радио давтамжийн хэрэглээ</div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>Радио давтамж хэрэглэсэн нийт тоо</div>
                    </Box>
                  </td>
                  <td colSpan={4} style={{ width: "70%" }}>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>Радио давтамж хэрэглэсэн нийт хугацаа (секунд)</div>
                    </Box>
                  </td>
                  <td colSpan={4} style={{ width: "70%" }}>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
                <tr style={{ fontWeight: "500" }}>
                  <td style={{ width: "30%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>
                        Амжилттай түлсэн хүртэлх радио давтамж хэрэглэсэн
                        хугацаа (секунд)
                      </div>
                    </Box>
                  </td>
                  <td colSpan={4} style={{ width: "70%" }}>
                    <Box sx={styles.tdDiv}>
                      <div></div>
                    </Box>
                  </td>
                </tr>
              </tbody>
            </Box>
          </div>
          {/* End */}
          {/* Begin */}
          <div style={{ marginBottom: "10px" }}>
            <Box component="table" sx={styles.table}>
              <tbody>
                <tr style={{ fontWeight: "500", backgroundColor: "#dedede" }}>
                  <td style={{ width: "40%" }}>
                    <Box sx={styles.tdDiv}>
                      <div>Ажилбарын нийт хугацаа (мин : сек)</div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div>Флюроскопийн хугацаа (мин : сек)</div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={styles.tdDiv}>
                      <div>DAP (mGy.cm2)</div>
                    </Box>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "33%" }}>
                    <Box sx={styles.tdDiv}></Box>
                  </td>
                  <td style={{ width: "34%" }}>
                    <Box sx={styles.tdDiv}></Box>
                  </td>
                  <td style={{ width: "33%" }}>
                    <Box sx={styles.tdDiv}></Box>
                  </td>
                </tr>
              </tbody>
            </Box>
          </div>
          {/* End */}
        </Box>
      </Box>
    );
  }
}

export default ProcedureTwo;
