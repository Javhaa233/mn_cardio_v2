import React from "react";
import { Link as RouterLink } from "react-router-dom";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
// custom components
import UniCard from "customComponents/UniCard";
// theme
import { colors } from "@/theme/colors";
import { COARSE, TOUCH } from "@/theme.js";
import { radius, space, elevation, motion } from "@/theme/tokens";

/**
 * Home tiles.
 *
 * Built on the existing UniCard rather than a new card system, so a dashboard
 * looks like the rest of the app. Written for the patient home first, but
 * deliberately generic — the role-aware doctor dashboard needs the same three
 * shapes.
 *
 * Every tile handles its own loading and error state, because a dashboard is
 * many independent requests and one slow tile must not blank the page.
 */

/**
 * Three frames, one tile API.
 *
 *   "card"  the original UniCard. PatientHome renders every tile this way and
 *           must stay pixel-identical, so this is the default.
 *   "panel" the flat brand-token panel the home feed rail is built from. Lifted
 *           verbatim from the AnalyticsRail it replaced, so removing that rail
 *           does not change how the page reads. Not CardHeader: that renders a
 *           Creative Tim gradient which would fight the one-palette rule.
 *   "bare"  no frame at all, so several tiles can share one panel instead of
 *           stacking one panel each. This is what keeps a rail short.
 */
/**
 * The focus ring for everything in this file.
 *
 * `colors.brand.focus` is the token for this and is now worth using: it used
 * to be cyan at 55% alpha, which measured 1.73:1 over a white card, and has
 * been corrected to the AA-passing step. See the note on the token itself.
 */
const FOCUS_RING = {
  "&:focus": { outline: "none" },
  "&:focus-visible": {
    outline: `2px solid ${colors.brand.focus}`,
    outlineOffset: "-2px",
    borderRadius: radius.lg,
  },
};

/**
 * A tile that goes somewhere is an anchor, not a div with an onClick.
 *
 * These were bare `<Box onClick>`: no tab stop, no Enter, no focus ring. On
 * the patient home that is the ENTIRE navigation, so the portal could not be
 * used without a mouse at all.
 *
 * An anchor rather than `role="button"` + a keydown handler, because `To` is
 * always a real path: the browser then gives Enter, middle-click,
 * open-in-new-tab and the correct "link" announcement for free, and there is
 * no key handling to get wrong. `customHistory.push` is gone for the same
 * reason - RouterLink already does client-side navigation.
 */
function linkProps(To, Label) {
  if (!To) return {};
  return {
    component: RouterLink,
    to: To,
    "aria-label": Label || undefined,
    sx: {
      display: "block",
      height: "100%",
      textDecoration: "none",
      color: "inherit",
      cursor: "pointer",
      transition: `opacity ${motion.fast}`,
      "&:hover": { opacity: 0.92 },
      ...FOCUS_RING,
    },
  };
}

export function TilePanel({
  Title,
  Color = "info",
  Variant = "card",
  Action,
  children,
}) {
  if (Variant === "bare") return <>{children}</>;

  if (Variant === "panel") {
    return (
      <Box
        sx={{
          backgroundColor: colors.brand.surface,
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: radius.lg,
          boxShadow: elevation[1],
          p: space[4],
          mb: space[4],
          minWidth: 0,
        }}
      >
        {Title ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: space[2],
              mb: space[3],
            }}
          >
            <Typography variant="h4" sx={{ color: colors.brand.ink }}>
              {Title}
            </Typography>
            {Action}
          </Box>
        ) : null}
        {children}
      </Box>
    );
  }

  return (
    <UniCard
      title={Title}
      color={Color}
      cardStyle={{ margin: 0, height: "100%" }}
    >
      {children}
    </UniCard>
  );
}

const TileFrame = TilePanel;

/**
 * A single number with a unit and an optional caption.
 */
