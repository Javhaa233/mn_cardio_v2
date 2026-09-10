import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/main.js";

cathlab_section.PolygonLAO = function (id, type) {
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

cathlab_section.polygons_lao = [];
cathlab_section.obj = new cathlab_section.PolygonLAO(
  "lao_basalseptal",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_lao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonLAO(
  "lao_apicalseptal",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_lao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonLAO(
  "lao_posterolateral",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_lao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonLAO(
  "lao_inferiorlateral",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_lao.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonLAO(
  "lao_superiorlateral",
  cathlab_section.PolygonRAOColorType.DEFAULT,
);
cathlab_section.polygons_lao.push(cathlab_section.obj);

export { cathlab_section };
