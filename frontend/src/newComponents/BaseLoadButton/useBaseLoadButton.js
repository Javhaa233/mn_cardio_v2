import { useState } from "react";
import { getValue } from "utils/helper";
import { useSelector } from "react-redux";

export default ({ selector, ...props }) => {
  const loading = useSelector((state) => getValue(state, selector));
  const loadingIcon = "/static/spin.gif";
  const [disable, setDisable] = useState(false);

  return {
    loadingIcon,
    loading,
    disable,
    setDisable,
  };
};
