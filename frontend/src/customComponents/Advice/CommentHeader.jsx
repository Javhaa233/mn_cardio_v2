import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
// custom components
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import PostMedia from "customComponents/AdviceFeed/PostMedia";
import {
  statusAccent,
  statusLabel,
} from "customComponents/AdviceFeed/ticketStatus";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

/**
 * The ticket itself, at the top of the detail page.
 *
 * Rebuilt to read like the feed card the reader just clicked, because it IS the
 * same ticket and the two screens used to look like different products. It also
 * absorbed the old right-hand doctor rail: organisation, place and the view /
 * reply counts belong to the ticket, and the rail hid all of them whenever the
 * author happened to have no DoctorsProfile row.
 *
 * Three things changed beyond colour:
 *
 * 1. The patient is a PILL, not a prefix. This used to render
 *    `"45,Эрэгтэй: <body>"` as one string, which made every ticket open with a
 *    fragment of demographics glued to the front of the clinical text.
 * 2. The ticket's own attachments render, via the feed's PostMedia grid. They
 *    were never shown here at all - the payload did not even carry them.
 * 3. The body is NOT clamped. The feed card clamps to six lines because it is a
 *    summary; this page is where the reader came to read the whole thing.
 */
export default function CommentHeader(props) {
  const { t } = useTranslation();
  const { Data = null } = props;

  if (!Data) return <div></div>;

  const dp = Data.DoctorsProfile || {};
  const name =
    (Data.Users && Data.Users.UserName) ||
    dp.FullName ||
    [dp.lastname, dp.firstname].filter(Boolean).join(" ") ||
    "—";

  const place = [
    dp.Organization && dp.Organization.Name,
    Data.DictProvinceCity && Data.DictProvinceCity.name,
    Data.DictSoumDistrict && Data.DictSoumDistrict.name,
  ]
    .filter(Boolean)
    .map((s) => t(s))
    .join("  ·  ");

  const patientBits = [];
  if (Data.Patient && Data.Patient.p_birthday) {
    patientBits.push(
      Helper.ObjectHelper.GetAgeDateStr(Data.Patient.p_birthday),
    );
  }
  if (Data.Patient && Data.Patient.p_gender) {
    patientBits.push(Helper.ObjectHelper.getGenderLabel(Data.Patient.p_gender));
  }

  const hasBody = !!(Data.Body && String(Data.Body).replace(/\s/g, "").length);
  const label = statusLabel(Data, t);

  return (
    <Box>
      {/* Author */}
      <Box sx={{ display: "flex", alignItems: "center", gap: space[3] }}>
        <Avatar
          src={(dp.Files && dp.Files[0] && dp.Files[0].FileSrc) || undefined}
          sx={{
            width: 44,
            height: 44,
            border: `1px solid ${colors.brand.hairline}`,
            backgroundColor: colors.brand.tint,
            color: colors.brand.cyanInk,
          }}
        >
          {name.slice(0, 1).toUpperCase()}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: space[2],
              flexWrap: "wrap",
            }}
          >
            <UserDialogLink UserId={Data.Users ? Data.Users.Id : null}>
              <Typography
                component="div"
                variant="h4"
                sx={{ color: colors.brand.ink }}
              >
                Dr. {name}
              </Typography>
            </UserDialogLink>
            {label ? (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: space[1],
                  px: space[2],
                  py: "2px",
                  borderRadius: radius.pill,
                  backgroundColor: colors.brand.tint,
                  color: colors.brand.cyanInk,
                  fontSize: "11px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {/* The dot carries the state's colour. The word next to it
                    stays cyanInk: statusAccent returns cyan and urgent, and
                    neither is legible as text. */}
                <Box
                  component="span"
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: statusAccent(Data),
                  }}
                />
                {label}
              </Box>
            ) : null}
          </Box>
          <Typography variant="caption" sx={{ color: colors.brand.inkDim }}>
            {Data.date_creation}
            {place ? "  ·  " + place : ""}
          </Typography>
        </Box>
      </Box>

      {patientBits.length ? (
        <Box
          sx={{
            display: "inline-block",
            mt: space[3],
            px: space[3],
            py: "3px",
            borderRadius: radius.pill,
            backgroundColor: colors.brand.tint,
            color: colors.brand.cyanInk,
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {patientBits.join("  ·  ")}
        </Box>
      ) : null}

      {hasBody ? (
        <Typography
          variant="body1"
          sx={{
            mt: space[3],
            color: colors.brand.ink,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {Data.Body}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          sx={{ mt: space[3], color: colors.brand.inkDim, fontStyle: "italic" }}
        >
          {t("Тайлбар бичээгүй")}
        </Typography>
      )}

      <PostMedia
        Files={Data.Files}
        FileTotal={Data.FileTotal}
        FullBleedMargin="0px"
      />

      {/* The counts the right rail used to hold. They describe the ticket, not
          its author, which is why they now live with it. */}
      <Typography
        variant="caption"
        sx={{ display: "block", mt: space[3], color: colors.brand.inkDim }}
      >
        {(Data.CommentQty || 0) + " " + t("хариулт")}
        {"  ·  "}
        {(Data.ViewQty || 0) + " " + t("үзсэн")}
      </Typography>
    </Box>
  );
}
