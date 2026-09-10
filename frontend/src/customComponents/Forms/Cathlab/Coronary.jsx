import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import ReactDOM from "react-dom";

// @mui/material components
import { css } from "@emotion/css";
import { ClickAwayListener, Popover, IconButton } from "@mui/material";
// @mui/icons-material
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import backGroundImage from "assets/img/coronary.png";
import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/coronaryArtery";

import cathlabStyles from "assets/jss/material-dashboard-pro-react/custom/Cathlab/cathlabStyles";
import { createMarkup } from "utils/sanitize";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

const withMui5Styles = (stylesObj) => (WrappedComponent) => {
  const classes = Object.keys(stylesObj).reduce((acc, key) => {
    acc[key] = css(stylesObj[key]);
    return acc;
  }, {});

  const WithMui5Styles = React.forwardRef((props, ref) => (
    <WrappedComponent {...props} classes={classes} ref={ref} />
  ));
  return WithMui5Styles;
};

class Coronary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: props.Data || null,
      anchorEl: null,
      CommentHtml: null,
      Polygon: null,
    };
    this.Dic = [
      { IsParent: true, Value: "normal" },
      //occlusion_less_50
      { IsParent: true, Value: "occlusion_less_50" },
      { IsChild: true, Parent: "occlusion_less_50", Value: "stent_less_50" },
      { IsChild: true, Parent: "occlusion_less_50", Value: "ballon_less_50" },
      //occlusion_50_75
      { IsParent: true, Value: "occlusion_50_75" },
      { IsChild: true, Parent: "occlusion_50_75", Value: "stent_50_75" },
      { IsChild: true, Parent: "occlusion_50_75", Value: "ballon_50_75" },
      //occlusion_75_99
      { IsParent: true, Value: "occlusion_75_99" },
      { IsChild: true, Parent: "occlusion_75_99", Value: "stent_75_99" },
      { IsChild: true, Parent: "occlusion_75_99", Value: "ballon_75_99" },
      //occlusion_100
      { IsParent: true, Value: "occlusion_100" },
      { IsChild: true, Parent: "occlusion_100", Value: "stent_100" },
      { IsChild: true, Parent: "occlusion_100", Value: "ballon_100" },
    ];
  }

  componentDidMount() {
    this.GetMainColor();
    this.BindData();
  }

  GetMainColor = () => {
    var key;
    var SelectObject = [];

    for (key in cathlab_section.polygons) {
      SelectObject = cathlab_section.polygons[key];
      SelectObject.tags = [];
      SelectObject.hasTag = false;
      SelectObject.comment = "";
    }

    for (key in cathlab_section.polygons) {
      var obj = cathlab_section.polygons[key];
      var element = document.getElementById(obj.id);
      if (element) {
        var textElements = element.getElementsByTagName("text");
        if (textElements.length > 0) {
          textElements[0].setAttribute(
            "fill",
            cathlab_section.PolygonColorType.MID,
          );
          textElements[0].setAttribute("font-size", "10");
        }
      }

      {
        const el = document.getElementById(obj.id);
        if (el) el.setAttribute("fill", obj.getColor());
      }
    }
  };

  GetComment = (event) => {
    const { NotEdit } = this.props;
    const { classes } = this.props;
    var SelectObject = [];
    if (event.target.id) {
      SelectObject = cathlab_section.polygons.filter(
        (e) => e.id === event.target.id,
      );
    } else {
      SelectObject = cathlab_section.polygons.filter(
        (e) => e.id === event.target.parentElement.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });

      if (SelectObject[0].tags.length > 0) SelectObject[0].hasTag = true;
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
                    color: "#3C4858",
                    fontSize: "16px",
                    textDecoration: "none",
                    marginBottom: "0",
                  }}
                >
                  Тайлбар:
                </h4>
                <BaseTextArea
                  Rows="4"
                  Value={SelectObject[0].comment}
                  fullWidth
                  ChangeValue={(name, value) =>
                    (SelectObject[0].comment = value)
                  }
                  className={classes.commentTextField}
                  HideLabel={true}
                  disabled={NotEdit}
                />
              </div>
            </div>
          ),
        });
      }
    }
  };

  PolygonCathElements = () => {
    var CathlabElements = [];
    cathlab_section.polygons.forEach((polygon) => {
      if (polygon.tags.length > 0) {
        var NewObj = {
          Type: "1",
          UniqueName: polygon.id,
          Comment: polygon.comment,
          Tags: polygon.tags,
        };
        CathlabElements.push(NewObj);
      }
    });

    return CathlabElements;
  };

  GetPolygon = (value) => {
    const { Dic } = this;
    const { Polygon } = this.state;
    const { NotEdit } = this.props;
    const { classes } = this.props;
    var Val = Dic.filter((s) => s.Value === value);
    var childs = [];
    Val = Val[0];
    if (Polygon && !NotEdit) {
      if (Polygon.tags.indexOf(value) !== -1) {
        childs = Dic.filter((s) => s.Parent === value);
        Polygon.tags.splice(Polygon.tags.indexOf(value), 1);
        childs.forEach((element) => {
          if (element && Polygon.tags.indexOf(element.Value) !== -1) {
            Polygon.tags.splice(Polygon.tags.indexOf(element.Value), 1);
          }
        });
      } else {
        if (Val.IsParent) {
          Polygon.tags = [];
        } else if (Val.IsChild) {
          childs = Dic.filter(
            (s) => s.Parent === Val.Parent && s.Value !== value,
          );
          var temp = [];
          childs.forEach((v) => {
            if (Polygon.tags.filter((s) => s === v.Value).length > 0) {
              temp.push(v.Value);
            }
          });
          Polygon.tags = [...temp, Val.Parent];
        }
        Polygon.tags.push(value);
      }

      if (Polygon.tags.length > 0) Polygon.hasTag = true;
      else Polygon.hasTag = false;
      document.getElementById(Polygon.id).style["fill"] = Polygon.getColor();

      // Update checkmarks in the menu
      var Tags = Polygon.tags;
      var child = document.getElementById("coronary_menu").children;
      for (var i = 0; i < child.length; i++) {
        var liTagVal = child[i].children[1].getAttribute("val");
        var tempCheck = Tags.filter((s) => s === liTagVal);
        if (tempCheck.length > 0) {
          child[i].children[0].style["display"] = "";
        } else {
          child[i].children[0].style["display"] = "none";
        }
        var childSubMenu = child[i].getElementsByTagName("ul");
        if (childSubMenu.length > 0) {
          var childSubMenuLi = childSubMenu[0].children;
          for (var j = 0; j < childSubMenuLi.length; j++) {
            var liSubMenuTagVal =
              childSubMenuLi[j].children[1].getAttribute("val");
            var tempSubMenu = Tags.filter((s) => s === liSubMenuTagVal);
            if (tempSubMenu.length > 0) {
              childSubMenuLi[j].children[0].style["display"] = "";
            } else {
              childSubMenuLi[j].children[0].style["display"] = "none";
            }
          }
        }
      }
    }
  };

  BindData = () => {
    const { Data } = this.state;
    if (Data && Data.CathlabElement) {
      Data.CathlabElement.forEach((element) => {
        if (
          element &&
          element.vwCathLabElementType &&
          element.vwCathLabElementType.value === "1"
        ) {
          var Tags = [];
          Array.isArray(element.LookUpData) &&
            element.LookUpData.map((row) => {
              Tags.push(row.vwCathLabElementTags.label);
            });

          this.SetData(
            element.vwCathLabUniqueName.label,
            Tags,
            element.comment,
          );
        }
      });
    }
  };

  SetData = (PolygonName, Tags, Comment) => {
    var SelectObject = cathlab_section.polygons.filter(
      (e) => e.id === PolygonName,
    )[0];

    SelectObject.tags = Tags;
    SelectObject.hasTag = true;
    SelectObject.comment = Comment;
    document.getElementById(PolygonName).style["fill"] =
      SelectObject.getColor();
  };

  onContextMenu = (event) => {
    const { classes } = this.props;
    var SelectObject = [];
    if (event.target.id) {
      SelectObject = cathlab_section.polygons.filter(
        (e) => e.id === event.target.id,
      );
    } else {
      SelectObject = cathlab_section.polygons.filter(
        (e) => e.id === event.target.parentElement.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });
      var Tags = SelectObject[0].tags;
      var child = document.getElementById("coronary_menu").children;
      for (var i = 0; i < child.length; i++) {
        var liTagVal = child[i].children[1].getAttribute("val");
        var temp = Tags.filter((s) => s === liTagVal);
        if (temp.length > 0) {
          child[i].children[0].style["display"] = "";
        } else {
          child[i].children[0].style["display"] = "none";
        }
        var childSubMenu = child[i].getElementsByTagName("ul");
        if (childSubMenu.length > 0) {
          var childSubMenuLi = childSubMenu[0].children;
          for (var j = 0; j < childSubMenuLi.length; j++) {
            var liSubMenuTagVal =
              childSubMenuLi[j].children[1].getAttribute("val");
            var tempSubMenu = Tags.filter((s) => s === liSubMenuTagVal);
            if (tempSubMenu.length > 0) {
              childSubMenuLi[j].children[0].style["display"] = "";
            } else {
              childSubMenuLi[j].children[0].style["display"] = "none";
            }
          }
        }
      }
    }

    document
      .querySelectorAll(`.${classes.contextMenu}`)
      .forEach((el) => (el.style.display = "block"));
    {
      const el = document.querySelector(`.${classes.contextMenu}`);
      if (el) {
        el.style.top = event.clientY + "px";
        el.style.left = event.clientX + "px";
      }
    }
    event.preventDefault();
  };

  onMouseLeavePolygon = (polygon, textId) => {
    var Obj = cathlab_section.polygons.filter(
      (e) => e.id === polygon.currentTarget.id,
    )[0];
    if (Obj) {
      polygon.currentTarget.style["fill"] = Obj.getColor();
    }
    if (polygon.currentTarget.getElementsByTagName("text").length !== 0)
      polygon.currentTarget.getElementsByTagName("text")[0].style["fill"] =
        cathlab_section.PolygonColorType.MID;
    if (textId !== null) {
      const el = document.getElementById(textId);
      if (el) el.removeAttribute("fill");
    }
  };

  onMouseEnterPolygon = (polygon, textId) => {
    polygon.currentTarget.style["fill"] = cathlab_section.colorFocused;
    if (polygon.currentTarget.getElementsByTagName("text").length !== 0)
      polygon.currentTarget.getElementsByTagName("text")[0].style["fill"] =
        cathlab_section.colorFocused;
    if (textId !== null) {
      const el = document.getElementById(textId);
      if (el) el.setAttribute("fill", cathlab_section.colorFocused);
    }
  };

  render() {
    const { t } = this.props;
    const { classes } = this.props;
    const { anchorEl, CommentHtml } = this.state;
    const {
      GetPolygon,
      onMouseLeavePolygon,
      onMouseEnterPolygon,
      GetComment,
      onContextMenu,
    } = this;
    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px 0",
          display: "flex",
          justifyContent: "center",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => this.setState({ anchorEl: null })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          classes={{ paper: classes.paper }}
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
                className={classes.closeButton}
                onClick={() => this.setState({ anchorEl: null })}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div>{CommentHtml}</div>
        </Popover>
        {ReactDOM.createPortal(
          <ClickAwayListener
            onClickAway={() =>
              document
                .querySelectorAll(`.${classes.contextMenu}`)
                .forEach((el) => (el.style.display = "none"))
            }
          >
            <div>
              <ul
                id="coronary_menu"
                className={classes.contextMenu}
                onContextMenu={(e) => e.preventDefault()}
              >
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="normal"
                    onClick={() => GetPolygon("normal")}
                  >
                    Хэвийн
                  </a>
                </li>

                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="occlusion_less_50"
                    onClick={() => GetPolygon("occlusion_less_50")}
                  >
                    50%-аас бага бөглөрөл
                  </a>
                  <ul>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="stent_less_50"
                        onClick={() => GetPolygon("stent_less_50")}
                      >
                        Стент суулгасан
                      </a>
                    </li>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="ballon_less_50"
                        onClick={() => GetPolygon("ballon_less_50")}
                      >
                        Баллон тэлэлт
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="occlusion_50_75"
                    onClick={() => GetPolygon("occlusion_50_75")}
                  >
                    50% - 75% бөглөрөл
                  </a>
                  <ul>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="stent_50_75"
                        onClick={() => GetPolygon("stent_50_75")}
                      >
                        Стент суулгасан
                      </a>
                    </li>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="ballon_50_75"
                        onClick={() => GetPolygon("ballon_50_75")}
                      >
                        Баллон тэлэлт
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="occlusion_75_99"
                    onClick={() => GetPolygon("occlusion_75_99")}
                  >
                    75% - 99% бөглөрөл
                  </a>
                  <ul>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="stent_75_99"
                        onClick={() => GetPolygon("stent_75_99")}
                      >
                        Стент суулгасан
                      </a>
                    </li>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="ballon_75_99"
                        onClick={() => GetPolygon("ballon_75_99")}
                      >
                        Баллон тэлэлт
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="occlusion_100"
                    onClick={() => GetPolygon("occlusion_100")}
                  >
                    100% бөглөрөл
                  </a>
                  <ul>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="stent_100"
                        onClick={() => GetPolygon("stent_100")}
                      >
                        Стент суулгасан
                      </a>
                    </li>
                    <li>
                      <span style={{ display: "none" }}>
                        <CheckIcon
                          fontSize="small"
                          style={{ color: "#009c00" }}
                        />
                      </span>
                      <a
                        type="checkbox"
                        val="ballon_100"
                        onClick={() => GetPolygon("ballon_100")}
                      >
                        Баллон тэлэлт
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </ClickAwayListener>,
          document.body,
        )}

        <svg
          id="coronaryArterySVG"
          contentScriptType="text/ecmascript"
          width="740px"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          baseProfile="full"
          zoomAndPan="magnify"
          contentStyleType="text/css"
          height="600.0px"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          version="1.0"
          onContextMenu={(e) => e.preventDefault()}
        >
          <defs>
            <pattern
              id="stentPatternMid"
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="6"
              height="6"
            >
              <rect x="0" y="0" width="6" height="6" fill="yellow" />
              <line
                x1="0"
                y1="0"
                x2="6"
                y2="6"
                stroke="black"
                strokeWidth=".7"
              />
              <line
                x1="6"
                y1="0"
                x2="0"
                y2="6"
                stroke="black"
                strokeWidth=".7"
              />
            </pattern>
            <pattern
              id="stentPatternBad"
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="6"
              height="6"
            >
              <rect x="0" y="0" width="6" height="6" fill="red" />
              <line
                x1="0"
                y1="0"
                x2="6"
                y2="6"
                stroke="black"
                strokeWidth=".7"
              />
              <line
                x1="6"
                y1="0"
                x2="0"
                y2="6"
                stroke="black"
                strokeWidth=".7"
              />
            </pattern>
          </defs>

          <image
            x="0.0"
            y="0.0"
            width="738"
            xlinkHref={backGroundImage}
            height="597"
            preserveAspectRatio="none"
          />
          <text id="label_proximal_rca" x="25.0" y="90.0" fontSize="12">
            <tspan xmlSpace="preserve">Proximal</tspan>
            <tspan x="25.0" dy="12.0" xmlSpace="preserve">
              RCA
            </tspan>
          </text>
          <text id="label_mid_rca" x="20.0" y="310.0" fontSize="12">
            <tspan xmlSpace="preserve">Mid</tspan>
            <tspan x="20.0" dy="12.0" xmlSpace="preserve">
              RCA
            </tspan>
          </text>
          <text id="label_distal_rca" x="30.0" y="463.0" fontSize="12">
            <tspan xmlSpace="preserve">Distal</tspan>
            <tspan x="30.0" dy="12.0" xmlSpace="preserve">
              RCA
            </tspan>
          </text>

          <text id="label_lm" x="270.0" y="73.0" fontSize="12">
            <tspan xmlSpace="preserve">LM</tspan>
          </text>
          <text id="label_proximal_lad" x="360.0" y="83.0" fontSize="12">
            <tspan xmlSpace="preserve">Proximal LAD</tspan>
          </text>
          <text id="label_mid_lad" x="570.0" y="160.0" fontSize="12">
            <tspan xmlSpace="preserve">Mid</tspan>
            <tspan x="570.0" dy="12.0" xmlSpace="preserve">
              LAD
            </tspan>
          </text>
          <text id="label_distal_lad" x="530.0" y="550.0" fontSize="12">
            <tspan xmlSpace="preserve">Distal</tspan>
            <tspan x="530.0" dy="12.0" xmlSpace="preserve">
              LAD
            </tspan>
          </text>

          <text id="label_proximal_lcx" x="285.0" y="160.0" fontSize="12">
            <tspan xmlSpace="preserve">Proximal</tspan>
            <tspan x="285.0" dy="12.0" xmlSpace="preserve">
              LCX
            </tspan>
          </text>
          <text id="label_mid_lcx" x="330.0" y="260.0" fontSize="12">
            <tspan xmlSpace="preserve">Mid</tspan>
            <tspan x="330.0" dy="12.0" xmlSpace="preserve">
              LCX
            </tspan>
          </text>
          <text id="label_distal_lcx" x="310.0" y="365.0" fontSize="12">
            <tspan xmlSpace="preserve">Distal</tspan>
            <tspan x="310.0" dy="12.0" xmlSpace="preserve">
              LCX
            </tspan>
          </text>

          <polygon
            id="rca_proximal_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="152.0,70.0 144.25,74.25 136.25,73.75 116.5,73.25 121.0,86.75 126.25,83.75
        131.5,82.75 136.25,84.75 141.25,87.25 145.0,87.0 147.25,85.25 156.0,84.75"
          />
          <polygon
            id="rca_proximal_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="116.75,73.5 106.5,73.25 110.0,85.5 121.75,86.5"
          />
          <polygon
            id="rca_proximal_3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="107.0,73.25 100.0,74.5 90.25,74.75 86.25,77.5 81.5,80.0 78.75,85.0 75.5,91.5
        73.0,99.25 83.0,102.0 85.5,95.5 87.75,89.75 91.25,86.5 96.75,85.5 102.5,84.5 110.5,85.5"
          />
          <polygon
            id="rca_proximal_4"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="83.2,101.8 81.4,106.4 80.8,110.8 79.6,115.6 79.0,121.8 78.2,126.4 77.4,134.2 67.4,134.0
        68.4,129.0 68.8,120.8 70.0,114.2 70.8,108.2 71.8,102.2 72.8,98.8"
          />
          <polygon
            id="rca_proximal_5"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="67.4,134.0 67.4,150.4 68.6,158.4 69.4,165.6 69.6,184.0 80.0,184.0 79.6,164.0 78.8,155.6
        78.0,145.6 77.6,134.2"
          />
          <polygon
            id="rca_mid_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="69.6,184.0 69.4,187.4 69.4,193.8 70.2,196.6 70.4,208.2 69.6,218.0 69.0,231.8 79.4,231.0
        79.0,220.4 80.0,205.8 79.8,184.4"
          />
          <polygon
            id="rca_mid_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="68.8,231.6 68.4,239.0 66.8,244.2 65.6,252.2 63.4,260.6 61.6,267.6 60.4,274.8 60.2,282.8
        58.4,287.4 57.4,290.8 56.8,296.6 67.6,297.6 68.4,292.6 69.4,284.2 71.0,277.4 72.2,271.8 73.6,262.8 76.2,258.2
        76.8,251.4 77.4,242.0 79.4,231.0"
          />
          <polygon
            id="rca_mid_3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="57.0,296.6 55.8,304.4 54.6,312.4 53.4,321.8 53.2,343.4 51.2,349.0 51.6,370.0 51.4,392.2
        62.6,391.8 62.8,371.2 63.6,361.4 63.4,346.8 63.4,332.6 64.8,317.8 66.2,307.8 67.8,297.6"
          />
          <polygon
            id="rca_distal_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="51.0,392.0 51.2,413.6 53.0,418.8 53.8,425.4 57.8,434.4 63.0,443.4 67.4,451.2 76.2,445.0
        72.6,439.8 69.0,433.4 65.6,425.2 62.8,417.0 62.0,411.0 62.2,391.8"
          />
          <polygon
            id="rca_distal_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_rca");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_rca");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="67.4,451.0 70.4,456.0 74.0,460.8 79.6,464.2 82.6,466.0 85.6,468.8 92.2,471.6 98.8,474.0
        103.2,475.8 112.0,476.2 115.4,477.4 121.6,477.6 124.6,478.4 134.4,478.0 134.0,467.4 127.2,467.4 120.2,466.2
        112.2,466.2 106.6,464.8 102.4,464.2 98.2,462.4 91.4,458.2 85.8,454.6 81.6,452.2 76.4,445.0"
          />
          <g
            id="g_Acute_Marginal2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="79.6,231.0 93.2,231.2 100.2,233.4
        106.2,238.6 110.0,244.6 110.8,267.2 116.8,278.2 124.6,286.2 135.0,289.8 143.2,293.0 148.2,295.6 134.8,291.6
        126.6,289.8 119.6,285.6 113.2,280.4 105.6,268.8 105.0,248.6 102.8,244.8 96.4,239.8 87.6,238.8 81.8,240.8
        77.6,241.2"
            />
            <text x="115.33333" y="263.33334">
              <tspan xmlSpace="preserve">Acute Marginal</tspan>
            </text>
          </g>
          <g
            id="g_Acute_Marginal1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="69.0,185.8 62.8,189.2 50.6,188.8
        41.8,189.4 35.8,191.6 31.0,195.0 26.8,198.4 22.6,203.8 20.0,211.2 18.4,219.2 18.6,231.2 20.6,239.6 24.0,247.2
        28.0,251.8 32.0,258.2 35.6,266.0 37.6,273.6 38.6,280.2 41.8,286.2 39.0,279.2 36.2,265.4 28.6,250.4 24.2,240.6
        22.2,233.0 21.4,223.2 22.6,214.4 25.0,208.8 29.2,203.6 37.8,196.6 64.2,196.4 69.6,193.8"
            />
            <text x="15.0" y="173.0">
              <tspan xmlSpace="preserve">Acute</tspan>
              <tspan x="15.0" dy="12.0" xmlSpace="preserve">
                Marginal
              </tspan>
            </text>
          </g>
          <g
            id="g_rt_pda"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="124.666664,477.66666 125.0,491.0 128.33333,498.66666 136.33333,507.66666
        147.33333,517.3333 160.0,529.0 164.0,535.3333 166.0,540.0 167.33333,551.6667 170.33333,558.6667
        176.66667,568.3333 181.33333,573.6667 188.33333,580.3333 199.0,584.0 213.66667,585.3333 225.33333,585.0
        239.0,585.3333 248.0,586.3333 263.33334,585.0 278.66666,581.0 288.66666,580.6667 305.33334,579.6667
        319.33334,580.0 334.33334,581.0 350.66666,585.3333 357.66666,585.6667 378.0,584.0 355.33334,583.3333
        344.33334,580.0 332.66666,577.3333 313.66666,577.0 301.33334,576.6667 288.33334,576.0 277.33334,577.3333
        261.66666,580.6667 245.0,580.0 234.0,578.3333 203.66667,577.6667 193.33333,574.6667 182.33333,563.0
        178.33333,559.3333 177.0,554.0 174.0,547.3333 173.0,539.3333 170.66667,531.6667 165.66667,522.6667
        158.0,515.6667 153.33333,513.0 150.33333,508.0 142.0,501.66666 136.33333,494.33334 134.33333,489.33334
        134.66667,477.0"
            />
            <text x="145.0" y="581.6667">
              <tspan xmlSpace="preserve">RT PDA</tspan>
            </text>
          </g>
          <polygon
            id="lad_proximal_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_lm");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_lm");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="246.4,70.2 249.6,72.6 254.2,72.8 257.0,74.6 261.8,75.8 264.4,78.4 267.8,78.8 271.8,81.4
        305.4,81.4 309.6,81.0 317.4,83.4 323.8,85.4 333.6,86.4 331.0,101.0 324.0,100.4 318.4,98.6 313.6,98.4 310.2,96.8
        304.6,96.6 299.2,97.4 280.2,97.0 273.2,95.4 265.6,95.2 259.8,92.2 252.6,88.8 247.2,88.2 244.8,85.8"
          />
          <polygon
            id="lad_proximal_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="333.6,86.2 364.4,86.4 364.0,101.6 356.4,101.0 347.2,100.2 341.8,100.6 331.0,101.0"
          />
          <polygon
            id="lad_proximal_3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="364.2,86.2 390.6,86.6 407.8,88.0 431.4,88.4 431.0,103.4 417.4,102.4 395.4,102.2
        363.8,101.8"
          />
          <polygon
            id="lad_proximal_4"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="431.4,88.2 436.4,89.2 442.2,89.4 447.8,91.2 453.2,91.4 460.4,93.6 465.0,96.2 468.4,96.4
        476.6,100.0 482.2,100.6 487.6,102.0 482.6,115.4 475.0,112.8 466.6,109.6 460.6,107.4 454.6,106.6 446.4,104.8
        440.2,103.6 431.0,103.0"
          />
          <polygon
            id="lad_proximal_5"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="331.0,101.2 331.6,106.6 330.8,111.2 329.6,116.2 328.4,123.2 327.4,130.6 327.4,136.8
        340.4,136.0 340.6,119.6 341.6,112.4 341.6,103.8 342.4,100.6"
          />
          <polygon
            id="lad_proximal_6"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="327.4,136.8 329.6,141.0 330.6,144.0 332.4,146.6 332.6,153.0 335.6,157.6 339.6,165.2
        341.8,168.4 344.0,171.4 354.4,167.8 352.4,163.2 349.8,160.2 349.4,157.0 344.8,150.2 340.8,142.6 340.6,136.0"
          />
          <polygon
            id="lad_proximal_7"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_proximal_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_proximal_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="344.0,171.4 347.2,180.2 350.4,193.6 353.4,204.4 356.4,219.0 366.8,216.4 366.2,208.8
        363.8,200.0 363.0,192.8 360.4,182.0 357.8,175.4 354.4,167.8"
          />
          <polygon
            id="lad_mid_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="482.6,115.4 487.6,117.4 492.6,118.8 498.2,123.4 504.6,129.0 509.4,134.2 513.8,138.2
        524.6,129.8 521.2,125.6 516.0,120.8 510.8,118.2 508.8,115.2 504.4,112.6 500.0,109.6 494.8,106.2 488.0,101.6"
          />
          <polygon
            id="lad_mid_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="514.2,138.2 518.0,144.2 527.0,153.2 530.6,155.0 534.2,158.6 538.4,161.8 540.2,163.6
        545.0,166.2 547.2,169.8 556.6,179.4 558.4,182.8 562.2,188.8 573.4,185.0 571.4,179.0 568.0,175.0 565.4,169.4
        555.4,159.6 553.4,158.8 550.2,155.8 547.4,153.6 545.2,152.8 541.2,148.4 538.0,146.4 535.8,145.4 530.4,135.8
        524.6,129.8"
          />
          <polygon
            id="lad_mid_3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="562.4,188.6 566.0,196.4 569.4,204.0 570.2,209.8 571.6,215.0 572.2,220.6 576.8,231.4
        578.6,235.4 578.8,239.6 582.4,250.8 583.6,260.4 586.4,271.4 586.8,275.6 595.8,274.4 595.4,261.0 593.8,255.2
        593.2,245.6 591.6,241.4 591.4,237.0 589.6,232.2 586.4,228.4 585.8,225.2 584.6,218.0 582.0,211.2 579.6,205.4
        578.4,197.6 576.2,191.2 573.4,185.0"
          />
          <polygon
            id="lad_mid_4"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="586.6,275.6 588.8,284.8 588.6,299.8 586.4,303.0 586.6,316.0 585.4,317.6 585.6,325.4
        588.4,331.6 589.0,337.4 598.8,335.8 597.6,329.4 596.6,326.4 596.0,307.8 598.4,304.0 598.2,289.8 597.4,278.8
        596.0,274.2"
          />
          <polygon
            id="lad_mid_5"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="589.0,337.4 591.4,346.8 593.2,357.8 593.4,393.8 591.6,396.4 600.6,396.8 600.6,386.8
        602.4,378.0 602.4,352.8 600.6,346.2 600.0,340.4 598.6,335.4"
          />
          <polygon
            id="lad_mid_6"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="356.2,219.0 359.0,229.0 360.2,234.8 362.4,240.8 363.6,251.8 375.2,249.4 373.6,242.4
        371.6,235.8 371.2,227.8 369.8,225.2 367.2,216.2"
          />
          <polygon
            id="lad_mid_7"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="363.6,251.8 365.4,257.8 364.8,281.8 376.6,282.4 376.4,269.6 375.8,260.2 376.4,253.8
        375.2,249.2"
          />
          <polygon
            id="lad_mid_8"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_mid_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_mid_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="365.2,281.6 363.8,283.2 363.8,311.8 375.2,312.6 376.0,303.4 377.0,282.6"
          />
          <polygon
            id="lad_distal_1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="591.6,396.6 592.6,405.0 593.4,413.2 593.8,439.8 594.4,450.6 602.6,450.4 603.4,444.0
        603.2,432.8 602.2,424.4 602.6,414.0 600.2,410.4 600.4,404.4 600.8,396.8"
          />
          <polygon
            id="lad_distal_2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="594.4,450.6 594.4,462.8 591.6,472.8 591.4,476.0 584.6,488.6 582.4,491.0 576.0,503.0
        571.8,509.6 577.8,514.4 581.4,509.2 583.8,503.4 586.2,498.8 589.2,496.2 590.0,493.2 594.6,483.2 596.2,481.8
        600.0,474.2 601.2,466.8 602.2,462.6 602.6,450.4"
          />
          <polygon
            id="lad_distal_3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lad");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lad");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="571.6,509.4 571.0,512.6 567.2,516.4 561.4,523.4 553.6,527.0 546.2,528.2 539.6,528.6
        535.2,530.2 526.0,530.4 517.2,533.4 512.8,533.2 501.2,536.2 495.8,536.2 488.6,538.6 479.0,543.6 472.6,547.2
        464.8,555.4 459.4,558.4 457.0,560.2 451.8,563.2 458.8,562.0 465.6,559.0 468.0,556.4 474.0,551.4 479.2,548.4
        494.8,540.8 506.4,539.0 511.4,537.2 519.0,536.6 527.2,536.0 531.8,534.6 550.8,533.6 559.4,530.4 563.6,529.0
        569.0,525.2 574.2,519.6 578.0,514.4"
          />
          <polygon
            id="lad_distal_4"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="364.0,311.6 362.2,319.2 361.0,323.2 359.8,329.0 357.0,339.0 353.0,347.8 363.6,352.0
        366.0,348.4 367.6,340.8 369.8,334.4 371.2,331.8 371.8,325.2 372.8,322.2 375.6,312.4"
          />
          <polygon
            id="lad_distal_5"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="353.2,347.8 349.8,354.2 347.4,358.0 345.4,363.2 344.2,369.2 342.4,373.0 340.0,377.0
        338.0,381.4 332.8,386.4 328.8,389.2 325.8,391.4 332.0,402.4 336.2,398.6 342.4,393.0 351.4,382.4 352.4,377.6
        357.0,369.6 358.8,362.6 360.0,358.8 364.0,352.0"
          />
          <polygon
            id="lad_distal_6"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, "label_distal_lcx");
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, "label_distal_lcx");
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
            points="326.0,391.6 321.0,395.2 316.6,396.6 312.2,400.2 304.8,404.0 298.4,407.6 294.6,409.6
        299.0,418.4 308.8,414.8 317.4,411.2 321.8,408.0 324.6,408.2 332.0,402.4"
          />
          <g
            id="g_lcx_circav"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="294.6,409.8 285.0,414.6 282.0,414.8 270.8,418.8 265.0,420.2 259.6,422.2 252.6,422.4
        244.2,424.6 237.0,427.4 232.0,427.4 225.8,430.2 220.6,432.2 215.8,433.2 224.4,433.2 231.0,430.8 236.4,430.4
        240.0,428.6 260.2,428.0 271.6,426.8 273.6,425.4 280.6,424.6 286.4,424.0 290.2,422.2 299.2,418.2"
            />
            <text x="201.0" y="424.0">
              <tspan xmlSpace="preserve">CIRC AV</tspan>
            </text>
          </g>
          <g
            id="g_lad_diag1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="487.33334,101.666664 491.0,94.0 493.33334,90.0 504.0,83.0 511.33334,82.0 526.0,82.0
        535.3333,84.666664 545.0,90.0 550.0,96.333336 556.0,100.666664 570.0,107.0 583.0,109.0 595.6667,111.333336
        606.6667,115.333336 615.6667,120.0 622.6667,127.333336 627.6667,134.66667 635.3333,147.33333 642.0,160.33333
        650.0,170.33333 655.0,178.0 660.3333,186.33333 664.6667,197.33333 667.3333,208.33333 668.6667,218.66667
        669.3333,225.66667 668.0,234.33333 666.3333,221.0 663.0,205.33333 656.0,187.66667 648.6667,175.0
        644.6667,169.66667 637.0,162.33333 623.0,136.0 614.0,127.333336 608.3333,122.666664 589.3333,116.333336
        576.6667,116.0 565.0,113.0 556.0,109.0 546.6667,102.666664 538.3333,95.333336 531.0,92.0 524.3333,90.0
        513.3333,90.333336 503.66666,93.666664 499.33334,96.666664 495.0,106.333336"
              stroke="none"
            />
            <text x="551.0" y="94.0">
              <tspan xmlSpace="preserve">DIAG 1</tspan>
            </text>
          </g>
          <g
            id="g_lad_latdiag1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="622.6667,127.0 629.3333,123.0 634.6667,122.333336 644.0,122.0 648.0,125.0
        651.3333,129.33333 654.6667,134.0 658.0,140.33333 662.0,142.66667 668.0,148.33333 672.6667,152.66667
        678.0,158.66667 682.0,166.33333 687.3333,177.33333 689.6667,188.66667 690.0,196.0 692.0,205.0 692.0,215.33333
        689.0,202.66667 688.6667,190.0 684.0,174.33333 681.0,169.33333 673.3333,160.33333 664.3333,151.66667
        649.6667,136.66667 646.3333,131.66667 641.3333,129.0 636.3333,128.66667 632.0,130.0 627.0,134.0"
              stroke="none"
            />
            <text x="671.25" y="148.5">
              <tspan xmlSpace="preserve">Lat DIAG 1</tspan>
            </text>
          </g>
          <g
            id="g_rca_cb"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="110.5,85.75 112.5,92.5 112.25,108.0 114.75,119.5 120.75,129.0 129.0,134.0
        135.25,139.0 142.5,147.75 134.75,137.0 133.5,134.25 131.25,132.0 127.5,129.0 124.5,125.0 121.5,121.5
        119.75,118.25 119.5,109.25 120.75,97.0 121.25,86.5"
            />
            <text x="125.0" y="121.333336">
              <tspan xmlSpace="preserve">CB</tspan>
            </text>
          </g>
          <g
            id="g_rca_sanodal"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="107.0,73.333336 103.666664,68.666664 99.666664,64.666664 95.0,63.0
        91.666664,61.333332 87.333336,59.666668 83.0,57.666668 78.666664,56.666668 76.0,54.666668 74.666664,51.0
        72.0,42.333332 76.333336,49.0 81.0,54.333332 89.333336,55.333332 98.0,57.0 102.666664,58.333332 108.0,62.0
        112.0,65.666664 114.333336,69.333336 116.666664,73.333336"
            />
            <text x="40.0" y="36.0">
              <tspan xmlSpace="preserve">SA nodal</tspan>
            </text>
          </g>
          <g
            id="g_rca_rpl1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="164.66667,484.66666 164.66667,493.66666 167.33333,499.66666 170.33333,505.33334
        176.33333,510.33334 177.66667,514.0 181.33333,519.6667 184.33333,526.6667 191.66667,534.3333 195.0,535.0
        198.66667,537.6667 208.33333,538.3333 225.33333,538.3333 232.0,537.3333 240.0,537.0 249.0,539.3333
        238.0,535.6667 227.66667,536.3333 202.66667,534.6667 196.33333,532.3333 190.66667,528.0 187.33333,522.3333
        185.0,514.3333 182.0,510.33334 176.66667,503.66666 173.66667,499.0 171.66667,493.0 172.0,485.0"
            />
            <text x="251.33334" y="545.99963">
              <tspan xmlSpace="preserve">RPL 1</tspan>
            </text>
          </g>
          <g
            id="g_rca_rpl2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="201.66667,487.0 204.0,496.0 207.0,499.66666 212.0,504.33334 221.0,509.0
        227.0,511.66666 263.33334,511.66666 269.33334,514.0 281.0,517.3333 292.66666,523.0 306.0,525.0
        293.33334,521.6667 285.66666,517.0 277.66666,513.3333 266.33334,510.33334 258.66666,508.0 231.66667,508.0
        224.66667,504.66666 217.33333,500.33334 212.0,495.33334 210.0,487.0"
            />
            <text x="310.66666" y="530.0">
              <tspan xmlSpace="preserve">RPL 2</tspan>
            </text>
          </g>
          <g
            id="g_rca_rpl3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="263.66666,480.66666 267.66666,486.33334 270.66666,492.0 276.66666,495.33334
        287.0,501.0 292.0,502.0 312.33334,500.66666 342.0,500.66666 347.0,501.66666 351.0,504.33334 346.66666,500.0
        337.66666,497.33334 290.66666,497.0 282.33334,493.0 276.33334,487.33334 273.0,483.0 271.33334,478.33334"
            />
            <text x="354.66666" y="510.33337">
              <tspan xmlSpace="preserve">RPL3</tspan>
            </text>
          </g>
          <g
            id="g_rca_rtpav"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="133.66667,467.33334 146.66667,467.66666 154.0,472.0 165.0,476.33334 192.0,476.66666
        230.33333,477.66666 269.0,472.33334 282.66666,467.33334 289.66666,466.33334 300.0,460.0 308.0,450.66666
        324.0,435.0 325.66666,431.33334 329.66666,428.0 327.33334,436.0 322.33334,441.33334 311.66666,454.66666
        300.66666,466.66666 293.66666,471.33334 282.33334,474.33334 271.66666,478.66666 263.33334,481.66666
        248.0,483.33334 243.0,483.0 227.66667,485.66666 219.66667,487.66666 210.0,487.33334 178.0,487.33334
        172.33333,485.66666 162.33333,485.0 154.33333,482.33334 147.33333,480.33334 145.0,478.33334 142.0,477.33334
        134.0,477.33334"
            />
            <text x="196.33333" y="470.3333">
              <tspan xmlSpace="preserve">RT PAV</tspan>
            </text>
          </g>
          <g
            id="g_rca_pdsep"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="278.66666,577.6667 281.66666,572.3333 282.0,567.0 287.0,562.6667 294.0,559.6667
        298.33334,559.6667 306.66666,561.3333 319.66666,562.6667 333.0,563.0 343.33334,563.3333 346.0,562.0
        352.66666,561.6667 359.33334,562.6667 348.66666,563.6667 345.33334,564.3333 340.66666,566.0 333.0,566.0
        311.33334,566.3333 304.66666,566.0 299.0,565.3333 295.33334,565.6667 292.0,567.3333 288.33334,570.6667
        288.0,573.3333 288.0,577.0"
            />
            <text x="360.33334" y="560.0">
              <tspan xmlSpace="preserve">PD SEP</tspan>
            </text>
          </g>
          <g
            id="g_lad_ladsep"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="498.66666,123.333336 494.66666,128.66667 493.33334,136.33333 494.0,144.0
        497.66666,150.0 502.66666,156.33333 510.66666,162.0 526.6667,170.66667 534.3333,176.0 539.6667,182.33333
        542.6667,190.66667 544.0,199.66667 544.6667,233.66667 546.0,200.66667 545.0,189.0 542.0,182.66667 536.6667,175.0
        528.3333,168.33333 518.6667,161.66667 509.66666,156.0 501.33334,148.33333 500.33334,140.0 501.0,131.33333
        504.33334,128.66667"
              stroke="none"
            />
            <text x="498.0" y="192.0">
              <tspan xmlSpace="preserve">LAD SEP</tspan>
            </text>
          </g>
          <g
            id="g_lad_ramus"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="347.33334,100.0 348.0,116.333336 351.33334,126.0 356.66666,133.0 361.33334,139.66667
        368.33334,144.66667 378.33334,150.66667 392.33334,156.66667 399.0,159.33333 409.0,166.66667 418.33334,173.66667
        425.0,177.66667 435.0,189.33333 438.66666,195.0 444.66666,201.0 449.33334,208.33333 451.66666,211.0 460.0,228.0
        465.33334,234.33333 462.66666,226.66667 457.33334,214.66667 453.33334,206.33333 445.0,196.66667 439.0,187.66667
        434.0,180.0 427.0,172.66667 418.0,164.66667 408.0,156.66667 400.66666,151.33333 394.66666,148.33333
        382.66666,144.0 376.33334,140.0 367.33334,133.66667 361.33334,124.666664 357.33334,115.666664
        356.33334,112.333336 356.66666,100.666664"
              stroke="none"
            />
            <text x="364.0" y="126.0">
              <tspan xmlSpace="preserve">RAMUS</tspan>
            </text>
          </g>
          <g
            id="g_lad_latramus"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="409.33334,158.0 416.66666,154.0 420.0,152.66667 435.66666,152.66667 441.0,153.66667
        445.0,157.0 452.33334,165.66667 455.0,173.33333 461.33334,181.33333 466.0,188.33333 469.33334,193.33333
        475.66666,198.66667 479.66666,204.33333 481.66666,208.33333 483.0,214.66667 483.66666,222.33333 484.33334,226.0
        487.0,232.33333 483.0,224.0 480.0,208.33333 473.33334,201.33333 470.66666,197.66667 463.33334,191.0
        457.33334,182.33333 451.66666,175.66667 445.66666,168.66667 444.0,164.66667 441.0,162.66667 437.0,161.33333
        432.33334,160.66667 425.33334,160.33333 422.0,161.33333 419.66666,163.0 418.0,165.0"
              stroke="none"
            />
            <text x="415.0" y="150.0">
              <tspan xmlSpace="preserve">Lat RAMUS</tspan>
            </text>
          </g>
          <g
            id="g_lad_ladsep2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="587.3333,276.0 583.3333,275.33334 579.6667,276.66666 572.6667,278.33334
        568.3333,282.0 566.0,287.33334 565.3333,292.33334 566.3333,299.66666 566.6667,316.33334 569.6667,328.66666
        571.3333,340.33334 573.0,348.66666 573.3333,368.0 573.6667,380.66666 576.0,385.66666 579.0,392.66666
        577.3333,386.33334 574.3333,380.66666 574.6667,348.0 575.3333,344.33334 575.0,336.33334 574.3333,332.33334
        572.3333,324.0 571.3333,318.0 571.0,298.66666 572.0,292.66666 573.0,288.0 575.3333,284.66666 579.6667,284.33334
        584.3333,283.66666 586.3333,283.33334 589.0,285.0"
              stroke="none"
            />
            <text x="525.0" y="322.0">
              <tspan xmlSpace="preserve">LAD SEP</tspan>
            </text>
          </g>
          <g
            id="g_lad_diag2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="585.6667,225.33333 590.6667,225.33333 592.0,224.33333 600.0,226.0 604.6667,227.66667
        609.0,232.33333 612.3333,242.0 614.0,253.66667 616.6667,261.66666 620.6667,273.66666 622.3333,278.0
        624.6667,282.0 627.3333,285.33334 629.6667,291.33334 632.3333,301.0 634.0,315.0 636.3333,327.0 638.3333,336.0
        639.6667,338.66666 639.3333,358.66666 637.6667,362.66666 637.3333,365.0 637.6667,375.66666 639.3333,380.33334
        640.6667,383.66666 640.3333,376.66666 639.6667,375.0 639.3333,371.66666 640.6667,363.33334 643.0,359.0
        643.3333,341.33334 641.3333,337.0 639.6667,326.0 639.0,317.33334 637.6667,312.0 636.3333,303.33334
        636.0,296.33334 633.6667,290.33334 631.6667,284.33334 629.3333,276.0 625.6667,270.0 621.6667,259.33334
        619.0,248.66667 618.3333,237.66667 615.6667,231.66667 612.3333,225.33333 610.0,222.66667 605.0,220.0
        598.3333,218.33333 584.3333,218.33333"
              stroke="none"
            />
            <text x="619.0" y="232.0">
              <tspan xmlSpace="preserve">DIAG 2</tspan>
            </text>
          </g>
          <g
            id="g_lad_latdiag2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="629.3333,276.33334 639.0,276.66666 644.3333,279.66666 648.3333,283.66666
        658.6667,307.33334 661.0,309.0 662.3333,313.0 665.6667,318.33334 666.3333,321.66666 666.0,325.33334
        666.0,336.66666 668.0,343.0 669.3333,348.66666 670.3333,352.0 671.0,367.33334 668.3333,353.66666
        667.3333,347.66666 664.6667,338.33334 662.6667,332.66666 662.3333,321.33334 660.3333,316.33334
        656.3333,309.66666 650.3333,300.33334 646.6667,292.33334 644.0,288.33334 639.3333,284.33334 631.6667,284.33334"
              stroke="none"
            />
            <text x="664.25" y="310.5">
              <tspan xmlSpace="preserve">Lat DIAG 2</tspan>
            </text>
          </g>
          <g
            id="g_lad_diag3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="600.3333,404.33334 605.3333,406.0 611.6667,407.0 615.6667,410.0 618.6667,416.33334
        618.3333,423.33334 617.0,432.33334 615.6667,440.0 616.6667,444.66666 617.3333,449.33334 620.0,454.0 623.0,460.0
        625.3333,462.66666 632.3333,477.0 633.6667,484.33334 633.3333,505.66666 631.3333,512.0 631.3333,530.0
        633.3333,536.0 635.6667,542.3333 638.3333,547.3333 644.6667,553.6667 638.6667,546.0 634.3333,534.6667
        633.3333,530.6667 634.0,514.6667 636.3333,506.66666 637.3333,495.0 637.3333,486.0 635.6667,477.33334
        634.3333,471.66666 630.3333,463.0 625.0,454.0 622.6667,447.0 621.3333,443.66666 621.3333,432.66666
        624.6667,425.66666 625.0,412.66666 623.3333,407.33334 616.0,400.0 612.0,398.33334 608.6667,397.0
        605.3333,396.33334 600.6667,396.66666 600.0,396.66666"
              stroke="none"
            />
            <text x="629.0" y="425.0">
              <tspan xmlSpace="preserve">DIAG 3</tspan>
            </text>
          </g>
          <g
            id="g_lad_latdiag3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="622.6667,446.66666 625.6667,448.66666 629.6667,449.33334 633.0,447.66666
        636.6667,447.33334 639.3333,448.33334 642.3333,448.66666 647.3333,450.66666 649.3333,451.33334 654.3333,457.0
        656.0,460.0 658.0,469.66666 659.6667,478.33334 660.0,489.66666 661.0,492.33334 663.3333,497.66666 666.6667,505.0
        667.3333,510.66666 669.6667,516.6667 670.6667,526.3333 673.0,538.6667 670.6667,534.3333 668.3333,522.3333
        667.3333,516.6667 665.0,509.33334 661.6667,501.0 657.6667,491.0 656.0,478.66666 652.3333,463.0 648.3333,457.0
        643.6667,453.33334 637.6667,453.33334 624.6667,453.33334"
              stroke="none"
            />
            <text x="660.25" y="470.5">
              <tspan xmlSpace="preserve">Lat DIAG 3</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_om1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="366.66666,216.66667 375.66666,216.66667 381.66666,220.0 387.33334,224.0
        392.33334,231.0 399.0,244.0 402.0,252.33333 405.66666,255.33333 411.66666,258.33334 417.33334,264.66666
        418.33334,268.0 421.33334,269.33334 425.33334,273.0 429.66666,279.33334 431.0,282.66666 433.66666,289.33334
        434.33334,299.66666 437.33334,306.66666 440.66666,313.0 448.0,322.0 450.0,324.0 452.0,325.66666
        460.33334,334.33334 463.66666,338.33334 465.0,341.33334 456.0,332.66666 448.66666,325.0 439.66666,316.33334
        438.33334,314.0 435.33334,310.66666 432.66666,305.33334 431.33334,300.33334 429.33334,296.33334
        428.66666,289.66666 425.33334,280.33334 420.33334,274.0 414.66666,271.0 410.0,266.66666 405.33334,263.33334
        400.33334,260.66666 396.33334,256.33334 392.66666,248.66667 389.0,242.0 385.33334,235.66667 381.0,230.33333
        378.0,227.66667 373.33334,225.66667 369.66666,225.33333"
              stroke="none"
            />
            <text x="396.0" y="236.0">
              <tspan xmlSpace="preserve">OM1</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_latom1"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="411.0,257.66666 419.0,253.66667 426.66666,251.66667 429.66666,251.66667
        434.0,253.33333 438.66666,255.33333 443.0,258.0 448.0,264.33334 452.66666,268.66666 456.0,274.33334
        457.66666,278.33334 458.33334,282.0 461.33334,286.66666 464.66666,290.66666 468.33334,293.0 474.0,299.33334
        477.66666,304.33334 482.66666,314.66666 485.0,322.66666 490.0,334.0 484.0,323.0 481.33334,317.0
        478.33334,310.66666 474.33334,304.66666 471.0,300.66666 467.0,296.33334 464.33334,295.33334 460.0,291.66666
        456.66666,286.66666 453.0,279.33334 448.66666,272.33334 443.66666,267.0 438.0,262.33334 434.0,258.66666
        428.66666,257.0 425.66666,257.66666 422.0,260.66666 417.0,264.33334"
              stroke="none"
            />
            <text x="463.0" y="286.0">
              <tspan xmlSpace="preserve">Lat OM1</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_om2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="372.33334,322.33334 381.66666,323.0 388.33334,325.66666 395.66666,331.66666
        406.0,340.66666 415.66666,350.33334 424.0,353.33334 430.66666,356.0 436.0,361.0 439.33334,369.0
        443.33334,374.33334 449.0,388.33334 450.33334,391.33334 457.0,398.33334 462.0,403.0 466.33334,405.66666
        471.33334,410.0 480.0,418.66666 478.33334,413.66666 470.66666,406.66666 463.66666,401.33334 459.0,397.0
        457.33334,394.0 452.66666,389.66666 449.66666,380.66666 444.66666,370.33334 441.66666,362.33334 440.0,359.0
        435.33334,355.0 430.66666,350.33334 424.66666,348.66666 421.0,347.0 413.0,337.66666 408.33334,333.0
        401.0,327.33334 397.0,322.0 390.66666,316.66666 386.66666,315.0 381.33334,314.33334 374.66666,312.0"
              stroke="none"
            />
            <text x="396.0" y="320.0">
              <tspan xmlSpace="preserve">OM2</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_latom2"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="430.33334,350.33334 436.66666,346.33334 443.0,343.66666 447.33334,344.0
        451.0,345.66666 454.66666,346.33334 457.33334,348.0 462.66666,357.33334 467.66666,365.0 473.66666,373.0
        477.0,377.33334 479.66666,384.0 486.0,390.33334 491.0,394.0 498.0,401.33334 502.0,406.0 504.66666,410.66666
        506.66666,417.0 502.33334,409.66666 496.66666,403.33334 490.0,396.66666 482.66666,390.66666 476.33334,384.0
        471.0,378.0 468.0,371.33334 462.33334,366.0 459.33334,362.66666 456.0,354.66666 452.66666,351.33334
        442.0,351.33334 437.33334,354.33334 436.0,355.66666"
              stroke="none"
            />
            <text x="480.0" y="380.0">
              <tspan xmlSpace="preserve">Lat OM2</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_om3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="342.0,392.66666 348.66666,394.0 354.33334,398.66666 360.33334,405.0
        367.33334,413.33334 374.0,419.0 382.66666,426.66666 391.0,431.66666 399.0,438.33334 403.33334,443.33334
        406.66666,451.66666 411.66666,460.0 414.0,465.66666 419.33334,471.66666 432.66666,484.33334 421.0,471.0
        414.33334,462.66666 409.66666,453.0 405.66666,439.33334 402.33334,435.0 398.66666,431.33334 389.0,423.66666
        382.33334,417.33334 376.33334,411.66666 368.66666,404.0 364.66666,396.33334 363.0,393.0 358.33334,390.0
        351.0,386.0 351.0,382.33334"
              stroke="none"
            />
            <text x="370.0" y="405.0">
              <tspan xmlSpace="preserve">OM3</tspan>
            </text>
          </g>
          <g
            id="g_lmca_circ_latom3"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event, null);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event, null);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="none"
          >
            <polygon
              points="381.33334,416.33334 386.0,415.66666 391.0,413.0 397.0,409.33334 402.0,409.0
        410.66666,409.66666 413.33334,412.0 420.66666,418.0 423.66666,423.0 426.33334,429.66666 428.66666,436.0
        429.0,437.66666 431.66666,440.33334 433.66666,448.66666 435.66666,453.33334 439.0,458.66666 442.66666,460.66666
        445.66666,464.66666 449.66666,469.66666 451.66666,475.33334 449.33334,470.0 442.0,463.0 437.33334,460.33334
        434.66666,456.0 431.0,448.0 428.0,439.66666 424.66666,435.66666 422.66666,429.33334 416.66666,420.33334
        411.33334,416.33334 407.66666,414.33334 400.33334,414.66666 395.33334,416.66666 389.66666,420.0 389.0,423.66666"
              stroke="none"
            />
            <text x="437.0" y="450.0">
              <tspan xmlSpace="preserve">Lat OM3</tspan>
            </text>
          </g>
        </svg>
      </div>
    );
  }
}

export default withMui5Styles(cathlabStyles)(Coronary);
