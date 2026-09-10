import { useTranslation } from "react-i18next";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  forwardRef,
} from "react";

import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";

import Helper from "helper";

const BaseListManual = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    ObjectName,
    Config,
    SearchOption,
    onSearchOptionChange,
    CustomRender,
    noHorizontalPadding,
    GridHideNumber,
    GridHideCheck,
    GridRowClickSelect,
    GridRowActions,
    GridColumnActions,
    widthPattern,
    SelectRow,
    ShowData,
    Fields: propsFields,
    // The lighter grid skin, rolled out from the patient record. Opt out
    // with Clean={false} on a screen that needs the older look.
    Clean = true,
  } = props;

  const [alert, setAlert] = useState(null);
  const [data, setData] = useState([]);
  const [gridOption, setGridOption] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [internalConfig, setInternalConfig] = useState(Config || null);
  const [configError, setConfigError] = useState(null);

  const [internalSearchOption, setInternalSearchOption] = useState(() => {
    return SearchOption || Helper.BaseCrudHelper.GetSearchOption();
  });

  const searchOption = SearchOption || internalSearchOption;
  const config = Config || internalConfig;

  useEffect(() => {
    if (SearchOption) {
      setInternalSearchOption(SearchOption);
    }
  }, [SearchOption]);

  useEffect(() => {
    if (Config) {
      setInternalConfig(Config);
    } else if (Config === undefined && ObjectName && !internalConfig) {
      setConfigError(null);
      Helper.BaseCrudHelper.GetConfigData(ObjectName, (resData) => {
        if (resData && resData.Success && resData.Data) {
          setInternalConfig(resData.Data);
        } else {
          // Dropping this used to leave the screen on a spinner forever.
          setConfigError((resData && resData.Message) || "");
        }
      });
    }
  }, [Config, ObjectName, internalConfig]);

  const fieldLists = useMemo(() => {
    if (!config) return [];
    const list = Helper.BaseCrudHelper.GetFieldList(config.Fields);
    const fieldListResult = Array.isArray(list) ? list : [];

    // Log column information for debugging (only in development mode)
    if (process.env.NODE_ENV === "development") {
      console.log("BaseListManual - Columns Info:", {
        objectName: ObjectName,
        totalColumns: fieldListResult.length,
        columns: fieldListResult.map((field) => ({
          name: field.Name,
          title: field.Title,
          type: field.Type,
          visible: field.Visible,
        })),
      });
    }

    return fieldListResult;
  }, [config, ObjectName]);

  const showAlert = useCallback((message, success) => {
    const a = Helper.BaseCrudHelper.ShowAlert(message, success, () =>
      setAlert(null),
    );
    setAlert(a);
  }, []);

  const fetchData = useCallback(async () => {
    if (!ObjectName || !config || fieldLists.length === 0) {
      return;
    }

    setIsFetching(true);
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName, SearchOption: searchOption },
      (resData) => {
        if (resData) {
          if (resData.Success === false) {
            showAlert(resData.Message || "Алдаа гарлаа", false);
            setData([]);
            setGridOption({});
          } else {
            setData(resData.Data || []);
            setGridOption(resData.Option || {});
          }
        } else {
          showAlert("Алдаа гарлаа", false);
          setData([]);
          setGridOption({});
        }
        setIsFetching(false);
      },
    );
  }, [ObjectName, config, searchOption, fieldLists.length, showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSearchOption = useCallback(
    (updater) => {
      const apply = (prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return { ...prev, ...next };
      };

      if (onSearchOptionChange) {
        onSearchOptionChange(apply(searchOption));
      } else {
        setInternalSearchOption((prev) => apply(prev));
      }
    },
    [onSearchOptionChange, searchOption],
  );

  const orderBy = useCallback(
    (Field, Type) => {
      updateSearchOption((prev) => ({
        ...prev,
        OrderBy: { Field, Type },
      }));
    },
    [updateSearchOption],
  );

  const pageLimitChange = useCallback(
    (Page, Limit) => {
      updateSearchOption((prev) => ({
        ...prev,
        PageOption: { Page, Limit },
      }));
    },
    [updateSearchOption],
  );

  const searchField = useCallback(
    (Field, SearchText) => {
      updateSearchOption((prev) => ({
        ...prev,
        PageOption: { ...(prev.PageOption || {}), Page: 0 },
        SearchField: Helper.BaseCrudHelper.SetSearchField(
          Field,
          SearchText,
          prev.SearchField || [],
        ),
      }));
    },
    [updateSearchOption],
  );

  // Expose methods and properties to parent via ref
  useImperativeHandle(ref, () => ({
    SearchOption: searchOption,
    GetData: fetchData,
    setState: () => {}, // Legacy compatibility - no-op for functional component
  }));

  if (!config) {
    if (configError !== null) {
      return (
        <LoadError
          Message={configError}
          Retry={() => {
            setConfigError(null);
            setInternalConfig(null);
          }}
        />
      );
    }
    return (
      <div style={{ position: "relative", minHeight: "160px" }}>
        <DivLoading WithoutCard />
      </div>
    );
  }

  if (CustomRender === true) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {isFetching ? <DivLoading WithoutCard /> : null}
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...(noHorizontalPadding ? {} : {}),
        }}
      >
        {alert}
        <BaseGrid
          Fields={
            propsFields && propsFields.length > 0 ? propsFields : fieldLists
          }
          HideNumber={GridHideNumber || false}
          HideCheck={GridHideCheck || false}
          RowClickSelect={GridRowClickSelect || false}
          RowActions={GridRowActions || []}
          ColumnActions={GridColumnActions || []}
          Data={data}
          Option={gridOption}
          widthPattern={widthPattern}
          OrderBy={orderBy}
          SearchField={searchField}
          SearchFieldData={searchOption.SearchField}
          PK={config.PK || ""}
          PageSize={searchOption?.PageOption?.Limit || 20}
          Page={searchOption?.PageOption?.Page || 0}
          ChangePage={pageLimitChange}
          ShowData={ShowData}
          SelectRow={SelectRow}
          FillHeight={true}
          Clean={Clean}
        />
      </div>
    </div>
  );
});

BaseListManual.displayName = "BaseListManual";

export default BaseListManual;
