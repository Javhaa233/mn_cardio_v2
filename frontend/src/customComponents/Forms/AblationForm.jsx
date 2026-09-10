import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Box } from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseCustomTextField from "customComponents/BaseEditControls/BaseCustomTextField";
import CustomRadio from "customComponents/BaseEditControls/CustomRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import { colors } from "@/theme/colors";

class AblationForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Dialog: null };
  }

  CustomRender = () => {
    const { Fields, Dialog } = this.state;
    const { t } = this.props;

    return (
      <div>
        {Dialog}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} sm={12} md={12} style={{ margin: "15px" }}>
            {Fields ? (
              <div>
                <Box
                  sx={{
                    border: `1px solid ${colors.border.default}`,
                    padding: "20px",
                  }}
                >
                  <Box
                    component="h3"
                    sx={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    {t("Treatment information")}
                  </Box>
                  <GridContainer style={{ width: "100%" }}>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={6}
                      style={{ padding: "0 3px" }}
                    >
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ShinjilgeeDate")}
                        md={6}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("DoctorId")}
                        md={6}
                        FullWidth={true}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("NurseId")}
                        md={6}
                        FullWidth={true}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("TechnicianId")}
                        md={6}
                        FullWidth={true}
                      />
                    </GridItem>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={6}
                      style={{ padding: "0 3px" }}
                    >
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("InDate")}
                        md={6}
                      />
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("OutDate")}
                        md={6}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("SendDoctorId")}
                        md={6}
                        FullWidth={true}
                      />
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("SendDate")}
                        md={6}
                      />
                    </GridItem>
                  </GridContainer>
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${colors.border.default}`,
                    padding: "20px",
                  }}
                >
                  <Box
                    component="h3"
                    sx={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    {t(
                      "Титмийн архаг хамшинжийн эрсдлийн үнэлгээ / Өвчний өгүүлэмж",
                    )}
                  </Box>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ArteriDaraltIhsdeg")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("ArteriDaraltIhsdegDetail"),
                        Label: t("If so"),
                      }}
                    />
                  </div>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Giperlipidemi")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("GiperlipidemiDetail"),
                        Label: t("If so"),
                      }}
                    />
                  </div>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ChihriinShijin")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("ChihriinShijinDetail"),
                        Label: t("If so"),
                      }}
                    />
                  </div>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ZvrhniiDutagdal")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Harvalt")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ZahSudasniUwchin")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ZvrhniBvtetsEmgeg")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Ziu")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Cardiomiopati")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("CardiomiopatiYes"),
                        Label: t("If so"),
                      }}
                      Row={true}
                    />
                    <GridContainer style={{ width: "100%" }}>
                      <GridItem xs={12} sm={6} md={3}></GridItem>
                      <GridItem xs={12} sm={6} md={9}>
                        <BaseCustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("CardiomiopatiYesOther")}
                          NoLabel={true}
                        />
                      </GridItem>
                    </GridContainer>
                  </div>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ZvrhniTurulhGajig")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("MitralHavhlagProlaps")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("HavhlagaGajig")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ZvrhniShigdees")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("ZvrhniShigdeesYes"),
                        Label: t("If so"),
                      }}
                      Row
                    />
                  </div>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("BHDisplazi")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Other")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("OtherDetail"),
                        Label: t("If so, please clarify"),
                      }}
                    />
                  </div>
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${colors.border.default}`,
                    padding: "20px",
                  }}
                >
                  <Box
                    component="h3"
                    sx={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    {t("Ажилбар")}
                  </Box>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Ajilbar")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Zaalt")}
                    Row={true}
                  />
                  <GridContainer style={{ width: "100%" }}>
                    <GridItem xs={12} sm={6} md={3}></GridItem>
                    <GridItem xs={12} sm={6} md={9}>
                      <BaseCustomTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ZaaltOther")}
                        FullWidth={true}
                        NoLabel={true}
                      />
                    </GridItem>
                  </GridContainer>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("HemAldaltEmenEmchilge")}
                  />
                  <div
                    style={{
                      position: "relative",
                      padding: "5px",
                      border: `1px solid ${colors.border.default}`,
                      margin: "10px",
                      backgroundColor: colors.background.surfaceAlt,
                    }}
                  >
                    <GridContainer style={{ width: "100%" }}>
                      <GridItem xs={12} sm={6} md={3}></GridItem>
                      <GridItem xs={12} sm={6} md={9}>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "HemAldaltEmenEmchilgeDetail",
                          )}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={12}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "HemAldaltEmenEmchilgeOther",
                          )}
                          NoLabel={true}
                        />
                      </GridItem>
                    </GridContainer>
                  </div>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("LVEF")}
                    FullWidth={true}
                  />
                  <Box
                    sx={{
                      border: `1px solid ${colors.border.default}`,
                      padding: "20px",
                    }}
                  >
                    <Box
                      component="h3"
                      sx={{ fontSize: "18px", fontWeight: "bold" }}
                    >
                      Хэм алдагдлын шалтгаантай өмнө нь ажилбарт орж байсан эсэх
                    </Box>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("HemAldaltMesZasal")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("PacemakerSuulgats")}
                    />
                    <div
                      id="heent_abChild"
                      style={{
                        position: "relative",
                        padding: "20px 5px 5px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "20px 10px 10px",
                        backgroundColor: colors.background.surfaceAlt,
                        //   display: this.GetDisplay("heent_ab"),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField("PacemakerSuulgatsYes"),
                          Label: t("If so"),
                        }}
                        Row={true}
                      />
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField("PacemakerSuulgatsYesDate"),
                          Label: t("Суулгасан огноо"),
                        }}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ICDSuulgats")}
                    />
                    <div
                      id="heent_abChild"
                      style={{
                        position: "relative",
                        padding: "20px 5px 5px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "20px 10px 10px",
                        backgroundColor: colors.background.surfaceAlt,
                        //   display: this.GetDisplay("heent_ab"),
                      }}
                    >
                      <GridContainer>
                        <GridItem xs={12} sm={6} md={3}>
                          <BaseLabel
                            Label="If so,"
                            Color={colors.label.primary}
                            Right
                            Weight="400"
                          />
                        </GridItem>
                        <GridItem xs={12} sm={6} md={9}></GridItem>
                      </GridContainer>
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField("PacemakerSuulgatsYesDate"),
                          Label: t("Installation dat"),
                        }}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("UmnuhKatetrAblatsi")}
                    />
                    <div
                      id="heent_abChild"
                      style={{
                        position: "relative",
                        padding: "20px 5px 5px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "20px 10px 10px",
                        backgroundColor: colors.background.surfaceAlt,
                        //   display: this.GetDisplay("heent_ab"),
                      }}
                    >
                      <GridContainer style={{ width: "100%" }}>
                        <GridItem xs={12} sm={6} md={3}>
                          <BaseLabel
                            Label="If so,"
                            Color={colors.label.primary}
                            Right
                            Weight="400"
                          />
                        </GridItem>
                        <GridItem xs={12} sm={6} md={9}></GridItem>
                      </GridContainer>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField("UmnuhKatetrAblatsiYesHaan"),
                          Label: t("Where"),
                        }}
                      />
                    </div>
                    <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("UmnuhAblatsiHiilgesen")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("UmnuhAjilbarOther")}
                    />
                    <div
                      id="heent_abChild"
                      style={{
                        position: "relative",
                        padding: "20px 5px 5px",
                        border: `1px solid ${colors.border.default}`,
                        margin: "20px 10px 10px",
                        backgroundColor: colors.background.surfaceAlt,
                        //   display: this.GetDisplay("heent_ab"),
                      }}
                    >
                      <GridContainer style={{ width: "100%" }}>
                        <GridItem xs={12} sm={6} md={3}>
                          <BaseLabel
                            Label="If so,"
                            Color={colors.label.primary}
                            Right
                            Weight="400"
                          />
                        </GridItem>
                        <GridItem xs={12} sm={6} md={9}></GridItem>
                      </GridContainer>
                      <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField("UmnuhAjilbarOtherYesDate"),
                          Label: t("Date"),
                        }}
                      />
                    </div>
                  </Box>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("EFShOnosh")}
                  />
                  <GridContainer style={{ width: "100%" }}>
                    <GridItem xs={12} sm={6} md={3}></GridItem>
                    <GridItem xs={12} sm={6} md={9}>
                      <BaseCustomTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("EFShOnoshOther")}
                        NoLabel={true}
                        FullWidth={true}
                      />
                    </GridItem>
                  </GridContainer>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("IncArrhythLab")}
                    FullWidth={true}
                  />
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${colors.border.default}`,
                    padding: "20px",
                  }}
                >
                  <Box
                    component="h3"
                    sx={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    Ажилбарын үеийн хүндрэл
                  </Box>
                </Box>
                <Box
                  sx={{
                    border: `1px solid ${colors.border.default}`,
                    padding: "20px",
                  }}
                >
                  <Box
                    component="h3"
                    sx={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    {t("Эмнэлгээс гарах")}
                  </Box>
                </Box>
              </div>
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(AblationForm);
