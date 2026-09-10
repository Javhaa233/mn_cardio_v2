import { useTranslation, withTranslation } from "react-i18next";
import { useTabContext } from "customComponents/PageTabs/TabContext";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
// translation
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";
// custom components
import BaseDetailView from "baseComponents/BaseDetailView";
import BaseCrudActions from "baseComponents/BaseCrudActions/BaseCrudActions";
import BaseListManual from "baseComponents/BaseListManual";

import RangeDate from "customComponents/RangeDate";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";
// helper
import Helper from "helper";

import { useQueryClient } from "@tanstack/react-query";
import { baseObjectKeys, useBaseObjectConfig } from "queries/baseObject";

const BaseCrudManager = forwardRef(function BaseCrudManager(props, ref) {
  const { t } = useTranslation();
  const {
    ObjectName,
    CustomDetailView,
    NewObject,
    ObjectHelper,
    SearchOption: initialSearchOption,
    CustomRender,
    HideNew = false,
    HideExport = false,
    HideRangeDate = false,
    GridRowClickSelect,
    GridHideCheck,
    GridHideNumber,
    widthPattern,
    rootObject,
    isDialog,
    CreateDate,
    noHorizontalPadding = false,
    cardBodyPadding,
    formSize,
    layoutPattern,
    labelWidth,
    Fields,
    GridColumnActions,
    GridRowActions,
  } = props;

  const queryClient = useQueryClient();

  const root = rootObject === false ? false : true;
  const dialog = isDialog === false ? false : true;
  const rangeDateField = CreateDate || "date_creation";

  const [alert, setAlert] = useState(null);

  const [detailState, setDetailState] = useState({
    open: false,
    isNew: false,
    dataId: null,
    editObject: null,
  });

  const [searchOption, setSearchOption] = useState(() => {
    return initialSearchOption || Helper.BaseCrudHelper.GetSearchOption();
  });

  const baseCrudActionsRef = useRef(null);
  const baseListRef = useRef(null);
  const openedFromUrlRef = useRef(false);
  // null outside the tab host (the patient layout, dialogs), which is why every
  // read below falls back to the address bar.
  const tab = useTabContext();

  const configQuery = useBaseObjectConfig(ObjectName, {
    enabled: Boolean(ObjectName),
  });

  const config = configQuery.data?.data || null;

  const showAlert = useCallback((message, success) => {
    const a = Helper.BaseCrudHelper.ShowAlert(message, success, () =>
      setAlert(null),
    );
    setAlert(a);
  }, []);

  const showConfirm = useCallback((message, confirmFunc) => {
    const a = Helper.BaseCrudHelper.ShowConfirm(message, confirmFunc, () =>
      setAlert(null),
    );
    setAlert(a);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailState({
      open: false,
      isNew: false,
      dataId: null,
      editObject: null,
    });

    // Refresh grid data when detail view is closed
    setTimeout(() => {
      if (baseListRef.current?.GetData) {
        baseListRef.current.GetData();
      }
    }, 100);
  }, []);

  const showDetailView = useCallback(
    (editObj, isNew, dataId) => {
      const resolvedId =
        dataId || (config && config.PK ? editObj?.[config.PK] : null);

      if (
        !isNew &&
        resolvedId &&
        detailState.open &&
        detailState.dataId === resolvedId
      ) {
        return;
      }

      console.log("showDetailView called with:", {
        editObj,
        isNew,
        dataId,
        resolvedId,
      });

      setDetailState({
        open: true,
        isNew: Boolean(isNew),
        dataId: resolvedId || null,
        editObject: editObj ? { ...editObj } : null,
      });
    },
    [config, detailState.open, detailState.dataId],
  );

  const deleteFunc = useCallback(() => {
    showAlert("Successfully deleted", true);
  }, [showAlert]);

  const getConfigData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: baseObjectKeys.config(ObjectName),
    });
  }, [queryClient, ObjectName]);

  useEffect(() => {
    if (!config) return;
    if (openedFromUrlRef.current) return;

    // The tab's own url, not the address bar. This effect runs on mount, and a
    // lazily-loaded page can mount after the doctor has already switched tabs -
    // at which point window.location points at a different record entirely.
    const detailId = Helper.BaseHelper.getUrlParam(
      (tab && tab.url) || window.location.href,
      "DataId",
    );
    if (detailId) {
      openedFromUrlRef.current = true;
      showDetailView({}, false, detailId);
    }
  }, [config, showDetailView, tab]);

  const detailComponent = useMemo(() => {
    if (!ObjectName) return null;
    if (!config) return null;
    if (!detailState.open) return null;

    const TempComponent = CustomDetailView || BaseDetailView;
    if (!TempComponent) return null;

    const onSave = (resData) => {
      if (!resData) return;

      showAlert(resData.Message, resData.Success);

      if (resData.Success) {
        closeDetail();
      }

      if (baseCrudActionsRef.current?.setState) {
        baseCrudActionsRef.current.setState({ exportLoading: false });
      }
    };

    const commonProps = {
      Save: onSave,
      isDialog: dialog,
      NewObject,
      IsNew: detailState.isNew,
      ObjectName,
      Config: config,
      ObjectHelper,
      Close: closeDetail,
      formSize,
      layoutPattern,
      labelWidth,
    };

    if (detailState.dataId) {
      return (
        <TempComponent
          key={String(detailState.dataId)}
          {...commonProps}
          DataId={detailState.dataId}
        />
      );
    }

    return (
      <TempComponent
        key={detailState.isNew ? "new" : "edit"}
        {...commonProps}
        DataId={config.PK ? detailState.editObject?.[config.PK] : null}
        EditObject={detailState.editObject}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ObjectName,
    config,
    dialog,
    CustomDetailView,
    NewObject,
    ObjectHelper,
    detailState,
    closeDetail,
    showAlert,
    queryClient,
    formSize,
    layoutPattern,
  ]);

  const onSearch = useCallback((text) => {
    if (!text || typeof text !== "string") return;
    setSearchOption((prev) => ({
      ...prev,
      PageOption: { ...(prev.PageOption || {}), Page: 0 },
      SearchText: text,
    }));
  }, []);

  const onRangeChange = useCallback(
    (StartDate, EndDate) => {
      setSearchOption((prev) => ({
        ...prev,
        SearchField: Helper.BaseCrudHelper.SetSearchField(
          rangeDateField,
          [StartDate, EndDate],
          prev.SearchField || [],
          "Between",
        ),
      }));
    },
    [rangeDateField],
  );

  const onRangeRefresh = useCallback(() => {
    setSearchOption((prev) => {
      const current = prev.SearchField || [];
      if (!Array.isArray(current) || current.length === 0) return prev;
      return {
        ...prev,
        SearchField: current.filter((el) => el.Field !== rangeDateField),
      };
    });
  }, [rangeDateField]);

  const exportExcel = useCallback(async () => {
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName,
        Url: "/BaseObject/ExportExcel",
        SearchOption: searchOption,
        FileName: ObjectName + ".xlsx",
      },
      (resData) => {
        if (baseCrudActionsRef.current?.setState) {
          baseCrudActionsRef.current.setState({ exportLoading: false });
        }
        if (resData && resData.Success === false) {
          showAlert(resData.Message, resData.Success);
        }
      },
    );
  }, [ObjectName, searchOption, showAlert]);

  // Expose imperative API for backward compatibility
  useImperativeHandle(
    ref,
    () => ({
      getConfigData,
      ShowDetailView: showDetailView,
      ShowConfirm: showConfirm,
      ShowAlert: showAlert,
      Delete: deleteFunc,
      BaseCrudActionsRef: baseCrudActionsRef,
      BaseListRef: baseListRef,
    }),
    [deleteFunc, showAlert, showConfirm, showDetailView, getConfigData],
  );

  if (CustomRender) {
    return null;
  }

  if (!config) {
    // A failed config request used to land here too and spin forever, because
    // the query resolved successfully with {success:false}. It now rejects, so
    // a failure is distinguishable from a request still in flight.
    if (configQuery.isError) {
      return (
        <LoadError
          Message={configQuery.error?.message}
          Retry={() => configQuery.refetch()}
        />
      );
    }
    return (
      <div style={{ position: "relative", minHeight: "160px" }}>
        <DivLoading WithoutCard />
      </div>
    );
  }

  if (root === false) {
    return (
      <div
        style={{
          height: "100%",
          maxWidth: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        {detailComponent}
        {alert}
        <BaseCrudActions
          ref={baseCrudActionsRef}
          HideSearchText={true}
          HideNew={HideNew}
          HideExport={HideExport}
          New={() => showDetailView({}, true)}
          Search={onSearch}
          Export={exportExcel}
          extraActions={props.extraActions}
        />
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <BaseListManual
            ref={baseListRef}
            ObjectName={ObjectName}
            Config={config}
            GridRowClickSelect={GridRowClickSelect}
            GridHideCheck={GridHideCheck}
            GridHideNumber={GridHideNumber}
            widthPattern={widthPattern}
            ShowData={(EditData) => showDetailView(EditData, false)}
            SearchOption={searchOption}
            onSearchOptionChange={setSearchOption}
            Fields={Fields}
            GridColumnActions={GridColumnActions}
            GridRowActions={GridRowActions}
          />
        </div>
      </div>
    );
  }

  if (dialog) {
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {configQuery.isFetching ? <DivLoading /> : null}
        {alert}
        {detailComponent}
        <GridContainer
          sx={{ margin: 0, width: "100%" }}
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            height: "100%",
          }}
        >
          <GridItem
            xs={12}
            sx={{ padding: 0 }}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <UniCard
              title={config.TitleObject ? t(config.TitleObject.Title + "") : ""}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                {HideRangeDate ? null : (
                  <RangeDate
                    ChangeValue={onRangeChange}
                    Refresh={onRangeRefresh}
                  />
                )}
                <BaseCrudActions
                  ref={baseCrudActionsRef}
                  HideNew={HideNew}
                  HideExport={HideExport}
                  New={() => showDetailView({}, true)}
                  Edit={() => showDetailView({}, false)}
                  Search={onSearch}
                  Export={exportExcel}
                  noWrapper={true}
                  extraActions={props.extraActions}
                />
              </div>
              <GridContainer
                sx={
                  noHorizontalPadding
                    ? { margin: 0, width: "100%", maxWidth: "100%" }
                    : undefined
                }
                style={
                  noHorizontalPadding
                    ? {
                        display: "flex",
                        flexDirection: "column",
                        flex: "1 1 auto",
                        minHeight: 0,
                        minWidth: 0,
                        maxWidth: "100%",
                      }
                    : undefined
                }
              >
                <GridItem
                  xs={12}
                  md={12}
                  sm={12}
                  sx={noHorizontalPadding ? { padding: 0 } : undefined}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 auto",
                    minHeight: 0,
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  <BaseListManual
                    ref={baseListRef}
                    ObjectName={ObjectName}
                    Config={config}
                    GridRowClickSelect={GridRowClickSelect}
                    GridHideCheck={GridHideCheck}
                    GridHideNumber={GridHideNumber}
                    widthPattern={widthPattern}
                    ShowData={(EditData) => showDetailView(EditData, false)}
                    SearchOption={searchOption}
                    onSearchOptionChange={setSearchOption}
                    Fields={Fields}
                    GridColumnActions={GridColumnActions}
                    GridRowActions={GridRowActions}
                  />
                </GridItem>
              </GridContainer>
            </UniCard>
          </GridItem>
        </GridContainer>
      </div>
    );
  }

  if (!detailState.open) {
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          width: "100%",
          minHeight: 0,
        }}
      >
        {configQuery.isFetching ? <DivLoading /> : null}
        {alert}
        <GridContainer
          sx={{
            margin: 0,
            width: "100%",
            minWidth: 0,
            flex: "1 1 auto",
            minHeight: 0,
            height: "100%",
          }}
        >
          <GridItem
            xs={12}
            sx={{
              padding: 0,
              minWidth: 0,
              width: "100%",
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <UniCard
              title={config.TitleObject ? t(config.TitleObject.Title + "") : ""}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                {HideRangeDate ? null : (
                  <RangeDate
                    ChangeValue={onRangeChange}
                    Refresh={onRangeRefresh}
                  />
                )}
                <BaseCrudActions
                  ref={baseCrudActionsRef}
                  HideNew={HideNew}
                  HideExport={HideExport}
                  New={() => showDetailView({}, true)}
                  Edit={() => showDetailView({}, false)}
                  Search={onSearch}
                  Export={exportExcel}
                  noWrapper={true}
                  extraActions={props.extraActions}
                />
              </div>
              <GridContainer
                sx={
                  noHorizontalPadding
                    ? {
                        margin: 0,
                        width: "100%",
                        flex: "1 1 auto",
                        minHeight: 0,
                      }
                    : { flex: "1 1 auto", minHeight: 0 }
                }
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <GridItem
                  xs={12}
                  md={12}
                  sm={12}
                  sx={
                    noHorizontalPadding
                      ? {
                          padding: 0,
                          flex: "1 1 auto",
                          minHeight: 0,
                          minWidth: 0,
                        }
                      : {
                          flex: "1 1 auto",
                          minHeight: 0,
                          minWidth: 0,
                        }
                  }
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <BaseListManual
                    ref={baseListRef}
                    ObjectName={ObjectName}
                    Config={config}
                    GridRowClickSelect={GridRowClickSelect}
                    GridHideCheck={GridHideCheck}
                    GridHideNumber={GridHideNumber}
                    widthPattern={widthPattern}
                    ShowData={(EditData) => showDetailView(EditData, false)}
                    SearchOption={searchOption}
                    onSearchOptionChange={setSearchOption}
                    Fields={Fields}
                    GridColumnActions={GridColumnActions}
                    GridRowActions={GridRowActions}
                  />
                </GridItem>
              </GridContainer>
            </UniCard>
          </GridItem>
        </GridContainer>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      {alert}
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        }}
      >
        <UniCard
          title={
            config.TitleObject ? t(config.TitleObject.EditObjectTitle + "") : ""
          }
        >
          {detailComponent}
        </UniCard>
      </div>
    </div>
  );
});

export default withTranslation(undefined, { withRef: true })(BaseCrudManager);
