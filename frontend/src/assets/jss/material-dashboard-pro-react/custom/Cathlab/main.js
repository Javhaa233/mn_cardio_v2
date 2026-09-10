var cathlab_section = {};
cathlab_section.dialogSelected = false;
cathlab_section.dialogCurrentElement = null;
cathlab_section.colorDefault = "#cccccc";
cathlab_section.colorFocused = "#3399FF";
cathlab_section.currentMousePos = { x: -1, y: -1 };
cathlab_section.PolygonColorType = {
  DEFAULT: "#ffffff",
  PROXIMAL: "#111111",
  MID: "#666666",
  DISTAL: "#cccccc",
};
cathlab_section.ColorNoticedType = {
  NORMAL: "green",
  MID: "yellow",
  BAD: "red",
  STENTMID: "url(#stentPatternMid)",
  STENTBAD: "url(#stentPatternBad)",
};
cathlab_section.PolygonRAOColorType = { DEFAULT: "#ffffff" };
cathlab_section.ColorRAONoticedType = { NORMAL: "green", BAD: "red" };

cathlab_section.Polygon = function (id, type) {
  this.id = id;
  this.readonly = false;
  this.colorType = type;
  this.colorFocused = "#3399FF";
  this.tags = [];
  this.hasTag = false;
  this.comment = "";
  this.hasNotice = function () {
    if (this.hasTag) return true;
    else return false;
  };
  this.getColor = function () {
    if (this.hasNotice()) return this.getColorNoticed();
    return this.colorType;
  };
};

export { cathlab_section };
