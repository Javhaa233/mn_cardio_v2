import React from "react";
import { withTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { colors } from "@/theme/colors";

/**
 * One boundary per tab panel.
 *
 * Without this, a single failed chunk load or a crash inside one page takes down
 * the whole Admin layout and every other open tab with it - a far worse blast
 * radius than the old one-page-at-a-time layout had.
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    process.env.NODE_ENV === "development" && console.log(error);
  }

  render() {
    const { t, onClose, children } = this.props;
    if (!this.state.failed) return children;

    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ color: colors.label.error, mb: 2 }}>
          {t("Хуудсыг ачаалахад алдаа гарлаа")}
        </Box>
        <Button
          variant="outlined"
          onClick={() => this.setState({ failed: false })}
          sx={{ mr: 1 }}
        >
          {t("Дахин оролдох")}
        </Button>
        {onClose ? (
          <Button variant="outlined" color="error" onClick={onClose}>
            {t("Хаах")}
          </Button>
        ) : null}
      </Box>
    );
  }
}

export default withTranslation()(TabErrorBoundary);
