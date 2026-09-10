import React, { Component } from "react";
import ReactDOM from "react-dom";

// @mui/material components
import { ClickAwayListener, Popover, IconButton, Box } from "@mui/material";
// @mui/icons-material
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import backGroundImage from "assets/img/VGOAG.jpg";
import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/ventriculographyLAO.jsx";
import { createMarkup } from "utils/sanitize";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

const CONTEXT_MENU_CLASS = "ventriculography-lao-context-menu";

const sxStyles = {
  contextMenu: {
    position: "fixed",
    width: "200px",
    zIndex: "99999",
    overflow: "visible",
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.34)",
    backgroundColor: "#FFFFFF",
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
      color: "#333",
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
      "& fieldset": { borderRadius: 0, borderColor: "#ccc" },
      "&:hover fieldset": { borderColor: "#ccc" },
      "&.Mui-focused fieldset": { borderColor: "#5c5c5c", borderWidth: "1px" },
    },
    "& .MuiInputBase-input": {
      color: "#3C4858",
      height: "unset",
      fontSize: "14px",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: "400",
      lineHeight: 1,
      opacity: "1",
    },
    "& .MuiInputBase-input::placeholder": { color: "#b2b2b2" },
  },
  container: {
    border: "1px solid #ccc",
    padding: "20px 0 0",
    display: "flex",
    justifyContent: "center",
  },
};

