import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha, styled } from "@mui/material/styles";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { colors } from "@/theme/colors";
import Helper from "helper";
import T from "components/Navbars/topBarTokens";

const RegistrationNumberRegex = /^[А-Яа-яA-Za-z]{2}[0-9]{8}$/;

/**
 * Register-number search for the admin top bar.
 *
 * Collapsed it is a 36x36 icon button, identical in size to every other control
 * in the bar. Clicking it animates the SAME element out to a full field, so the
 * search icon never jumps: only the container's width changes, and because the
 * bar's left group is left-anchored with a flex spacer after it, nothing else in
 * the bar moves.
 *
 * The old version was a fixed 192px field plus a 100px "Search" button - ~292px
 * permanently competing for width with the right-hand cluster, with no fallback
 * at any viewport. Enter plus the persistent leading icon carry the affordance
 * the button used to.
 *
 * Searches by register number only. Validation is unchanged.
 */
const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "expanded" && prop !== "hasError",
})(({ theme, expanded, hasError }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  flex: "0 0 auto",
  height: T.button,
  width: expanded ? T.searchWidth : T.button,
  padding: expanded ? "0 4px 0 8px" : 0,
  justifyContent: expanded ? "flex-start" : "center",
  boxSizing: "border-box",
  borderRadius: T.radius,
  cursor: expanded ? "text" : "pointer",
  backgroundColor: expanded ? colors.background.primary : "transparent",
  border: expanded
    ? `1px solid ${hasError ? colors.input.error : colors.border.default}`
    : "1px solid transparent",
  transition: theme.transitions.create(
    ["width", "background-color", "border-color", "padding"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    },
  ),
  willChange: "width",

  "&:hover": {
    backgroundColor: expanded
      ? colors.background.primary
      : colors.background.hover,
    borderColor: expanded
      ? hasError
        ? colors.input.error
        : colors.input.borderHover
      : "transparent",
  },

  // Collapsed, the whole 36px box is the focus target.
  "&:focus": { outline: "none" },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },

  // Only once open - collapsed, Root itself holds focus and would otherwise
  // paint a field border around a plain icon button.
  ...(expanded && {
    "&:focus-within": {
      borderColor: hasError ? colors.input.error : theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(
        hasError ? colors.input.error : theme.palette.primary.main,
        0.12,
      )}`,
    },
  }),

  [theme.breakpoints.down("md")]: {
    width: expanded ? T.searchWidthSm : T.button,
  },

  // Same touch size as TopBarIconButton, so the bar stays one height of control.
  "@media (pointer: coarse)": {
    height: T.buttonTouch,
    ...(!expanded && { width: T.buttonTouch }),
  },
}));

const Input = styled("input")({
  flex: 1,
  minWidth: 0,
  height: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "0 4px",
  fontSize: 14,
  fontFamily: "inherit",
  color: colors.text.primary,
  "&::placeholder": { color: colors.input.placeholder },
});

export default function PatientSearch(props) {
  const { t } = useTranslation();
  const { Search, onExpandedChange } = props;

  const RegisterNo = Helper.BaseHelper.getUrlParam(
    decodeURI(document.location.href),
    "RegisterNo",
  );

  const [SearchText, setSearchText] = useState(
    RegisterNo ? RegisterNo.replace(/\s/g, "").toUpperCase() : "",
  );
  // Seeded open when the URL already carries a register number, so the doctor
  // can see what the current page is showing.
  const [expanded, setExpanded] = useState(Boolean(RegisterNo));
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  const setExpandedState = (next) => {
    setExpanded(next);
    onExpandedChange && onExpandedChange(next);
  };

  const expand = () => {
    if (expanded) return;
    setExpandedState(true);
    // Select rather than just focus, so a value seeded from ?RegisterNo= is
    // replaced by typing instead of appended to.
    window.requestAnimationFrame(() => {
      inputRef.current && inputRef.current.focus();
      inputRef.current && inputRef.current.select();
    });
  };

  const collapse = () => {
    setError(null);
    setExpandedState(false);
    window.requestAnimationFrame(() => {
      triggerRef.current && triggerRef.current.focus();
    });
  };

  // Ctrl+K. Guarded against firing while the doctor is typing in a form - this
  // app has screens with several hundred fields.
  useEffect(() => {
    const onKey = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k")
        return;
      const el = event.target;
      const tag = el && el.tagName ? el.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || (el && el.isContentEditable))
        return;
      event.preventDefault();
      expand();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const GetSearch = () => {
    const formatted = SearchText.replace(/\s/g, "").toUpperCase();
    setSearchText(formatted);

    if (formatted.length !== 10) {
      setError(t("Регистрийн дугаар 10 тэмдэгт байх ёстой"));
    } else if (RegistrationNumberRegex.test(formatted)) {
      setError(null);
      Search && Search(formatted);
    } else {
      setError(
        t("Регистрийн дугаар буруу байна (Эхний 2 үсэг, дараа нь 8 тоо)"),
      );
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      GetSearch();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      // Two-stage: clear first, collapse second. A single-press collapse would
      // silently discard nine of ten typed characters.
      if (SearchText) {
        setSearchText("");
        setError(null);
      } else {
        collapse();
      }
    }
  };

  const root = (
    <Root
      expanded={expanded}
      hasError={Boolean(error)}
      ref={triggerRef}
      onClick={expanded ? undefined : expand}
      tabIndex={expanded ? -1 : 0}
      role={expanded ? undefined : "button"}
      aria-label={expanded ? undefined : t("Search by register number")}
      onKeyDown={
        expanded
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                expand();
              }
            }
      }
      onBlur={(event) => {
        // Collapse on click-away only when empty - a doctor who tabs away
        // mid-entry must not lose a half-typed register number.
        if (
          expanded &&
          !SearchText &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setExpandedState(false);
      }}
    >
      <SearchOutlinedIcon
        sx={{
          fontSize: T.icon,
          flex: "0 0 auto",
          color: expanded ? colors.text.muted : colors.text.strong,
        }}
      />

      <Fade
        in={expanded}
        timeout={150}
        style={{ transitionDelay: expanded ? "60ms" : "0ms" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            // Collapsed the field must take no width at all, or it would push
            // the icon off-centre inside the 36px box.
            flex: expanded ? 1 : "0 0 0px",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Input
            ref={inputRef}
            value={SearchText}
            maxLength={10}
            placeholder={t("Personal number")}
            aria-label={t("Search by register number")}
            aria-invalid={Boolean(error)}
            tabIndex={expanded ? 0 : -1}
            onChange={(event) => {
              setSearchText(event.target.value);
              error && setError(null);
            }}
            onKeyDown={onKeyDown}
          />
          {SearchText ? (
            <IconButton
              size="small"
              aria-label={t("Clear")}
              tabIndex={expanded ? 0 : -1}
              onClick={() => {
                setSearchText("");
                setError(null);
                inputRef.current && inputRef.current.focus();
              }}
              sx={{
                width: T.searchClear,
                height: T.searchClear,
                flex: "0 0 auto",
                "& .MuiSvgIcon-root": { fontSize: 16 },
              }}
            >
              <CloseOutlinedIcon />
            </IconButton>
          ) : null}
        </Box>
      </Fade>

      {error && expanded ? (
        <Box
          role="alert"
          sx={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1,
            maxWidth: 320,
            padding: "6px 10px",
            borderRadius: "6px",
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.input.error}`,
            boxShadow: `0 4px 12px ${colors.shadow.light}`,
            color: colors.input.error,
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {error}
        </Box>
      ) : null}
    </Root>
  );

  if (expanded) return root;

  return (
    <Tooltip
      title={t("Search by register number")}
      placement="bottom"
      arrow
      enterDelay={400}
    >
      {root}
    </Tooltip>
  );
}
