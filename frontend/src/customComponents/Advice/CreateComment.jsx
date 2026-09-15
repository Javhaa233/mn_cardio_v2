import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  Avatar,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
// @mui/icons-material
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import AudioRecorder from "customComponents/Chat/AudioRecorder";
import { recorderUnavailableReason } from "customComponents/Chat/useMediaRecorder";
import {
  ADVICE_UPLOAD_EXT,
  ADVICE_MAX_FILE_MB,
} from "customComponents/AdviceFeed/mediaUtils";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

export default function CreateComment(props) {
  const { t } = useTranslation();
  const {
    AdviceId = 0,
    LogedUser = null,
    IsDisabled = false,
    SaveComment,
  } = props;

  const [DoctorInfo, setDoctorInfo] = useState(null);
  const [Comment, setComment] = useState("");
  const [Files, setFiles] = useState([]);
  const [Recording, setRecording] = useState(false);
  const [RecordError, setRecordError] = useState(null);

  // Checked once per mount rather than on click: a browser that cannot record
  // will not start being able to, and a button that explains itself only after
  // being pressed is a button that should not have been offered.
  const RecorderBlocked = React.useMemo(() => recorderUnavailableReason(), []);

  useEffect(() => {
    const getDoctorInfo = async () => {
      if (AdviceId)
        await Helper.DoctorsProfileHelper.GetDoctorsProfileInfoByUserId(
          LogedUser?.Id,
          (resData) => resData && setDoctorInfo(resData.Data),
        );
    };
    getDoctorInfo();
  }, [AdviceId, LogedUser?.Id]);

  const Save = () =>
    SaveComment &&
    SaveComment({ Comment, Files }, () => {
      setComment("");
      setFiles([]);
      setRecordError(null);
    });

  /*
   * A finished recording is APPENDED, not sent.
   *
   * Chat sends a voice note the instant recording stops, because there the clip
   * is the whole message. A зөвлөгөө reply is usually a recording AND the words
   * that frame it - "сонсоод үзээрэй, II холболт дээр..." - so it joins the
   * attachment list and waits for Send like any other file.
   *
   * The recorder's output is already the exact shape both BaseFileUpload and
   * BaseUploadFile expect - { FileSrc, File, Type, FileInfo: { Name,
   * DurationMs } } - so nothing needs converting. DurationMs is what lets the
   * player show a length before the bytes are fetched.
   */
  const AddRecording = (file) => {
    setRecording(false);
    if (!file) return;
    setFiles((prev) => [...prev, file]);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: colors.brand.hairline,
        boxShadow: "none",
        overflow: "visible",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              width: 32,
              height: 32,
              border: `1px solid ${colors.brand.hairline}`,
            }}
            src={
              DoctorInfo && DoctorInfo.Files && DoctorInfo.Files.length > 0
                ? DoctorInfo.Files[0].FileSrc
                : ""
            }
          />
        }
        title={
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Dr. {LogedUser ? LogedUser.UserName : ""}
          </Typography>
        }
        sx={{ p: 1, pb: 0 }}
      />
      <CardContent sx={{ py: 0, px: 1, "&:last-child": { pb: 0.5 } }}>
        <Box
          sx={{
            mt: 0.5,
            mb: 0.5,
            "& textarea": {
              border: "1px solid !important",
              borderColor: `${colors.brand.hairlineStrong} !important`,
              borderRadius: `${radius.sm} !important`,
              p: "8px !important",
            },
            "& textarea:focus": {
              borderColor: `${colors.brand.cyan} !important`,
            },
          }}
        >
          <BaseTextArea
            Rows="3"
            Value={Comment}
            ChangeValue={(name, value) => setComment(value)}
            HideLabel={true}
            Disabled={IsDisabled}
          />
        </Box>
      </CardContent>

      {RecordError ? (
        <Typography
          variant="caption"
          sx={{ display: "block", px: 1, pb: 0.5, color: colors.label.error }}
        >
          {t(RecordError)}
        </Typography>
      ) : null}

      {/* Attachments get their own full-width row. Squeezed between the
          microphone and Send, the drop zone and the attached-file cards had
          no room and pushed the Send button around. */}
      {!Recording && !IsDisabled ? (
        <Box sx={{ px: 1, pb: 0.5 }}>
          <BaseFileUpload
            Value={Files}
            Config={{ Name: "Files" }}
            ChangeValue={(value) => setFiles(value)}
            WithLabel={false}
            allowedFileTypes={ADVICE_UPLOAD_EXT}
            maxFileSize={ADVICE_MAX_FILE_MB}
          />
        </Box>
      ) : null}

      <CardActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          pb: 1,
          pt: 0,
        }}
      >
        {/* While recording the row belongs to the recorder alone. There is
            nothing useful to do during a recording, and the composer is not
            wide enough to hold both without making each of them unusable -
            the same call Chat/Composer.jsx makes. */}
        {Recording ? (
          <AudioRecorder
            Active={Recording}
            DoneLabel={t("Хавсаргах")}
            OnDone={AddRecording}
            OnCancel={() => setRecording(false)}
            OnError={(msg) => {
              setRecording(false);
              setRecordError(msg);
            }}
          />
        ) : (
          <>
            {/* LEFT: voice note */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip
                title={RecorderBlocked ? t(RecorderBlocked) : t("Дуу бичих")}
              >
                {/* span, because a disabled IconButton fires no events and a
                    Tooltip with nothing to listen to never opens - which is
                    exactly the case that needs to explain itself. */}
                <span>
                  <IconButton
                    size="small"
                    aria-label={t("Дуу бичих")}
                    disabled={IsDisabled || !!RecorderBlocked}
                    onClick={() => {
                      setRecordError(null);
                      setRecording(true);
                    }}
                    sx={{ color: colors.brand.cyanInk }}
                  >
                    <MicIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* RIGHT: Send button */}
            <Button
              color="primary"
              size="sm"
              sx={{
                height: 36,
                minHeight: 36,
                px: 1.5,
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
              }}
              onClick={Save}
              // A photo-only reply is legitimate and every save path already
              // supports one - AdviceComment.SaveComment, AdviceDetail and
              // ReplyThread all check text OR files. Only this button forbade
              // it, on a feed where the answer is very often an ECG strip and
              // no words. A voice-note-only reply is the same case.
              disabled={IsDisabled || (!Comment.trim() && Files.length === 0)}
            >
              {t("Send")}
              <SendIcon sx={{ ml: 1, width: 16, height: 16 }} />
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
}
