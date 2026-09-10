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
  Typography,
  Box,
} from "@mui/material";
// @mui/icons-material
import SendIcon from "@mui/icons-material/Send";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

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
    });

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
              borderColor: "grey.300 !important",
              borderRadius: "4px !important",
              p: "8px !important",
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

      <CardActions
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: 1,
          pb: 1,
          pt: 0,
        }}
      >
        {/* LEFT: File upload */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            "& .fileinput": {
              minHeight: 36,
              padding: "0px !important",
              display: "flex",
              alignItems: "center",
            },

            "& .fileinput button": {
              height: 36,
              minHeight: 36,
              padding: "0 12px",
              lineHeight: "36px",
            },
          }}
        >
          <BaseFileUpload
            Value={Files}
            Config={{ Name: "Files" }}
            ChangeValue={(value) => setFiles(value)}
            WithLabel={false}
          />
        </Box>

        {/* RIGHT: Send button */}
        <Button
          color="info"
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
          // ReplyThread all check text OR files. Only this button forbade it,
          // on a feed where the answer is very often an ECG strip and no words.
          disabled={IsDisabled || (!Comment.trim() && Files.length === 0)}
        >
          {t("Send")}
          <SendIcon sx={{ ml: 1, width: 16, height: 16 }} />
        </Button>
      </CardActions>
    </Card>
  );
}
