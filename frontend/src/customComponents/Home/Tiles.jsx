import React from "react";
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
import { radius, space, elevation } from "@/theme/tokens";
// history
import customHistory from "customHistory";

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

  const clickable = !!To;

  return (
    <Box
      onClick={clickable ? () => customHistory.push(To) : undefined}
      sx={{
        height: "100%",
        cursor: clickable ? "pointer" : "default",
        "&:hover": clickable ? { opacity: 0.92 } : undefined,
      }}
    >
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
    <Box
      onClick={() => customHistory.push(To)}
      sx={{ height: "100%", cursor: "pointer", "&:hover": { opacity: 0.92 } }}
    >
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
              onClick={OnItemClick ? () => OnItemClick(item) : undefined}
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
