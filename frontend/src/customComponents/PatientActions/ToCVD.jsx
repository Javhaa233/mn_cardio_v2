import React from "react";
import customHistory from "customHistory";
// translation
import { useTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
import FavoriteIcon from "@mui/icons-material/Favorite";

// import Helper from "helper";

// eslint-disable-next-line no-control-regex
const RegistrationNumberRegex = /[^\u0000-\u007F][^\u0000-\u007F][0-9]{8}$/;

export default function ToCVD(props) {
  const { t } = useTranslation();

  // const [buttonDisabled, setButtonDisabled] = useState(true);
  const { PatRegNo = null, className = "" } = props;

  // const FindPatient = async() => {
  // await Helper.BaseCrudHelper.CallService(
  //     "Patient/FindPatient",
  //     { PatientId },
  //     (DaresDatata) => {
  //       if (resData && resData.Success && resData.Data) {
  //         if (RegistrationNumberRegex.test(resData.Data.p_registration)) {
  //           setButtonDisabled(false);
  //           setPatRegNo(resData.Data.p_registration.replace(/\s/g, ""));
  //         }
  //       }
  //     }
  //   );
  // };

  return (
    <div>
      <Button
        disabled={PatRegNo ? false : true}
        color="info"
        className={className}
        onClick={() => {
          if (RegistrationNumberRegex.test(PatRegNo)) {
            customHistory.push(
              "/admin/Cardiovascular?PatRegNo=" +
                PatRegNo.replace(/\s/g, "") +
                "&source=PatientInfo",
            );
          }
        }}
        size="sm"
      >
        <FavoriteIcon />
        {t("Cardiovascular risk monitoring")}
      </Button>
    </div>
  );
}
