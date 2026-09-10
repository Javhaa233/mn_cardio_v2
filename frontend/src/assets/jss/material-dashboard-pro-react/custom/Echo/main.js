var echo_examination = {};
echo_examination.polygons = [];
echo_examination.dialogSelected = false;
echo_examination.dialogCurrentElement = null;
echo_examination.colorDefault = "#cccccc";
echo_examination.colorFocused = "#3399FF";
echo_examination.currentMousePos = { x: -1, y: -1 }; //For start position of dialog box
echo_examination.PolygonColorType = {
  DEFAULT: "#ffffff",
  FORECOLOR: "#999999",
};
echo_examination.ColorNoticedType = { NORMAL: "#ccffcc", BAD: "#ffcccc" };
echo_examination.current_element = null;
echo_examination.context_menu_showing = false;

echo_examination.Polygon = function (id, type) {
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
    else return this.colorType;
  };
};

export { echo_examination };
