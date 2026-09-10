import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import Helper from "helper";
import { StatTile, TilePanel } from "customComponents/Home/Tiles";
import { space } from "@/theme/tokens";

/**
 * "My work today" - the question a doctor actually opens the app with.
 *
 * Three independent counts. There is no dedicated endpoint for this: there is
 * no VisitHelper, VisitController has nothing date- or doctor-scoped, and the
 * two DashboardController stored procs return chart series rather than scalars.
 * So each number is one BaseGetList with Limit 1, read off Option.Total.
 *
 * Three counts, three states, three requests - deliberately not awaited in
 * sequence, so one slow query cannot hold the other two numbers hostage.
 */

const EMPTY = { loading: true, error: false, value: null };

/**
 * Today as a DATETIME range.
 *
 * getDateYMD alone gives 'YYYY-MM-DD', and BETWEEN two bare dates against a
 * DATETIME column matches midnight only - so a single-day filter would report 0
 * all day. The existing RangeDate callers get away with bare dates because they
 * always span more than one.
 */
const todayRange = () => {
  const d = Helper.ObjectHelper.getDateYMD();
  return [d + " 00:00:00", d + " 23:59:59"];
};

/**
 * One count = one list request with Limit 1, reading Option.Total.
 *
 * OrderBy is NOT optional. ModelHelper builds the COUNT by stripping
 * 'ORDER BY ... OFFSET n ROWS FETCH NEXT n ROWS ONLY' off the generated SQL.
 * With no ORDER BY the mssql dialect can emit SELECT TOP(1) instead, the strip
 * misses, and Total comes back as 1 for every user.
 */
const countOf = (ObjectName, SearchField, done) => {
  const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  SearchOption.PageOption = { Page: 0, Limit: 1 };
  SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
  SearchOption.SearchField = SearchField;

  Helper.BaseCrudHelper.BaseGetList({ ObjectName, SearchOption }, (resData) => {
    if (!resData || resData.Success === false) {
      done({ loading: false, error: true, value: null });
      return;
    }
    const Total = resData.Option ? resData.Option.Total : 0;
    // 0 is an answer, not a gap - coerce so the tile prints "0", not an em dash.
    done({ loading: false, error: false, value: Number(Total) || 0 });
  });
};

const NO_USER = { loading: false, error: true, value: null };

export default function HomeWorkToday({ compact = false }) {
  const { t } = useTranslation();

  // Read once, lazily. GetLogedUserLocal returns null on an expired session, and
  // deriving the initial state from it here means the "no user" case never has
  // to setState from inside the effect.
  const [me] = useState(() => {
    const User = Helper.AuthHelper.GetLogedUserLocal();
    return (User && User.Id) || null;
  });
  const initial = me ? EMPTY : NO_USER;

  const [visits, setVisits] = useState(initial);
  const [patients, setPatients] = useState(initial);
  const [monitored, setMonitored] = useState(initial);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!me) return undefined;

    const [from, to] = todayRange();
    const set = (fn) => (next) => {
      if (alive.current) fn(next);
    };

    // Visit.id and Patient.id ARE the creating user's Users.Id - ModelHelper
    // stamps them on create. Do not use `user_id`: CreateAllVisits filters on
    // it, but it is not a column on the Visit model.
    countOf(
      "Visit",
      [
        { Field: "id", Value: me, Op: "Equals" },
        { Field: "visit_date", Value: [from, to], Op: "Between" },
      ],
      set(setVisits),
    );

    // ObjectName "Patient" must keep the default FindType "AllData":
    // AddOrgFilter injects $Users.Id$ / $Users.RoleId$ predicates that only
    // resolve against Patient.findAllNew's Users include.
    countOf(
      "Patient",
      [
        { Field: "id", Value: me, Op: "Equals" },
        { Field: "date_creation", Value: [from, to], Op: "Between" },
      ],
      set(setPatients),
    );

    countOf(
      "PatientMonitoringDoctor",
      [
        { Field: "user_id", Value: me, Op: "Equals" },
        { Field: "is_active", Value: "1", Op: "Equals" },
      ],
      set(setMonitored),
    );

    return () => {
      alive.current = false;
    };
  }, [me]);

  const stats = [
    {
      Title: t("Өнөөдрийн үзлэг"),
      state: visits,
      To: "/admin/CreateAllVisits",
    },
    {
      Title: t("Шинэ иргэн"),
      state: patients,
      To: "/admin/CreatePatients",
    },
    {
      Title: t("Хяналтад"),
      state: monitored,
      To: "/admin/PatientMonitoringDoctor",
    },
  ];

  // Phones: a scroll-snapped strip, the shape this slot already used, so a
  // narrow screen keeps one glanceable row instead of a tall stack.
  if (compact) {
    return (
      <Box
        sx={{
          display: "flex",
          gap: space[3],
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          pb: space[2],
          mb: space[4],
        }}
      >
        {stats.map((s) => (
          <Box
            key={s.Title}
            sx={{ flex: "0 0 150px", scrollSnapAlign: "start" }}
          >
            <StatTile
              Variant="panel"
              Title={s.Title}
              To={s.To}
              Value={s.state.value}
              Loading={s.state.loading}
              Error={s.state.error}
            />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <TilePanel Title={t("Миний өнөөдрийн ажил")} Variant="panel">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: space[3],
        }}
      >
        {stats.map((s) => (
          <StatTile
            key={s.Title}
            Variant="bare"
            Title={s.Title}
            To={s.To}
            Value={s.state.value}
            Loading={s.state.loading}
            Error={s.state.error}
          />
        ))}
      </Box>
    </TilePanel>
  );
}
