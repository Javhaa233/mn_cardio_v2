import React, { Component } from "react";
// @mui/material components
import {
  ClickAwayListener,
  Popover,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
// @mui/icons-material
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { echo_examination } from "assets/jss/material-dashboard-pro-react/custom/Echo/echoExamination.jsx";
import { createMarkup, sanitizeHtml } from "utils/sanitize";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea.jsx";
import { colors } from "@/theme/colors";

const CONTEXT_MENU_CLASS = "echo-context-menu";

const sxStyles = {
  contextMenu: {
    position: "absolute",
    width: "200px",
    zIndex: "99999",
    overflow: "visible",
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.34)",
    backgroundColor: colors.background.primary,
    padding: 0,
    margin: 0,
    display: "none",
    fontWeight: "400",
    "& > li": {
      position: "relative",
      listStyle: "none",
      padding: 0,
      margin: 0,
      lineHeight: "32px",
      height: "32px",
      borderBottom: "1px solid #dbdbdb",
    },
    "& > li:last-child": { borderBottom: "none" },
    "& > li > span": {
      position: "absolute",
      top: 0,
      left: 0,
      listStyle: "none",
      padding: "5px 3px",
      margin: 0,
      lineHeight: "32px",
      height: "32px",
    },
    "& > li > a": {
      cursor: "pointer",
      color: colors.text.strong,
      textDecoration: "none",
      display: "block",
      lineHeight: "30px",
      height: "32px",
      backgroundPosition: "6px center",
      backgroundRepeat: "no-repeat",
      outline: "none",
      padding: "0px 5px",
      paddingLeft: "28px",
    },
    "& > li:hover > a": { color: "inherit", backgroundColor: "#eee" },
    "& > li:disabled > a": { color: "#aaa", cursor: "default" },
    "& > li:hover.disabled > a": { backgroundColor: "transparent" },
  },
  closeButton: {
    fontSize: "7px",
    padding: "2px",
    position: "absolute",
    right: "4px",
    top: "4px",
    color: "#737373",
  },
  paper: { padding: "0px 15px 15px" },
  commentTextField: {
    "& .MuiOutlinedInput-multiline": { padding: "8px" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderRadius: 0, borderColor: colors.border.default },
      "&:hover fieldset": { borderColor: colors.border.default },
      "&.Mui-focused fieldset": { borderColor: "#5c5c5c", borderWidth: "1px" },
    },
    "& .MuiInputBase-input": {
      color: colors.text.heading,
      height: "unset",
      fontSize: "14px",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: "400",
      lineHeight: 1,
      opacity: "1",
    },
    "& .MuiInputBase-input::placeholder": { color: "#b2b2b2" },
  },
};

