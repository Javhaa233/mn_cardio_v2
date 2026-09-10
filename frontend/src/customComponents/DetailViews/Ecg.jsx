import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseFilesInfo from "customComponents/BaseViewControls/BaseFilesInfo";
import BaseLoading from "customComponents/BaseLoading";
// helper
import Helper from "helper";

export default function Ecg(props) {
  const { t } = useTranslation();

  const [Data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { DataId = null } = props;

  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetData = async () => {
    setIsLoading(true);
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "id_data",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );

      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "EcgExamination", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            setData(Object.assign({}, resData.Data));
          setIsLoading(false);
        },
      );
    } else {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <BaseLoading />;
  } else {
    return (
      <div>
        {Data && (
          <GridContainer style={{ width: "100%" }}>
            <GridItem xs={12} sm={12} md={12}>
              <GridContainer style={{ margin: "15px 0" }}>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "left" }}>
                    {t("Date")}: {"\u00A0"}
                    <span style={{ fontWeight: "400" }}>
                      &nbsp;{Data.date_creation || ""}
                    </span>
                  </div>
                </GridItem>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "right", marginRight: "40px" }}>
                    <UserDialogLink UserId={Data.id}>
                      {t("Doctor")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;{Data.user_mod || ""}
                      </span>
                    </UserDialogLink>
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>

            <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
              <BaseInfo Label="Comments" Value={Data.comment} md={6} />
              <BaseFilesInfo
                Data={Data.Files || []}
                Label="File attachment"
                md={6}
              />
            </GridItem>
          </GridContainer>
        )}
      </div>
    );
  }
}
