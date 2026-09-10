import React, { Component } from "react";
import PropTypes from "prop-types";
// translation
import { withTranslation } from "react-i18next";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowRight from "@mui/icons-material/ArrowRight";

class SubMenuItem extends Component {
  static propTypes = {
    Label: PropTypes.string.isRequired,
    parentMenuOpen: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { subMenuOpen: false };
  }

  render() {
    const { subMenuOpen } = this.state;
    const { t, Label, parentMenuOpen, children } = this.props;

    return (
      <div
        onMouseLeave={(e) => this.setState({ subMenuOpen: false })}
        onClick={(event) => {
          event.stopPropagation();
          this.setState({ subMenuOpen: !subMenuOpen });
        }}
      >
        <MenuItem
          ref={(node) => (this.subMenuItem = node)}
          style={{ top: "0" }}
        >
          {t(Label + "")}
          <ArrowRight />
        </MenuItem>
        <Menu
          style={{ pointerEvents: "none" }}
          anchorEl={this.subMenuItem}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          open={subMenuOpen && parentMenuOpen}
          onClose={() => this.setState({ subMenuOpen: false })}
        >
          <div style={{ pointerEvents: "auto" }}>{children}</div>
        </Menu>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(SubMenuItem);