class EchoExamination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: props.Data || null,
      Polygon: null,
      anchorEl: null,
      CommentHtml: null,
    };
  }

  componentDidMount() {
    this.GetMainColor();
    this.BindData();
  }

  GetMainColor = () => {
    var key;
    for (key in echo_examination.polygons) {
      var SelectObject = echo_examination.polygons[key];
      SelectObject.tags = [];
      SelectObject.hasTag = false;
      SelectObject.comment = "";
    }

    for (key in echo_examination.polygons) {
      var obj = echo_examination.polygons[key];
      document.querySelectorAll("g[id='" + obj.id + "']").forEach((element) => {
        var aElement = element.getElementsByTagName("polygon");
        for (var i = 0; i < aElement.length; i++) {
          aElement[i].style["fill"] = obj.getColor();
        }
        var aElementText = element.querySelectorAll("text");
        for (var j = 0; j < aElementText.length; j++) {
          aElementText[j].style["fill"] =
            echo_examination.PolygonColorType.FORECOLOR;
        }
      });
    }
  };

  onMouseLeavePolygon = (polygon) => {
    const Obj = echo_examination.polygons.filter(
      (e) => e.id === polygon.currentTarget.id,
    )[0];
    if (Obj) {
      document.querySelectorAll("g[id='" + Obj.id + "']").forEach((element) => {
        var aElement = element.getElementsByTagName("polygon");
        for (var i = 0; i < aElement.length; i++) {
          aElement[i].style["fill"] = Obj.getColor();
        }
        var aElementText = element.querySelectorAll("text");
        for (var j = 0; j < aElementText.length; j++) {
          aElementText[j].style["fill"] =
            echo_examination.PolygonColorType.FORECOLOR;
        }
      });
    }
  };

  onMouseEnterPolygon = (polygon) => {
    var Obj = echo_examination.polygons.filter(
      (e) => e.id === polygon.currentTarget.id,
    )[0];
    if (Obj) {
      document.querySelectorAll("g[id='" + Obj.id + "']").forEach((element) => {
        var aElement = element.getElementsByTagName("polygon");
        for (var i = 0; i < aElement.length; i++) {
          aElement[i].style["fill"] = echo_examination.colorFocused;
        }
        var aElementText = element.querySelectorAll("text");
        for (var j = 0; j < aElementText.length; j++) {
          aElementText[j].style["fill"] = echo_examination.colorFocused;
        }
      });
    }
  };

  onContextMenu = (event) => {
    var SelectObject = [];
    if (event.currentTarget.id && event.currentTarget.id !== "") {
      SelectObject = echo_examination.polygons.filter(
        (e) => e.id === event.currentTarget.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });
      var Tags = SelectObject[0].tags;
      var child = document.getElementById("echo_ultrasound_menu").children;
      for (var i = 0; i < child.length; i++) {
        var liTagVal = child[i].children[1].getAttribute("val");
        var temp = Tags.filter((s) => s === liTagVal);
        if (temp.length > 0) child[i].children[0].style["display"] = "";
        else child[i].children[0].style["display"] = "none";
      }
    }

    document
      .querySelectorAll(`.${CONTEXT_MENU_CLASS}`)
      .forEach((el) => (el.style.display = ""));
    {
      const el = document.querySelector(`.${CONTEXT_MENU_CLASS}`);
      if (el) {
        el.style.top = event.pageY + "px";
        el.style.left = event.pageX + "px";
      }
    }
    // event.preventDefault();
  };

  GetPolygon = (value) => {
    const { Polygon } = this.state;
    const { View } = this.props;

    if (Polygon && !View) {
      if (Polygon.tags.indexOf(value) !== -1) {
        Polygon.tags.splice(Polygon.tags.indexOf(value), 1);
      } else {
        if (value === "1 - normal") {
          Polygon.tags = [];
        } else {
          if (Polygon.tags.indexOf("1 - normal") !== -1)
            Polygon.tags.splice(Polygon.tags.indexOf("1 - normal"), 1);
        }
        Polygon.tags.push(value);
      }

      if (
        Polygon.tags.length > 0 ||
        (Polygon.comment && Polygon.comment !== "")
      )
        Polygon.hasTag = true;
      else Polygon.hasTag = false;

      //   { const el = document.getElementById(SelectObject.id); if (el) el.setAttribute("fill", SelectObject.getColor(); });
      document
        .querySelectorAll("g[id='" + Polygon.id + "']")
        .forEach((element) => {
          var aElement = element.getElementsByTagName("polygon");
          for (var i = 0; i < aElement.length; i++) {
            aElement[i].style["fill"] = Polygon.getColor();
          }
        });

      document
        .querySelectorAll("text[id='" + Polygon.id + "_tag']")
        .forEach((element) => {
          element.textContent = "";
          var str = "";

          for (var i = 0; i < Polygon.tags.length; i++) {
            var tag = "";
            switch (Polygon.tags[i]) {
              case "1 - normal":
                tag = "1";
                break;
              case "X - cannot interpret":
                tag = "X";
                break;
              case "0 - hyperkinetic":
                tag = "0";
                break;
              case "2 - hypokinetic":
                tag = "2";
                break;
              case "3 - akinetic":
                tag = "3";
                break;
              case "4 - dyskinetic":
                tag = "4";
                break;
              case "5 - aneurysmal":
                tag = "5";
                break;
              case "6 - akinetic with scar":
                tag = "6";
                break;
              case "7 - dyskinetic with scar":
                tag = "7";
                break;
              default:
                tag = "";
            }
            if (i === 0) {
              str = tag;
            } else {
              str += "," + tag;
            }
            element.textContent = str;
          }
        });
      document
        .querySelectorAll(`.${CONTEXT_MENU_CLASS}`)
        .forEach((el) => (el.style.display = "none"));
    }
  };

  GetComment = (event) => {
    const { View } = this.props;
    var SelectObject = [];
    if (event.currentTarget.id && event.currentTarget.id !== "") {
      SelectObject = echo_examination.polygons.filter(
        (e) => e.id === event.currentTarget.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });
      if (
        SelectObject[0].tags.length > 0 ||
        (SelectObject[0].comment && SelectObject[0].comment !== "")
      )
        SelectObject[0].hasTag = true;
      else SelectObject[0].hasTag = false;

      if (SelectObject[0].hasTag) {
        this.setState({ anchorEl: event.currentTarget });
        this.setState({
          CommentHtml: (
            <div>
              <div
                dangerouslySetInnerHTML={createMarkup(
                  SelectObject[0].getTags(),
                )}
              />
              <div>
                <h4
                  style={{
                    color: colors.text.heading,
                    fontSize: "16px",
                    textDecoration: "none",
                    marginBottom: "0",
                  }}
                >
                  Тайлбар:
                </h4>
                <BaseTextArea
                  Rows={3}
                  Value={SelectObject[0].comment}
                  ChangeValue={(name, value) => {
                    SelectObject[0].comment = value;
                  }}
                  Disabled={View}
                />
              </div>
            </div>
          ),
        });
      }
    }
  };

  PolygonElements = () => {
    var Elements = [];
    echo_examination.polygons.forEach((polygon) => {
      if (
        polygon.tags.length > 0 ||
        (polygon.comment && polygon.comment !== "")
      ) {
        const NewObj = {
          SectionName: polygon.id,
          Comment: polygon.comment,
          Tags: polygon.tags,
        };
        Elements.push(NewObj);
      }
    });

    return Elements;
  };

  BindData = () => {
    const { Data } = this.state;
    if (Data) {
      Data.forEach((element) => {
        var Tags = [];
        Array.isArray(element.LookUpData) &&
          element.LookUpData.map((row) => {
            Tags.push(row.vwEchoElementTag.label);
          });
        this.SetData(element.vwEchoSectionName.label, Tags, element.comment);
      });
    }
  };

  SetData = (PolygonName, Tags, Comment) => {
    var SelectObject = echo_examination.polygons.filter(
      (e) => e.id === PolygonName,
    )[0];

    if (SelectObject) {
      SelectObject.tags = Tags;
      SelectObject.hasTag = true;
      SelectObject.comment = Comment;

      document
        .querySelectorAll("g[id='" + PolygonName + "']")
        .forEach((element) => {
          var aElement = element.getElementsByTagName("polygon");
          for (var i = 0; i < aElement.length; i++) {
            aElement[i].style["fill"] = SelectObject.getColor();
          }
        });

      document
        .querySelectorAll("text[id='" + SelectObject.id + "_tag']")
        .forEach((element) => {
          element.textContent = "";
          var str = "";

          for (var i = 0; i < SelectObject.tags.length; i++) {
            var tag = "";
            switch (SelectObject.tags[i]) {
              case "1 - normal":
                tag = "1";
                break;
              case "X - cannot interpret":
                tag = "X";
                break;
              case "0 - hyperkinetic":
                tag = "0";
                break;
              case "2 - hypokinetic":
                tag = "2";
                break;
              case "3 - akinetic":
                tag = "3";
                break;
              case "4 - dyskinetic":
                tag = "4";
                break;
              case "5 - aneurysmal":
                tag = "5";
                break;
              case "6 - akinetic with scar":
                tag = "6";
                break;
              case "7 - dyskinetic with scar":
                tag = "7";
                break;
              default:
                tag = "";
            }
            if (i === 0) {
              str = tag;
            } else {
              str += "," + tag;
            }

            element.textContent = str;
          }
        });
    }
  };

  render() {
    const { t } = this.props;
    const {
      onMouseLeavePolygon,
      onMouseEnterPolygon,
      onContextMenu,
      GetPolygon,
      GetComment,
    } = this;
    const { anchorEl, CommentHtml } = this.state;
    return (
      <Box
        sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", padding: "10px" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => this.setState({ anchorEl: null })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: sxStyles.paper }}
        >
          <div style={{ width: "290px" }}>
            <div
              style={{ display: "flex", height: "100%", alignItems: "center" }}
            >
              <h4 style={{ marginTop: "7px", marginBottom: "5px" }}>
                Тэмдэглэл
              </h4>
              <IconButton
                aria-label="close"
                sx={sxStyles.closeButton}
                onClick={() => this.setState({ anchorEl: null })}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <Divider sx={{ margin: "0 -15px 10px" }} />
          <div>{CommentHtml}</div>
        </Popover>
        <div>
          <ClickAwayListener
            onClickAway={() =>
              document
                .querySelectorAll(`.${CONTEXT_MENU_CLASS}`)
                .forEach((el) => (el.style.display = "none"))
            }
          >
            <div>
              <Box
                component="ul"
                id="echo_ultrasound_menu"
                className={CONTEXT_MENU_CLASS}
                sx={sxStyles.contextMenu}
              >
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="X - cannot interpret"
                    onClick={() => GetPolygon("X - cannot interpret")}
                  >
                    X - cannot interpret
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="0 - hyperkinetic"
                    onClick={() => GetPolygon("0 - hyperkinetic")}
                  >
                    0 - hyperkinetic
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="1 - normal"
                    onClick={() => GetPolygon("1 - normal")}
                  >
                    1 - normal
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="2 - hypokinetic"
                    onClick={() => GetPolygon("2 - hypokinetic")}
                  >
                    2 - hypokinetic
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="3 - akinetic"
                    onClick={() => GetPolygon("3 - akinetic")}
                  >
                    3 - akinetic
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="4 - dyskinetic"
                    onClick={() => GetPolygon("4 - dyskinetic")}
                  >
                    4 - dyskinetic
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="5 - aneurysmal"
                    onClick={() => GetPolygon("5 - aneurysmal")}
                  >
                    5 - aneurysmal
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="6 - akinetic with scar"
                    onClick={() => GetPolygon("6 - akinetic with scar")}
                  >
                    6 - akinetic with scar
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon
                      fontSize="small"
                      style={{ color: colors.status.normal }}
                    />
                  </span>
                  <a
                    value="7 - dyskinetic with scar"
                    onClick={() => GetPolygon("7 - dyskinetic with scar")}
                  >
                    7 - dyskinetic with scar
                  </a>
                </li>
              </Box>
            </div>
          </ClickAwayListener>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
          <div
            style={{ width: "50%", display: "flex", justifyContent: "center" }}
          >
            <svg
              id="echo_examination_svg"
              contentScriptType="text/ecmascript"
              width="300.0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              baseProfile="full"
              zoomAndPan="magnify"
              contentStyleType="text/css"
              height="350.0px"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
            >
              <g
                id="basal_pos"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="103.5,226.5 99.25,226.0 95.75,223.75 92.0,218.5
			88.25,209.0 85.75,197.75 83.75,184.5 82.5,174.0 81.75,164.25 81.25,158.0 114.75,158.5 115.25,168.5 115.75,181.5
			115.25,196.75 114.5,210.25 111.5,221.25 109.0,224.5 107.0,226.25"
                  stroke={colors.text.black}
                />
                <text x="21.5" y="190.0">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="21.5" xmlSpace="preserve" dy="12.0">
                    posterior
                  </tspan>
                </text>
                <text
                  id="basal_pos_tag"
                  fill={colors.text.black}
                  x="88.0"
                  y="180.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_pos"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="81.333336,158.0 81.5,141.83333 82.0,125.666664
			82.666664,112.166664 84.0,102.333336 116.0,103.0 114.5,115.166664 113.666664,127.666664 113.666664,140.33333
			114.166664,149.5 114.833336,158.33333"
                  stroke={colors.text.black}
                />
                <text x="16.0" y="126.5">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="16.0" xmlSpace="preserve" dy="12.0">
                    posterior
                  </tspan>
                </text>
                <text
                  id="mid_pos_tag"
                  fill={colors.text.black}
                  x="85.0"
                  y="136.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_lat"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="84.166664,102.0 87.833336,82.333336
			91.166664,67.83333 94.166664,59.166668 97.5,49.666668 101.833336,45.333332 106.5,40.666664 113.833336,35.166664
			117.5,32.833336 132.83333,58.833332 128.83333,61.833332 125.333336,67.83333 122.166664,75.16667
			118.833336,85.166664 117.166664,93.5 116.166664,102.833336"
                  stroke={colors.text.black}
                />
                <text x="40.0" y="59.0">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="40.0" xmlSpace="preserve" dy="12.0">
                    lateral
                  </tspan>
                </text>
                <text
                  id="apical_lat_tag"
                  fill={colors.text.black}
                  x="95.0"
                  y="70.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apex"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="117.666664,32.666664 126.833336,27.333332 131.66667,25.166668
			135.16667,24.0 139.83333,23.333332 145.5,23.5 150.83333,24.5 158.5,26.666668 165.66667,29.666666 171.5,33.5
			176.16667,37.333336 157.66667,61.0 154.16667,58.666668 149.16667,56.833332 142.83333,56.166668 137.5,56.5
			133.16667,58.5"
                  stroke={colors.text.black}
                />
                <text x="131.5" y="15.5">
                  <tspan xmlSpace="preserve">apex </tspan>
                </text>
                <text
                  id="apex_tag"
                  fill={colors.text.black}
                  x="133.0"
                  y="40.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="176.33333,37.333336 185.33333,45.166668
			192.5,52.833332 197.16667,60.333332 201.16667,68.0 204.5,77.166664 206.33333,86.0 206.83333,94.666664
			207.16667,104.666664 178.33333,104.666664 176.5,94.5 174.16667,84.833336 171.0,77.5 167.33333,71.33333
			163.5,67.0 157.66667,61.166668"
                  stroke={colors.text.black}
                />
                <text x="209.0" y="59.5">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="209.0" xmlSpace="preserve" dy="12.0">
                    septal
                  </tspan>
                </text>
                <text
                  id="apical_sep_tag"
                  fill={colors.text.black}
                  x="168.0"
                  y="70.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_ant_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="207.33333,104.666664 208.5,124.5
			209.16667,140.83333 209.83333,160.16667 184.0,160.0 183.16667,146.16667 182.16667,132.83334 180.16667,117.833336
			178.16667,104.666664"
                  stroke={colors.text.black}
                />
                <text x="236.9" y="122.0">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="236.9" xmlSpace="preserve" dy="12.0">
                    anterior
                  </tspan>
                  <tspan x="236.9" xmlSpace="preserve" dy="12.0">
                    septal
                  </tspan>
                </text>
                <line
                  y2="129.0"
                  fill="none"
                  x1="200.5"
                  x2="234.0"
                  stroke={colors.diagram.leader}
                  y1="134.5"
                />
                <text
                  id="mid_ant_sep_tag"
                  fill={colors.text.black}
                  x="183.0"
                  y="130.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="basal_ant_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="209.66667,160.16667 210.16667,177.66667
			210.0,191.16667 208.33333,204.83333 205.83333,215.16667 204.33333,219.0 202.33333,222.5 200.0,222.66667
			197.33333,220.66667 193.83333,216.33333 190.0,208.5 186.83333,197.66667 185.0,185.83333 184.16667,160.0"
                  stroke={colors.text.black}
                />
                <text x="243.5" y="182.0">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="243.5" xmlSpace="preserve" dy="12.0">
                    anterior
                  </tspan>
                  <tspan x="243.5" xmlSpace="preserve" dy="12.0">
                    septal
                  </tspan>
                </text>
                <line
                  y2="186.5"
                  fill="none"
                  x1="204.0"
                  x2="242.5"
                  stroke={colors.diagram.leader}
                  y1="182.5"
                />
                <text
                  id="basal_ant_sep_tag"
                  fill={colors.text.black}
                  x="186.0"
                  y="190.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <path
                fill="none"
                d="M 190.0 234.33333 C 190.0 234.33333 194.0 228.83333 194.0 228.83333 C 194.0 228.83333 196.66667
        225.16667 196.66667 225.33333 C 196.66667 225.5 199.33333 223.0 199.33333 223.0 C 199.33333 223.0 203.66667
        222.33333 203.66667 222.33333 C 203.66667 222.33333 206.66667 222.66667 206.66667 222.66667 C 206.66667
        222.66667 209.5 223.66667 209.5 223.66667 C 209.5 223.66667 211.66667 225.5 211.66667 225.5 C 211.66667 225.5
        213.83333 228.16667 213.83333 228.16667 C 213.83333 228.16667 214.66667 232.83333 214.66667 232.83333 C
        214.66667 232.83333 215.16667 238.33333 215.16667 238.33333 C 215.16667 238.33333 214.66667 247.5 214.66667
        247.5 C 214.66667 247.5 215.5 251.0 215.5 251.0 C 215.5 251.0 216.66667 253.33333 216.66667 253.33333 C
        216.66667 253.33333 232.16667 279.16666 232.16667 279.16666"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 189.66667 295.16666 C 189.66667 295.16666 188.33333 288.83334 188.33333 288.83334 C 188.33333
        288.83334 185.33333 282.0 185.33333 282.0 C 185.33333 282.0 182.0 276.0 182.0 276.0 C 182.0 276.0 179.0 272.5
        179.0 272.5 C 179.0 272.5 174.66667 269.83334 174.66667 269.83334 C 174.66667 269.83334 169.5 266.8333 169.5
        266.8333 C 169.5 266.8333 161.66667 262.5 161.66667 262.5 C 161.66667 262.5 158.0 258.5 158.0 258.5 C 158.0
        258.5 156.0 254.5 156.0 254.5 C 156.0 254.5 155.83333 250.0 155.83333 250.0 C 155.83333 250.0 156.83333 246.0
        156.83333 246.0 C 156.83333 246.0 158.83333 242.83333 158.83333 242.83333 C 158.83333 242.83333 163.83333
        241.33333 163.83333 241.33333 C 163.83333 241.33333 170.5 239.83333 170.5 239.83333 C 170.5 239.83333 174.33333
        239.16667 174.33333 239.16667 C 174.33333 239.16667 179.16667 239.16667 179.16667 239.16667"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 160.16667 242.5 C 160.16667 242.5 156.33333 242.0 156.33333 242.0 C 156.33333 242.0 152.83333
        239.66667 152.83333 239.66667 C 152.83333 239.66667 149.5 237.33333 149.5 237.33333 C 149.5 237.33333 145.83333
        233.5 145.83333 233.5 C 145.83333 233.5 142.0 229.0 142.0 229.0 C 142.0 229.0 138.66667 222.33333 138.66667
        222.33333 C 138.66667 222.33333 135.83333 215.5 135.83333 215.5 C 135.83333 215.5 134.5 208.5 134.5 208.5 C
        134.5 208.5 133.66667 205.5 133.66667 205.5 C 133.66667 205.5 133.83333 201.33333 133.83333 201.33333"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 129.16667 200.16667 C 129.16667 200.16667 128.66667 206.0 128.66667 206.0 C 128.66667 206.0
        126.166664 211.5 126.166664 211.5 C 126.166664 211.5 123.666664 215.66667 123.666664 215.66667 C 123.666664
        215.66667 120.0 219.83333 120.0 219.83333 C 120.0 219.83333 115.333336 223.33333 115.333336 223.33333 C
        115.333336 223.33333 111.166664 225.33333 111.166664 225.33333 C 111.166664 225.33333 106.5 226.33333 106.5
        226.33333 C 106.5 226.33333 100.666664 226.66667 100.666664 226.66667 C 100.666664 226.66667 99.5 228.83333 99.5
        228.83333 C 99.5 228.83333 98.0 234.0 98.0 234.0 C 98.0 234.0 96.166664 242.5 96.166664 242.5 C 96.166664 242.5
        95.166664 250.66667 95.166664 250.66667 C 95.166664 250.66667 95.0 260.1667 95.0 260.1667 C 95.0 260.1667 96.0
        266.3333 96.0 266.3333 C 96.0 266.3333 97.5 271.83334 97.5 271.83334 C 97.5 271.83334 99.333336 278.33334
        99.333336 278.33334 C 99.333336 278.33334 103.0 286.33334 103.0 286.33334"
                stroke={colors.text.black}
              />
              <text x="119.0" y="272.0">
                <tspan xmlSpace="preserve">LA </tspan>
              </text>
              <text x="187.5" y="271.0">
                <tspan xmlSpace="preserve">Ao </tspan>
              </text>
              <text x="139.0" y="157.5">
                <tspan xmlSpace="preserve">LV </tspan>
              </text>
              <text x="86.0" y="323.0">
                <tspan style={{ fontSize: "20px" }} xmlSpace="preserve">
                  Apical long axis
                </tspan>
                <tspan xmlSpace="preserve"> </tspan>
              </text>
              <path
                fill="none"
                d="M 220.6 259.2 C 220.6 259.2 227.2 247.0 227.2 247.0 C 227.2 247.0 232.8 230.6 232.8 230.6 C
        232.8 230.6 235.4 214.6 235.4 214.6 C 235.4 214.6 237.0 196.0 237.0 196.0 C 237.0 196.0 236.6 171.0 236.6 171.0
        C 236.6 171.0 233.4 154.6 233.4 154.6 C 233.4 154.6 227.8 137.4 227.8 137.4 C 227.8 137.4 221.4 121.8 221.4
        121.8 C 221.4 121.8 219.6 118.4 219.6 118.4 C 219.6 118.4 215.0 114.8 215.0 114.8 C 215.0 114.8 207.6 110.4
        207.6 110.4"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 207.4 104.8 C 207.4 105.0 217.4 110.6 217.4 110.6 C 217.4 110.6 222.0 116.6 222.0 116.6 C
        222.0 116.6 226.2 124.2 226.2 124.2 C 226.2 124.2 231.0 136.0 231.0 136.0 C 231.0 136.0 235.4 149.4 235.4 149.4
        C 235.4 149.4 237.6 161.0 237.6 161.0 C 237.6 161.0 239.4 174.0 239.4 174.0 C 239.4 174.0 239.6 185.8 239.6
        185.8 C 239.6 185.8 238.4 209.0 238.4 209.0 C 238.4 209.0 236.8 222.0 236.8 222.0 C 236.8 222.0 233.8 235.0
        233.8 235.0 C 233.8 235.0 231.2 242.8 231.2 242.8 C 231.2 242.8 227.6 251.6 227.6 251.6 C 227.6 251.6 221.6
        261.2 221.6 261.2"
                stroke={colors.text.black}
              />
            </svg>
          </div>
          <div
            style={{ width: "50%", display: "flex", justifyContent: "center" }}
          >
            <svg
              id="echo_examination_svg"
              contentScriptType="text/ecmascript"
              width="300.0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              baseProfile="full"
              zoomAndPan="magnify"
              contentStyleType="text/css"
              height="350.0px"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
            >
              <g
                id="mid_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="128.8,122.8 123.0,127.6 116.0,136.0 110.6,144.4 108.2,151.4 107.6,159.0 108.2,165.2 112.2,173.0
            85.2,179.2 83.6,172.6 83.2,164.8 83.4,152.2 85.0,143.2 87.8,133.6 91.6,125.8 96.6,117.8 102.0,110.8
            105.8,107.4 112.0,102.6"
                  stroke={colors.text.black}
                />
                <text x="9.0" y="90.666664">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="9.0" dy="12.0" xmlSpace="preserve">
                    septal
                  </tspan>
                </text>
                <line
                  y2="133.33333"
                  fill="none"
                  x1="50.666668"
                  x2="92.666664"
                  stroke={colors.diagram.leader}
                  y1="106.666664"
                />
                <text
                  id="mid_sep_tag"
                  fill={colors.text.black}
                  x="89.0"
                  y="145.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_inf"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="112.2,173.2 115.4,176.0 118.8,177.4 124.2,178.8 130.0,180.2 136.0,182.2 139.2,184.4 141.4,187.2
            142.2,190.0 141.6,194.6 139.8,200.4 138.8,206.6 138.6,209.8 139.4,212.6 126.6,234.2 122.8,232.6 117.4,229.2
            111.8,224.8 106.8,220.4 101.8,214.2 97.6,207.4 93.2,200.0 89.8,192.8 85.4,179.4"
                  stroke={colors.text.black}
                />
                <text x="55.666668" y="217.66667">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="55.666668" dy="12.0" xmlSpace="preserve">
                    inferior
                  </tspan>
                </text>
                <text
                  id="mid_inf_tag"
                  fill={colors.text.black}
                  x="105.0"
                  y="200.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_pos"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="139.4,212.6 142.8,217.4 147.4,220.8 153.4,222.8 162.6,223.0 170.2,221.8 179.2,219.8 188.8,215.4
            196.2,211.6 199.4,209.2 204.8,204.4 220.8,221.0 215.0,226.0 208.8,230.4 200.8,234.8 191.6,238.4 183.2,240.8
            175.2,242.4 166.6,243.2 156.6,242.8 147.6,241.6 139.4,239.8 132.6,237.8 126.8,234.2"
                  stroke={colors.text.black}
                />
                <text x="139.0" y="258.66672">
                  <tspan xmlSpace="preserve">mid posterior </tspan>
                </text>
                <text
                  id="mid_pos_tag"
                  fill={colors.text.black}
                  x="160.0"
                  y="237.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_lat"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="221.0,221.0 226.0,216.0 232.2,208.6 237.2,201.4 242.6,193.2 246.6,185.0 249.2,176.6 251.0,167.2
            252.0,158.8 252.0,151.2 251.6,142.6 227.4,147.8 227.4,154.6 226.4,162.6 223.6,168.4 218.8,172.4 213.6,175.0
            207.6,178.2 203.8,182.6 202.6,187.4 203.0,190.8 205.6,195.2 206.6,198.6 206.2,201.4 205.0,204.8"
                  stroke={colors.text.black}
                />
                <text x="253.33333" y="190.0">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="253.33333" dy="12.0" xmlSpace="preserve">
                    lateral
                  </tspan>
                </text>
                <text
                  id="mid_lat_tag"
                  fill={colors.text.black}
                  x="215.0"
                  y="190.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_ant"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="251.8,142.6 250.4,135.0 248.4,128.0 244.6,121.0 240.2,115.4 235.6,110.0 230.6,105.2 225.2,100.6
            219.8,97.0 214.2,93.8 206.4,90.4 196.2,109.4 200.8,112.2 206.6,116.2 212.4,122.0 217.8,128.0 222.0,134.8
            225.6,141.0 227.4,147.8"
                  stroke={colors.text.black}
                />
                <text x="240.33333" y="89.0">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="240.33333" dy="12.0" xmlSpace="preserve">
                    anterior
                  </tspan>
                </text>
                <text
                  id="mid_ant_tag"
                  fill={colors.text.black}
                  x="217.0"
                  y="125.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_ant_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="206.4,90.6 200.4,88.2 193.6,86.4 186.0,85.0 176.6,84.2 168.2,83.8 160.0,84.2 148.4,86.4
            142.6,88.2 134.6,90.8 125.0,95.0 118.6,98.2 112.0,102.6 129.0,122.8 135.2,118.4 141.6,113.8 149.4,109.6
            159.0,106.8 168.6,105.6 180.2,106.0 187.6,107.2 196.6,109.8"
                  stroke={colors.text.black}
                />
                <text x="109.333336" y="17.666666">
                  <tspan xmlSpace="preserve">mid anterior </tspan>
                  <tspan x="109.333336" dy="12.0" xmlSpace="preserve">
                    septal
                  </tspan>
                </text>
                <line
                  y2="92.0"
                  fill="none"
                  x1="143.0"
                  x2="155.66667"
                  stroke={colors.diagram.leader}
                  y1="37.0"
                />
                <text
                  id="mid_ant_sep_tag"
                  fill={colors.text.black}
                  x="160.0"
                  y="100.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <path
                fill="none"
                d="M 206.2 90.2 C 206.2 90.2 204.4 84.8 204.4 84.8 C 204.4 84.8 201.4 78.8 201.4 78.8 C 201.4 78.8
        196.2 71.6 196.2 71.6 C 196.2 71.6 189.2 64.2 189.2 64.2 C 189.2 64.2 181.4 58.0 181.4 58.0 C 181.4 58.0 170.6
        53.4 170.6 53.4 C 170.6 53.4 159.6 50.0 159.6 50.0 C 159.6 50.0 149.4 48.8 149.4 48.8 C 149.4 48.8 139.2 48.2
        139.2 48.2 C 139.2 48.2 125.8 49.0 125.8 49.0 C 125.8 49.0 114.8 51.2 114.8 51.2 C 114.8 51.2 102.8 55.4 102.8
        55.4 C 102.8 55.4 93.4 61.0 93.4 61.0 C 93.4 61.0 83.4 68.4 83.4 68.4 C 83.4 68.4 74.8 77.0 74.8 76.8 C 74.8
        76.6 64.6 88.6 64.6 88.6 C 64.6 88.6 56.6 101.2 56.6 101.2 C 56.6 101.2 49.6 114.8 49.6 114.8 C 49.6 114.8 46.4
        128.6 46.4 128.6 C 46.4 128.6 45.4 142.4 45.4 142.4 C 45.4 142.4 46.6 156.2 46.6 156.2 C 46.6 156.2 49.8 168.2
        49.8 168.2 C 49.8 168.2 54.8 179.4 54.8 179.4 C 54.8 179.4 63.2 190.8 63.2 190.8 C 63.2 190.8 72.2 199.6 72.2
        199.6 C 72.2 199.6 81.2 206.4 81.2 206.4 C 81.2 206.4 88.6 210.2 88.6 210.2 C 88.6 210.2 101.6 214.0 101.6
        214.0"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 197.0 87.2 C 197.0 87.2 193.0 79.6 193.0 79.6 C 193.0 79.6 187.4 72.4 187.4 72.4 C 187.4 72.4
        180.2 66.4 180.2 66.4 C 180.2 66.4 172.4 61.4 172.4 61.4 C 172.4 61.4 162.0 57.4 162.0 57.4 C 162.0 57.4 151.8
        55.4 151.8 55.4 C 151.8 55.4 141.4 54.8 141.4 54.8 C 141.4 54.8 128.8 56.0 128.8 56.0 C 128.8 56.0 116.8 59.4
        116.8 59.4 C 116.8 59.4 104.2 65.2 104.2 65.2 C 104.2 65.2 92.6 72.4 92.6 72.4 C 92.6 72.4 83.4 80.2 83.4 80.2 C
        83.4 80.2 75.8 88.8 75.8 88.8 C 75.8 88.8 69.6 97.4 69.6 97.4 C 69.6 97.4 64.0 106.8 64.0 106.8 C 64.0 106.8
        60.2 115.0 60.2 115.0 C 60.2 115.0 57.8 122.0 57.8 122.0 C 57.8 122.0 56.0 129.6 56.0 129.6 C 56.0 129.6 54.8
        137.8 54.8 137.8 C 54.8 137.8 54.8 150.8 54.8 150.8 C 54.8 150.8 57.2 161.6 57.2 161.6 C 57.2 161.6 61.4 172.2
        61.4 172.2 C 61.4 172.2 66.6 180.4 66.6 180.4 C 66.6 180.4 74.0 189.4 74.0 189.4 C 74.0 189.4 81.4 195.6 81.4
        195.6 C 81.4 195.6 87.2 199.6 87.2 199.6 C 87.2 199.6 94.8 202.4 94.8 202.4"
                stroke={colors.text.black}
              />
              <text x="160.00002" y="164.0">
                <tspan xmlSpace="preserve">LV </tspan>
              </text>
              <text x="76.666664" y="110.0">
                <tspan xmlSpace="preserve">RV </tspan>
              </text>
              <text x="70.0" y="307.0">
                <tspan style={{ fontSize: "20px" }} xmlSpace="preserve">
                  Short-axis (mid-LV)
                </tspan>
              </text>
            </svg>
          </div>
          <div
            style={{ width: "50%", display: "flex", justifyContent: "center" }}
          >
            <svg
              id="echo_examination_svg"
              contentScriptType="text/ecmascript"
              width="300.0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              baseProfile="full"
              zoomAndPan="magnify"
              contentStyleType="text/css"
              height="350.0px"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
            >
              <g
                id="basal_lat"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="206.2,210.6 211.2,208.2 214.6,204.6 218.4,201.0 220.6,197.2 222.8,189.2
			225.8,178.6 226.8,169.6 227.8,157.8 227.8,148.6 203.2,148.6 204.0,155.2 204.8,163.0 205.2,171.2 205.4,179.2
			205.8,187.2 205.8,194.6 205.8,203.2"
                  stroke={colors.text.black}
                />
                <text x="230.0" y="170.0">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="230.0" dy="12.0" xmlSpace="preserve">
                    lateral{" "}
                  </tspan>
                </text>
                <text
                  id="basal_lat_tag"
                  fill={colors.text.black}
                  x="206.0"
                  y="175.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_lat"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="228.0,148.4 226.8,139.2 225.6,129.8 223.6,119.6 221.0,109.4 219.2,101.4
			217.0,92.6 191.6,92.4 193.8,100.2 196.4,110.6 198.4,120.6 200.6,132.6 202.2,141.6 203.2,148.4"
                  stroke={colors.text.black}
                />
                <text x="227.5" y="115.0">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="227.5" dy="12.0" xmlSpace="preserve">
                    lateral{" "}
                  </tspan>
                </text>
                <text
                  id="mid_lat_tag"
                  fill={colors.text.black}
                  x="201.0"
                  y="129.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_lat"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="217.2,92.6 214.8,85.0 212.0,76.8 209.2,68.6 205.6,60.0 203.2,55.0
			199.6,49.8 195.6,45.0 187.8,37.0 176.2,58.4 179.2,61.4 181.8,66.0 184.4,71.4 187.0,78.0 189.8,85.4 191.8,92.4"
                  stroke={colors.text.black}
                />
                <text x="212.5" y="56.5">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="212.5" dy="12.0" xmlSpace="preserve">
                    lateral{" "}
                  </tspan>
                </text>
                <text
                  id="apical_lat_tag"
                  fill={colors.text.black}
                  x="188.0"
                  y="80.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apex"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="187.8,37.0 182.2,32.4 176.0,28.4 170.0,25.2 164.8,23.8 158.8,23.2 154.2,23.8
			149.2,25.8 144.0,28.2 137.4,32.8 151.2,59.6 154.0,56.6 157.6,54.2 162.0,53.4 167.0,53.8 171.4,55.0 176.4,58.6"
                  stroke={colors.text.black}
                />
                <text x="147.5" y="16.5">
                  <tspan xmlSpace="preserve">apex </tspan>
                </text>
                <text
                  id="apex_tag"
                  fill={colors.text.black}
                  x="150.0"
                  y="45.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="137.4,32.8 133.0,36.0 128.6,40.2 124.2,44.6 120.2,49.4 118.8,54.4
			117.2,61.2 116.0,67.2 114.6,73.4 114.0,80.6 112.6,90.4 138.0,90.6 139.2,85.4 141.2,78.4 143.6,72.2 146.6,66.0
			148.4,62.2 151.2,59.4"
                  stroke={colors.text.black}
                />
                <text x="50.0" y="59.5">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="50.0" dy="12.0" xmlSpace="preserve">
                    septal{" "}
                  </tspan>
                </text>
                <line
                  y2="76.0"
                  fill="none"
                  x1="92.0"
                  x2="121.0"
                  stroke={colors.diagram.leader}
                  y1="68.5"
                />
                <text
                  id="apical_sep_tag"
                  fill={colors.text.black}
                  x="120.0"
                  y="70.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="112.6,90.6 111.6,99.8 109.8,110.4 108.4,120.4 107.2,129.2 106.6,137.2
			106.0,146.0 130.2,146.4 130.2,139.8 130.8,132.4 131.6,123.4 133.0,114.2 134.6,105.6 136.0,98.4 138.0,90.8"
                  stroke={colors.text.black}
                />
                <text x="28.5" y="110.5">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="28.5" dy="12.0" xmlSpace="preserve">
                    septal{" "}
                  </tspan>
                </text>
                <line
                  y2="118.5"
                  fill="none"
                  x1="72.0"
                  x2="112.0"
                  stroke={colors.diagram.leader}
                  y1="115.5"
                />
                <text
                  id="mid_sep_tag"
                  fill={colors.text.black}
                  x="109.0"
                  y="130.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="basal_sep"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="106.0,146.4 106.0,156.6 106.4,166.8 107.4,178.0 108.6,185.8 110.0,191.8
			112.2,197.6 115.6,204.0 119.2,210.4 123.2,216.4 126.8,219.8 129.0,221.4 132.0,221.4 134.2,220.2 136.2,217.4
			137.2,213.6 137.2,208.4 137.0,204.6 135.8,197.8 134.2,189.8 132.6,182.8 131.6,177.0 130.4,170.6 130.4,164.0
			130.2,158.0 130.2,146.4"
                  stroke={colors.text.black}
                />
                <text x="20.5" y="183.5">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="20.5" dy="12.0" xmlSpace="preserve">
                    septal{" "}
                  </tspan>
                </text>
                <line
                  y2="174.0"
                  fill="none"
                  x1="60.0"
                  x2="110.0"
                  stroke={colors.diagram.leader}
                  y1="185.0"
                />
                <text
                  id="basal_sep_tag"
                  fill={colors.text.black}
                  x="109.0"
                  y="187.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <path
                fill="none"
                d="M 120.0 49.8 C 120.0 49.8 113.0 57.8 113.0 57.8 C 113.0 57.8 109.0 63.4 109.0 63.4 C 109.0 63.4
        104.8 69.0 104.8 69.0 C 104.8 69.0 99.6 76.8 99.6 76.8 C 99.6 76.8 94.4 85.0 94.4 85.0 C 94.4 85.0 89.6 93.6
        89.6 93.6 C 89.6 93.6 84.6 103.6 84.6 103.6 C 84.6 103.6 81.6 111.0 81.6 111.0 C 81.6 111.0 78.2 119.8 78.2
        119.8 C 78.2 119.8 75.2 128.8 75.2 128.8 C 75.2 128.8 72.4 139.2 72.4 139.2 C 72.4 139.2 70.2 147.4 70.2 147.4 C
        70.2 147.4 68.0 159.0 68.0 159.0 C 68.0 159.0 66.4 168.6 66.4 168.6 C 66.4 168.6 65.2 178.4 65.2 178.4 C 65.2
        178.4 65.0 191.6 65.0 191.6 C 65.0 191.6 65.4 199.6 65.4 199.6 C 65.4 199.6 67.0 207.6 67.0 207.6 C 67.0 207.6
        69.0 213.6 69.0 213.6 C 69.0 213.6 70.6 216.6 70.6 216.6 C 70.6 216.6 73.2 217.2 73.2 217.2 C 73.2 217.2 75.2
        216.2 75.2 216.2 C 75.2 216.2 77.2 212.6 77.2 212.6 C 77.2 212.6 77.6 210.6 77.6 210.6 C 77.6 210.6 76.0 207.2
        76.0 207.2 C 76.0 207.2 75.2 203.8 75.2 203.8 C 75.2 203.8 74.6 198.8 74.6 198.8 C 74.6 198.8 74.6 193.2 74.6
        193.2 C 74.6 193.2 74.8 186.4 74.8 186.4 C 74.8 186.4 74.8 178.0 74.8 178.0 C 74.8 178.0 75.6 169.2 75.6 169.2 C
        75.6 169.2 76.8 160.0 76.8 160.0 C 76.8 160.0 78.6 150.2 78.6 150.2 C 78.6 150.2 81.0 139.8 81.0 139.8 C 81.0
        139.8 83.8 131.4 83.8 131.4 C 83.8 131.4 86.4 123.8 86.4 123.8 C 86.4 123.8 89.6 114.6 89.6 114.6 C 89.6 114.6
        94.4 105.0 94.4 105.0 C 94.4 105.0 99.2 95.6 99.2 95.6 C 99.2 95.6 103.8 87.6 103.8 87.6 C 103.8 87.6 108.6 80.0
        108.6 80.0 C 108.6 80.0 114.8 72.2 114.8 72.2"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 90.0 187.2 C 90.0 187.2 90.2 193.2 90.2 193.2 C 90.2 193.2 89.2 199.0 89.2 199.0 C 89.2 199.0
        87.0 204.6 87.0 204.6 C 87.0 204.6 83.6 209.2 83.6 209.2 C 83.6 209.2 80.0 211.8 80.0 211.8 C 80.0 211.8 77.8
        211.6 77.8 211.6"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 73.4 217.2 C 73.4 217.2 72.4 222.2 72.4 222.2 C 72.4 222.2 71.0 228.2 71.0 228.2 C 71.0 228.2
        70.0 235.0 70.0 235.0 C 70.0 235.0 70.0 242.4 70.0 242.4 C 70.0 242.4 70.2 249.2 70.2 249.2 C 70.2 249.2 71.2
        256.8 71.2 256.8 C 71.2 256.8 72.6 264.6 72.6 264.6 C 72.6 264.6 74.0 272.4 74.0 272.4 C 74.0 272.4 75.2 279.4
        75.2 279.4 C 75.2 279.4 76.2 290.8 76.2 290.8"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 94.4 185.8 C 94.4 185.8 97.2 193.0 97.2 193.0 C 97.2 193.0 100.2 198.8 100.2 198.8 C 100.2
        198.8 103.6 204.4 103.6 204.4 C 103.6 204.4 107.4 209.2 107.4 209.2 C 107.4 209.2 110.4 212.0 110.4 212.0 C
        110.4 212.0 113.6 214.0 113.6 214.0 C 113.6 214.0 116.0 215.0 116.0 215.0 C 116.0 215.0 118.4 215.4 118.4 215.4
        C 118.4 215.4 122.0 214.6 122.0 214.6"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 135.0 219.6 C 135.0 219.6 136.8 221.4 136.8 221.4 C 136.8 221.4 138.0 224.0 138.0 224.0 C
        138.0 224.0 139.0 228.2 139.0 228.2 C 139.0 228.2 139.0 232.4 139.0 232.4 C 139.0 232.4 138.6 239.0 138.6 239.0
        C 138.6 239.0 137.4 245.8 137.4 245.8 C 137.4 245.8 136.8 252.8 136.8 252.8 C 136.8 252.8 136.0 260.2 136.0
        260.2 C 136.0 260.2 134.6 269.0 134.6 269.0 C 134.6 269.0 132.8 276.8 132.8 276.8 C 132.8 276.8 131.0 283.2
        131.0 283.2 C 131.0 283.2 128.4 289.0 128.4 289.0 C 128.4 289.0 125.8 293.4 125.8 293.4"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 136.4 217.4 C 136.4 217.4 139.4 216.8 139.4 216.8 C 139.4 216.8 143.0 215.6 143.0 215.6 C
        143.0 215.6 147.6 213.6 147.6 213.6 C 147.6 213.6 152.0 211.6 152.0 211.6 C 152.0 211.6 156.0 209.6 156.0 209.6
        C 156.0 209.6 159.8 207.2 159.8 207.2 C 159.8 207.2 163.2 205.4 163.2 205.4 C 163.2 205.4 166.0 202.4 166.0
        202.4 C 166.0 202.4 169.2 199.4 169.2 199.4 C 169.2 199.4 171.6 196.8 171.6 196.8 C 171.6 196.8 174.2 193.4
        174.2 193.4"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 177.0 192.6 C 177.0 192.6 182.0 195.8 182.0 195.8 C 182.0 195.8 187.6 200.0 187.6 200.0 C
        187.6 200.0 193.4 204.0 193.4 204.0 C 193.4 204.0 198.0 206.6 198.0 206.6 C 198.0 206.6 201.6 208.6 201.6 208.6
        C 201.6 208.6 206.4 210.4 206.4 210.4 C 206.4 210.4 209.0 211.4 209.0 211.4 C 209.0 211.4 211.0 212.6 211.0
        212.6 C 211.0 212.6 212.4 215.2 212.4 215.2 C 212.4 215.2 213.6 219.6 213.6 219.6 C 213.6 219.6 214.6 225.6
        214.6 225.6 C 214.6 225.6 215.2 232.8 215.2 232.8 C 215.2 232.8 215.2 241.2 215.2 241.2 C 215.2 241.2 214.4
        248.0 214.4 248.0 C 214.4 248.0 213.4 256.0 213.4 256.0 C 213.4 256.0 211.6 265.4 211.6 265.4 C 211.6 265.4
        209.2 274.8 209.2 274.8 C 209.2 274.8 207.0 281.4 207.0 281.4 C 207.0 281.4 204.0 290.8 204.0 290.8"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 185.2 296.0 C 185.2 296.0 179.4 293.6 179.4 293.6 C 179.4 293.6 173.4 292.0 173.4 292.0 C
        173.4 292.0 168.0 291.4 168.0 291.4 C 168.0 291.4 158.4 291.8 158.4 291.8 C 158.4 291.8 152.2 293.4 152.0 293.4
        C 151.8 293.4 147.2 295.2 147.2 295.2 C 147.2 295.2 141.8 299.0 141.8 299.0"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 114.0 298.0 C 114.0 298.0 107.6 298.8 107.6 298.8 C 107.6 298.8 101.4 299.4 101.4 299.2 C
        101.4 299.0 98.4 299.6 98.4 299.6 C 98.4 299.6 95.2 300.6 95.2 300.6"
                stroke={colors.text.black}
              />
              <text x="156.2" y="142.2">
                <tspan xmlSpace="preserve">LV </tspan>
              </text>
              <text x="80.20001" y="166.59996">
                <tspan xmlSpace="preserve">RV </tspan>
              </text>
              <text x="92.600006" y="254.8">
                <tspan xmlSpace="preserve">RA </tspan>
              </text>
              <text x="167.59999" y="250.59999">
                <tspan xmlSpace="preserve">LA </tspan>
              </text>
              <text x="70.1" y="331.8">
                <tspan style={{ fontSize: "20px" }} xmlSpace="preserve">
                  Apical 4-chamber
                </tspan>
              </text>
            </svg>
          </div>
          <div
            style={{ width: "50%", display: "flex", justifyContent: "center" }}
          >
            <svg
              id="echo_examination_svg"
              contentScriptType="text/ecmascript"
              width="300.0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              baseProfile="full"
              zoomAndPan="magnify"
              contentStyleType="text/css"
              height="350.0px"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
            >
              <g
                id="basal_ant"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="195.5,217.91669 199.0,217.41669 202.25,215.9167 205.5,212.4167
			208.5,205.9167 212.25,194.9167 213.5,186.6667 215.25,173.9167 215.25,159.6667 188.25,159.1667 188.25,167.4167
			187.5,177.6667 186.25,189.1667 186.5,199.9167 187.25,207.6667 190.0,215.6667 191.75,216.91669"
                  stroke={colors.text.black}
                />
                <text x="217.66667" y="186.33337">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="217.66667" xmlSpace="preserve" dy="12.0">
                    anterior
                  </tspan>
                </text>
                <text
                  id="basal_ant_tag"
                  fill={colors.text.black}
                  x="188.0"
                  y="187.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_ant"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="215.25,159.6667 214.0,143.9167 212.5,133.16667 209.5,118.41666
			207.25,108.66666 205.75,102.66666 179.0,102.41666 180.75,107.66666 183.0,116.16666 185.25,126.41666
			186.75,135.9167 188.25,147.6667 188.25,159.1667"
                  stroke={colors.text.black}
                />
                <text x="215.66667" y="126.999985">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="215.66667" xmlSpace="preserve" dy="12.0">
                    anterior
                  </tspan>
                </text>
                <text
                  id="mid_ant_tag"
                  fill={colors.text.black}
                  x="186.0"
                  y="130.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_ant"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="206.0,102.66666 202.0,89.66666 197.0,74.16665 192.0,62.66667
			187.75,54.41667 182.0,47.66667 174.0,39.66667 157.75,63.41667 157.5,64.16667 161.25,67.91667 165.5,74.41665
			169.75,81.41665 173.0,87.41665 176.25,94.66666 179.0,102.16666"
                  stroke={colors.text.black}
                />
                <text x="197.00002" y="53.000008">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="197.00002" xmlSpace="preserve" dy="12.0">
                    anterior
                  </tspan>
                  <tspan x="197.00002" xmlSpace="preserve" dy="12.0"></tspan>
                </text>
                <text
                  id="apical_ant_tag"
                  fill={colors.text.black}
                  x="170.0"
                  y="80.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apex"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="174.0,39.66667 167.5,34.166664 160.75,29.916664 155.25,27.666664
			148.5,25.916664 141.5,25.166664 137.0,26.666664 131.75,29.166664 127.0,31.416664 122.5,34.666664 136.0,61.16667
			140.0,59.66667 144.75,59.16667 150.25,59.91667 153.75,61.41667 157.5,63.91667"
                  stroke={colors.text.black}
                />
                <text x="131.66667" y="17.666668">
                  <tspan xmlSpace="preserve">apex </tspan>
                </text>
                <text
                  id="apex_tag"
                  fill={colors.text.black}
                  x="135.0"
                  y="50.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="apical_inf"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="122.625,34.666664 114.75,40.79167 108.375,47.91667 104.125,54.16667
			99.875,68.04167 96.625,82.16665 93.625,100.16666 121.75,100.66666 122.75,93.16666 124.625,84.16665
			127.0,75.79165 130.125,68.916664 133.125,64.41667 136.125,61.54167"
                  stroke={colors.text.black}
                />
                <text x="45.0" y="62.33333">
                  <tspan xmlSpace="preserve">apical </tspan>
                  <tspan x="45.0" xmlSpace="preserve" dy="12.0">
                    inferior
                  </tspan>
                </text>
                <text
                  id="apical_inf_tag"
                  fill={colors.text.black}
                  x="100.0"
                  y="80.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="mid_inf"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="93.625,100.29166 92.25,110.66666 91.25,124.41666 90.75,138.2917
			90.5,157.4167 119.375,157.6667 119.25,146.7917 119.125,133.41667 119.5,121.16666 120.25,111.79166
			121.875,100.66666"
                  stroke={colors.text.black}
                />
                <text x="29.000004" y="125.66666">
                  <tspan xmlSpace="preserve">mid </tspan>
                  <tspan x="29.000004" xmlSpace="preserve" dy="12.0">
                    inferior
                  </tspan>
                </text>
                <text
                  id="mid_inf_tag"
                  fill={colors.text.black}
                  x="93.0"
                  y="130.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <g
                id="basal_inf"
                onMouseLeave={(event) => onMouseLeavePolygon(event)}
                onMouseEnter={(event) => onMouseEnterPolygon(event)}
                onContextMenu={(event) => onContextMenu(event)}
                onClick={(event) => GetComment(event)}
              >
                <polygon
                  points="90.625,157.6667 90.5,173.2917 91.625,183.2917 93.75,194.2917
			96.25,202.1667 99.625,209.2917 104.0,216.54169 108.75,223.41669 113.625,228.29169 117.0,230.29169
			119.5,230.29169 122.125,229.16669 124.0,226.04169 125.375,220.41669 125.625,214.2917 125.375,200.6667
			123.875,192.1667 121.875,182.9167 120.75,175.0417 119.875,166.4167 119.625,157.6667"
                  stroke={colors.text.black}
                />
                <text x="40.333332" y="186.33333">
                  <tspan xmlSpace="preserve">basal </tspan>
                  <tspan x="40.333332" xmlSpace="preserve" dy="12.0">
                    inferior
                  </tspan>
                </text>
                <text
                  id="basal_inf_tag"
                  fill={colors.text.black}
                  x="96.0"
                  y="200.0"
                  style={{ cursor: "default" }}
                ></text>
              </g>
              <path
                fill="none"
                d="M 151.125 204.0417 C 151.125 204.0417 149.625 208.9167 149.625 208.9167 C 149.625 208.9167
        146.875 213.2917 146.875 213.2917 C 146.875 213.2917 143.375 218.04169 143.375 218.04169 C 143.375 218.04169
        139.375 221.66669 139.375 221.66669 C 139.375 221.66669 135.5 224.79169 135.5 224.79169 C 135.5 224.79169
        131.375 227.16669 131.375 227.16669 C 131.375 227.16669 128.125 228.29169 128.125 228.29169 C 128.125 228.29169
        125.375 228.41669 125.375 228.41669 C 125.375 228.41669 123.375 227.41669 123.375 227.41669 C 123.375 227.41669
        122.25 229.04169 122.25 229.04169 C 122.25 229.04169 121.125 230.54169 121.125 230.54169 C 121.125 230.54169
        120.875 233.66669 120.875 233.66669 C 120.875 233.66669 120.0 240.91669 120.0 240.91669 C 120.0 240.91669
        119.125 249.16669 119.125 249.16669 C 119.125 249.16669 118.5 256.2917 118.5 256.2917 C 118.5 256.2917 118.375
        263.5416 118.375 263.5416 C 118.375 263.5416 118.375 271.0416 118.375 271.0416 C 118.375 271.0416 118.625
        280.2916 118.625 280.2916 C 118.625 280.2916 119.375 289.5416 119.375 289.5416 C 119.375 289.5416 120.625
        301.5416 120.625 301.5416 C 120.625 301.5416 120.875 305.7916 120.875 305.7916"
                stroke={colors.text.black}
              />
              <path
                fill="none"
                d="M 155.75 200.5417 C 155.75 200.5417 157.5 204.2917 157.5 204.2917 C 157.5 204.2917 159.625
        206.6667 159.625 206.6667 C 159.625 206.6667 163.125 209.4167 163.125 209.4167 C 163.125 209.4167 167.625
        211.7917 167.625 211.7917 C 167.625 211.7917 174.0 214.1667 174.0 214.1667 C 174.0 214.1667 180.625 215.5417
        180.625 215.5417 C 180.625 215.5417 186.0 216.66669 186.0 216.66669 C 186.0 216.66669 189.75 216.91669 189.75
        216.91669 C 189.75 216.91669 191.875 216.91669 191.875 216.91669 C 191.875 216.91669 194.5 217.91669 194.5
        217.91669 C 194.5 217.91669 197.0 218.54169 197.0 218.54169 C 197.0 218.54169 198.375 218.91669 198.375
        218.91669 C 198.375 218.91669 201.125 221.91669 201.125 221.91669 C 201.125 221.91669 203.25 225.41669 203.25
        225.41669 C 203.25 225.41669 204.375 229.29169 204.375 229.29169 C 204.375 229.29169 204.875 233.29169 204.875
        233.29169 C 204.875 233.29169 205.375 239.91669 205.375 239.91669 C 205.375 239.91669 205.125 249.04169 205.125
        249.04169 C 205.125 249.04169 204.0 257.2917 204.0 257.2917 C 204.0 257.2917 203.375 263.4166 203.375 263.4166 C
        203.375 263.4166 202.0 270.5416 202.0 270.5416 C 202.0 270.5416 200.0 277.5416 200.0 277.5416 C 200.0 277.5416
        197.875 284.9166 197.875 284.9166 C 197.875 284.9166 195.25 291.7916 195.25 291.7916 C 195.25 291.7916 193.375
        298.2916 193.375 298.2916"
                stroke={colors.text.black}
              />
              <text x="151.0" y="262.99994">
                <tspan xmlSpace="preserve">LA </tspan>
              </text>
              <text x="145.66667" y="157.00003">
                <tspan xmlSpace="preserve">LV </tspan>
              </text>
              <text x="72.0" y="331.0">
                <tspan style={{ fontSize: "20px" }} xmlSpace="preserve">
                  Apical 2-chamber
                </tspan>
                <tspan xmlSpace="preserve"> </tspan>
              </text>
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              marginTop: "50px",
              marginBottom: "30px",
            }}
          >
            <table
              style={{
                cursor: "default",
                color: "black",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "150px" }}>X - cannot interpret</td>
                  <td style={{ width: "150px" }}>0 - hyperkinetic</td>
                  <td style={{ width: "150px" }}>1 - normal</td>
                  <td style={{ width: "150px" }}>2 - hypokinetic</td>
                </tr>
                <tr>
                  <td>3 - akinetic</td>
                  <td>4 - dyskinetic</td>
                  <td>5 - aneurysmal</td>
                  <td>6 - akinetic with scar</td>
                </tr>
                <tr>
                  <td>7 - dyskinetic with scar</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Box>
    );
  }
}

export default EchoExamination;
