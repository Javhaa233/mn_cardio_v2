import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseNoData from "customComponents/BaseNoData";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
// import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const sx = {
  childDiv: {
    position: "relative",
    padding: "10px",
    border: `1px solid ${colors.brand.hairline}`,
    margin: "10px",
    backgroundColor: colors.brand.tintSolid,
  },
};

class AtrialRhythm extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: null, Loading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;

    // refs
    this.ReportRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ Loading: true });

    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "AtrialRhythm", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: resData.Data });
          this.setState({ Loading: false });
        },
      );
    } else {
      this.setState({ Loading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/AtrialRhythm/PrintReport",
          Data: { Id: DataId },
          FileName: "AtrialRhythm.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data saved", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };

  GetPrintNew = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/AtrialRhythm/PrintReportNew",
          Data: { Id: DataId },
          FileName: "AtrialRhythm.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data saved", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };

  //
  Confirm = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythm/Confirm",
        { Id: DataId },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback();
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
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  render() {
    const { Loading, Data, Alert } = this.state;
    const { t } = this.props;
    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data ? (
            <div>
              <GridContainer style={{ width: "calc(100% - 30px)" }}>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer style={{ margin: "15px 0" }}>
                    <GridItem xs={12} sm={6} md={6}>
                      <div style={{ float: "left" }}>
                        {t("Date")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          &nbsp;
                          {Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.CreatedDate,
                          })}
                        </span>
                      </div>
                    </GridItem>
                    <GridItem xs={12} sm={6} md={6}>
                      <div style={{ float: "right" }}>
                        <UserDialogLink UserId={Data.CreateUserId || null}>
                          {t("Doctor")}: {"\u00A0"}
                          <span style={{ fontWeight: "400" }}>
                            {Data.Users ? Data.Users.UserName : ""}
                          </span>
                        </UserDialogLink>
                      </div>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
                  <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                    {t("Тосгуурын жирвэгнээ")}
                  </h4>
                </GridItem>
              </GridContainer>
              <GridContainer
                style={{ margin: "0", width: "100%", minHeight: "760px" }}
              >
                <GridItem xs={12} sm={12} md={12}>
                  <GroupPanel
                    title={t("Эмчид үзүүлэх үеийн бүртгэл")}
                    level={1}
                  >
                    <BaseInfo
                      Label="Байгууллага"
                      Value={
                        Data.OrganizationObj
                          ? Data.OrganizationObj.Label
                          : Data.organization_other
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Үзлэгийн огноо"
                      Value={Data.visit_date}
                      md={4}
                    />
                    <BaseInfo
                      Label="Эмчийн нэр"
                      Value={Data.doctor_name}
                      md={4}
                    />
                    <BaseInfo Label="Out Score" Value={Data.out_score} md={4} />
                    <BaseInfo
                      Label="Хяналт шинжилгээ хийлгэх эмнэлгийн нэр"
                      Value={Data.monitoring_hostpital_name}
                      md={4}
                    />

                    <GroupPanel
                      title={t("Шинж тэмдэг (хэд хэдийг сонгож болно)")}
                      level={2}
                    >
                      <BaseArrayInfo
                        Label="Шинж тэмдэг"
                        TextField="Label"
                        Values={Data.r_symptomsObj ? Data.r_symptomsObj : []}
                        md={4}
                      />
                      <BaseInfo
                        Label="Бусад шинж тэмдэг"
                        Value={Data.r_symptoms_other}
                        md={4}
                      />
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel
                    title={t("Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс")}
                    level={1}
                  >
                    <BaseInfo
                      Label="Даралт ихсэлт"
                      Value={
                        Data.daralt_ihseltObj ? Data.daralt_ihseltObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Уух тос уурчлулт"
                      Value={
                        Data.uuh_tos_uurchlultObj
                          ? Data.uuh_tos_uurchlultObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Чихрийн шижин"
                      Value={
                        Data.chihriin_shijinObj
                          ? Data.chihriin_shijinObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Ишеми урид"
                      Value={
                        Data.ishemi_uridObj ? Data.ishemi_uridObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Зүрх генетик үхэл"
                      Value={
                        Data.zurh_genet_uhelObj
                          ? Data.zurh_genet_uhelObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Тамхи татах"
                      Value={Data.tamhidaltObj ? Data.tamhidaltObj.Label : ""}
                      md={4}
                    />
                    {Data.tamhidalt === "4" && (
                      <Box component="div" sx={sx.childDiv}>
                        <BaseInfo
                          Label="Тамхинаас гарсан хугацаа"
                          Value={Data.tamhinaas_garsan_hugatsaa}
                          md={4}
                        />
                      </Box>
                    )}
                    {Data.tamhidalt === "6" && (
                      <Box component="div" sx={sx.childDiv}>
                        <BaseInfo
                          Label="Дундаж тамхины тоо"
                          Value={Data.dundaj_tamhinii_too}
                          md={4}
                        />
                      </Box>
                    )}

                    <BaseInfo
                      Label="Архи хэрэглээ"
                      Value={
                        Data.arhi_heregleeObj ? Data.arhi_heregleeObj.Label : ""
                      }
                      md={4}
                    />
                    {Data.arhi_hereglee === "4" && (
                      <Box component="div" sx={sx.childDiv}>
                        <BaseInfo
                          Label="Архинаас гарсан хугацаа"
                          Value={Data.arhinaas_garsan_hugatsaa}
                          md={4}
                        />
                      </Box>
                    )}
                  </GroupPanel>

                  <GroupPanel title={t("Бусад онцлох өвчний түүх")} level={1}>
                    <BaseInfo
                      Label="Хэрэг эмгэг"
                      Value={
                        Data.hereg_emgegObj ? Data.hereg_emgegObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Хавхлага гажиг мэс"
                      Value={
                        Data.havhlaga_gajig_mesObj
                          ? Data.havhlaga_gajig_mesObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Кардиомиопати"
                      Value={
                        Data.cardiomiopatiObj ? Data.cardiomiopatiObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Архаг дутагдал"
                      Value={
                        Data.arhag_dutagdalObj
                          ? Data.arhag_dutagdalObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Миокардит"
                      Value={Data.miokarditObj ? Data.miokarditObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Халдварт эндокардит"
                      Value={
                        Data.haldvart_endokarditObj
                          ? Data.haldvart_endokarditObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Бөөр дутагдал"
                      Value={
                        Data.buur_dutagdalObj ? Data.buur_dutagdalObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Өмнө тархи судас"
                      Value={
                        Data.umnu_tarhi_sudasObj
                          ? Data.umnu_tarhi_sudasObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {(Data.umnu_tarhi_sudas === "y" ||
                      Data.umnu_tarhi_sudas === "5") && (
                      <Box component="div" sx={sx.childDiv}>
                        <BaseInfo
                          Label="Өмнө тархи судас төрөл"
                          Value={
                            Data.y_umnu_tarhi_sudasObj
                              ? Data.y_umnu_tarhi_sudasObj.Label
                              : ""
                          }
                          md={4}
                        />
                      </Box>
                    )}
                    <BaseInfo
                      Label="TISDE"
                      Value={Data.is_tisdeObj ? Data.is_tisdeObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="GABG"
                      Value={Data.is_gabgObj ? Data.is_gabgObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Уушиг архаг"
                      Value={
                        Data.uushig_arhagObj ? Data.uushig_arhagObj.Label : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Гипертиреоз"
                      Value={Data.gipertiObj ? Data.gipertiObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Гипотиреоз"
                      Value={Data.gipotiObj ? Data.gipotiObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Захын судас эмгэг"
                      Value={
                        Data.zahiin_sudas_emgegObj
                          ? Data.zahiin_sudas_emgegObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Амисгал ноир тасалдах"
                      Value={
                        Data.amisgal_noir_tasaldahObj
                          ? Data.amisgal_noir_tasaldahObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo Label="Бусад" Value={Data.other_uwchin} md={4} />

                    <GroupPanel
                      title={t("Тосгуурын жирвэгнээгийн тохиолдлын давтамж")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Сүүлийн 48 цаг"
                        Value={Data.suuliin_48_tsag}
                        md={4}
                      />
                      <BaseInfo
                        Label="Эхний удаа"
                        Value={Data.ehnii_udaa}
                        md={4}
                      />
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel title={t("Зүрхний цахилгаан бичлэг ")} level={1}>
                    <BaseInfo
                      Label="QRS duration"
                      Value={Data.qrs_duration}
                      md={4}
                    />
                    <BaseInfo
                      Label="Left BBB"
                      Value={Data.left_bbbObj ? Data.left_bbbObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Right BBB"
                      Value={Data.right_bbbObj ? Data.right_bbbObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo Label="ЗТСТ" Value={Data.ztst} md={4} />
                    <BaseInfo
                      Label="Зүүн ховдол гипертрофи"
                      Value={
                        Data.zuun_hovdol_gipertrofiObj
                          ? Data.zuun_hovdol_gipertrofiObj.Label
                          : ""
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel title={t("Зүүн тосгуурын хэмжээ")} level={1}>
                    <BaseArrayInfo
                      Label="Зүүн тосгуурын хэмжээ"
                      TextField="Label"
                      Values={
                        Data.zuun_tosguur_hemjeeObj
                          ? Data.zuun_tosguur_hemjeeObj
                          : []
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel
                    title={t("Зүүн ховдолын цацалтын фракцын хэмжээ")}
                    level={1}
                  >
                    <BaseArrayInfo
                      Label="Зүүн цацалт фракц"
                      TextField="Label"
                      Values={
                        Data.zuun_tsatsalt_fraktsObj
                          ? Data.zuun_tsatsalt_fraktsObj
                          : []
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel
                    title={t("Хэм алдагдлын эсрэг эмийн хэрэглээ")}
                    level={1}
                  >
                    <BaseArrayInfo
                      Label="Хэм алдагдлын эсрэг"
                      TextField="Label"
                      Values={
                        Data.hem_aldagdal_esregObj
                          ? Data.hem_aldagdal_esregObj
                          : []
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel title={t("Өмнө хийгдэсэн эмчилгээ")} level={1}>
                    <BaseArrayInfo
                      Label="Өмнөх эмчилгээ"
                      TextField="Label"
                      Values={
                        Data.umnuh_emchilgeeObj ? Data.umnuh_emchilgeeObj : []
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel
                    title={t("Тогтмол уудаг эмийн хэрэглээ ")}
                    level={1}
                  >
                    <BaseArrayInfo
                      Label="Тогтмол уудаг эм"
                      TextField="Label"
                      Values={
                        Data.togtmol_uudag_emObj ? Data.togtmol_uudag_emObj : []
                      }
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel title={t("Эрсдлийн үнэлгээ ")} level={1}>
                    <BaseInfo
                      Label="CHADS2 Score"
                      Value={Data.chads2_score}
                      md={4}
                    />
                    <BaseInfo
                      Label="CHADS2-VASc Score"
                      Value={Data.chads2_vasc_score}
                      md={4}
                    />
                    <BaseInfo
                      Label="HAS-BLED Score"
                      Value={Data.has_bled_score}
                      md={4}
                    />
                    <BaseInfo
                      Label="C2HEST Score"
                      Value={Data.c2hest_score}
                      md={4}
                    />
                  </GroupPanel>
                </GridItem>
              </GridContainer>
            </div>
          ) : (
            <BaseNoData />
          )}
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(AtrialRhythm);
