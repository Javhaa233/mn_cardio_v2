import { withTranslation } from "react-i18next";
import React, { Component } from "react";

// @mui/icons-material
import RefreshIcon from "@mui/icons-material/Refresh";

import BaseLoadButton from "customComponents/BaseLoadButton";

class Actions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { download, refresh, t } = this.props;
    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <BaseLoadButton
          ButtonText={t("Download")}
          Color="success"
          onClick={(callback) => {
            download &&
              download(() => {
                callback && callback();
              });
          }}
        />
        <BaseLoadButton
          ButtonText={t("Сэргээх")}
          Color="primary"
          Icon={RefreshIcon}
          onClick={async (callback) => {
            refresh &&
              refresh(() => {
                callback && callback();
              });
          }}
        />
      </div>
    );
  }
}

export default withTranslation()(Actions);
