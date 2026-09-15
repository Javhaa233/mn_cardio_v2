import { saveAs } from "file-saver";

import BaseAlert from "baseComponents/BaseAlert";

import Server from "config/Server";
import Helper from "helper";
import i18n from "i18n";

class BaseCrudHelper {
  GetRequestData = function (ObjectName, SearchOption) {
    try {
      let ReqData = {};
      ReqData = { ObjectName };
      if (SearchOption.WhereType) {
        ReqData["WhereType"] = SearchOption.WhereType;
      }
      if (SearchOption.FindType) {
        ReqData["FindType"] = SearchOption.FindType;
      }
      if (SearchOption.OrderBy) {
        ReqData["OrderByField"] = SearchOption.OrderBy.Field;
        ReqData["OrderByType"] = SearchOption.OrderBy.Type;
      }
      if (SearchOption.SearchText) {
        ReqData["SearchText"] = SearchOption.SearchText;
      }
      if (SearchOption.PageOption) {
        ReqData["PageSize"] = SearchOption.PageOption.Limit;
        ReqData["PageNumber"] = SearchOption.PageOption.Page;
      }
      ReqData["SearchField"] = [];
      if (SearchOption.SearchField) {
        ReqData["SearchField"] = SearchOption.SearchField;
      }
      return ReqData;
    } catch (ex) {
      return null;
    }
  };

  CallServiceWithoutAuthError = async (Url, ReqData, callback) => {
    process.env.NODE_ENV === "development" && console.log({ ReqData, Url });
    const Token = localStorage.getItem("MnCardioToken");
    const headers = {};
    if (Token) headers.authorization = "Bearer " + Token;
    await Server({
      method: "POST",
      url: Url,
      headers: headers,
      data: ReqData,
    })
      .then((res) => {
        const Data = res.data;
        process.env.NODE_ENV === "development" &&
          console.log({ responseData: Data });
        callback && callback(Data);
      })
      .catch((err) => {
        callback && callback({ AuthError: false });
        process.env.NODE_ENV === "development" && console.log({ err });
      });
  };

  CallService = async (Url, ReqData, callback) => {
    ReqData = { ...ReqData, AppId: 1 };
    process.env.NODE_ENV === "development" && console.log({ Url, ReqData });
    const Token = localStorage.getItem("MnCardioToken");
    const headers = { App: 1 };
    if (Token) headers.authorization = "Bearer " + Token;

    await Server({
      method: "POST",
      url: Url,
      headers: headers,
      data: ReqData,
    })
      .then((res) => {
        const Data = res.data;
        process.env.NODE_ENV === "development" &&
          console.log({
            ObjectName: ReqData.ObjectName
              ? ReqData.ObjectName
              : "CustomUrl: " + Url,
            responseData: Data,
          });
        if (Data && Data.AuthError === true) {
          localStorage.removeItem("IsLogin");
          localStorage.removeItem("LogedUser");
          localStorage.removeItem("MnCardioToken");
          document.location = "/auth/login";
        }
        Data && callback && callback(Data);
      })
      .catch((err) => {
        // callback(null);
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback({ Success: false, Data: null });
      });
  };

  CallServiceWithoutToken = async (Url, ReqData, callback) => {
    process.env.NODE_ENV === "development" && console.log({ ReqData, Url });
    await Server({ method: "POST", url: Url, data: ReqData })
      .then((res) => {
        const Data = res.data;
        process.env.NODE_ENV === "development" &&
          console.log({ responseData: Data });
        Data && callback && callback(Data);
      })
      .catch((err) => {
        callback && callback({ Success: false });
        process.env.NODE_ENV === "development" && console.log({ err });
      });
  };

