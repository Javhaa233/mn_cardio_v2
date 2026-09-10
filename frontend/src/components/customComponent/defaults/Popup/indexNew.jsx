import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import {
  DialogContent,
  DialogActions,
  Dialog,
  IconButton,
  CircularProgress,
} from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
// @mui/icons-material
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import Button from "components/CustomButtons/Button";
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";

const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  overflow: "visible",
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "&::-webkit-scrollbar": { width: "6px", height: "6px" },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "rgba(136, 136, 136, 0.1)",
    "&:hover": { backgroundColor: "rgba(173, 173, 173, 0.4)" },
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(136, 136, 136, 0.6)",
    borderRadius: "6px",
    width: "6px",
    "&:hover": { backgroundColor: "rgba(136, 136, 136, 0.9)" },
  },
}));

const DialogTitleContent = (props) => {
  const { children, onClose } = props;
  const theme = React.useContext(styled) || {};

  return (
    <StyledDialogTitle disableTypography>
      <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
        <BaseLabel Label={children} Size="16px" Weight="400" Color="#878787" />
      </div>
      {onClose ? (
        <IconButton
          aria-label="close"
          style={{
            fontSize: "18px",
            padding: "4px",
            position: "absolute",
            right: theme.spacing ? theme.spacing(2) : "16px",
            top: theme.spacing ? theme.spacing(2) : "16px",
            color: theme.palette ? theme.palette.grey[500] : "gray",
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </StyledDialogTitle>
  );
};

class BaseDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Loading: false,
      PrintLoading: false,
      DeclineLoading: false,
      ConfirmLoading: false,
    };
  }

  Close = () => {
    const { Close } = this.props;
    Close && Close();
  };

  render() {
    const { Loading, PrintLoading, DeclineLoading, ConfirmLoading } =
      this.state;
    const {
      t,
      Width,
      MaxWidth,
      Title = "",
      Scroll = false,
      MarginBottom,
      Padding = "8px 24px",
      MinHeight = "30px",
      Save,
      ShowDecline = false,
      ShowConfirm = false,
      ShowPrint = false,
      ShowPrintAndSave = false,
      ShowSaveNotLoad = false,
      ShowSave = true,
      overflowInherit,
      Decline,
      Confirm,
      Print,
      SaveButtonText,
      ConfirmButtonText,
      children,
    } = this.props;

    return (
      <Dialog
        open
        fullWidth={Width ? false : true}
        onClose={this.Close}
        maxWidth={MaxWidth ? MaxWidth : "md"}
        disableEscapeKeyDown={false}
        PaperProps={{
          style: { margin: 0, overflowY: "initial" },
        }}
        scroll={Scroll}
      >
        <DialogTitleContent onClose={this.Close}>
          {t(Title + "")}
        </DialogTitleContent>
        <StyledDialogContent
          dividers
          style={{
            marginBottom: MarginBottom ? MarginBottom : "auto",
            width: Width ? Width : "auto",
            minHeight: MinHeight,
            padding: Padding,
            overflow: overflowInherit ? "inherit" : "auto",
            zIndex: 9000,
          }}
        >
          {children}
        </StyledDialogContent>
        <DialogActions style={{ display: "inline-block", width: "100%" }}>
          {/* Back Button */}
          <Button
            color="primary"
            size="sm"
            style={{ float: "left", margin: "4px" }}
            startIcon={<CancelIcon />}
            onClick={this.Close}
          >
            {t("Back")}
          </Button>
          {/* Print & Save Button */}
          {ShowPrintAndSave === true ? (
            <div
              style={{
                float: "right",
                position: "relative",
                display: "inline",
              }}
            >
              <Button
                color="success"
                size="sm"
                startIcon={<SaveIcon />}
                onClick={() => {
                  this.setState({ Loading: true });
                  Save && Save();
                  // setInterval(() => {        //   setLoading(false);
                  // }, 5000);
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
          ) : null}
          {/* Decline Button */}
          {ShowDecline === true ? (
            <div
              style={{
                float: "right",
                position: "relative",
                display: "inline",
              }}
            >
              <Button
                color="danger"
                size="sm"
                startIcon={<SaveIcon />}
                onClick={() => {
                  this.setState({ DeclineLoading: true });
                  Decline && Decline();
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
          ) : null}
          {/* Save Button */}
          {ShowSave === true ? (
            <div
              style={{
                float: "right",
                position: "relative",
                display: "inline",
              }}
            >
              <Button
                color="success"
                size="sm"
                startIcon={<SaveIcon />}
                onClick={() => {
                  this.setState({ Loading: true });
                  Save && Save();
                }}
                disabled={Loading}
              >
                {SaveButtonText ? t(SaveButtonText + "") : t("Save")}
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
          ) : null}
          {/* Save Confirm */}
          {ShowConfirm === true ? (
            <div
              style={{
                float: "right",
                position: "relative",
                display: "inline",
              }}
            >
              <Button
                color="success"
                size="sm"
                startIcon={<CheckIcon />}
                onClick={() => {
                  this.setState({ ConfirmLoading: true });
                  Confirm &&
                    Confirm(() => this.setState({ ConfirmLoading: false }));
                }}
                disabled={ConfirmLoading}
              >
                {ConfirmButtonText ? t(ConfirmButtonText + "") : t("Confirm")}
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
          ) : null}
          {/* Print Button */}
          {ShowPrint === true ? (
            <div
              style={{
                float: "right",
                position: "relative",
                display: "inline",
              }}
            >
              <Button
                color="info"
                size="sm"
                style={{ float: "right", margin: "4px" }}
                startIcon={<PrintOutlinedIcon />}
                onClick={() => {
                  this.setState({ PrintLoading: true });
                  Print && Print();
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
          ) : null}
          {ShowSaveNotLoad === true ? (
            <Button
              color="success"
              size="sm"
              style={{ float: "right", margin: "4px" }}
              startIcon={<SaveIcon />}
              onClick={() => Save && Save()}
            >
              {SaveButtonText ? t(SaveButtonText + "") : t("Save")}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(BaseDialog);
