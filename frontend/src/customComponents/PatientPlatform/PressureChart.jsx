import React, { useCallback, useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
// custom components
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";
// theme
import { colors } from "@/theme/colors";
// helper
import Helper from "helper";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

/**
 * PressureChart - the chart half of "2.2 Миний тэмдэглэл".
 *
 * The tender's acceptance criterion for the daily health log is that entries
 * "график хэлбэрээр харагдана", so this component is the deliverable rather
 * than decoration around the list.
 *
 * It reads through Helper.PatientApiHelper.GetJournalSummary, the same
 * /api/patient surface the mobile app will consume. That endpoint already
 * shapes the response as { labels, series } precisely so the client does no
 * aggregation - and it derives the patient from the verified token, so no
 * patient identifier is sent from here.
 *
 * DUAL-SOURCE, added for the doctor's monitoring workspace. Given a PatientId
 * it reads GET /api/doctor/monitoring/:id/journal instead, which returns the
 * SAME { labels, series } shape - so nothing below this line changes. Without
 * one it behaves exactly as before, patient-token-scoped. The doctor route is
 * access-audited and capped at 365 rows; a legacy
 * POST /PatientMonitoring/getPressureChartData returns a similar shape and is
 * neither, which is why it stays unused.
 *
 * A doctor who is not monitoring this patient gets NOT_MONITORED, and that is
 * a stated reason rather than a failure - see the message branch below.
 *
 * Every outcome is drawn: loading, load failure with a retry, an empty log,
 * and the chart itself. Previously only the last one existed, and a response
 * that was not an array replaced the chart's { labels, datasets } shape with
 * a bare [], which chart.js cannot render.
 */

// PatientMonitoring stores its measurements as strings, so the series arrive
// as strings and chart.js needs numbers. Anything unparseable becomes a gap
// rather than a zero, which would otherwise read as a real measurement.
const ToNumbers = (Values) =>
  Array.isArray(Values)
    ? Values.map((Value) => {
        const Parsed = parseFloat(Value);
        return Number.isFinite(Parsed) ? Parsed : null;
      })
    : [];

const HasValue = (Values) => Values.some((Value) => Value !== null);

const CHART_HEIGHT = "280px";

export default function PressureChart({ RefreshKey, PatientId = null }) {
  const { t } = useTranslation();

  const [State, setState] = useState({
    isLoading: true,
    LoadFailed: false,
    Message: "",
    Summary: null,
  });

  // Fetch and state are kept apart on purpose: this returns the next state
  // rather than writing it, so the effect below only ever calls setState from
  // the resolution callback. A refresh therefore leaves the previous chart on
  // screen instead of flashing a spinner over it - the first render already
  // starts in the loading state, which is the one time a spinner is right.
  const Fetch = useCallback(async () => {
    const Result = PatientId
      ? await Helper.DoctorApiHelper.GetMonitoringJournal(PatientId, {})
      : await Helper.PatientApiHelper.GetJournalSummary({});

    if (!Result || !Result.success) {
      return {
        isLoading: false,
        LoadFailed: true,
        // The monitoring gate is a rule, not a fault. Saying "хяналтад
        // байхгүй" is useful; "Алдаа гарлаа" sends the doctor looking for a
        // bug that is not there.
        Message:
          Result && Result.code === "NOT_MONITORED"
            ? "Энэ иргэн таны хяналтад байхгүй байна"
            : (Result && Result.message) || "",
        Summary: null,
      };
    }

    return {
      isLoading: false,
      LoadFailed: false,
      Message: "",
      Summary: Result.data || null,
    };
  }, [PatientId]);

  const Retry = useCallback(() => {
    setState({
      isLoading: true,
      LoadFailed: false,
      Message: "",
      Summary: null,
    });
    Fetch().then(setState);
  }, [Fetch]);

  useEffect(() => {
    let Cancelled = false;
    Fetch().then((Next) => {
      if (!Cancelled) setState(Next);
    });
    return () => {
      Cancelled = true;
    };
  }, [Fetch, RefreshKey]);

  const { isLoading, LoadFailed, Message, Summary } = State;

  if (isLoading) return <BaseLoading />;

  if (LoadFailed) {
    return (
      <LoadError
        Message={Message || t("Тэмдэглэлийн график ачаалж чадсангүй")}
        Retry={Retry}
      />
    );
  }

  const Labels = Summary && Array.isArray(Summary.labels) ? Summary.labels : [];
  const Series = Summary && Summary.series ? Summary.series : {};

  if (Labels.length === 0) {
    return <BaseNoData Text="Одоогоор бүртгэсэн тэмдэглэл алга байна" />;
  }

  // One dataset per measurement, and only for measurements the patient has
  // actually recorded - an all-empty series would otherwise sit in the legend
  // as a line that never appears.
  const Definitions = [
    {
      Key: "blood_pressure",
      Label: t("Систол даралт (мм.муб)"),
      Color: colors.chart.primary,
    },
    {
      Key: "pulse",
      Label: t("Судасны цохилт (уд/мин)"),
      Color: colors.chart.tertiary,
    },
    {
      Key: "weight",
      Label: t("Жин (кг)"),
      Color: colors.chart.quaternary,
    },
  ];

  const Datasets = Definitions.map((Definition) => ({
    ...Definition,
    Values: ToNumbers(Series[Definition.Key]),
  }))
    .filter((Definition) => HasValue(Definition.Values))
    .map((Definition) => ({
      label: Definition.Label,
      data: Definition.Values,
      fill: false,
      spanGaps: true,
      borderColor: Definition.Color,
      backgroundColor: Definition.Color,
      pointBackgroundColor: Definition.Color,
      pointRadius: 3,
      borderWidth: 2,
      tension: 0.2,
    }));

  if (Datasets.length === 0) {
    return <BaseNoData Text="Одоогоор бүртгэсэн тэмдэглэл алга байна" />;
  }

  const Options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: colors.text.strong, font: { size: 13 } },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: { color: colors.text.secondary, maxRotation: 0 },
        grid: { color: colors.border.subtle },
      },
      y: {
        beginAtZero: false,
        ticks: { color: colors.text.secondary },
        grid: { color: colors.border.subtle },
      },
    },
  };

  return (
    <div style={{ height: CHART_HEIGHT }}>
      <Line data={{ labels: Labels, datasets: Datasets }} options={Options} />
    </div>
  );
}
