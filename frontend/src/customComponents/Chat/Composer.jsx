import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { docIcon } from "customComponents/AdviceFeed/PostMedia";
import AudioRecorder from "./AudioRecorder";
import VideoRecorder from "./VideoRecorder";
import { recorderUnavailableReason } from "./useMediaRecorder";

/**
 * The message composer.
 *
 * NOT baseComponents/Controls/BaseFileUpload: that component renders its own
 * "Choose files" button (hardcoded to #5ba3ff), its own thumbnail strip and its
 * own validation banner. Advice/CreateComment.jsx already has to CSS-wrestle it
 * down to 36px to fit a comment box, and a chat composer is tighter still.
 *
 * What IS reused from it, deliberately and in a bounded way, is the payload
 * contract and the validation gate: the {FileSrc, File, Type, FileInfo:{Name}}
 * shape built in its ChooseFile, and the size/extension check in its
 * validateFile. Helper.BaseCrudHelper.BaseUploadFile depends on that exact shape
 * - it does formData.append("File" + n, File, FileInfo.Name) - so the duplication
 * here is of ~15 lines, and it is the price of not shipping a second oversized
 * widget in a 550px panel.
 */

const MAX_FILES = 10;
const MAX_FILE_MB = 50; // matches MAX_UPLOAD_BYTES_CHAT on the backend
const ALLOWED_EXT = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "dcm",
  "mp3",
  "m4a",
  "aac",
  "ogg",
  "wav",
  "webm",
  // audio/webm, what a browser voice note is when it cannot record audio/mp4
  "weba",
  // Video, matching AllowedExtFor('ChatMessages') on the backend. Kept in step
  // with that list: anything here the server does not accept is a file the user
  // watches upload and then loses.
  "mp4",
  "m4v",
  "mov",
];

const TYPING_THROTTLE_MS = 2000;
const TYPING_IDLE_MS = 3500;

