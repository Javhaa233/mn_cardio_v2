import React from "react";
import { withTranslation } from "react-i18next";
import LoadError from "customComponents/LoadError";
import Report from "helper/ErrorReporter";

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

  componentDidCatch(error, errorInfo) {
    // Was `NODE_ENV === "development" && console.log(error)`, which meant every
    // crashed tab in production was discarded: the doctor saw the panel below
    // and nobody could find out what had thrown.
    Report.Capture(error, { source: "TabErrorBoundary", info: errorInfo });
  }

  render() {
    const { t, onClose, children } = this.props;
    if (!this.state.failed) return children;

    // The same error panel as a failed list load, so a crashed tab and a
    // failed request look like one kind of problem.
    return (
      <LoadError
        Title="Хуудсыг ачаалахад алдаа гарлаа"
        Retry={() => this.setState({ failed: false })}
        Close={onClose}
      />
    );
  }
}

export default withTranslation()(TabErrorBoundary);
