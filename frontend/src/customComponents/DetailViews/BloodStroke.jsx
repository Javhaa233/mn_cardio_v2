import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";

export default function BloodStroke(props) {
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
        { ObjectName: "BloodStroke", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            setData(Object.assign({}, resData.Data));
          }
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
          <div>
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Date")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;{Data.date_creation}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right" }}>
                      <UserDialogLink UserId={Data.id}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          {Data.user_mod}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
                <BaseInfo Label="Date" Value={Data.date} md={6} />
                <BaseInfo
                  Label="Type"
                  Value={
                    Data.BloodStrokeType ? Data.BloodStrokeType.label : null
                  }
                  md={6}
                />
                <BaseInfo Label="Inr" Value={Data.inr_value} md={6} />
              </GridItem>
            </GridContainer>
          </div>
        )}
      </div>
    );
  }
}
