import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { FormControl, Select, MenuItem } from "@mui/material";

const sx = {
  selectFormControl: {
    margin: "0px",
    "& .MuiInputBase-root": {
      height: "32px",
    },
  },
  select: {
    "& .MuiSelect-select": {
      padding: "6px 12px",
      fontSize: "13px",
    },
  },
  selectMenuPaper: {
    maxHeight: "300px",
  },
  selectMenuList: {
    padding: "4px 0",
  },
  selectMenuItem: {
    fontSize: "13px",
    padding: "6px 12px",
    "&.Mui-selected": {
      backgroundColor: "rgba(0, 172, 193, 0.1)",
      "&:hover": {
        backgroundColor: "rgba(0, 172, 193, 0.2)",
      },
    },
  },
};

class SingleSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { Name: props.Name || null, Value: "-1", Data: [] };
  }

  GetData = (Data) => this.setState({ Data, Value: "-1" });

  GetMenuItem = () => {
    const { t } = this.props;
    const { Data } = this.state;

    var MenuItems = [];
    for (var i = 0; i < Data.length; i++) {
      MenuItems.push(
        <MenuItem
          key={"Item" + i}
          value={Data[i]["id_data"] + ""}
          sx={sx.selectMenuItem}
        >
          {t(Data[i]["name"] + "")}
        </MenuItem>,
      );
    }
    return MenuItems;
  };

  render() {
    const { Name, Value } = this.state;
    const { ChangeValue, t } = this.props;

    return (
      <FormControl
        fullWidth
        sx={sx.selectFormControl}
        variant="outlined"
        size="small"
      >
        <Select
          MenuProps={{
            PaperProps: { sx: sx.selectMenuPaper },
            MenuListProps: { sx: sx.selectMenuList },
          }}
          sx={{
            ...sx.select,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              height: "32px",
              padding: "0 32px 0 8px",
              boxSizing: "border-box",
            },
          }}
          value={Value}
          onChange={(event) => {
            const value = event.target.value;
            this.setState({ Value: value });
            ChangeValue && ChangeValue(Name, value);
          }}
        >
          <MenuItem value="-1" sx={sx.selectMenuItem}>
            {t("All")}
          </MenuItem>
          {this.GetMenuItem()}
        </Select>
      </FormControl>
    );
  }
}

// ReportLocationSelect reaches in through a ref and calls GetData() to fill the
// options. Without withRef the HOC swallowed the ref, GetData was never called,
// and all three location dropdowns sat empty on every report screen.
export default withTranslation(undefined, { withRef: true })(SingleSelect);
