import React, { useCallback, useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Avatar from "@mui/material/Avatar";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import UniCard from "customComponents/UniCard";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseNoData from "customComponents/BaseNoData";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";
// helper
import Helper from "helper";

/**
 * 2.1 Миний бүртгэл — the patient's own registration card.
 *
 * Reads /api/patient/me through PatientApiHelper: no patient id travels with
 * the request, the server derives it from the verified token. That is the same
 * surface the mobile app consumes, so this screen keeps it honest.
 *
 * Previously this screen resolved the patient from `localStorage` and returned
 * `null` whenever that lookup came back empty — a blank page with no message
 * and no way forward. Loading, empty and error are now all explicit.
 *
 * Read-only by design for now: prefill from the ХУР state service is blocked on
 * customer credentials, so there is nothing here a patient may edit yet.
 */

const avatarParentStyle = {
  height: 0,
  overflow: "hidden",
  paddingTop: "85%",
  boxSizing: "border-box",
  position: "relative",
};

const avatarStyle = {
  width: "75%",
  verticalAlign: "top",
  position: "absolute",
  top: "5%",
  left: "12.5%",
  height: "88%",
};

const loadingWrapStyle = {
  position: "relative",
  minHeight: "260px",
};

export default function PatientProfile() {
  const { t } = useTranslation();
  // One record with three outcomes, same shape PatientHome uses for its tiles.
  const [Profile, setProfile] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const load = useCallback(
    async (fetcher, setter) => {
      const res = await fetcher();
      if (!res.success) {
        // `message` is already Mongolian when the server produced it; the
        // fallback is there so a bare network failure still says something.
        setter({
          loading: false,
          error: res.message || t("Бүртгэлийн мэдээллийг уншиж чадсангүй"),
          data: null,
        });
        return;
      }
      setter({ loading: false, error: null, data: res.data || null });
    },
    [t],
  );

  useEffect(() => {
    load(() => Helper.PatientApiHelper.GetMe(), setProfile);
  }, [load]);

  // Back to the spinner, then re-read.
  const Retry = useCallback(() => {
    setProfile({ loading: true, error: null, data: null });
    load(() => Helper.PatientApiHelper.GetMe(), setProfile);
  }, [load]);

  const Data = Profile.data;
  const Rows = Data
    ? [
        { Label: t("РД"), Value: Data.p_registration },
        { Label: t("Овог"), Value: Data.p_lastname },
        { Label: t("Нэр"), Value: Data.p_firstname },
        {
          Label: t("Төрсөн огноо"),
          Value: Data.p_birthday
            ? Helper.ObjectHelper.getDateYMD({ DateStr: Data.p_birthday })
            : "",
        },
        { Label: t("Нас"), Value: Data.p_age },
        { Label: t("Утасны дугаар"), Value: Data.p_telephone },
        { Label: t("Нэмэлт утасны дугаар"), Value: Data.p_telephone2 },
        { Label: t("Ажлын газар"), Value: Data.p_workplace },
      ]
    : [];

  const RenderBody = () => {
    if (Profile.loading) {
      return (
        <div style={loadingWrapStyle}>
          <DivLoading WithoutCard />
        </div>
      );
    }

    if (Profile.error) {
      return <LoadError Message={Profile.error} Retry={Retry} />;
    }

    if (!Data || Rows.every((row) => !row.Value)) {
      return <BaseNoData Text={t("Бүртгэлийн мэдээлэл олдсонгүй")} />;
    }

    return (
      <GridContainer>
        <GridItem xs={12} sm={2} md={2}>
          <div style={avatarParentStyle}>
            <Avatar style={avatarStyle} />
          </div>
        </GridItem>
        <GridItem xs={12} sm={10} md={10}>
          <GridContainer>
            {Rows.map((row) => (
              <GridItem xs={12} sm={12} md={12} key={row.Label}>
                <BaseInfo
                  Label={row.Label}
                  Value={row.Value ? row.Value + "" : ""}
                  Size="14px"
                  md={3.6}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
              </GridItem>
            ))}
          </GridContainer>
        </GridItem>
      </GridContainer>
    );
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <UniCard color="info" title={t("Миний бүртгэл")}>
          {RenderBody()}
        </UniCard>
      </GridItem>
    </GridContainer>
  );
}
