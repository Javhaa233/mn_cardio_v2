import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

import baseControlsStyles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";
import { colors } from "@/theme/colors";

class DoctorCrudActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SearchText: "",
      exportLoading: false,
      DoctorId: null,
      UserId: null,
    };
  }

  SetValues = (data) => {
    const t = this.props.t;
    if (data) this.setState({ DoctorId: data.id_data, UserId: data.id });
    else this.setState({ DoctorId: null, UserId: null });
  };

  render() {
    const { exportLoading, DoctorId, UserId, SearchText } = this.state;
    const {
      New,
      Export,
      HideSearchText = false,
      noHorizontalPadding = false,
      t,
    } = this.props;

    return (
      <div>
        <GridContainer
          sx={
            noHorizontalPadding
              ? { margin: 0, width: "100%", maxWidth: "100%" }
              : undefined
          }
          style={{ marginTop: "10px", marginBottom: "1px" }}
        >
          <GridItem
            xs={12}
            md={6}
            sx={noHorizontalPadding ? { padding: 0 } : undefined}
          >
            <Button
              variant="contained"
              size="sm"
              color="primary"
              splice={1}
              onClick={() => New && New()}
              style={{ marginRight: "5px" }}
            >
              <AddIcon style={{ marginRight: "4px" }} /> {t("New")}
            </Button>

            {!this.props.HideExport && (
              <div style={{ position: "relative", display: "inline" }}>
                {/* Secondary: New is the bar's one filled button. */}
                <Button
                  variant="outlined"
                  color="info"
                  size="sm"
                  onClick={() => {
                    this.setState({ exportLoading: true });
                    Export && Export();
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: colors.brand.cyanInk,
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}

            {/* Change password Button */}
            {/* Not destructive - it opens a dialog - so outlined neutral,
                not the template's rose. */}
            <Button
              size="sm"
              color="info"
              onClick={this.props.OnChangePassword}
              disabled={!DoctorId || !UserId}
              style={{ marginLeft: "10px" }}
            >
              <LockOutlinedIcon style={{ marginRight: "4px" }} />
              {t("Change password")}
            </Button>
          </GridItem>

          {HideSearchText === true ? null : (
            <GridItem
              md={6}
              sx={noHorizontalPadding ? { padding: 0 } : undefined}
            >
              <div
                style={{
                  float: "right",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  placeholder={t("Search field") + "..."}
                  onKeyDown={(event) =>
                    event.key === "Enter" &&
                    this.props.SearchText &&
                    this.props.SearchText(SearchText)
                  }
                  onChange={(e) =>
                    this.setState({ SearchText: e.target.value })
                  }
                  sx={{
                    "& .MuiInputBase-input": {
                      ...(baseControlsStyles.input || {}),
                    },
                    "& .MuiInput-underline:before": {
                      borderColor: `${colors.brand.hairlineStrong} !important`,
                      borderWidth: "1px !important",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderColor: `${colors.brand.hairlineStrong} !important`,
                      borderWidth: "1px !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderColor: colors.brand.cyan,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: colors.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    this.props.SearchText && this.props.SearchText(SearchText)
                  }
                  startIcon={<SearchIcon />}
                  sx={{
                    boxShadow: "none",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    minWidth: "100px",
                    height: "32px",
                    marginLeft: "8px",
                  }}
                >
                  {t("Search")}
                </Button>
              </div>
            </GridItem>
          )}
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(DoctorCrudActions);
