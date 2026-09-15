import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";
import { dialogActionSx } from "@/theme/controlStyles";

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

/**
 * One action button. `loading` is MUI's own busy state: it disables the button
 * and swaps the start icon for a spinner in the button's text colour, so the
 * separate green/red/blue spinners that used to float over each button are
 * gone.
 */
const ActionButton = ({ Rank, Icon, Busy, onClick, children, sx }) => (
  <Button
    disableElevation
    startIcon={<Icon />}
    loading={Busy}
    loadingPosition="start"
    onClick={onClick}
    sx={{ ...dialogActionSx(Rank), ...sx }}
  >
    {children}
  </Button>
);

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

  // One filled button per bar. Save is the everyday action; Confirm locks a
  // record permanently, so it only takes the filled slot when there is no Save
  // beside it.
  const HasSave = ShowSave || ShowSaveNotLoad;
  const ConfirmRank = HasSave ? "neutral" : "primary";
  const PrintAndSaveRank = HasSave || ShowConfirm ? "neutral" : "primary";

  return (
    <DialogActions
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: space[2],
        width: "100%",
        flexShrink: 0,
        padding: `${space[3]} ${space[4]}`,
        // No top rule here: the dialog content above uses `dividers`, which
        // already draws the hairline, and a second one read as a double line.
        backgroundColor: colors.brand.surface,
        // MUI spaces siblings with a left margin; `gap` does that now.
        "& > :not(style) ~ :not(style)": { marginLeft: 0 },
      }}
    >
      {ShowPrint && (
        <ActionButton
          Rank="neutral"
          Icon={PrintOutlinedIcon}
          Busy={PrintLoading}
          sx={{ marginRight: "auto" }}
          onClick={() => {
            setPrintLoading(true);
            runAction(Print, setPrintLoading);
          }}
        >
          {t("Print")}
        </ActionButton>
      )}

      {ShowPrintAndSave && (
        <ActionButton
          Rank={PrintAndSaveRank}
          Icon={SaveIcon}
          Busy={Loading}
          onClick={() => {
            setLoading(true);
            runAction(Save, setLoading);
          }}
        >
          {t("Save")} & {t("Print")}
        </ActionButton>
      )}

      {ShowDecline && (
        <ActionButton
          Rank="danger"
          Icon={CloseIcon}
          Busy={DeclineLoading}
          onClick={() => {
            setDeclineLoading(true);
            runAction(Decline, setDeclineLoading);
          }}
        >
          {t("Decline")}
        </ActionButton>
      )}

      {ShowConfirm && (
        <ActionButton
          Rank={ConfirmRank}
          Icon={CheckIcon}
          Busy={ConfirmLoading}
          onClick={() => {
            setConfirmLoading(true);
            runAction(Confirm, setConfirmLoading);
          }}
        >
          {t(ConfirmButtonText)}
        </ActionButton>
      )}

      {ShowSaveNotLoad && (
        <ActionButton
          Rank="primary"
          Icon={SaveIcon}
          Busy={false}
          onClick={() => Save && Save()}
        >
          {t(SaveButtonText)}
        </ActionButton>
      )}

      {ShowSave && (
        <ActionButton
          Rank="primary"
          Icon={SaveIcon}
          Busy={Loading}
          onClick={() => {
            setLoading(true);
            runAction(Save, setLoading);
          }}
        >
          {SaveButtonText ? t(SaveButtonText) : t("Save")}
        </ActionButton>
      )}
    </DialogActions>
  );
}
