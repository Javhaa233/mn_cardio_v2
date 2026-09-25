import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import StatusChip from "customComponents/StatusChip";
import { SESSION_STATUS } from "./rehabLabels";

/**
 * The three cells that turn the monitoring list from "who is on my list" into
 * "who needs me today".
 *
 * All three read values the controller attaches per page in two batched queries
 * (AttachRosterColumns). Nothing here fetches - a cell renderer runs once per
 * visible row, and the export runs it with no row limit.
 */

/** Days since a date, or null when there is no date. */
function DaysSince(Value) {
  if (!Value) return null;
  const Then = new Date(Value);
  if (Number.isNaN(Then.getTime())) return null;
  return Math.floor((Date.now() - Then.getTime()) / 86400000);
}

/**
 * How long since anyone said anything, in either direction.
 *
 * Shown as elapsed time rather than a date because the question a doctor is
 * asking is "has this gone quiet", and answering it from a raw date means
 * doing the subtraction in their head for every row.
 */
export function LastContactCell({ rowdata = null }) {
  const Value = rowdata && rowdata.LastContact;
  if (!Value) {
    return (
      <Typography
        variant="caption"
        component="span"
        sx={{ color: colors.brand.inkDim }}
      >
        —
      </Typography>
    );
  }

  const Days = DaysSince(Value);
  const Exact = Helper.ObjectHelper.getDateYMD({ DateStr: Value });
  const Label =
    Days === null
      ? Exact
      : Days === 0
        ? "Өнөөдөр"
        : Days === 1
          ? "Өчигдөр"
          : Days < 30
            ? Days + " хоног"
            : Days < 365
              ? Math.floor(Days / 30) + " сар"
              : Math.floor(Days / 365) + " жил";

  return (
    <Tooltip title={Exact} placement="top-start">
      <Typography
        variant="caption"
        component="span"
        // Over a year of silence is worth noticing, but it is the common case
        // in this data and must not shout - dim, not red.
        sx={{ color: Days > 365 ? colors.brand.inkDim : colors.brand.ink }}
      >
        {Label}
      </Typography>
    </Tooltip>
  );
}

/**
 * How many patient messages have arrived since the doctor last answered.
 *
 * NOT the size of the thread. The badge this sits beside counts every comment
 * including the doctor's own, so a well-answered patient and an ignored one
 * look identical. Zero renders as nothing at all: a column of noughts is a
 * column of noise, and the whole point is that a number here means act.
 */
export function AwaitingReplyCell({ rowdata = null }) {
  const N = (rowdata && Number(rowdata.AwaitingReply)) || 0;
  if (!N) return null;

  return (
    <Tooltip title={"Хариу хүлээж буй " + N + " мессеж"} placement="top-start">
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 22,
          height: 22,
          px: 0.75,
          borderRadius: radius.pill,
          // The one saturated colour on this grid, on the one thing that is a
          // request for action.
          backgroundColor: colors.brand.urgent,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {N}
      </Box>
    </Tooltip>
  );
}

/**
 * The patient's own most recent reading.
 *
 * Self-reported between visits, which is exactly why it belongs on a MONITORING
 * list - it is the only number on this screen the doctor did not measure
 * themselves. Deliberately not colour-coded against a threshold: what counts as
 * high depends on the patient, and a red cell next to a name is a clinical
 * claim this screen is not entitled to make.
 */
export function LastReadingCell({ rowdata = null }) {
  const R = rowdata && rowdata.LastReading;
  const BP =
    R && R.BloodPressure && R.BloodPressure !== "/" ? R.BloodPressure : "";
  const Pulse = R && R.Pulse ? R.Pulse : "";

  if (!BP && !Pulse) {
    return (
      <Typography
        variant="caption"
        component="span"
        sx={{ color: colors.brand.inkDim }}
      >
        —
      </Typography>
    );
  }

  const When =
    R && R.Date ? Helper.ObjectHelper.getDateYMD({ DateStr: R.Date }) : "";

  return (
    <Tooltip
      title={
        (BP ? "Даралт " + BP : "") +
        (Pulse ? (BP ? " · " : "") + "Судас " + Pulse : "") +
        (When ? " · " + When : "")
      }
      placement="top-start"
    >
      <Typography
        variant="caption"
        component="span"
        sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
      >
        {BP || "—"}
        {Pulse ? (
          <Box component="span" sx={{ color: colors.brand.inkDim }}>
            {" · " + Pulse}
          </Box>
        ) : null}
      </Typography>
    </Tooltip>
  );
}

/**
 * Rehab at a glance: the programme and day, or how the last session ended.
 *
 * A stop from the symptom sheet is the one state that is red - the patient
 * chose chat over a push for stops, so this list is where the doctor meets it.
 * Nothing (a dash) for a patient with no plan and no sessions.
 */
export function RehabCell({ rowdata = null }) {
  const R = rowdata && rowdata.Rehab;
  if (!R) {
    return (
      <Typography
        variant="caption"
        component="span"
        sx={{ color: colors.brand.inkDim }}
      >
        —
      </Typography>
    );
  }

  const Last = R.lastSessionAt
    ? Helper.ObjectHelper.getDateYMD({ DateStr: R.lastSessionAt })
    : "";
  const Title =
    (R.programName ? R.programName : "Хөтөлбөргүй") +
    (R.dayNo ? " · " + R.dayNo + "-р өдөр" : "") +
    (R.planStatus === "paused" ? " · Түр зогссон" : "") +
    (Last
      ? " · Сүүлийн дасгал " +
        Last +
        " (" +
        (SESSION_STATUS[R.lastStatus] || "") +
        ")"
      : "");

  let Tone = "info";
  let Label = R.programCode || R.programName || "Хөтөлбөргүй";
  if (R.stoppedWithSymptoms) {
    Tone = "danger";
    Label = "Зогсоосон";
  } else if (R.planStatus === "paused") {
    Tone = "warning";
  } else if (!R.planId) {
    Tone = "neutral";
  }
  if (!R.stoppedWithSymptoms && R.dayNo && R.planId) Label += " · " + R.dayNo;

  return (
    <Tooltip title={Title} placement="top-start">
      <span>
        <StatusChip Tone={Tone} Label={Label} />
      </span>
    </Tooltip>
  );
}