class VentriculographyLAO extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: props.Data || null,
      anchorEl: null,
      CommentHtml: null,
      Polygon: null,
    };
  }

  componentDidMount() {
    this.GetMainColor();
    this.BindData();
  }

  GetMainColor = () => {
    var key;
    for (key in cathlab_section.polygons_lao) {
      var SelectObject = cathlab_section.polygons_lao[key];
      SelectObject.tags = [];
      SelectObject.hasTag = false;
      SelectObject.comment = "";
    }

    for (key in cathlab_section.polygons_lao) {
      var obj = cathlab_section.polygons_lao[key];
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
    var SelectObject = [];
    if (event.target.id) {
      SelectObject = cathlab_section.polygons_lao.filter(
        (e) => e.id === event.target.id,
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
                  sx={sxStyles.commentTextField}
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
    cathlab_section.polygons_lao.forEach((polygon) => {
      if (polygon.tags.length > 0) {
        var NewObj = {
          Type: "2",
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
    const { Polygon } = this.state;
    const { NotEdit } = this.props;
    if (Polygon && !NotEdit) {
      if (Polygon.tags.indexOf(value) !== -1) {
        Polygon.tags.splice(Polygon.tags.indexOf(value), 1);
      } else {
        if (value === "normal") {
          Polygon.tags = [];
        } else {
          if (Polygon.tags.indexOf("normal") !== -1) {
            Polygon.tags.splice(Polygon.tags.indexOf("normal"), 1);
          }
        }
        Polygon.tags.push(value);
      }

      if (Polygon.tags.length > 0) Polygon.hasTag = true;
      else Polygon.hasTag = false;

      document.getElementById(Polygon.id).style["fill"] = Polygon.getColor();

      // Update checkmarks in the menu
      var Tags = Polygon.tags;
      var child = document.getElementById("ventriculography_lao_menu").children;
      for (var i = 0; i < child.length; i++) {
        var liTagVal = child[i].children[1].getAttribute("val");
        var tempCheck = Tags.filter((s) => s === liTagVal);
        if (tempCheck.length > 0) {
          child[i].children[0].style["display"] = "";
        } else {
          child[i].children[0].style["display"] = "none";
        }
      }
    }
  };

  BindData = () => {
    const { Data } = this.state;
    if (Data && Data.CathlabElement) {
      Data.CathlabElement.forEach((element) => {
        if (element.vwCathLabElementType.value === "2") {
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
    var SelectObject = cathlab_section.polygons_lao.filter(
      (e) => e.id === PolygonName,
    )[0];

    if (SelectObject) {
      SelectObject.tags = Tags;
      SelectObject.hasTag = true;
      SelectObject.comment = Comment;
      document.getElementById(PolygonName).style["fill"] =
        SelectObject.getColor();
    }
  };

  onContextMenu = (event) => {
    var SelectObject = [];
    if (event.target.id) {
      SelectObject = cathlab_section.polygons_lao.filter(
        (e) => e.id === event.target.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });
      var Tags = SelectObject[0].tags;
      var child = document.getElementById("ventriculography_lao_menu").children;
      for (var i = 0; i < child.length; i++) {
        var liTagVal = child[i].children[1].getAttribute("val");
        var temp = Tags.filter((s) => s === liTagVal);
        if (temp.length > 0) {
          child[i].children[0].style["display"] = "";
        } else {
          child[i].children[0].style["display"] = "none";
        }
      }
    }

    document
      .querySelectorAll(`.${CONTEXT_MENU_CLASS}`)
      .forEach((el) => (el.style.display = "block"));
    {
      const el = document.querySelector(`.${CONTEXT_MENU_CLASS}`);
      if (el) {
        el.style.top = event.clientY + "px";
        el.style.left = event.clientX + "px";
      }
    }
    event.preventDefault();
  };

  onMouseLeavePolygon = (polygon, textId) => {
    var Obj = cathlab_section.polygons_lao.filter(
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
    const { anchorEl, CommentHtml } = this.state;
    const {
      GetPolygon,
      onMouseLeavePolygon,
      onMouseEnterPolygon,
      GetComment,
      onContextMenu,
    } = this;
    return (
      <Box sx={sxStyles.container} onContextMenu={(e) => e.preventDefault()}>
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
          <div>{CommentHtml}</div>
        </Popover>
        {ReactDOM.createPortal(
          <ClickAwayListener
            onClickAway={() => {
              document
                .querySelectorAll(`.${CONTEXT_MENU_CLASS}`)
                .forEach((el) => (el.style.display = "none"));
            }}
          >
            <div>
              <Box
                component="ul"
                id="ventriculography_lao_menu"
                className={CONTEXT_MENU_CLASS}
                sx={sxStyles.contextMenu}
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
                    val="hypokinesis"
                    onClick={() => GetPolygon("hypokinesis")}
                  >
                    Hypokinesis
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="akinesis"
                    onClick={() => GetPolygon("akinesis")}
                  >
                    Akinesis
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="dyskinesia"
                    onClick={() => GetPolygon("dyskinesia")}
                  >
                    Dyskinesia
                  </a>
                </li>
                <li>
                  <span style={{ display: "none" }}>
                    <CheckIcon fontSize="small" style={{ color: "#009c00" }} />
                  </span>
                  <a
                    type="radio"
                    val="aneurysm"
                    onClick={() => GetPolygon("aneurysm")}
                  >
                    Aneurysm (цүлхэм)
                  </a>
                </li>
              </Box>
            </div>
          </ClickAwayListener>,
          document.body,
        )}
        <svg
          id="ventriculographyLAOSVG"
          contentScriptType="text/ecmascript"
          width="600.0px"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          baseProfile="full"
          zoomAndPan="magnify"
          contentStyleType="text/css"
          height="400.0px"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          version="1.0"
          onContextMenu={(e) => e.preventDefault()}
        >
          <image
            x="1.0"
            y="2.0"
            width="597.0"
            xlinkHref={backGroundImage}
            height="395.0"
            preserveAspectRatio="none"
          />
          <polygon
            id="lao_basalseptal"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="#000000"
            points="229.33333,54.333332 223.66667,61.333332 219.66667,70.333336 217.33333,79.666664
        216.66667,87.0 215.33333,94.0 212.0,101.0 207.66667,109.0 201.0,117.0 191.66667,124.333336 181.66667,132.66667
        173.0,139.66667 166.66667,149.0 161.0,157.66667 156.66667,167.66667 153.33333,179.0 150.66667,193.0
        175.33333,195.66667 177.0,184.66667 181.0,176.33333 181.66667,163.66667 186.33333,154.33333 193.33333,144.33333
        202.33333,134.66667 210.66667,127.333336 211.0,122.0 215.33333,118.666664 219.0,108.666664 223.66667,103.333336
        227.33333,94.666664 226.66667,81.333336 228.33333,76.333336 235.33333,66.0"
          />
          <polygon
            id="lao_apicalseptal"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="#000000"
            points="175.0,196.0 174.66667,207.0 177.33333,217.66667 179.66667,228.33333 182.33333,238.33333
        187.66667,248.33333 194.66667,256.66666 202.66667,261.0 211.33333,264.0 218.33333,265.33334 210.66667,292.33334
        205.66667,290.66666 198.66667,285.33334 190.33333,278.66666 181.0,271.33334 174.66667,264.33334
        169.33333,258.33334 163.33333,250.66667 160.33333,243.0 155.66667,237.0 153.0,226.33333 150.66667,217.66667
        148.33333,211.66667 148.66667,199.0 150.66667,193.0"
          />
          <polygon
            id="lao_posterolateral"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="#000000"
            points="219.0,266.0 230.66667,267.66666 243.0,267.66666 254.66667,266.0 262.33334,265.0
        266.66666,263.0 277.0,263.66666 280.33334,262.33334 286.66666,261.66666 293.33334,258.33334 301.0,257.0
        307.66666,255.66667 316.0,250.0 331.33334,272.33334 323.33334,275.33334 316.33334,277.33334 307.66666,280.0
        301.33334,284.33334 293.66666,285.33334 279.33334,290.66666 269.33334,292.66666 256.33334,293.66666
        249.33333,296.66666 238.66667,296.66666 228.0,297.33334 219.66667,295.0 210.66667,292.33334"
          />
          <polygon
            id="lao_inferiorlateral"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="#000000"
            points="331.66666,273.0 340.66666,268.33334 351.0,261.66666 360.33334,255.66667
        368.33334,247.33333 377.66666,237.0 386.0,226.66667 393.66666,215.0 400.33334,204.66667 406.0,187.33333
        379.66666,178.66667 378.33334,190.33333 376.66666,196.66667 368.66666,206.0 364.0,211.66667 355.66666,220.33333
        347.0,227.33333 337.0,235.66667 327.0,242.33333 316.0,250.0"
          />
          <polygon
            id="lao_superiorlateral"
            onMouseLeave={(event) => {
              onMouseLeavePolygon(event);
            }}
            onMouseEnter={(event) => {
              onMouseEnterPolygon(event);
            }}
            onContextMenu={(event) => {
              onContextMenu(event);
            }}
            onClick={(event) => {
              GetComment(event);
            }}
            stroke="#000000"
            points="406.33334,187.33333 407.66666,174.0 408.0,159.66667 406.33334,149.0 404.33334,137.33333
        400.0,126.0 395.33334,114.666664 391.33334,102.333336 385.33334,92.333336 380.0,81.333336 374.0,71.0
        368.33334,61.0 357.0,45.333332 355.33334,53.333332 351.33334,60.0 349.0,63.333332 356.66666,73.0 363.0,83.0
        366.0,95.0 369.0,98.666664 377.66666,108.0 380.66666,118.0 383.33334,129.0 385.0,143.66667 386.66666,151.33333
        384.33334,161.66667 382.33334,171.0 380.0,179.0"
          />
        </svg>
      </Box>
    );
  }
}

export default VentriculographyLAO;