  BaseUploadFile = async (
    { Value, LinkedObjectInfo },
    callback,
    onProgress,
    cancelToken,
  ) => {
    var formData = new FormData();
    process.env.NODE_ENV === "development" && console.log({ Value });
    formData.append("LinkedObjectInfo", JSON.stringify(LinkedObjectInfo));
    for (var l = 0; l < Value.length; l++) {
      if (Value[l].File) {
        formData.append("File" + l, Value[l].File, Value[l].FileInfo.Name);
      }
      formData.append("File" + l + "Info", JSON.stringify(Value[l].FileInfo));
    }
    await this.uploadFile(
      formData,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted, progressEvent);
        }
      },
      (resData) => callback && callback(resData),
      cancelToken,
    );
  };

  baseUploadTest = async ({ Value, LinkedObjectInfo }, callback) => {
    var formData = new FormData();
    process.env.NODE_ENV === "development" && console.log({ Value });
    formData.append("LinkedObjectInfo", JSON.stringify(LinkedObjectInfo));
    for (var l = 0; l < Value.length; l++) {
      if (Value[l].File) {
        formData.append("File" + l, Value[l].File, Value[l].FileInfo.Name);
      }
      formData.append("File" + l + "Info", JSON.stringify(Value[l].FileInfo));
    }
    await this.uploadTes(
      formData,
      (env) => {},
      (resData) => callback && callback(resData),
    );
  };

  uploadTest = async (ReqData, ShowProgress, callback) => {
    process.env.NODE_ENV === "development" && console.log({ ReqData });
    var Url = "/Test/uploadFile";
    await Server({
      method: "PUT",
      url: Url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: ReqData,
      onUploadProgress: ShowProgress,
    })
      .then((res) => {
        const Data = res.data;
        process.env.NODE_ENV === "development" &&
          console.log({ responseData: Data });
        Data && callback && callback(Data);
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
      });
  };

  uploadFile = async (ReqData, ShowProgress, callback, cancelToken) => {
    process.env.NODE_ENV === "development" && console.log({ ReqData });
    var Url = "/BaseObject/uploadFile";
    const Token = localStorage.getItem("MnCardioToken");
    await Server({
      method: "POST",
      url: Url,
      headers: { authorization: "Bearer " + Token },
      data: ReqData,
      onUploadProgress: ShowProgress,
      cancelToken: cancelToken,
    })
      .then((res) => {
        const Data = res.data;
        process.env.NODE_ENV === "development" &&
          console.log({ responseData: Data });
        if (Data) {
          if (Data.AuthError === true) {
            localStorage.removeItem("IsLogin");
            localStorage.removeItem("LogedUser");
            localStorage.removeItem("MnCardioToken");
            document.location = "/auth/login";
          }
          callback && callback(Data);
        }
      })
      .catch((err) => {
        if (Server.isCancel && Server.isCancel(err)) {
          process.env.NODE_ENV === "development" &&
            console.log("Upload cancelled");
          callback &&
            callback({
              Success: false,
              Message: "Upload cancelled",
              Cancelled: true,
            });
        } else {
          process.env.NODE_ENV === "development" && console.log({ err });
          callback &&
            callback({
              Success: false,
              Message: err.message || "Upload failed",
            });
        }
      });
  };

  GetSearchOption = function () {
    return {
      PageOption: { Page: 0, Limit: 20 },
      FindType: "AllData",
      WhereType: "Contains",
      SearchText: undefined,
      SearchField: [],
      //SearchField: {Field:'name', Value:'bat', Op: "Equels: 'Contains'"},
      OrderBy: { Field: undefined, Type: undefined },
    };
  };

  ArraySort = function (property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  };

  // Confirm & Alert
  // Options.Destructive: the Yes button deletes or removes something, so it is
  // drawn red instead of as the filled primary.
  ShowConfirm = function (Message, ConfirmFunc, HideFunction, Options = {}) {
    return (
      <BaseAlert
        Hide={HideFunction}
        Type="Confirm"
        Message={Message}
        Confirm={ConfirmFunc}
        Destructive={!!Options.Destructive}
      />
    );
  };

  /**
   * An alert for code that has nowhere to render one - a download helper, say,
   * with no component state to hold the element. It mounts its own small React
   * root, inside the app theme, and removes it on OK. Components should keep
   * using ShowAlert and render the element themselves.
   */
  ShowAlertDetached = async function (Message, Success = false) {
    const [{ createRoot }, { ThemeProvider }, { default: theme }] =
      await Promise.all([
        import("react-dom/client"),
        import("@mui/material/styles"),
        import("@/theme.js"),
      ]);
    const Host = document.createElement("div");
    document.body.appendChild(Host);
    const Root = createRoot(Host);
    const Hide = () => {
      Root.unmount();
      Host.remove();
    };
    Root.render(
      <ThemeProvider theme={theme}>
        <BaseAlert
          Type="Message"
          Message={Message}
          success={Success}
          Hide={Hide}
        />
      </ThemeProvider>,
    );
  };

  ShowAlert = function (Message, Success, HideFunction) {
    return (
      <BaseAlert
        Hide={HideFunction}
        success={Success}
        Type="Message"
        Message={Message}
      />
    );
  };

  GetFieldIndexByName = function (Fields, Name) {
    const Temp = Fields.filter((s) => s.Name === Name);
    if (Temp.length === 1) return Fields.indexOf(Temp[0]);
    else return -1;
  };

  GetCrudUrls = function (props) {
    var Urls = {
      CreateUrl: "",
      UpdateUrl: "",
      DeleteUrl: "",
      GetListDataUrl: "",
      GetConfigDataUrl: "",
    };
    Urls.CreateUrl = props.CreateUrl || "/BaseObject/create";
    Urls.UpdateUrl = props.UpdateUrl || "/BaseObject/update";
    Urls.DeleteUrl = props.DeleteUrl || "/BaseObject/delete";
    Urls.GetListDataUrl = props.GetListDataUrl || "/BaseObject";
    Urls.GetConfigDataUrl = props.GetConfigDataUrl || "/BaseObject/getData";
    return Urls;
  };
  /*
  GetFieldList = (Fields) => {
    var result = [];
    if (Fields && Fields.length > 0) {
      for (let i = 0; i < Fields.length; i++) {
        for (let j = 0; j < Fields[i].length; j++) {
          let Field = Object.assign({}, Fields[i][j]);
          result.push(Field);
        }
      }
    }
    result.sor(Helper.ObjectHelper.ArraySor("Position"));
    return result;
  };
*/
  // Шинэчилсэн GetFieldList функц
  GetFieldList = (Fields) => {
    var result = [];
    const seenNames = new Set();

    if (Fields && Fields.length > 0) {
      for (let i = 0; i < Fields.length; i++) {
        if (Array.isArray(Fields[i])) {
          for (let j = 0; j < Fields[i].length; j++) {
            const Field = Object.assign({}, Fields[i][j]);

            // 👉 ЭНЭ шүүлтийг нэмнэ: GridField === false бол алгасна
            if (Field.GridField === false) continue;

            if (!seenNames.has(Field.Name)) {
              result.push(Field);
              seenNames.add(Field.Name);
            }
          }
        }
      }
    }

    result.sort(Helper.ObjectHelper.ArraySort("Position"));
    return result;
  };
  GetFieldByName = (FieldName, Fields) => {
    if (Fields.length > 0) {
      for (let i = 0; i < Fields.length; i++) {
        for (let j = 0; j < Fields[i].length; j++) {
          if (Fields[i][j].Name === FieldName) return Fields[i][j];
        }
      }
    }
    return null;
  };

  SetSearchField = (Field, Value, SearchField, Op) => {
    const SearchFieldData = { Field: Field + "", Value, Op: Op || "Contains" };
    const Temp = SearchField.filter((s) => s.Field + "" === Field);
    if (Temp.length === 1) SearchField.splice(SearchField.indexOf(Temp[0]), 1);
    if (Field && Value && SearchField) SearchField.push(SearchFieldData);
    return SearchField;
  };

  GetConfigField = (FieldName, ListFields) => {
    const Field = ListFields.filter((s) => s.Name + "" === FieldName + "");
    if (Field.length === 1) return Field[0];
    else return null;
  };

  GetConfigData = async (ObjectName, callback) => {
    await this.CallService(
      "/BaseObject/getData",
      { ObjectName },
      (resData) => callback && callback(resData),
    );
  };

  BaseGetList = async ({ ObjectName, SearchOption }, callback) => {
    const ReqData = this.GetRequestData(ObjectName, SearchOption);
    await this.CallService(
      "/BaseObject/",
      ReqData,
      (resData) => callback && callback(resData),
    );
  };

  BaseGetListInfo = async ({ ObjectName, SearchOption }, callback) => {
    const ReqData = this.GetRequestData(ObjectName, SearchOption);
    await this.CallService(
      "/BaseObject/getListInfo",
      ReqData,
      (resData) => callback && callback(resData),
    );
  };

  ExportExcel = async (
    {
      ObjectName,
      Url,
      SearchOption,
      FileName,
      ExportFields,
      ReqData: ReqDataOverride,
    },
    callback,
  ) => {
    const Token = localStorage.getItem("MnCardioToken");
    // An aggregate report endpoint takes its own filter shape, not the
    // {ObjectName, SearchField, ...} list envelope. Passing ReqData lets those
    // screens reuse this helper instead of hand-rolling another raw axios
    // download - the four CVD copies of that are exactly what goes wrong,
    // because a Blob response never matches their `Success === false` check.
    const ReqData =
      ReqDataOverride || this.GetRequestData(ObjectName, SearchOption);
    // Optional fixed column set for screens whose export layout is agreed with
    // the customer and must not follow the list grid. Omitted means the
    // server's existing GridField behaviour.
    if (Array.isArray(ExportFields) && ExportFields.length > 0) {
      ReqData["ExportFields"] = ExportFields;
    }
    process.env.NODE_ENV === "development" &&
      console.log({ ReqData, Url: ObjectName ? ObjectName : Url });
    await Server({
      method: "POST",
      url: Url,
      headers: { authorization: "Bearer " + Token },
      data: ReqData,
      responseType: "blob",
    })
      .then(async (res) => {
        const resData = res.data;
        if (
          resData.type === "application/json" ||
          res.headers["content-type"] === "application/json"
        ) {
          const text = await resData.text();
          const result = JSON.parse(text);
          process.env.NODE_ENV === "development" &&
            console.log({ ExcelError: result });
          callback && callback({ Success: false });
          return;
        }

        const xlsxBlob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(xlsxBlob, FileName || "Report.xlsx");
        callback && callback({ Success: true });
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback({ Success: false });
      });
  };

  /**
   * The same export as tab-separated text.
   *
   * The upgrade tender asks for lists in .xlsx and .txt alike; the server builds
   * both from one query, so the two files always agree. Kept separate from
   * ExportExcel rather than parameterised because the response type, the MIME
   * type and the failure detection all differ.
   */
  ExportText = async (
    {
      ObjectName,
      Url,
      SearchOption,
      FileName,
      ExportFields,
      ReqData: ReqDataOverride,
    },
    callback,
  ) => {
    const Token = localStorage.getItem("MnCardioToken");
    const ReqData =
      ReqDataOverride || this.GetRequestData(ObjectName, SearchOption);
    if (Array.isArray(ExportFields) && ExportFields.length > 0) {
      ReqData["ExportFields"] = ExportFields;
    }
    await Server({
      method: "POST",
      url: Url || "/BaseObject/ExportText",
      headers: { authorization: "Bearer " + Token },
      data: ReqData,
      responseType: "blob",
    })
      .then(async (res) => {
        const resData = res.data;
        // A failure comes back as the usual JSON envelope, not as a file.
        if (
          resData.type === "application/json" ||
          res.headers["content-type"] === "application/json"
        ) {
          callback && callback({ Success: false });
          return;
        }
        saveAs(
          new Blob([res.data], { type: "text/plain;charset=utf-8" }),
          FileName || "Report.txt",
        );
        callback && callback({ Success: true });
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback({ Success: false });
      });
  };

  /**
   * The message to show when a file download fails.
   *
   * Both download endpoints report failure two ways: HTTP 200 with a JSON error
   * envelope, and a real status code - 404 when the bytes are not in
   * ALLFILE_DIR, 403 from the download authorization gate. Because the request
   * asks for `responseType: "blob"`, BOTH arrive as a Blob, so
   * `err.response.data.Message` is always undefined and the alert used to fall
   * back to axios's own "Request failed with status code 404". That string told a
   * doctor nothing and sent us looking for a routing fault that did not exist.
   *
   * So: read the blob back as text, take the server's Message, and only then
   * fall back to a status the user can act on.
   */
  DownloadErrorMessage = async (err) => {
    const Response = err && err.response;
    const Body = Response && Response.data;

    if (Body && typeof Body.text === "function") {
      try {
        const Parsed = JSON.parse(await Body.text());
        if (Parsed && Parsed.Message) return Parsed.Message;
      } catch (ex) {
        // Not a JSON envelope - fall through to the status map below.
      }
    } else if (Body && Body.Message) {
      return Body.Message;
    }

    const Status = Response && Response.status;
    if (Status === 404) return i18n.t("Файл серверт олдсонгүй");
    if (Status === 403) return i18n.t("Энэ файлд хандах эрхгүй байна");
    if (Status === 401)
      return i18n.t("Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү");
    return i18n.t("Файл татахад алдаа гарлаа");
  };

  /**
   * Fetch a file's bytes as a Blob instead of saving it to disk.
   *
   * BaseDownloadFile below always ends in a save-as. The feed's lightbox needs
   * the same bytes to *display*, and it cannot use a plain <img src> because
   * the download endpoint authenticates from the Authorization header, not a
   * cookie or a query token.
   *
   * Callback style, to match every other method on this helper.
   *
   * `Source` optionally overrides the endpoint as { Url, Body }. Chat uses it to
   * fetch through /Chat/DownloadAttachment, which checks room membership -
   * /BaseObject/downloadFile takes generated_name straight from the request body
   * with no ownership check at all, so any authenticated user who learns a
   * filename can pull any file. Existing callers pass nothing and are unchanged.
   */
  BaseDownloadFileBlob = async (file, callback, Source) => {
    if (!file || !file.FileInfo || !file.FileInfo.id_data) {
      callback && callback(null);
      return;
    }
    const Token = localStorage.getItem("MnCardioToken");
    await Server({
      method: "POST",
      url: (Source && Source.Url) || "/BaseObject/downloadFile",
      headers: { authorization: "Bearer " + Token },
      data: (Source && Source.Body) || { FileInfo: file.FileInfo },
      responseType: "blob",
    })
      .then(async (res) => {
        const data = res.data;
        // The endpoint answers with HTTP 200 + a JSON error envelope when it
        // fails, so a Blob is not by itself proof of success.
        if (
          data &&
          (data.type === "application/json" ||
            res.headers["content-type"] === "application/json")
        ) {
          let Message = "";
          try {
            Message = (JSON.parse(await data.text()) || {}).Message || "";
          } catch (ex) {
            // Leave it empty; the caller falls back to its own wording.
          }
          callback && callback(null, Message);
          return;
        }
        callback && callback(data);
      })
      // Second argument: why it failed. Callers render the thumbnail underneath,
      // so without this a missing original is a silent forever-blur.
      .catch(async (err) => {
        const Message = await this.DownloadErrorMessage(err);
        callback && callback(null, Message);
      });
  };

  // `Source` optionally overrides the endpoint - see BaseDownloadFileBlob above.
  BaseDownloadFile = async (file, callback, Source) => {
    const FileInfo = file.FileInfo;
    process.env.NODE_ENV === "development" && console.log({ file });
    if (file && file.FileInfo) {
      if (file.FileInfo.id_data) {
        const Token = localStorage.getItem("MnCardioToken");
        await Server({
          method: "POST",
          url: (Source && Source.Url) || "/BaseObject/downloadFile",
          headers: { authorization: "Bearer " + Token },
          data: (Source && Source.Body) || { FileInfo },
          responseType: "blob",
        })
          .then(async (res) => {
            const resData = res.data;
            if (
              resData.type === "application/json" ||
              res.headers["content-type"] === "application/json"
            ) {
              const text = await resData.text();
              const result = JSON.parse(text);
              process.env.NODE_ENV === "development" &&
                console.log({ DownloadError: result });

              // Show error message to user
              const errorMessage = result.Message || "File download failed";
              // No component to render into here, so the alert mounts itself. This was a
              // browser alert(): `window.BaseAlert` is never defined anywhere.
              this.ShowAlertDetached(errorMessage, false);

              callback && callback({ success: false, error: errorMessage });
              return;
            }
            const url = window.URL.createObjectURL(new Blob([resData]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              FileInfo.original_name + "." + FileInfo.ext,
            );
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            }, 100);

            callback && callback({ success: true });
          })
          .catch(async (err) => {
            const errorMessage = await this.DownloadErrorMessage(err);
            process.env.NODE_ENV === "development" && console.log({ err });

            // Show error message to user
            // No component to render into here, so the alert mounts itself. This was a
            // browser alert(): `window.BaseAlert` is never defined anywhere.
            this.ShowAlertDetached(errorMessage, false);

            callback && callback({ success: false, error: errorMessage });
          });
      } else if (file.File && !file.FileInfo.id_data) {
        // Download unsaved file from memory
        try {
          const url = URL.createObjectURL(file.File);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", file.File.name);
          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);

          callback && callback({ success: true });
        } catch (err) {
          console.error("Error downloading file:", err);
          callback &&
            callback({ success: false, error: "Failed to download file" });
        }
      }
    } else {
      callback &&
        callback({ success: false, error: "Invalid file information" });
    }
  };

  BaseDeleteFile = async (fileId, callback) => {
    await this.CallService(
      "/BaseObject/deleteFile",
      { FileId: fileId },
      (resData) => callback && callback(resData),
    );
  };

  /**
   * Download a PDF report.
   *
   * NOTE the callback contract: this calls back with a plain BOOLEAN, not the
   * { Success, Message, Data } envelope the rest of this helper uses. 40 call
   * sites rely on it - `(Success) => ShowAlert(Success ? ... : ..., Success)`.
   * Do not "align" it with ExportExcel, which passes { Success }: an object is
   * always truthy, so every one of those sites would report a failed print as
   * a success.
   */
  BasePrintReport = async ({ Url, Data, FileName }, callback) => {
    const Token = localStorage.getItem("MnCardioToken");
    await Server({
      method: "POST",
      url: Url,
      headers: { authorization: "Bearer " + Token },
      data: Data,
      responseType: "blob",
    })
      .then(async (res) => {
        const resData = res.data;
        if (resData) {
          if (
            resData.type === "application/json" ||
            res.headers["content-type"] === "application/json"
          ) {
            const text = await resData.text();
            const result = JSON.parse(text);
            process.env.NODE_ENV === "development" &&
              console.log({ PrintError: result });
            callback && callback(false);
            return;
          }

          //   const url = window.URL.createObjectURL(
          //     new Blob([Data], { type: "application/pdf" })
          //   );
          //   const link = document.createElement("a");
          //   link.href = url;
          //   link.setAttribute("download", FileName || "Report.pdf");
          //   document.body.appendChild(link);
          //   link.click();

          const pdfBlob = new Blob([resData], { type: "application/pdf" });
          saveAs(pdfBlob, FileName || "Report.pdf");
          callback && callback(true);
        }
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback(false);
      });
  };

  /**
   * Unused. No call site imports this - `BasePrintReport` above is the live one.
   * Same boolean callback contract; see the note there before changing either.
   */
  BasePrintReportNew = async ({ Url, Data, FileName }, callback) => {
    const Token = localStorage.getItem("MnCardioToken");
    await Server({
      method: "POST",
      url: Url,
      headers: { authorization: "Bearer " + Token },
      data: Data,
      responseType: "blob",
    })
      .then(async (res) => {
        const resData = res.data;
        if (resData) {
          if (
            resData.type === "application/json" ||
            res.headers["content-type"] === "application/json"
          ) {
            const text = await resData.text();
            const result = JSON.parse(text);
            process.env.NODE_ENV === "development" &&
              console.log({ PrintError: result });
            callback && callback(false);
            return;
          }

          //   const url = window.URL.createObjectURL(
          //     new Blob([Data], { type: "application/pdf" })
          //   );
          //   const link = document.createElement("a");
          //   link.href = url;
          //   link.setAttribute("download", FileName ? FileName : "Report.pdf");
          //   document.body.appendChild(link);
          //   link.click();
          const pdfBlob = new Blob([resData], { type: "application/pdf" });
          saveAs(pdfBlob, FileName ? FileName : "Report.pdf");
          callback && callback(true);
        }
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback(false);
      });
  };

  BaseGetDetailInfo = async ({ ObjectName, SearchOption }, callback) => {
    const ReqData = this.GetRequestData(ObjectName, SearchOption);
    await this.CallService("/BaseObject/getDetailInfo", ReqData, (resData) => {
      if (resData && resData.Data && Array.isArray(resData.Data)) {
        resData.Data = resData.Data[0] || {};
      }
      callback && callback(resData);
    });
  };

  BaseGetDetail = async ({ ObjectName, SearchOption }, callback) => {
    const ReqData = this.GetRequestData(ObjectName, SearchOption);
    await this.CallService("/BaseObject/getDetail", ReqData, (resData) => {
      if (resData && resData.Data && Array.isArray(resData.Data)) {
        resData.Data = resData.Data[0] || {};
      }
      callback && callback(resData);
    });
  };

  BaseCreate = async ({ ObjectName, Url, Data }, callback) => {
    let SaveUrl = "/BaseObject/create";
    if (Url) SaveUrl = Url;
    await this.CallService(
      SaveUrl,
      { ObjectName, Data: JSON.stringify(Data) },
      (resData) => callback && callback(resData),
    );
  };

  BaseUpdate = async ({ ObjectName, Url, Data }, callback) => {
    let UpdateUrl = "/BaseObject/update";
    if (Url) UpdateUrl = Url;
    await this.CallService(
      UpdateUrl,
      { ObjectName, Data: JSON.stringify(Data) },
      (resData) => callback && callback(resData),
    );
  };
}

export default new BaseCrudHelper();
