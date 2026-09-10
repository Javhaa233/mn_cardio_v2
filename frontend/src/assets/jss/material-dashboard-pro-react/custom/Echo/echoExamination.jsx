import { echo_examination } from "assets/jss/material-dashboard-pro-react/custom/Echo/main.js";

echo_examination.PolygonEcho = function (id, type) {
  // Use the parameters to avoid eslint warnings
  this.id = id;
  this.type = type;
  echo_examination.Polygon.apply(this, arguments);

  this.getTags = function () {
    var ret = "";
    if (this.tags.includes("1 - normal")) {
      ret = "<span style='color:green'> 1 - normal</span><br/>";
    } else {
      if (this.tags.includes("X - cannot interpret")) {
        ret += "<span style='color:red'> X - cannot interpret</span><br/>";
      }
      if (this.tags.includes("0 - hyperkinetic")) {
        ret += "<span style='color:red'> 0 - hyperkinetic</span><br/>";
      }
      if (this.tags.includes("2 - hypokinetic")) {
        ret += "<span style='color:red'> 2 - hypokinetic</span><br/>";
      }
      if (this.tags.includes("3 - akinetic")) {
        ret += "<span style='color:red'> 3 - akinetic</span><br/>";
      }
      if (this.tags.includes("4 - dyskinetic")) {
        ret += "<span style='color:red'> 4 - dyskinetic</span><br/>";
      }
      if (this.tags.includes("5 - aneurysmal")) {
        ret += "<span style='color:red'> 5 - aneurysmal</span><br/>";
      }
      if (this.tags.includes("6 - akinetic with scar")) {
        ret += "<span style='color:red'> 6 - akinetic with scar</span><br/>";
      }
      if (this.tags.includes("7 - dyskinetic with scar")) {
        ret += "<span style='color:red'> 7 - dyskinetic with scar</span><br/>";
      }
    }
    return ret;
  };

  this.getColorNoticed = function () {
    var ret = "";
    if (this.hasTag) {
      if (this.tags.includes("1 - normal")) {
        ret = echo_examination.ColorNoticedType.NORMAL;
      } else {
        ret = echo_examination.ColorNoticedType.BAD;
      }
    }
    return ret;
  };
};

echo_examination.PolygonEcho.prototype = new echo_examination.Polygon();
echo_examination.PolygonEcho.prototype.constructor =
  echo_examination.PolygonEcho;

echo_examination.polygons = [];
echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_pos",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_pos",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "apical_lat",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "apex",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "apical_sep",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_ant_sep",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_ant_sep",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);

echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_sep",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_inf",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_lat",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "mid_ant",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);

echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_lat",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_sep",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);

echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_ant",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "apical_ant",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "apical_inf",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);
echo_examination.obj = new echo_examination.PolygonEcho(
  "basal_inf",
  echo_examination.PolygonColorType.DEFAULT,
);
echo_examination.polygons.push(echo_examination.obj);

export { echo_examination };
