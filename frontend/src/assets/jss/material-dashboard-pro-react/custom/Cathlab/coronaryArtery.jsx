import { cathlab_section } from "assets/jss/material-dashboard-pro-react/custom/Cathlab/main.js";

cathlab_section.PolygonCoronary = function (id, type) {
  // Use the parameters to avoid eslint warnings
  this.id = id;
  this.type = type;
  cathlab_section.Polygon.apply(this, arguments);

  this.getTags = function () {
    var ret = "";
    if (this.tags.includes("normal")) {
      ret = "<span style='color:green'> • Хэвийн</span><br/>";
    }
    if (this.tags.includes("occlusion_less_50")) {
      ret =
        "<span style='background-color:yellow'> • 50%-аас бага бөглөрөл</span><br/>";
    }
    if (this.tags.includes("occlusion_50_75")) {
      ret =
        "<span style='background-color:yellow'> • 50%-75% бөглөрөл</span><br/>";
    }
    if (this.tags.includes("occlusion_75_99")) {
      ret = "<span style='color:red'> • 75%-99% бөглөрөл</span><br/>";
    }
    if (this.tags.includes("occlusion_100")) {
      ret = "<span style='color:red'> • 100% бөглөрөл</span><br/>";
    }
    if (
      this.tags.includes("stent_less_50") ||
      this.tags.includes("stent_50_75") ||
      this.tags.includes("stent_75_99") ||
      this.tags.includes("stent_100")
    ) {
      ret += " • Стент суулгасан<br/>";
    }
    if (
      this.tags.includes("ballon_less_50") ||
      this.tags.includes("ballon_50_75") ||
      this.tags.includes("ballon_75_99") ||
      this.tags.includes("ballon_100")
    ) {
      ret += " • Баллон тэлэлт<br/>";
    }
    return ret;
  };
  this.getColorNoticed = function () {
    var ret = ""; //ColorNoticedType
    if (this.hasTag) {
      if (this.tags.includes("normal")) {
        ret = cathlab_section.ColorNoticedType.NORMAL;
      }
      if (this.tags.includes("occlusion_less_50")) {
        ret = cathlab_section.ColorNoticedType.MID;
        if (this.tags.includes("stent_less_50")) {
          ret = cathlab_section.ColorNoticedType.STENTMID;
        }
      }
      if (this.tags.includes("occlusion_50_75")) {
        ret = cathlab_section.ColorNoticedType.MID;
        if (this.tags.includes("stent_50_75")) {
          ret = cathlab_section.ColorNoticedType.STENTMID;
        }
      }
      if (this.tags.includes("occlusion_75_99")) {
        ret = cathlab_section.ColorNoticedType.BAD;
        if (this.tags.includes("stent_75_99")) {
          ret = cathlab_section.ColorNoticedType.STENTBAD;
        }
      }
      if (this.tags.includes("occlusion_100")) {
        ret = cathlab_section.ColorNoticedType.BAD;
        if (this.tags.includes("stent_100")) {
          ret = cathlab_section.ColorNoticedType.STENTBAD;
        }
      }
    } else {
      ret = cathlab_section.colorFocused;
    }
    return ret;
  };
};

cathlab_section.polygons = [];
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_proximal_1",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_proximal_2",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_proximal_3",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_proximal_4",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_proximal_5",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_Acute_Marginal1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_Acute_Marginal2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rt_pda",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_diag1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_cb",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_sanodal",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_rpl1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_rpl2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_rpl3",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_rtpav",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_rca_pdsep",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_latdiag1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_ladsep",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_ramus",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_latramus",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_ladsep2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_diag2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_latdiag2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_diag3",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lad_latdiag3",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_om1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_latom1",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_om2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_latom2",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_om3",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lmca_circ_latom3",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_mid_1",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_mid_2",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_mid_3",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_distal_1",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "rca_distal_2",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_1",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_2",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_3",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_4",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_5",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_6",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_proximal_7",
  cathlab_section.PolygonColorType.PROXIMAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_1",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_2",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_3",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_4",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_5",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_6",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_7",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_mid_8",
  cathlab_section.PolygonColorType.MID,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_1",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_2",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_3",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_4",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_5",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "lad_distal_6",
  cathlab_section.PolygonColorType.DISTAL,
);
cathlab_section.polygons.push(cathlab_section.obj);
cathlab_section.obj = new cathlab_section.PolygonCoronary(
  "g_lcx_circav",
  cathlab_section.PolygonColorType.DEFAULT,
);
cathlab_section.polygons.push(cathlab_section.obj);

export { cathlab_section };
