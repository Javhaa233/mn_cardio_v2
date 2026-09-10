import React, { useCallback, useMemo, useRef, useState } from "react";
import PageContainer from "customComponents/PageContainer";
// translation
import { useTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";
import LoadError from "customComponents/LoadError";
// custom components
import BaseDialog from "customComponents/BaseDialog";
import DoctorCrudActions from "customComponents/DoctorProfile/DoctorCrudActions";
import BaseListManual from "baseComponents/BaseListManual";
import RangeDate from "customComponents/RangeDate";
import DoctorsProfileForm from "customComponents/Forms/DoctorsProfileForm";
import ChangePassword from "customComponents/DoctorProfile/ChangePassword";
// helper
import Helper from "helper";

import { useBaseObjectConfig } from "queries/baseObject";

export default function DoctorsProfile() {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const doctorCrudActionsRef = useRef(null);
  const baseListRef = useRef(null);
  const changePasswordRef = useRef(null);

  const [alert, setAlert] = useState(null);
  const [dialogEditObject, setDialogEditObject] = useState(undefined);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [searchOption, setSearchOption] = useState(() => {
    const so = Helper.BaseCrudHelper.GetSearchOption();
    so.OrderBy = { Field: "id_data", Type: "desc" };
    return so;
  });

  const configQuery = useBaseObjectConfig("DoctorsProfile", {
    enabled: true,
  });
  const configData = configQuery.data?.data;
  const config = useMemo(() => configData || null, [configData]);

  const openDialog = useCallback((editObject) => {
    setDialogEditObject(editObject === undefined ? undefined : editObject);
  }, []);

  const handleNew = useCallback(() => openDialog(null), [openDialog]);

  const onSaved = useCallback((success) => {
    if (success) {
      setDialogEditObject(undefined);
      if (baseListRef.current?.GetData) {
        baseListRef.current.GetData();
      }
    }
  }, []);

  const handleSavePassword = useCallback(() => {
    const changePasswordInstance = changePasswordRef.current?.getWrappedInstance
      ? changePasswordRef.current.getWrappedInstance()
      : changePasswordRef.current;

    if (selectedDoctor && changePasswordInstance?.Save) {
      changePasswordInstance.Save(selectedDoctor, (resData) => {
        if (resData && resData.Success) {
          setOpenChangePassword(false);
          const Alert = Helper.BaseCrudHelper.ShowAlert(
            resData.Message,
            resData.Success,
            () => setAlert(null),
          );
          setAlert(Alert);
        } else {
          const Alert = Helper.BaseCrudHelper.ShowAlert(
            (resData && resData.Message) || t("An error occurred"),
            false,
            () => setAlert(null),
          );
          setAlert(Alert);
        }
      });
    }
  }, [selectedDoctor, t]);

  const openChangePasswordDialog = useCallback(() => {
    if (selectedDoctor) {
      Helper.DoctorsProfileHelper.GetDoctorsProfileInfo(
        selectedDoctor.DoctorId,
        (res) => {
          if (res && res.Success && res.Data) {
            if (res.Data.Users) {
              setOpenChangePassword(true);
              setTimeout(() => {
                if (baseListRef.current?.GetData) {
                  baseListRef.current.GetData();
                }
              }, 100);
            } else {
              const Alert = Helper.BaseCrudHelper.ShowAlert(
                t(
                  "User account not found. Please edit and save the doctor profile to create a user account.",
                ),
                false,
                () => setAlert(null),
              );
              setAlert(Alert);
            }
          } else {
            const Alert = Helper.BaseCrudHelper.ShowAlert(
              res?.Message || "Error fetching doctor details.",
              false,
              () => setAlert(null),
            );
            setAlert(Alert);
          }
        },
      );
    } else {
      const Alert = Helper.BaseCrudHelper.ShowAlert(
        t("Please select a doctor first"),
        false,
        () => setAlert(null),
      );
      setAlert(Alert);
    }
  }, [selectedDoctor, t]);

  const dialog = useMemo(() => {
    if (dialogEditObject === undefined) return null;

    return (
      <BaseDialog
        ref={(ref) => (dialogRef.current = ref)}
        Close={() => setDialogEditObject(undefined)}
        Title={dialogEditObject ? t("Edit doctor") : t("doctor")}
        ShowSave={true}
        Save={(resetLoading) => {
          console.log("Save initiated from DoctorsProfile view");
          // Get the actual form instance (withRef: true requires getWrappedInstance())
          const formInstance = formRef.current?.getWrappedInstance
            ? formRef.current.getWrappedInstance()
            : formRef.current;

          if (formInstance && formInstance.Save) {
            formInstance.Save((success) => {
              console.log(
                "Save completed in DoctorsProfile view, success:",
                success,
              );
              onSaved(success);
              resetLoading && resetLoading();
            });
          } else {
            resetLoading && resetLoading();
          }
        }}
      >
        <DoctorsProfileForm
          ref={(ref) => (formRef.current = ref)}
          ObjectName="DoctorsProfile"
          DataId={dialogEditObject ? dialogEditObject.id_data : null}
        />
      </BaseDialog>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogEditObject, onSaved]);

  const changePasswordDialog = useMemo(() => {
    if (!openChangePassword) return null;
    return (
      <BaseDialog
        Close={() => setOpenChangePassword(false)}
        Title={t("Change password")}
        SaveButtonText={t("Change password")}
        Width="360px"
        Height="400px"
        Save={handleSavePassword}
        ShowSaveNotLoad={true}
      >
        <ChangePassword ref={changePasswordRef} />
        <div style={{ height: "55px" }}></div>
      </BaseDialog>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openChangePassword, handleSavePassword]);

  const selectRow = useCallback(
    (rows) => {
      if (Array.isArray(rows) && rows.length === 1) {
        const last = rows[rows.length - 1];
        if (last) {
          console.log("Selected row data:", last);
          console.log("id_data:", last.id_data, "id:", last.id);
          doctorCrudActionsRef.current?.SetValues &&
            doctorCrudActionsRef.current.SetValues(last);
          setSelectedDoctor({ DoctorId: last.id_data, UserId: last.UserId });
        }
      } else {
        doctorCrudActionsRef.current?.SetValues &&
          doctorCrudActionsRef.current.SetValues(null);
        setSelectedDoctor(null);
      }
    },
    [doctorCrudActionsRef, setSelectedDoctor],
  );

  const onRangeChange = useCallback((StartDate, EndDate) => {
    setSearchOption((prev) => ({
      ...prev,
      SearchField: Helper.BaseCrudHelper.SetSearchField(
        "date_creation",
        [StartDate, EndDate],
        prev.SearchField || [],
        "Between",
      ),
    }));
  }, []);

  const onRangeRefresh = useCallback(() => {
    setSearchOption((prev) => {
      const current = prev.SearchField || [];
      if (!Array.isArray(current) || current.length === 0) return prev;
      return {
        ...prev,
        SearchField: current.filter((el) => el.Field !== "date_creation"),
      };
    });
  }, []);

  const exportExcel = useCallback(async () => {
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName: "DoctorsProfile",
        Url: "/BaseObject/ExportExcel",
        SearchOption: searchOption,
        FileName: "DoctorsProfile.xlsx",
      },
      (resData) => {
        doctorCrudActionsRef.current?.setState &&
          doctorCrudActionsRef.current.setState({ exportLoading: false });
        const Success = !!(resData && resData.Success);
        const Alert = Helper.BaseCrudHelper.ShowAlert(
          Success
            ? t("Excel file downloaded")
            : (resData && resData.Message) || t("Excel export failed"),
          Success,
          () => setAlert(null),
        );
        setAlert(Alert);
      },
    );
  }, [searchOption, t]);

  const onSearchText = useCallback((text) => {
    if (!text || typeof text !== "string") return;
    setSearchOption((prev) => ({
      ...prev,
      PageOption: { ...(prev.PageOption || {}), Page: 0 },
      SearchText: text,
    }));
  }, []);

  // Without this a failed config request rendered the whole screen with a
  // null Config and no explanation.
  if (configQuery.isError) {
    return (
      <LoadError
        Message={configQuery.error?.message}
        Retry={() => configQuery.refetch()}
      />
    );
  }

  return (
    <PageContainer>
      {dialog}
      {changePasswordDialog}
      {alert}
      <UniCard
        title={t("Doctor")}
        color="info"
        cardStyle={{
          margin: "0px 0 0 0",
          width: "100%",
          height: "100%",
          flex: "1 1 auto",
          minHeight: 0,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        cardBodyStyle={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <DoctorCrudActions
          ref={(ref) => (doctorCrudActionsRef.current = ref)}
          New={handleNew}
          Export={exportExcel}
          SearchText={onSearchText}
          OnChangePassword={openChangePasswordDialog}
          noHorizontalPadding
          HideExport={true}
        />
        <GridContainer sx={{ margin: 0, width: "100%", maxWidth: "100%" }}>
          <GridItem md={8} xs={12} sx={{ padding: 0 }}>
            <RangeDate ChangeValue={onRangeChange} Refresh={onRangeRefresh} />
          </GridItem>
        </GridContainer>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <BaseListManual
            ref={baseListRef}
            SearchOption={searchOption}
            onSearchOptionChange={setSearchOption}
            ObjectName="DoctorsProfile"
            Config={config}
            ShowData={openDialog}
            GridHideCheck={false}
            SelectRow={selectRow}
            noHorizontalPadding
            widthPattern="30c, 50c, 100l, 120, 120, 200, 200, 120, 120, 120, 120, 120, 100, 200, 120, 150, 100c"
          />
        </div>
      </UniCard>
    </PageContainer>
  );
}
