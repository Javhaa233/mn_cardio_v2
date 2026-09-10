import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import Helper from "helper";
import { ListTile } from "customComponents/Home/Tiles";
import { colors } from "@/theme/colors";
import customHistory from "customHistory";

/**
 * Unread notifications on the home rail.
 *
 * UNREAD ONLY, deliberately: the top bar bell already shows the last ten
 * regardless of read state, and a second identical list on the same screen is
 * exactly the duplication this page was cleaned up to remove. Unread is the one
 * cut the bell does not offer.
 *
 * Rows are rendered inline rather than through NotificationListItem, which
 * hardcodes five hex values and pulls in CustomBadge - both against the
 * one-palette rule.
 */
const LIMIT = 5;

export default function HomeNotifications() {
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
    SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    SearchOption.SearchField = [
      { Field: "ToUserId", Value: me, Op: "Equals" },
      // "null" is a real sentinel in ModelHelper, mapping to IS NULL. Unread
      // rows keep Seen NULL; Seen is only ever written as "1".
      { Field: "Seen", Value: "null", Op: "Equals" },
    ];

    Helper.NotificationHelper.GetListData(SearchOption, (resData) => {
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

  const open = (item) => {
    Helper.NotificationHelper.Seen(item, () => {
      // Url is server-supplied. Only relative paths can go through the router;
      // an absolute one would push a broken in-app route.
      if (item.Url && String(item.Url).startsWith("/")) {
        customHistory.push(item.Url);
      } else if (item.Url) {
        document.location = item.Url;
      }
    });
  };

  return (
    <ListTile
      Variant="panel"
      Title={t("Мэдэгдэл")}
      Loading={state.loading}
      Error={state.error}
      Items={state.items}
      OnItemClick={open}
      // An empty inbox is a good state, not a failure - keep it quiet.
      EmptyText={t("Уншаагүй мэдэгдэл алга")}
      MaxHeight="220px"
      Footer={
        <Box
          onClick={() => customHistory.push("/admin/AllNotifications")}
          sx={{
            fontSize: "12px",
            color: colors.brand.cyanInk,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {t("All Notifications")}
        </Box>
      }
      RenderItem={(item) => (
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: colors.text.primary,
            }}
          >
            {item.Notes}
          </Box>
          <Box sx={{ fontSize: "11px", color: colors.text.muted, mt: "2px" }}>
            {item.CreateDoctorsProfile
              ? item.CreateDoctorsProfile.FullName
              : ""}
          </Box>
        </Box>
      )}
    />
  );
}