export function StatTile({
  Title,
  Value,
  Unit,
  Hint,
  Color,
  Variant,
  Loading,
  Error,
  To,
}) {
  const { t } = useTranslation();

  // Composed deliberately. Without it a screen reader reads the whole card as
  // one link name - title, number, unit and caption run together - which is
  // what wrapping a card in an anchor does by default.
  const label = [
    Title,
    Value === null || Value === undefined || Value === "" ? null : Value,
    Unit,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Box {...(To ? linkProps(To, label) : { sx: { height: "100%" } })}>
      <TileFrame Title={Title} Color={Color} Variant={Variant}>
        {Variant === "bare" && Title ? (
          <Box
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: colors.text.secondary,
              mb: "2px",
            }}
          >
            {Title}
          </Box>
        ) : null}
        {Loading ? (
          <Skeleton variant="text" width="60%" height={38} />
        ) : Error ? (
          <Box sx={{ fontSize: "12.5px", color: colors.label.error }}>
            {t("Мэдээлэл ачаалахад алдаа гарлаа")}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <Box
              sx={{
                // Three bare stats share one narrow rail panel, so the number
                // steps down to fit without wrapping.
                fontSize: Variant === "bare" ? "22px" : "30px",
                fontWeight: 500,
                lineHeight: 1.1,
                color: colors.text.primary,
              }}
            >
              {Value === null || Value === undefined || Value === ""
                ? "—"
                : Value}
            </Box>
            {Unit ? (
              <Box sx={{ fontSize: "13px", color: colors.text.secondary }}>
                {Unit}
              </Box>
            ) : null}
          </Box>
        )}
        {Hint && !Loading && !Error ? (
          <Box
            sx={{
              marginTop: "4px",
              fontSize: "12px",
              color: colors.text.secondary,
            }}
          >
            {Hint}
          </Box>
        ) : null}
      </TileFrame>
    </Box>
  );
}

/**
 * A whole card that navigates somewhere. This is what keeps a sparse role's
 * home from being an empty page.
 */
export function ActionTile({ Title, Description, Icon, To, Color }) {
  return (
    <Box {...linkProps(To, [Title, Description].filter(Boolean).join(". "))}>
      <TileFrame Title={Title} Color={Color}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {Icon ? (
            <Box
              sx={{
                display: "flex",
                color: colors.text.secondary,
                "& svg": { width: "22px", height: "22px" },
              }}
            >
              {Icon}
            </Box>
          ) : null}
          <Box sx={{ fontSize: "12.5px", color: colors.text.secondary }}>
            {Description}
          </Box>
        </Box>
      </TileFrame>
    </Box>
  );
}

/**
 * A short list with its own empty and error states, for recent items.
 */
export function ListTile({
  Title,
  Color,
  Variant,
  Action,
  Footer,
  Loading,
  Error,
  Items,
  RenderItem,
  EmptyText,
  OnItemClick,
  MaxHeight = "260px",
}) {
  const { t } = useTranslation();

  return (
    <TileFrame Title={Title} Color={Color} Variant={Variant} Action={Action}>
      <Box sx={{ maxHeight: MaxHeight, overflowY: "auto" }}>
        {Loading ? (
          <>
            <Skeleton variant="text" height={22} />
            <Skeleton variant="text" height={22} width="80%" />
            <Skeleton variant="text" height={22} width="60%" />
          </>
        ) : Error ? (
          <Box sx={{ fontSize: "12.5px", color: colors.label.error }}>
            {t("Мэдээлэл ачаалахад алдаа гарлаа")}
          </Box>
        ) : !Items || Items.length === 0 ? (
          <Box sx={{ fontSize: "12.5px", color: colors.text.secondary }}>
            {EmptyText || t("Мэдээлэл олдсонгүй")}
          </Box>
        ) : (
          Items.map((item, i) => (
            <Box
              key={i}
              // A row only becomes a control when there is something to
              // activate. Rows without OnItemClick stay inert text and must
              // NOT become tab stops - the patient home's two lists are
              // read-only, and giving every entry a stop would put five dead
              // stops between the reader and the next real control.
              {...(OnItemClick
                ? {
                    role: "button",
                    tabIndex: 0,
                    onClick: () => OnItemClick(item),
                    onKeyDown: (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        // Space scrolls the page otherwise.
                        event.preventDefault();
                        OnItemClick(item);
                      }
                    },
                  }
                : {})}
              sx={{
                padding: "7px 0",
                borderBottom:
                  i === Items.length - 1
                    ? "none"
                    : "1px solid " + colors.border.subtle,
                fontSize: "12.5px",
                color: colors.text.primary,
                cursor: OnItemClick ? "pointer" : "default",
                "&:hover": OnItemClick
                  ? { backgroundColor: colors.background.hover }
                  : undefined,
                ...(OnItemClick
                  ? {
                      // ~26px of text is under the 44px WCAG 2.5.5 asks of a
                      // touch target, and these rows are only targets at all
                      // once they are clickable.
                      [COARSE]: {
                        minHeight: TOUCH.height,
                        display: "flex",
                        alignItems: "center",
                      },
                      ...FOCUS_RING,
                      "&:focus-visible": {
                        ...FOCUS_RING["&:focus-visible"],
                        borderRadius: radius.sm,
                      },
                    }
                  : {}),
              }}
            >
              {RenderItem(item)}
            </Box>
          ))
        )}
      </Box>
      {Footer && !Loading && !Error ? (
        <Box
          sx={{
            mt: "8px",
            pt: "8px",
            borderTop: "1px solid " + colors.border.subtle,
          }}
        >
          {Footer}
        </Box>
      ) : null}
    </TileFrame>
  );
}