const Composer = forwardRef(function Composer(
  { Disabled, OnSend, OnTyping, Draft, OnDraftChange },
  ref,
) {
  const { t } = useTranslation();
  const [text, setText] = useState(Draft || "");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Recording state. `recordAudio` swaps the text field for the recorder row;
  // `recordVideo` opens a dialog over the panel.
  const [recordAudio, setRecordAudio] = useState(false);
  const [recordVideo, setRecordVideo] = useState(false);

  // Resolved once on mount via the lazy initialiser: it only asks what the
  // browser supports and whether the page is a secure context, and neither can
  // change for the life of the component.
  const [cannotRecord] = useState(recorderUnavailableReason);

  // Typing-signal bookkeeping. This used to emit on EVERY keystroke and never
  // said "stopped", so a long message was dozens of socket frames and the other
  // side's "Бичиж байна..." never went away.
  const lastTypingAt = useRef(0);
  const idleTimer = useRef(null);

  const signalTyping = useCallback(() => {
    if (!OnTyping) return;
    const now = Date.now();
    if (now - lastTypingAt.current > TYPING_THROTTLE_MS) {
      lastTypingAt.current = now;
      OnTyping(true);
    }
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      lastTypingAt.current = 0;
      OnTyping(false);
    }, TYPING_IDLE_MS);
  }, [OnTyping]);

  const stopTyping = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = null;
    lastTypingAt.current = 0;
    OnTyping && OnTyping(false);
  }, [OnTyping]);

  // NOTE: Draft is read ONCE, as the initial value above. Conversation gives
  // this component a key of the room id, so switching rooms remounts it and
  // picks up that room's draft. Syncing it with an effect instead would be a
  // synchronous setState inside an effect - a cascading render, and an error
  // under this project's react-hooks rules.

  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  const canSend = !Disabled && (text.trim().length > 0 || files.length > 0);

  const validate = useCallback(
    (file) => {
      const mb = file.size / (1024 * 1024);
      const ext = String(file.name || "")
        .split(".")
        .pop()
        .toLowerCase();

      if (mb > MAX_FILE_MB) {
        return t("Файл хэт том байна") + ` (${MAX_FILE_MB}MB): ${file.name}`;
      }
      if (!ALLOWED_EXT.includes(ext)) {
        return t("Файлын төрөл зөвшөөрөгдөөгүй") + `: .${ext}`;
      }
      return null;
    },
    [t],
  );

  const addFiles = useCallback(
    async (incoming) => {
      setError(null);
      const list = Array.from(incoming || []);
      if (list.length === 0) return;

      const next = [...files];
      const problems = [];

      for (let i = 0; i < list.length; i++) {
        if (next.length >= MAX_FILES) {
          problems.push(t("Хамгийн ихдээ 10 файл хавсаргана"));
          break;
        }
        const file = list[i];
        const problem = validate(file);
        if (problem) {
          problems.push(problem);
          continue;
        }

        let FileSrc = null;
        if (file.type && file.type.indexOf("image") > -1) {
          try {
            FileSrc = await Helper.FileHelper.GetFileSrc(file);
          } catch (ex) {
            FileSrc = null;
          }
        }
        next.push({
          FileSrc,
          File: file,
          Type: file.type,
          FileInfo: { Name: file.name },
        });
      }

      setFiles(next);
      if (problems.length) setError(problems.join("\n"));
    },
    [files, validate, t],
  );

  // Conversation owns the drop target (the whole pane, not just this box), so
  // it needs a way to hand the dropped files down.
  useImperativeHandle(ref, () => ({ addFiles }), [addFiles]);

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const send = () => {
    if (!canSend) return;
    stopTyping();
    OnSend({ MessageText: text, Files: files });
    // Only cleared once the send has actually been dispatched. The old code
    // cleared the box before it knew anything, so a failure lost the text.
    setText("");
    setFiles([]);
    setError(null);
  };

  const onKeyDown = (e) => {
    // isComposing guard: without it every IME commit fires this handler, which
    // for Cyrillic and Mongolian input means sending half a word.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const onPaste = (e) => {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    const images = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          // A pasted blob's name is empty, and BaseUploadFile does
          // formData.append("File"+n, File, FileInfo.Name) - an empty filename
          // produces a broken multipart part that the backend cannot match.
          images.push(
            new File([blob], `paste-${Date.now()}.png`, {
              type: blob.type || "image/png",
            }),
          );
        }
      }
    }
    if (images.length === 0) return; // let plain text paste normally
    e.preventDefault();
    addFiles(images);
  };

  return (
    <Box
      sx={{
        borderTop: `1px solid ${colors.brand.hairline}`,
        p: 1,
        bgcolor: colors.brand.surface,
      }}
    >
      {error ? (
        <Alert
          severity="warning"
          onClose={() => setError(null)}
          sx={{ mb: 1, whiteSpace: "pre-line" }}
        >
          {error}
        </Alert>
      ) : null}

      {files.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {files.map((f, i) => (
            <Chip
              key={`${f.FileInfo.Name}-${i}`}
              size="small"
              variant="outlined"
              onDelete={() => removeFile(i)}
              icon={f.FileSrc ? undefined : docIcon(extOf(f.FileInfo.Name))}
              avatar={
                f.FileSrc ? (
                  <Box
                    component="img"
                    src={f.FileSrc}
                    alt=""
                    sx={{
                      width: 24,
                      height: 24,
                      objectFit: "cover",
                      borderRadius: radius.xs,
                    }}
                  />
                ) : undefined
              }
              label={f.FileInfo.Name}
              sx={{
                maxWidth: 200,
                borderColor: colors.brand.hairline,
                color: colors.brand.ink,
              }}
            />
          ))}
        </Box>
      ) : null}

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          aria-label={t("Файл хавсаргах")}
        />
        <Tooltip title={t("Файл хавсаргах")}>
          <span>
            <IconButton
              size="small"
              disabled={Disabled || recordAudio}
              onClick={() => inputRef.current && inputRef.current.click()}
              aria-label={t("Файл хавсаргах")}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {recordAudio ? (
          <AudioRecorder
            Active={recordAudio}
            OnDone={(file) => {
              setRecordAudio(false);
              // Straight out, not into the chip strip: a voice note is the
              // message, not an attachment to one, and making the user press
              // send twice for it would be a strange way to talk.
              stopTyping();
              OnSend({ MessageText: "", Files: [file] });
            }}
            OnCancel={() => setRecordAudio(false)}
            OnError={(msg) => {
              setRecordAudio(false);
              setError(t(msg));
            }}
          />
        ) : (
          <>
            <Tooltip title={cannotRecord ? t(cannotRecord) : t("Дуу бичих")}>
              <span>
                <IconButton
                  size="small"
                  disabled={Disabled || !!cannotRecord}
                  onClick={() => {
                    setError(null);
                    setRecordAudio(true);
                  }}
                  aria-label={t("Дуу бичих")}
                >
                  <MicIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={cannotRecord ? t(cannotRecord) : t("Видео бичих")}>
              <span>
                <IconButton
                  size="small"
                  disabled={Disabled || !!cannotRecord}
                  onClick={() => {
                    setError(null);
                    setRecordVideo(true);
                  }}
                  aria-label={t("Видео бичих")}
                >
                  <VideocamIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {recordAudio ? null : (
          <TextField
            fullWidth
            multiline
            maxRows={5}
            size="small"
            disabled={Disabled}
            placeholder={t("Мессеж бичих...")}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              OnDraftChange && OnDraftChange(e.target.value);
              if (e.target.value) signalTyping();
              else stopTyping();
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            inputProps={{ "aria-label": t("Мессеж бичих...") }}
          />
        )}

        {recordAudio ? null : (
          <Tooltip title={t("Илгээх")}>
            <span>
              <IconButton
                size="small"
                disabled={!canSend}
                onClick={send}
                aria-label={t("Илгээх")}
                sx={{
                  bgcolor: canSend ? colors.brand.cyanInk : "transparent",
                  color: canSend ? "#fff" : undefined,
                  "&:hover": {
                    bgcolor: canSend ? colors.brand.cyanInkHover : undefined,
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>

      <VideoRecorder
        Open={recordVideo}
        OnClose={() => setRecordVideo(false)}
        OnDone={(file) => {
          setRecordVideo(false);
          stopTyping();
          OnSend({ MessageText: "", Files: [file] });
        }}
      />
    </Box>
  );
});

export default Composer;

function extOf(name) {
  if (!name) return "";
  const i = String(name).lastIndexOf(".");
  return i > -1
    ? String(name)
        .slice(i + 1)
        .toLowerCase()
    : "";
}
