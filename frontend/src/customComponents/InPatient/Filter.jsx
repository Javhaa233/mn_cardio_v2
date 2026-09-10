import React, { useState, useEffect } from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import SimpleSelect from "customComponents/SimpleSelect";
// translation
import { useTranslation } from "react-i18next";
// helper
import Helper from "helper";

export default function Filter(props) {
  const { t } = useTranslation();
  const { SetFilter } = props;

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

  const [Data, setData] = useState([]);

  useEffect(() => {
    getDepartmentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDepartmentList = async () => {
    const DoctorId = LogedUser.Doctor ? LogedUser.Doctor.id_data : null;
    await Helper.InPatientHelper.GetDepartmentList(DoctorId, (resData) => {
      if (resData && resData.Success) {
        setData(Array.isArray(resData.Data) ? resData.Data : []);
        const DepId = resData.Data.length > 0 ? resData.Data[0].id_data : null;
        DepId && SetFilter(DepId);
      }
    });
  };

  return (
    <GridContainer
      sx={{ margin: 0, width: "100%" }}
      style={{ marginLeft: "6px" }}
    >
      <GridItem xs={12} sm={4} md={3}>
        <SimpleSelect
          Config={{
            Name: "DepartmentId",
            Label: t("Department"),
            Config: { IdField: "id_data", TextField: "name" },
            Data,
            NewValue: Data && Data.length > 0 ? Data[0].id_data : null,
          }}
          ChangeValue={(value) => SetFilter && SetFilter(value)}
          Variant="outlined"
          DefaultValue="-- Select --"
          Width="220px"
        />
      </GridItem>
    </GridContainer>
  );
}
