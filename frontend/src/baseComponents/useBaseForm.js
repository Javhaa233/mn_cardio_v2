import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { loadFormConfig, loadDetailData, saveFormData } from "./formHelpers";
import { useTabDirty } from "customComponents/PageTabs/TabContext";

export const useBaseForm = ({
  ObjectName,
  Config,
  DataId,
  IsNew = false,
  NewObject = {},
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadedConfig, setLoadedConfig] = useState(null);
  const [editObject, setEditObject] = useState(IsNew ? { ...NewObject } : {});
  const modifyRef = useRef(IsNew ? { ...NewObject } : {});

  // Reported to the tab so closing one with unsaved edits asks first. Doing it
  // here covers every BaseDetailView and BaseFormDialog form at once. It is a
  // no-op outside the tab host, and forms that do not use this hook simply
  // close without a prompt - the guard fails OPEN on purpose, because
  // prompting on every close would train doctors to click straight through it.
  const [dirty, setDirty] = useState(false);
  useTabDirty(dirty);

  /* ---------- DERIVED CONFIG ---------- */
  const currentConfig = Config ?? loadedConfig;
  const fields = useMemo(() => currentConfig?.Fields || [], [currentConfig]);

  /* ---------- LOAD CONFIG (only if not provided) ---------- */
  useEffect(() => {
    if (Config || !ObjectName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    loadFormConfig(
      ObjectName,
      (config) => {
        setLoadedConfig(config);
      },
      () => setLoading(false),
    );
  }, [ObjectName, Config]);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!currentConfig || !DataId || !ObjectName) return;

    loadDetailData(
      {
        ObjectName,
        PrimaryKey: currentConfig.PK,
        DataId,
      },
      (data) => {
        setEditObject(data || {});
        modifyRef.current = { ...(data || {}) };
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [currentConfig, DataId, ObjectName]);

  /* ---------- VALUE CHANGE ---------- */
  const ChangeValue = useCallback((Field, Value) => {
    modifyRef.current[Field] = Value;
    setEditObject((prev) => ({ ...prev, [Field]: Value }));
    setDirty(true);
  }, []);

  /* ---------- SAVE ---------- */
  const onSave = useCallback(
    async (callback) => {
      await saveFormData(
        {
          ObjectName,
          Data: modifyRef.current,
          IsNew,
          PrimaryKey: currentConfig?.PK,
          DataId,
        },
        (resData) => {
          // Only a SUCCESSFUL save clears the flag. After a failed one the edits
          // are still unsaved, so closing the tab must still warn.
          if (resData && resData.Success) setDirty(false);
          callback && callback(resData);
        },
      );
    },
    [IsNew, ObjectName, currentConfig, DataId],
  );

  /* ---------- RESET ---------- */
  const resetForm = useCallback(() => {
    setEditObject({});
    modifyRef.current = {};
    setDirty(false);
  }, []);

  /* ---------- SET DATA ---------- */
  const setFormData = useCallback((data) => {
    setEditObject(data || {});
    modifyRef.current = { ...(data || {}) };
    setDirty(false);
  }, []);

  return {
    loading,
    currentConfig,
    fields,
    editObject,
    modifyRef,
    ChangeValue,
    onSave,
    resetForm,
    setFormData,
  };
};
