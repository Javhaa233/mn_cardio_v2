import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
//import BaseFilesInfo from "customComponents/BaseViewControls/BaseFilesInfo";
import BaseLoading from "customComponents/BaseLoading";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";

// SVG
import Coronary from "customComponents/Forms/Cathlab/Coronary";
import VentriculographyLAO from "customComponents/Forms/Cathlab/VentriculographyLAO";
import VentriculographyRAO from "customComponents/Forms/Cathlab/VentriculographyRAO";

// helper
import Helper from "helper";

export default function Tcd2(props) {
  const { t } = useTranslation();

  const [Data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { DataId = null } = props;
  //const [FieldLists, setFieldLists] = useState([]);

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
        { ObjectName: "PCathlab", SearchOption },
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
          <GridContainer style={{ margin: "0" }}>
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
                      <span style={{ fontWeight: "400" }}>{Data.user_mod}</span>
                    </UserDialogLink>
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>

            <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
              <BaseArrayInfo
                Label="Procedure"
                TextField={"Label"}
                Left={true}
                Values={
                  Data.cath_lab_operation_procedureObj
                    ? Data.cath_lab_operation_procedureObj
                    : []
                }
              />
              <BaseArrayInfo
                Label="Doctor's name"
                TextField={"Label"}
                Left={true}
                Values={Data.doctors_nameObj ? Data.doctors_nameObj : []}
              />
              <BaseInfo
                Label="Conclusion"
                Value={Data.Conclusion}
                md={3}
                style={{ marginTop: "15px", marginBottom: "15px" }}
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
              <Coronary Data={Data} NotEdit={true} />
              <div style={{ height: "10px" }}></div>
              <VentriculographyLAO Data={Data} NotEdit={true} />
              <div style={{ height: "10px" }}></div>
              <VentriculographyRAO Data={Data} NotEdit={true} />
            </GridItem>
          </GridContainer>
        )}
      </div>
    );
  }
}
