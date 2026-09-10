import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/main.js";

cathlab_section.PolygonRAO = function (id, type) {
  // Use the parameters to avoid eslint warnings
  this.id = id;
  this.type = type;
  cathlab_section.Polygon.apply(this, arguments);

  this.getTags = function () {
    var ret = "";
    if (this.tags.includes("normal")) {
      ret = "<span style='color:green'> • Хэвийн</span><br/>";
    } else {
      if (this.tags.includes("hypokinesis")) {
        ret += "<span style='color:red'> • Hypokinesis</span><br/>";
      }
      if (this.tags.includes("akinesis")) {
        ret += "<span style='color:red'> • Akinesis</span><br/>";
      }
      if (this.tags.includes("dyskinesia")) {
        ret += "<span style='color:red'> • Dyskinesia</span><br/>";
      }
      if (this.tags.includes("aneurysm")) {
        ret += "<span style='color:red'> • Aneurysm (цүлхэм)</span><br/>";
      }
    }
    return ret;
  };
  this.getColorNoticed = function () {
    var ret = "";
    //ColorRAONoticedType
    if (this.hasTag) {
      if (this.tags.includes("normal")) {
        ret = cathlab_section.ColorRAONoticedType.NORMAL;
      } else {
        ret = cathlab_section.ColorRAONoticedType.BAD;
      }
    } else {
      ret = cathlab_section.ColorRAONoticedType.BAD;
    }
    return ret;
  };
};

cathlab_section.polygons_rao = [];
cathlab_section.obj = new cathlab_section.PolygonRAO(
  "rao_posterobasal",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_rao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonRAO(
  "rao_diaphragmatic",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_rao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonRAO(
  "rao_apical",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_rao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonRAO(
  "rao_anterolateral",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_rao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonRAO(
  "rao_anterobasal",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_rao.push(cathlab_section.obj);

export { cathlab_section };
