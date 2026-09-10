import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
// translation
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import styles from "assets/jss/material-dashboard-pro-react/views/sweetAlertStyle.js";

export default function BaseAlert(props) {
  const { t } = useTranslation();

  const {
    Type = "Message",
    Message = "",
    Confirm,
    Hide,
    success = false,
    MoreInfo = null,
  } = props;

  // This component is mounted on demand (Helper.BaseCrudHelper.ShowAlert /
  // ShowConfirm build it, the caller renders it and unmounts to dismiss), so
  // being rendered at all means it must be open. It used to key `open` off the
  // message being non-empty, which meant a response with no Message rendered an
  // invisible dialog: Hide never fired, so the caller's continuation never ran
  // and the Save spinner span forever on a record that had actually saved.
  const text = Message
    ? t(Message + "")
    : success
      ? t("Амжилттай")
      : t("Алдаа гарлаа");

  const handleConfirm = () => {
    if (Confirm) Confirm();
  };

  const handleClose = () => {
    if (Hide) Hide();
  };

  if (Type === "Confirm") {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{text}</DialogTitle>
        {MoreInfo && <DialogContent>{MoreInfo}</DialogContent>}
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("No")}
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            {t("Yes")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (Type === "Message") {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{ color: success ? "green" : "red" }}
        >
          {text}
        </DialogTitle>
        {MoreInfo && <DialogContent>{MoreInfo}</DialogContent>}
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            {t("OK")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return <div></div>;
}

// Add prop types
BaseAlert.propTypes = {
  Type: PropTypes.string,
  Message: PropTypes.string,
  Confirm: PropTypes.func,
  Hide: PropTypes.func,
  success: PropTypes.bool,
  MoreInfo: PropTypes.any,
};
