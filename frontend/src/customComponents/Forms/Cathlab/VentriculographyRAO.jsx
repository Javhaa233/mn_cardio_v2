import React, { Component } from "react";
import ReactDOM from "react-dom";

// @mui/material components
import { ClickAwayListener, Popover, IconButton, Box } from "@mui/material";
// @mui/icons-material
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import backGroundImage from "assets/img/VGOAD.jpg";
import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/ventriculographyRAO.jsx";
import { createMarkup } from "utils/sanitize";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

const CONTEXT_MENU_CLASS = "ventriculography-rao-context-menu";

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
};

class VentriculographyRAO extends Component {
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
    for (key in cathlab_section.polygons_rao) {
      var SelectObject = cathlab_section.polygons_rao[key];
      SelectObject.tags = [];
      SelectObject.hasTag = false;
      SelectObject.comment = "";
    }

    for (key in cathlab_section.polygons_rao) {
      var obj = cathlab_section.polygons_rao[key];
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
      SelectObject = cathlab_section.polygons_rao.filter(
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
    cathlab_section.polygons_rao.forEach((polygon) => {
      if (polygon.tags.length > 0) {
        var NewObj = {
          Type: "3",
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
      var child = document.getElementById("ventriculography_rao_menu").children;
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
        if (element.vwCathLabElementType.value === "3") {
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
    var SelectObject = cathlab_section.polygons_rao.filter(
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
      SelectObject = cathlab_section.polygons_rao.filter(
        (e) => e.id === event.target.id,
      );
    }

    if (SelectObject.length > 0) {
      this.setState({ Polygon: SelectObject[0] });
      var Tags = SelectObject[0].tags;
      var child = document.getElementById("ventriculography_rao_menu").children;
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
    var Obj = cathlab_section.polygons_rao.filter(
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
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px 0 0",
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
                id="ventriculography_rao_menu"
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
          id="ventriculographyRAOSVG"
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
            x="2.0"
            y="1.0"
            width="596.0"
            xlinkHref={backGroundImage}
            height="398.0"
            preserveAspectRatio="none"
          />
          <polygon
            id="rao_posterobasal"
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
            points="152.33333,253.33333 155.33333,260.0 159.0,265.33334 165.0,270.66666
        170.66667,274.33334 175.66667,276.66666 182.66667,277.33334 193.0,277.66666 201.33333,277.33334 210.0,278.33334
        218.66667,278.33334 227.33333,279.0 233.0,279.33334 239.66667,280.0 246.0,281.33334 253.33333,280.66666
        261.33334,281.66666 272.33334,282.66666 282.0,285.66666 286.33334,286.33334 292.33334,287.0 301.33334,289.66666
        308.66666,292.33334 313.66666,293.0 312.0,274.0 306.33334,271.33334 290.0,270.66666 286.66666,267.33334
        283.0,266.0 264.66666,262.66666 244.33333,261.0 227.33333,260.0 225.0,258.33334 201.0,257.33334
        192.66667,260.66666 188.33333,256.33334 184.66667,254.66667 177.0,254.66667 170.33333,252.0 166.33333,247.33333"
          />
          <polygon
            id="rao_diaphragmatic"
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
            points="313.33334,293.0 324.66666,295.33334 336.33334,299.0 343.0,300.33334 351.0,303.66666
        361.33334,305.33334 372.33334,309.33334 381.66666,310.33334 389.33334,312.33334 401.33334,313.0 416.66666,313.0
        414.66666,291.33334 403.0,294.33334 396.33334,293.66666 385.33334,292.33334 378.0,289.0 363.66666,284.66666
        351.0,283.33334 344.33334,282.66666 330.66666,278.33334 317.33334,275.33334 312.0,273.66666"
          />
          <polygon
            id="rao_apical"
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
            points="417.0,313.33334 426.66666,313.66666 435.0,312.0 447.0,309.66666 456.0,305.66666
        468.33334,298.66666 476.33334,289.0 480.0,284.33334 481.66666,275.66666 482.0,266.0 480.66666,255.33333
        475.33334,244.33333 469.33334,233.33333 459.66666,220.66667 444.0,204.0 427.0,218.33333 432.66666,222.66667
        439.0,224.66667 448.33334,236.33333 450.33334,242.33333 455.0,248.66667 455.0,265.66666 454.66666,270.66666
        449.0,279.0 441.0,285.0 433.0,288.33334 420.66666,290.0 414.66666,291.66666"
          />
          <polygon
            id="rao_anterolateral"
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
            points="444.33334,204.66667 433.0,195.33333 423.33334,188.33333 412.33334,179.66667
        401.33334,171.0 388.66666,163.66667 377.0,156.33333 363.0,147.33333 352.0,164.33333 354.0,168.66667
        359.66666,171.33333 372.0,182.0 378.33334,190.0 384.33334,192.66667 394.33334,197.33333 402.66666,202.33333
        413.0,209.0 419.33334,213.33333 427.33334,218.33333"
          />
          <polygon
            id="rao_anterobasal"
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
            points="363.33334,147.66667 349.0,136.33333 335.66666,125.333336 324.66666,112.666664
        312.0,98.0 298.0,76.0 295.0,79.333336 287.0,87.0 292.33334,92.666664 295.66666,102.333336 300.0,112.0
        304.0,117.666664 308.66666,124.666664 310.66666,132.33333 317.0,140.33333 323.33334,147.33333 329.33334,152.0
        338.0,157.33333 345.0,160.66667 352.33334,165.0"
          />
        </svg>
      </div>
    );
  }
}

export default VentriculographyRAO;
