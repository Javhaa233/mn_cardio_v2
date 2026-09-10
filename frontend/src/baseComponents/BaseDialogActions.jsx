import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogActions, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Button from "components/CustomButtons/Button";

/**
 * BaseDialogActions - Reusable action buttons for dialogs
 * @param {Object} props
 * @param {boolean} props.ShowPrintAndSave - Show combined Print & Save button
 * @param {boolean} props.ShowDecline - Show Decline button
 * @param {boolean} props.ShowSave - Show Save button
 * @param {boolean} props.ShowConfirm - Show Confirm button
 * @param {boolean} props.ShowPrint - Show Print button
 * @param {boolean} props.ShowSaveNotLoad - Show Save button without loading state
 * @param {Function} props.Save - Save callback
 * @param {Function} props.Decline - Decline callback
 * @param {Function} props.Confirm - Confirm callback (receives setLoading callback)
 * @param {Function} props.Print - Print callback
 * @param {string} props.SaveButtonText - Custom text for Save button
 * @param {string} props.ConfirmButtonText - Custom text for Confirm button
 */
// How long to leave an action button spinning before assuming its consumer
// forgot to signal completion. Mirrors the safety timeout in BaseCustomForm.
const ACTION_TIMEOUT_MS = 30000;

/**
 * Run a dialog action and keep its button busy for as long as the action runs.
 *
 * An action either (a) returns a promise, (b) declares a callback parameter and
 * invokes it when it finishes, or (c) is synchronous. Only (c) may clear the
 * spinner immediately. Clearing it for (b) as well - which is what this used to
 * do - reset the button on the same tick, before the request had even been
 * sent: no in-flight feedback, and double-submit wide open.
 */
const runAction = (handler, setBusy) => {
  if (!handler) {
    setBusy(false);
    return;
  }

  let finished = false;
  let timer = null;
  const stop = () => {
    if (finished) return;
    finished = true;
    if (timer) clearTimeout(timer);
    setBusy(false);
  };

  timer = setTimeout(stop, ACTION_TIMEOUT_MS);

  const result = handler(stop);

  if (result && typeof result.then === "function") {
    result.finally(stop);
  } else if (handler.length === 0) {
    // Takes no callback and returned nothing to wait on - nothing to wait for.
    stop();
  }
};

export default function BaseDialogActions(props) {
  const {
    ShowPrintAndSave = false,
    ShowDecline = false,
    ShowSave = false,
    ShowConfirm = false,
    ShowPrint = false,
    ShowSaveNotLoad = false,
    Save,
    Decline,
    Confirm,
    Print,
    SaveButtonText = "Save",
    ConfirmButtonText = "Confirm",
  } = props;

  const { t } = useTranslation();

  const [Loading, setLoading] = useState(false);
  const [PrintLoading, setPrintLoading] = useState(false);
  const [DeclineLoading, setDeclineLoading] = useState(false);
  const [ConfirmLoading, setConfirmLoading] = useState(false);

  const hasActions =
    ShowPrintAndSave ||
    ShowDecline ||
    ShowSave ||
    ShowConfirm ||
    ShowPrint ||
    ShowSaveNotLoad;

  if (!hasActions) return null;

  return (
    <DialogActions
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        flexShrink: 0,
        padding: "8px 16px",
      }}
    >
      {/* Print Button */}
      {ShowPrint && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginRight: "auto",
          }}
        >
          <Button
            color="info"
            size="sm"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => {
              setPrintLoading(true);
              runAction(Print, setPrintLoading);
            }}
            disabled={PrintLoading}
          >
            {t("Print")}
          </Button>
          {PrintLoading && (
            <CircularProgress
              size={24}
              style={{
                color: "#1492ff",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
      )}

      {/* Print & Save Button */}
      {ShowPrintAndSave && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginLeft: "8px",
          }}
        >
          <Button
            color="success"
            size="sm"
            startIcon={<SaveIcon />}
            onClick={() => {
              setLoading(true);
              runAction(Save, setLoading);
            }}
            disabled={Loading}
          >
            {t("Save")} & {t("Print")}
          </Button>
          {Loading && (
            <CircularProgress
              size={24}
              style={{
                color: "green",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
      )}

      {/* Decline Button */}
      {ShowDecline && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginLeft: "8px",
          }}
        >
          <Button
            color="danger"
            size="sm"
            startIcon={<SaveIcon />}
            onClick={() => {
              setDeclineLoading(true);
              runAction(Decline, setDeclineLoading);
            }}
            disabled={DeclineLoading}
          >
            {t("Decline")}
          </Button>
          {DeclineLoading && (
            <CircularProgress
              size={24}
              style={{
                color: "#f44336",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
      )}

      {/* Confirm Button */}
      {ShowConfirm && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginLeft: "8px",
          }}
        >
          <Button
            color="success"
            size="sm"
            startIcon={<CheckIcon />}
            onClick={() => {
              setConfirmLoading(true);
              runAction(Confirm, setConfirmLoading);
            }}
            disabled={ConfirmLoading}
          >
            {t(ConfirmButtonText)}
          </Button>
          {ConfirmLoading && (
            <CircularProgress
              size={24}
              style={{
                color: "green",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
      )}

      {/* Save Not Load Button */}
      {ShowSaveNotLoad && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginLeft: "8px",
          }}
        >
          <Button
            color="success"
            size="sm"
            startIcon={<SaveIcon />}
            onClick={() => Save && Save()}
          >
            {t(SaveButtonText)}
          </Button>
        </div>
      )}

      {/* Save Button */}
      {ShowSave && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginLeft: "8px",
          }}
        >
          <Button
            color="success"
            size="sm"
            startIcon={<SaveIcon />}
            onClick={() => {
              setLoading(true);
              runAction(Save, setLoading);
            }}
            disabled={Loading}
          >
            {SaveButtonText ? t(SaveButtonText) : t("Save")}
          </Button>
          {Loading && (
            <CircularProgress
              size={24}
              style={{
                color: "green",
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
      )}
    </DialogActions>
  );
}
