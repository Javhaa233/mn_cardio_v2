import React, { Component } from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

import Report from "helper/ErrorReporter";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Through the reporter, so this lands in the same place as everything else
    // and reaches a sink if one is ever configured.
    Report.Capture(error, { source: "ErrorBoundary", info: errorInfo });

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: this.props.fullScreen ? "100vh" : "400px",
            padding: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              padding: 4,
              textAlign: "center",
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: "error.main",
                marginBottom: 2,
              }}
            />
            <Typography variant="h5" gutterBottom>
              {this.props.title || "Алдаа гарлаа"}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.props.message ||
                "Уучлаарай, хуудас ачаалахад алдаа гарлаа. Та дахин оролдоно уу."}
            </Typography>

            {this.props.showDetails && this.state.error && (
              <Box
                sx={{
                  marginTop: 2,
                  padding: 2,
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                  textAlign: "left",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ margin: 0 }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                marginTop: 3,
                display: "flex",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
              >
                Дахин оролдох
              </Button>
              {this.props.showHomeButton && (
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = "/")}
                >
                  Нүүр хуудас руу буцах
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  fullScreen: PropTypes.bool,
  showDetails: PropTypes.bool,
  showHomeButton: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
};

ErrorBoundary.defaultProps = {
  fullScreen: false,
  showDetails: process.env.NODE_ENV === "development",
  showHomeButton: true,
};

export default ErrorBoundary;
