import { useTranslation } from "react-i18next";
import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";

export default function MonitoringInfo(props) {
  const { t } = useTranslation();
  const spanStyle = { padding: "2px 4px", borderRadius: "2px", color: "white" };
  // props Data
  const { PatRegNo = null, Data = null, DoctorsProfileData = null } = props;

  const StatusText = (Text) => {
    return (
      <div>
        {Text && Text + "" === "activated" ? (
          <span style={{ ...spanStyle, backgroundColor: "#2bb559" }}>
            Идэвхитэй
          </span>
        ) : Text && Text + "" === "out_control" ? (
          <span style={{ ...spanStyle, backgroundColor: "#ff5757" }}>
            Хяналтаас гарсан
          </span>
        ) : Text && Text + "" === "expired" ? (
          <span style={{ ...spanStyle, backgroundColor: "#ffcc00" }}>
            Үзлэгт хамрагдсан
          </span>
        ) : (
          <span style={{ ...spanStyle, backgroundColor: "#a9b0ab" }}>
            Идэвхигүй
          </span>
        )}
      </div>
    );
  };

  const DateStatus = (Text) => {
    return (
      <div>
        {Text && Text + "" === "simple" ? (
          <span style={{ ...spanStyle, backgroundColor: "#2bb559" }}>
            Хэвийн
          </span>
        ) : Text && Text + "" === "date_expired" ? (
          <span style={{ ...spanStyle, backgroundColor: "#ff5757" }}>
            Хугацаа дууссан
          </span>
        ) : Text && Text + "" === "date_warning" ? (
          <span style={{ ...spanStyle, backgroundColor: "#ffcc00" }}>
            Хугацаа тулсан
          </span>
        ) : (
          <span style={{ ...spanStyle, backgroundColor: "#a9b0ab" }}>
            Тодорхойгүй
          </span>
        )}
      </div>
    );
  };

  const setRiskView = (level, score) => {
    let bodyColor = "blue";
    let bodyText = "";

    if (level) {
      switch (level) {
        case 5:
          bodyColor = "brown";
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 30-аас дээш хувь";
          break;
        case 4:
          bodyColor = "red";
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 20-30 хувь";
          break;
        case 3:
          bodyColor = "orange";
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 10-20 хувь";
          break;
        case 2:
          bodyColor = "yellow";
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-10 хувь";
          break;
        case 1:
          bodyColor = "green";
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл  5-аас бага хувь ";
          break;
        default:
          bodyColor = "blue";
          bodyText = "";
          break;
      }

      return (
        <div
          style={{
            width: "100%",
            height: "100px",
            border: "1px solid " + bodyColor,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <span
            style={{
              backgroundColor: bodyColor,
              width: "100px",
              height: "100px",
              color: "#fff",
              fontWeight: "normal",
              fontSize: "2.2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {score || 0}
          </span>
          <span style={{ margin: "auto", padding: "0 15px" }}>{bodyText}</span>
        </div>
      );
    }
  };

  return (
    <div>
      {PatRegNo && (
        <div>
          {Data ? (
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "100%",
                      borderTop: "1px solid #ccc",
                      padding: "15px 0 0",
                      marginTop: "25px",
                    }}
                  >
                    <h5
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "400",
                        padding: "3px 15px",
                        borderRadius: "0.2rem",
                        color: "#FFF",
                        backgroundColor: "#00acc1",
                        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
                        textTransform: "uppercase",
                      }}
                    >
                      Эмчийн мэдээлэл
                    </h5>
                    <BaseInfo
                      Label="Эмч"
                      Value={
                        DoctorsProfileData ? DoctorsProfileData.firstname : null
                      }
                      Size="13px"
                      LabelWeight="400"
                      ValueWeight="300"
                    />
                    <BaseInfo
                      Label="Эмнэлэг"
                      Value={
                        DoctorsProfileData
                          ? DoctorsProfileData.Organization
                            ? DoctorsProfileData.Organization.Name
                            : ""
                          : null
                      }
                      Size="13px"
                      LabelWeight="400"
                      ValueWeight="300"
                    />
                    <BaseInfo
                      Label="Эмнэлгийн хаяг"
                      Size="13px"
                      LabelWeight="400"
                      ValueWeight="300"
                      Value={
                        DoctorsProfileData
                          ? (DoctorsProfileData.DictProvinceCity
                              ? DoctorsProfileData.DictProvinceCity.name + ", "
                              : "") +
                            (DoctorsProfileData.DictSoumDistrict
                              ? DoctorsProfileData.DictSoumDistrict.name + ", "
                              : "") +
                            (DoctorsProfileData.DictBagKhoroo
                              ? DoctorsProfileData.DictBagKhoroo.name
                              : "")
                          : null
                      }
                    />
                  </div>
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "100%",
                      borderTop: "1px solid #ccc",
                      padding: "15px 0 0",
                      marginTop: "25px",
                    }}
                  >
                    <h5
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "400",
                        padding: "3px 15px",
                        borderRadius: "0.2rem",
                        color: "#FFF",
                        backgroundColor: "#FF007F",
                        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
                        textTransform: "uppercase",
                      }}
                    >
                      Үзлэгийн мэдээлэл
                    </h5>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "start",
                          gap: "10px",
                        }}
                      >
                        {StatusText(Data.Status)}
                        {DateStatus(Data.date_status)}
                      </div>
                      <BaseInfo
                        Label="Үзлэгийн огноо"
                        Value={
                          Data
                            ? Helper.ObjectHelper.getDateYMD({
                                DateStr: Data.CreateDate,
                              })
                            : null
                        }
                        Size="13px"
                        LabelWeight="400"
                        ValueWeight="300"
                      />
                      <BaseInfo
                        Label="Эрсдлийн түвшин"
                        Value={Data.Risk ? Data.Risk.Risk : null}
                        Size="13px"
                        LabelWeight="400"
                        ValueWeight="300"
                      />
                      <BaseInfo
                        Label="Эрсдлийн хувь"
                        Value={Data.Risk ? Data.Risk.Score : null}
                        Size="13px"
                        LabelWeight="400"
                        ValueWeight="300"
                      />
                      <BaseInfo
                        Label="Дахин хамрагдах огноо"
                        Value={
                          Data
                            ? Helper.ObjectHelper.getDateYMD({
                                DateStr: Data.ExpiredDate,
                              })
                            : null
                        }
                        Size="13px"
                        LabelWeight="400"
                        ValueWeight="300"
                      />
                    </div>
                  </div>
                </div>
              </GridItem>
              <GridItem xs={12} md={12}>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                    borderTop: "1px solid #ccc",
                    padding: "15px 0 0",
                    marginTop: "25px",
                  }}
                >
                  <h5
                    style={{
                      position: "absolute",
                      top: "-25px",
                      left: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "400",
                      padding: "3px 15px",
                      borderRadius: "0.2rem",
                      color: "#FFF",
                      backgroundColor: "#355E3B",
                      boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
                      textTransform: "uppercase",
                    }}
                  >
                    Эрсдлийн үнэлгээ
                  </h5>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "stretch",
                      margin: "22px 0",
                      padding: "10px 15px",
                      gap: "5px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          backgroundColor: "green",
                          padding: "7px 14px",
                          marginRight: "4px",
                        }}
                      ></span>
                      <span> {"<"}5%</span>
                    </div>
                    <div>
                      <span
                        style={{
                          backgroundColor: "yellow",
                          padding: "7px 14px",
                          marginRight: "4px",
                        }}
                      ></span>
                      <span> 5% {"<"} 10%</span>
                    </div>
                    <div>
                      <span
                        style={{
                          backgroundColor: "orange",
                          padding: "7px 14px",
                          marginRight: "4px",
                        }}
                      ></span>
                      <span> 10% {"<"} 20%</span>
                    </div>
                    <div>
                      <span
                        style={{
                          backgroundColor: "red",
                          padding: "7px 14px",
                          marginRight: "4px",
                        }}
                      ></span>
                      <span> 20% {"<"} 30%</span>
                    </div>
                    <div>
                      <span
                        style={{
                          backgroundColor: "brown",
                          padding: "7px 14px",
                          marginRight: "4px",
                        }}
                      ></span>
                      <span> ≥30%</span>
                    </div>
                  </div>
                  {Data.Risk && setRiskView(Data.Risk.Risk, Data.Risk.Score)}
                </div>
              </GridItem>
            </GridContainer>
          ) : (
            <GridContainer>
              <GridItem xs={12} md={12}>
                <BaseNoData
                  Text={"ЗС эрсдлийн хяналтын үзлэг бүртгэгдээгүй байна"}
                />
              </GridItem>
            </GridContainer>
          )}
        </div>
      )}
    </div>
  );
}
