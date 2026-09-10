import i18n from "i18n";
import { jsPDF } from "jspdf";
var font = "undefined";
var callAddFont = function () {
  this.addFileToVFS("Montserrat-Bold-normal.ttf", font);
  this.addFon("Montserrat-Bold-normal.ttf", "Montserrat-Bold", "normal");
};
jsPDF.API.events.push(["addFonts", callAddFont]);
