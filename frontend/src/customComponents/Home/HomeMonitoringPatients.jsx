import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import Helper from "helper";
import { ListTile } from "customComponents/Home/Tiles";
import { colors } from "@/theme/colors";
import customHistory from "customHistory";

/**
 * The doctor's own monitoring patients, most recently taken under monitoring
 * first.
 *
 * LIMIT STAYS AT 5. PatientMonitoringController.GetList runs
 * Journal.GetRealJournalData(PatientId) once per returned row, so the row count
 * is a direct multiplier on server work.
 *
 * Ordered by date_creation, not by comment count: CommentQty is typed STRING on
 * the view, so ordering by it would sort "9" above "10".
 */
const LIMIT = 5;

export default function HomeMonitoringPatients() {
  const { t } = useTranslation();
  // Read once, lazily. Deriving the initial state from it means the expired
  // session case never has to setState from inside the effect.
  const [me] = useState(() => {
    const User = Helper.AuthHelper.GetLogedUserLocal();
    return (User && User.Id) || null;
  });
  const [state, setState] = useState({
    loading: !!me,
    error: !me,
    items: [],
  });
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!me) return undefined;

    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.PageOption = { Page: 0, Limit: LIMIT };
    SearchOption.OrderBy = { Field: "date_creation", Type: "desc" };
    SearchOption.SearchField = [
      { Field: "user_id", Value: me, Op: "Equals" },
      { Field: "is_active", Value: "1", Op: "Equals" },
    ];

    Helper.PatientMonitoringHelper.GetList({ SearchOption }, (resData) => {
      if (!alive.current) return;
      if (!resData || resData.Success === false) {
        setState({ loading: false, error: true, items: [] });
        return;
      }
      setState({
        loading: false,
        error: false,
        items: Array.isArray(resData.Data) ? resData.Data : [],
      });
    });

    return () => {
      alive.current = false;
    };
  }, [me]);

  return (
    <ListTile
      Variant="panel"
      Title={t("Хяналтын иргэд")}
      Loading={state.loading}
      Error={state.error}
      Items={state.items}
      EmptyText={t("Хяналтад иргэн алга")}
      MaxHeight="220px"
      OnItemClick={(item) =>
        item.Patient &&
        item.Patient.p_registration &&
        customHistory.push(
          "/admin/PatientInfo?RegisterNo=" + item.Patient.p_registration,
        )
      }
      Footer={
        <Box
          onClick={() => customHistory.push("/admin/PatientMonitoringDoctor")}
          sx={{
            fontSize: "12px",
            color: colors.brand.cyanInk,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {t("Personal monitoring")}
        </Box>
      }
      RenderItem={(item) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: colors.text.primary,
              }}
            >
              {item.Patient ? item.Patient.FullName : ""}
            </Box>
            <Box sx={{ fontSize: "11px", color: colors.text.muted }}>
              {item.Patient ? item.Patient.p_registration : ""}
            </Box>
          </Box>
          {item.vwVisitComments && item.vwVisitComments.CommentQty ? (
            <Box
              sx={{
                flex: "0 0 auto",
                fontSize: "11px",
                color: colors.text.muted,
              }}
            >
              {item.vwVisitComments.CommentQty}
            </Box>
          ) : null}
        </Box>
      )}
    />
  );
}
