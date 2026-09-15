// Deep imports, not the "@mui/material" barrel. This file sits on the LOGIN
// critical path (LoginPage -> helper -> BaseCrudHelper -> BaseAlert), and in dev
// the barrel pulls @mui_material.js plus 137 transitive chunk files - 87 extra
// requests and ~1.4 MB, through an import graph 12 levels deep, which serialises
// badly on Vite dev's 6 sockets per origin.
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
// translation
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { dialogActionSx, dialogPaperSx } from "@/theme/controlStyles";

/**
 * The tone of the badge beside the message. The words stay in brand ink: the
 * old dialog printed the whole message in pure red or green, which is hard to
 * read at length and says nothing a colour-blind reader can see. The icon
 * carries the meaning; the colour only reinforces it.
 */
const TONES = {
  success: {
    Icon: CheckCircleOutlineRoundedIcon,
    color: colors.status.success,
    background: "rgba(40, 167, 69, 0.10)",
  },
  error: {
    Icon: ErrorOutlineRoundedIcon,
    color: colors.status.danger,
    background: "rgba(220, 53, 69, 0.08)",
  },
  question: {
    Icon: HelpOutlineRoundedIcon,
    color: colors.brand.cyanInk,
    background: colors.brand.tint,
  },
  destructive: {
    Icon: WarningAmberRoundedIcon,
    color: colors.status.danger,
    background: "rgba(220, 53, 69, 0.08)",
  },
};

export default function BaseAlert(props) {
  const { t } = useTranslation();

  const {
    Type = "Message",
    Message = "",
    Confirm,
    Hide,
    success = false,
    MoreInfo = null,
    // Confirm only: the Yes button destroys something (delete, remove), so it
    // is red rather than the filled primary.
    Destructive = false,
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

  if (Type !== "Confirm" && Type !== "Message") return <div></div>;

  const IsConfirm = Type === "Confirm";
  const Tone = IsConfirm
    ? Destructive
      ? TONES.destructive
      : TONES.question
    : success
      ? TONES.success
      : TONES.error;
  const ToneIcon = Tone.Icon;

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby={MoreInfo ? "alert-dialog-description" : undefined}
      PaperProps={{
        sx: {
          ...dialogPaperSx,
          margin: { xs: space[3], sm: space[8] },
          width: { xs: "calc(100% - 24px)", sm: "100%" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: space[4],
          alignItems: "flex-start",
          padding: `${space[6]} ${space[6]} ${space[2]}`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: "40px",
            height: "40px",
            borderRadius: radius.md,
            backgroundColor: Tone.background,
            color: Tone.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ToneIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, paddingTop: "9px" }}>
          {/* component="div": a bare heading is restyled by _misc.scss. */}
          <Typography
            id="alert-dialog-title"
            variant="h4"
            component="div"
            sx={{
              color: colors.brand.ink,
              overflowWrap: "anywhere",
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </Typography>
          {MoreInfo ? (
            <Box
              id="alert-dialog-description"
              sx={{
                marginTop: space[2],
                typography: "body2",
                color: colors.brand.inkMuted,
              }}
            >
              {MoreInfo}
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: space[2],
          padding: `${space[4]} ${space[6]} ${space[6]}`,
        }}
      >
        {IsConfirm ? (
          <>
            <Button
              disableElevation
              onClick={handleClose}
              sx={dialogActionSx("neutral")}
            >
              {t("No")}
            </Button>
            <Button
              disableElevation
              autoFocus
              onClick={handleConfirm}
              sx={
                Destructive
                  ? {
                      ...dialogActionSx("danger"),
                      color: colors.text.white,
                      backgroundColor: colors.status.danger,
                      "&:hover": {
                        boxShadow: "none",
                        backgroundColor: colors.button.dangerHover,
                        borderColor: colors.button.dangerHover,
                      },
                    }
                  : dialogActionSx("primary")
              }
            >
              {t("Yes")}
            </Button>
          </>
        ) : (
          <Button
            disableElevation
            autoFocus
            onClick={handleClose}
            sx={dialogActionSx("primary")}
          >
            {t("OK")}
          </Button>
        )}
      </Box>
    </Dialog>
  );
}

// Add prop types
BaseAlert.propTypes = {
  Type: PropTypes.string,
  Message: PropTypes.string,
  Confirm: PropTypes.func,
  Hide: PropTypes.func,
  success: PropTypes.bool,
  MoreInfo: PropTypes.any,
  Destructive: PropTypes.bool,
};
