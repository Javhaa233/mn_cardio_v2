import { useTranslation } from "react-i18next";
import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";
import StatusChip from "customComponents/StatusChip";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
// helper
import Helper from "helper";

export default function MonitoringInfo(props) {
  const { t } = useTranslation();
  // props Data
  const { PatRegNo = null, Data = null, DoctorsProfileData = null } = props;

  // The shared status pill (word in a tone ink, meaning repeated in the dot).
  // It was white text on #2bb559 / #ff5757 / #ffcc00 / #a9b0ab; white on
  // that yellow is about 1.4:1.
  const StatusText = (Text) =>
    Text + "" === "activated" ? (
      <StatusChip Tone="success" Label="Идэвхитэй" />
    ) : Text + "" === "out_control" ? (
      <StatusChip Tone="danger" Label="Хяналтаас гарсан" />
    ) : Text + "" === "expired" ? (
      <StatusChip Tone="warning" Label="Үзлэгт хамрагдсан" />
    ) : (
      <StatusChip Tone="neutral" Label="Идэвхигүй" />
    );

  const DateStatus = (Text) =>
    Text + "" === "simple" ? (
      <StatusChip Tone="success" Label="Хэвийн" />
    ) : Text + "" === "date_expired" ? (
      <StatusChip Tone="danger" Label="Хугацаа дууссан" />
    ) : Text + "" === "date_warning" ? (
      <StatusChip Tone="warning" Label="Хугацаа тулсан" />
    ) : (
      <StatusChip Tone="neutral" Label="Тодорхойгүй" />
    );

  // The risk band keeps its colour scale (colors.risk, the same hues as the
  // doctor-side risk column). The score sits on the band colour, so on the
  // light bands (yellow, orange) it is ink, not white.
  const riskFill = (level) => colors.risk[level] || colors.brand.hairlineStrong;
  const riskOnFill = (level) =>
    level === 2 || level === 3 ? colors.brand.ink : "#fff";

  const setRiskView = (level, score) => {
    let bodyColor = "blue";
    let bodyText = "";

    if (level) {
      switch (level) {
        case 5:
          bodyColor = riskFill(5);
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 30-аас дээш хувь";
          break;
        case 4:
          bodyColor = riskFill(4);
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 20-30 хувь";
          break;
        case 3:
          bodyColor = riskFill(3);
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 10-20 хувь";
          break;
        case 2:
          bodyColor = riskFill(2);
          bodyText =
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-10 хувь";
          break;
        case 1:
          bodyColor = riskFill(1);
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
            minHeight: "88px",
            border: `1px solid ${colors.brand.hairline}`,
            borderRadius: radius.md,
            overflow: "hidden",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <span
            style={{
              backgroundColor: bodyColor,
              flex: "0 0 88px",
              color: riskOnFill(level),
              fontWeight: "normal",
              fontSize: "2.2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {score || 0}
          </span>
          <span
            style={{
              margin: "auto 0",
              padding: "12px 16px",
              color: colors.brand.ink,
            }}
          >
            {bodyText}
          </span>
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
                {/* The three sections were floating uppercase pills in cyan,
                    hot pink and forest green riding a grey rule. They are the
                    GroupPanel sections every read-only view uses. */}
                <GroupPanel title="Эмчийн мэдээлэл" level={2}>
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
                </GroupPanel>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <GroupPanel title="Үзлэгийн мэдээлэл" level={2}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "start",
                        gap: "8px",
                        marginBottom: "6px",
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
                </GroupPanel>
              </GridItem>
              <GridItem xs={12} md={12}>
                <GroupPanel title="Эрсдлийн үнэлгээ" level={2}>
                  {/* Legend: a swatch and its band on one unbreakable line,
                      the pairs wrapping as a whole on a phone. The labels
                      used to break under their own swatches. */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "8px 16px",
                      margin: "8px 0 16px",
                      color: colors.brand.inkMuted,
                    }}
                  >
                    {[
                      [1, <>{"<"}5%</>],
                      [2, <>5% {"<"} 10%</>],
                      [3, <>10% {"<"} 20%</>],
                      [4, <>20% {"<"} 30%</>],
                      [5, <>≥30%</>],
                    ].map(([level, label]) => (
                      <span
                        key={level}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: "20px",
                            height: "12px",
                            borderRadius: radius.xs,
                            backgroundColor: riskFill(level),
                          }}
                        />
                        {label}
                      </span>
                    ))}
                  </div>
                  {Data.Risk && setRiskView(Data.Risk.Risk, Data.Risk.Score)}
                </GroupPanel>
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
