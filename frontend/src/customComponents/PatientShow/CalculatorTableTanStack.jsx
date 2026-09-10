import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";

import Helper from "helper";

// TanStack Table version of CalculatorTable
const CalculatorTableTanStack = ({ patientId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [gridOption, setGridOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstDataCheck, setFirstDataCheck] = useState(true);
  const [searchOption, setSearchOption] = useState({
    PageOption: { Page: 0, Limit: 5 },
    OrderBy: { Field: "id_data", Type: "desc" },
    SearchField: [],
  });

  // Get data function
  const getData = useCallback(
    async (firstCheck = false, overrideId) => {
      const currentId = overrideId || patientId;
      if (!currentId) return;

      setIsLoading(true);

      // Add patient ID to search fields
      let updatedSearchField = Helper.BaseCrudHelper.SetSearchField(
        "patient_id",
        currentId,
        searchOption.SearchField,
        "Equals",
      );

      const updatedSearchOption = {
        ...searchOption,
        SearchField: updatedSearchField,
      };

      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "Calculator", SearchOption: updatedSearchOption },
        (resData) => {
          if (resData && resData.Data) {
            if (resData.Data.length === 0 && firstCheck) {
              setFirstDataCheck(true);
            } else {
              setFirstDataCheck(false);
            }
            setData(resData.Data);
            setGridOption(resData.Option || null);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setData([]);
          }
        },
      );
    },
    [patientId, searchOption],
  );

  // Refresh function
  const handleRefresh = useCallback(() => {
    const filteredSearchField = searchOption.SearchField.filter(
      (el) => el.Field !== "date_creation",
    );
    setSearchOption((prev) => ({
      ...prev,
      SearchField: filteredSearchField,
    }));
  }, [searchOption.SearchField]);

  // Initialize data when patientId changes
  useEffect(() => {
    if (patientId) {
      getData(true);
    }
  }, [patientId, getData]);

  // Define fields for the table
  const tableFields = [
    { Title: t("Calculator"), Name: "calculator" },
    { Title: t("Score"), Name: "score" },
    { Title: t("Ref"), Name: "ref" },
    { Title: t("Date"), Name: "date_creation", Type: "Date" },
    { Title: t("Doctor"), Name: "DoctorsProfile.firstname" },
  ];

  if (firstDataCheck && data.length === 0) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      {isLoading && <DivLoading />}
      <BaseGrid
        Data={data}
        Fields={tableFields}
        PK="id_data"
        HidePagination={false}
        PageSize={5}
        Option={gridOption}
      />
    </div>
  );
};

// Wrapper class to maintain compatibility with existing BaseList functionality
class CalculatorTable extends React.Component {
  render() {
    // Use the functional component with TanStack Table
    return <CalculatorTableTanStack patientId={this.props.patientId} />;
  }
}

export default CalculatorTable;
