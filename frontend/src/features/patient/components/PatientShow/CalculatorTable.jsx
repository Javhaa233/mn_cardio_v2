import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import BaseTable from "customComponents/BaseTable";
import DivLoading from "customComponents/DivLoading";

import Helper from "helper";
import i18n from "i18n";

// TanStack Table version of CalculatorTable
const CalculatorTable = React.forwardRef(
  (
    { patientId: propPatientId, Title, Color, WithoutCard, Height, Clean },
    ref,
  ) => {
    const [patientId, setPatientId] = useState(propPatientId);
    const [data, setData] = useState([]);
    const [gridOption, setGridOption] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [firstDataCheck, setFirstDataCheck] = useState(true);
    const [searchOption, setSearchOption] = useState({
      PageOption: { Page: 0, Limit: 10 },
      OrderBy: { Field: "id_data", Type: "desc" },
      SearchField: [],
    });

    // Sync prop to state
    useEffect(() => {
      if (propPatientId !== undefined) {
        setPatientId(propPatientId);
      }
    }, [propPatientId]);

    // Memoized getData function
    const getData = useCallback(
      async (firstCheck = false, overrideId) => {
        const idToUse = overrideId || patientId;
        if (!idToUse) return;

        setIsLoading(true);

        // Add patient ID to search fields
        let updatedSearchField = Helper.BaseCrudHelper.SetSearchField(
          "patient_id",
          idToUse,
          searchOption.SearchField,
          "Equals",
        );

        const optionsToUse = {
          ...searchOption,
          SearchField: updatedSearchField,
          OrderBy: searchOption.OrderBy || {
            Field: "date_creation",
            Type: "desc",
          },
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

    useImperativeHandle(ref, () => ({
      SetPatientId: (id) => {
        setPatientId(id);
        getData(true, id);
      },
      GetData: (firstCheck) => {
        getData(firstCheck);
      },
    }));

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
      },
      [searchOption],
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
    }, [searchOption]);

    const handleChangePage = useCallback((Page, Limit) => {
      setSearchOption((prev) => ({
        ...prev,
        PageOption: { Page, Limit },
      }));
    }, []);

    const handleOrderBy = useCallback((Field, Type) => {
      setSearchOption((prev) => ({
        ...prev,
        OrderBy: { Field, Type },
      }));
    }, []);

    // Removed automatic useEffect fetch on patientId change
    // Initialize data when patientId changes (handled by useEffect above mostly, but first check logic)
    useEffect(() => {
      if (!patientId) {
        const timer = setTimeout(() => {
          setData([]); // Clear data if no patientId
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [patientId]);

    // Define fields for the table
    const tableFields = [
      { Label: i18n.t("Calculator"), Name: "calculator" },
      { Label: i18n.t("Score"), Name: "score" },
      { Label: i18n.t("Ref"), Name: "ref" },
      { Label: i18n.t("Date"), Name: "date_creation", Type: "Date" },
      { Label: i18n.t("Doctor"), Name: "DoctorsProfile.firstname" },
    ];

    return (
      <div
        style={{
          position: "relative",
        }}
      >
        {isLoading && <DivLoading />}
        <BaseTable
          Height={Height || "454px"}
          Clean={Clean}
          Data={data}
          Fields={tableFields}
          PK="id_data"
          HidePagination={false}
          PageSize={searchOption.PageOption.Limit}
          ShowData={(rowData) => {
            // Handle row click if needed
            console.log("Row clicked:", rowData);
          }}
          SelectRow={(selectedRows) => {
            // Handle selection change if needed
            console.log("Selection changed:", selectedRows);
          }}
          Title={Title || "Calculator"}
          headerColor={Color || "info"}
          WithoutCard={WithoutCard}
          Option={gridOption}
          Search={setSearchDateRange}
          Refresh={handleRefresh}
          OrderBy={handleOrderBy}
          PageLimitChange={handleChangePage}
        />
      </div>
    );
  },
);

export default CalculatorTable;
