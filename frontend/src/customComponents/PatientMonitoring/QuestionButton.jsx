import React from "react";
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import CustomBadge from "customComponents/CustomBadge";

import { colors } from "@/theme/colors";

/**
 * Opens the patient's question thread, with the unanswered count on the icon.
 *
 * The count is the reason this one keeps a badge while the other row actions
 * are bare icons: it is the only action on the row that carries state a doctor
 * needs to see without clicking.
 */
export default function QuestionButton(props) {
  const { rowdata = {}, onClick } = props;
  const { t } = useTranslation();

  const count = rowdata.vwVisitComments
    ? rowdata.vwVisitComments.CommentQty
    : 0;

  return (
    <CustomBadge
      Content={count}
      color={count > 0 ? colors.brand.cyanInk : "transparent"}
      textColor={colors.text.white}
      top="6px"
      right="6px"
    >
      <RowActionButton
        label={count > 0 ? t("Асуулт") + " (" + count + ")" : t("Асуулт")}
        icon={<QuestionAnswerOutlinedIcon />}
        onClick={() => onClick && onClick("Type")}
      />
    </CustomBadge>
  );
}
