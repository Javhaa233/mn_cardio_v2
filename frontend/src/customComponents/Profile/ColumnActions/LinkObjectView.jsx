import React from "react";
import { useTranslation } from "react-i18next";

import Button from "components/CustomButtons/Button";

export default function LinkObjectView(props) {
  const { t } = useTranslation();

  const { onClick } = props;

  // A per-row action, so outlined: filled, it put a primary button on every
  // row of the history grid - a column of seventeen calls to action.
  return (
    <Button size={"sm"} color="info" onClick={() => onClick && onClick()}>
      {t("Related information")}
    </Button>
  );
}
