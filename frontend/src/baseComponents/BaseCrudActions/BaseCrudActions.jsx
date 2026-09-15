import { withTranslation } from "react-i18next";
import { Component } from "react";
// @mui/material components
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ImportExportIcon from "@mui/icons-material/ImportExport";

import { colors } from "@/theme/colors";
import { radius, motion } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * The toolbar above every BaseCrudManager list.
 *
 * Three things changed here, all visual:
 *
 * 1. Rank. `Шинэ` is the reason a CRUD screen exists, so it is the one filled
 *    button; Export and the Search button are outlined. Before, New was purple,
 *    Export green and Search MUI-blue, all filled, so the bar had no focal
 *    point at all.
 * 2. The buttons were `components/CustomButtons/Button` given
 *    `variant="contained" size="sm" color="primary"`. That wrapper intercepts
 *    `color` but forwards `variant`, so MUI painted a blue contained background
 *    and the wrapper painted purple over it; `size="sm"` is not a MUI size and
 *    did nothing. They are plain MUI Buttons now.
 * 3. The whole render was duplicated - once as a flex row for `noWrapper`, once
 *    inside GridContainer/GridItem. Only the flex row was ever reached from the
 *    list screens. The copy is gone.
 */
class BaseCrudActions extends Component {
  constructor(props) {
    super(props);
    this.state = { SearchText: "", exportLoading: false };
  }

  render() {
    const { exportLoading, SearchText } = this.state;
    const {
      t,
      New,
      HideNew = false,
      Export,
      HideExport = false,
      HideSearchText,
      Search,
      extraActions,
    } = this.props;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!HideNew && (
            // Inside a detail page the bar also carries the record's Save
            // (extraActions). Save is then the one filled button; a new child
            // row is secondary, or the bar has two primaries side by side.
            <Button
              variant={extraActions ? "outlined" : "contained"}
              onClick={() => New && New()}
              startIcon={<AddIcon />}
              sx={
                extraActions
                  ? gridToolbarButtonSx.neutral
                  : gridToolbarButtonSx.primary
              }
            >
              {t("New")}
            </Button>
          )}
          {!HideExport && (
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ exportLoading: true });
                Export && Export();
              }}
              disabled={exportLoading}
              // The spinner replaces the icon in place. It used to be an
              // absolutely-positioned green ring floating over the label.
              startIcon={
                exportLoading ? (
                  <CircularProgress size={14} thickness={5} color="inherit" />
                ) : (
                  <ImportExportIcon />
                )
              }
              sx={gridToolbarButtonSx.neutral}
            >
              {t("Export")}
            </Button>
          )}
          {extraActions && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {extraActions}
            </div>
          )}
        </div>

        {HideSearchText === true ? null : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
            }}
          >
            <TextField
              placeholder={t("Search field") + "..."}
              value={SearchText}
              onKeyDown={(event) =>
                event.key === "Enter" && Search && Search(event.target.value)
              }
              onChange={(event) =>
                this.setState({ SearchText: event.target.value })
              }
              variant="outlined"
              // Matches the grid's per-column filter inputs one row below, so
              // the two search affordances read as the same control.
              sx={{
                margin: "0 !important",
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  borderRadius: radius.xs,
                  backgroundColor: colors.brand.surface,
                  fontSize: "13px",
                  transition: `box-shadow ${motion.fast}`,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.input.borderHover },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${colors.brand.focus}`,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.brand.cyanDeep,
                    borderWidth: "1px",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.5 }}>
                    <SearchIcon
                      sx={{ fontSize: "16px", color: colors.text.secondary }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={() => Search && Search(SearchText)}
              startIcon={<SearchIcon />}
              sx={{ ...gridToolbarButtonSx.neutral, minWidth: "92px" }}
            >
              {t("Search")}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(BaseCrudActions);
