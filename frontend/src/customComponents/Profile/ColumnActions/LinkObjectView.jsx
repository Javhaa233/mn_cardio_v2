import React from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";

export default function LinkObjectView(props) {
  const { t } = useTranslation();

  const { onClick } = props;

  return (
    <Button size={"sm"} color="primary" onClick={() => onClick && onClick()}>
      {t("Related information")}
    </Button>
  );
}
