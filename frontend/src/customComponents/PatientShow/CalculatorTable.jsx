import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import React, { useState, useEffect, useCallback } from "react";
import BaseTable from "customComponents/BaseTable";
import DivLoading from "customComponents/DivLoading";

import Helper from "helper";
import i18n from "i18n";

// TanStack Table version of CalculatorTable
const CalculatorTable = React.forwardRef(({ patientId }, ref) => {
  const [data, setData] = useState([]);
  const [gridOption, setGridOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstDataCheck, setFirstDataCheck] = useState(true);
  const [searchOption, setSearchOption] = useState({
    PageOption: { Page: 0, Limit: 10 },
    OrderBy: { Field: "id_data", Type: "desc" },
    SearchField: [],
  });

  // Memoized getData function
  const getData = useCallback(
    async (firstCheck = false) => {
      if (!patientId) return;

      setIsLoading(true);

      // Add patient ID to search fields
      let updatedSearchField = Helper.BaseCrudHelper.SetSearchField(
        "patient_id",
        patientId,
        searchOption.SearchField,
        "Equals",
      );

      const optionsToUse = {
        ...searchOption,
        SearchField: updatedSearchField,
        OrderBy: { Field: "date_creation", Type: "desc" }, // Sort by date by default
      };

      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "Calculator", SearchOption: optionsToUse },
        (resData) => {
          if (resData && resData.Data) {
            if (resData.Data.length === 0 && firstCheck) {
              setFirstDataCheck(true);
            } else {
              setFirstDataCheck(false);
            }
            setData(resData.Data);
            setGridOption(resData.Option);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setData([]); // Set empty array if no data
          }
        },
      );
    },
    [patientId, searchOption],
  );

  // Set search option with date range
  const setSearchDateRange = useCallback(
    (startDate, endDate) => {
      // Remove old date filter and add new one
      let filteredSearchField = searchOption.SearchField.filter(
        (el) => el.Field !== "date_creation",
      );

      const newSearchField = Helper.BaseCrudHelper.SetSearchField(
        "date_creation",
        [startDate, endDate],
        filteredSearchField,
        "Between",
      );

      setSearchOption((prev) => ({
        ...prev,
        SearchField: newSearchField,
      }));

      // Fetch updated data
      setTimeout(() => getData(false), 100); // Allow state update before fetching
    },
    [searchOption, getData],
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

    // Fetch updated data
    setTimeout(() => getData(false), 100);
  }, [searchOption, getData]);

  const searchField = useCallback(
    (Field, SearchText) => {
      setSearchOption((prev) => ({
        ...prev,
        PageOption: { ...(prev.PageOption || {}), Page: 0 },
        SearchField: Helper.BaseCrudHelper.SetSearchField(
          Field,
          SearchText,
          prev.SearchField || [],
        ),
      }));
    },
    [setSearchOption],
  );

  // Initialize data when patientId changes
  useEffect(() => {
    if (patientId) {
      getData(true);
    } else {
      setData([]); // Clear data if no patientId
    }
  }, [patientId, getData]);

  // Define fields for the table
  const tableFields = [
    { Label: i18n.t("Calculator"), Name: "calculator" },
    { Label: i18n.t("Score"), Name: "score" },
    { Label: i18n.t("Ref"), Name: "ref" },
    { Label: i18n.t("Date"), Name: "date_creation", Type: "Date" },
    { Label: i18n.t("Doctor"), Name: "DoctorsProfile.firstname" },
  ];

  if (firstDataCheck) {
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
        PageSize={10}
        FillHeight={false}
        Height="454px"
        SearchField={searchField}
        SearchFieldData={searchOption.SearchField}
        ShowData={(rowData) => {
          // Handle row click if needed
          console.log("Row clicked:", rowData);
        }}
        SelectRow={(selectedRows) => {
          // Handle selection change if needed
          console.log("Selection changed:", selectedRows);
        }}
      />
    </div>
  );
});

export default CalculatorTable;
