import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme/colors";
import { radius, space, elevation, motion } from "@/theme/tokens";

export const FEED_TABS = [
  { key: "all", label: "Бүгд" },
  { key: "open", label: "Нээлттэй" },
  { key: "closed", label: "Хаагдсан" },
  { key: "mine", label: "Миний" },
  { key: "drafts", label: "Миний ноорог" },
];

/**
 * Tabs and search, pinned to the top of the feed column.
 *
 * "Миний ноорог" is not decoration. Drafts no longer appear on the shared wall,
 * so this tab is the only route back to them - 25 exist today and none of them
 * were ever published.
 */
export default function FilterBar({
  filter,
  onFilter,
  search,
  onSearch,
  draftCount,
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(search || "");

  // Debounced: the search hits the DB with a leading-wildcard LIKE, so firing
  // it per keystroke would scan the table on every letter.
  useEffect(() => {
    const id = setTimeout(() => {
      if (text !== search) onSearch(text);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: space[2],
        flexWrap: "wrap",
        mb: space[4],
        p: space[2],
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "2px",
          flexWrap: "wrap",
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        {FEED_TABS.map((tab) => {
          const active = tab.key === filter;
          return (
            <Box
              key={tab.key}
              component="button"
              type="button"
              onClick={() => onFilter(tab.key)}
              aria-pressed={active}
              sx={{
                border: "none",
                cursor: "pointer",
                font: "inherit",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                px: space[3],
                py: space[2],
                borderRadius: radius.sm,
                whiteSpace: "nowrap",
                transition: `background-color ${motion.fast}, color ${motion.fast}`,
                backgroundColor: active ? colors.brand.tint : "transparent",
                color: active ? colors.brand.cyanInk : colors.brand.inkDim,
                "&:hover": { backgroundColor: colors.brand.tint },
                "&:focus-visible": {
                  outline: `2px solid ${colors.brand.focus}`,
                  outlineOffset: "1px",
                },
              }}
            >
              {t(tab.label)}
              {tab.key === "drafts" && draftCount ? (
                <Box
                  component="span"
                  sx={{
                    ml: space[2],
                    px: "6px",
                    borderRadius: radius.pill,
                    backgroundColor: colors.brand.cyanInk,
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {draftCount}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[2],
          px: space[3],
          minWidth: "180px",
          flex: "0 1 240px",
          height: "32px",
          borderRadius: radius.sm,
          border: `1px solid ${colors.brand.hairline}`,
          "&:focus-within": { borderColor: colors.brand.cyan },
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: colors.brand.inkDim }} />
        <InputBase
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Тасалбар хайх")}
          inputProps={{ "aria-label": t("Тасалбар хайх") }}
          sx={{ flex: 1, fontSize: "14px", color: colors.brand.ink }}
        />
      </Box>
    </Box>
  );
}
