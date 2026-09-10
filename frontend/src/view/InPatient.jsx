import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";

import UniCard from "customComponents/UniCard";

import CustomTab from "customComponents/CustomTab";
import WaitingList from "customComponents/InPatient/WaitingList";
import AdmittedList from "customComponents/InPatient/AdmittedList";
import ArchiveList from "customComponents/InPatient/ArchiveList";
import Filter from "customComponents/InPatient/Filter";
// helper
import Helper from "helper";

export default function InPatient() {
  const { t } = useTranslation();

  const [Alert, setAlert] = useState(null);
  const [DepartmentId, setDepartmentId] = useState(null);

  // refs
  var AdmittedListRef = useRef();
  var WaitingListRef = useRef();
  var ArchiveListRef = useRef();

  const SetFilter = (id) => {
    setDepartmentId(id);
    if (WaitingListRef.current) {
      const instance = WaitingListRef.current.getWrappedInstance
        ? WaitingListRef.current.getWrappedInstance()
        : WaitingListRef.current;
      instance.SetDepartmentId && instance.SetDepartmentId(id);
    }
    if (AdmittedListRef.current) {
      const instance = AdmittedListRef.current.getWrappedInstance
        ? AdmittedListRef.current.getWrappedInstance()
        : AdmittedListRef.current;
      instance.SetDepartmentId && instance.SetDepartmentId(id);
    }
    if (ArchiveListRef.current) {
      const instance = ArchiveListRef.current.getWrappedInstance
        ? ArchiveListRef.current.getWrappedInstance()
        : ArchiveListRef.current;
      instance.SetDepartmentId && instance.SetDepartmentId(id);
    }
  };

  const ShowConfirm = (Message, ConfirmFunct) => {
    const alert = Helper.BaseCrudHelper.ShowConfirm(
      Message,
      () => {
        ConfirmFunct();
        setAlert(null);
      },
      () => setAlert(null),
    );
    setAlert(alert);
  };

  const ShowAlert = (Data, callback) => {
    if (Data) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        Data.Message,
        Data.Success,
        () => {
          setAlert(null);
          callback && callback(Data);
        },
      );
      setAlert(alert);
    }
  };

  const GetTabs = () => {
    var Tabs = [];
    Tabs.push({
      tabButton: t("Waiting"),
      tabContent: (
        <WaitingList
          ref={WaitingListRef}
          ShowAlert={ShowAlert}
          ShowConfirm={ShowConfirm}
          ObjectName="OrderHospitalization"
          CustomRender={true}
          DepartmentId={DepartmentId}
        />
      ),
    });
    Tabs.push({
      tabButton: t("In patient"),
      tabContent: (
        <AdmittedList
          ref={AdmittedListRef}
          ShowAlert={ShowAlert}
          ShowConfirm={ShowConfirm}
          ObjectName="Stay"
          CustomRender={true}
          DepartmentId={DepartmentId}
        />
      ),
    });
    Tabs.push({
      tabButton: t("Archive"),
      tabContent: (
        <ArchiveList
          ref={ArchiveListRef}
          ShowAlert={ShowAlert}
          ShowConfirm={ShowConfirm}
          ObjectName="Stay"
          CustomRender={true}
          DepartmentId={DepartmentId}
        />
      ),
    });
    return Tabs;
  };

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
      {Alert}
      <UniCard
        title={t("Patient list of inpatient department")}
        cardStyle={{ flex: "1 1 auto", minHeight: 0 }}
      >
        <CustomTab tabs={GetTabs()} fillHeight={true}>
          <Filter SetFilter={SetFilter} />
        </CustomTab>
      </UniCard>
    </div>
  );
}
