import React, { useState } from "react";
import PageContainer from "customComponents/PageContainer";
// translation
import { useTranslation } from "react-i18next";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import UniCard from "customComponents/UniCard";

import {
  Toolbar,
  Form as FormDialog,
  Filter,
  MergeDialog,
  useDataGrid,
} from "customComponents/Organization";

export default (props) => {
  const { t } = useTranslation();
  const [mergeVisible, setMergeVisible] = useState(false);

  const formName = "Organization";
  const filterFormName = `${formName}Filter`;
  const {
    dataGrid: { dataSource, refreshData, exportData, filter, searchByText },
    fn: { create, edit, deleteRow, setCurrent },
    confirmDialog,
  } = useDataGrid({ formName, gridName: formName, filterFormName, ...props });

  // Convert to BaseGrid Fields format
  const fields = [
    {
      Name: "ParentOrganization.Name",
      Label: t("Parent organization"),
    },
    {
      Name: "Name",
      Label: t("Name"),
    },
    {
      Name: "DictSoumDistrict.name",
      Label: t("Soum/district"),
    },
    {
      Name: "DictBagKhoroo.name",
      Label: t("Bag/khoroo"),
    },
    {
      Name: "CreateDate",
      Label: t("Create date"),
      Type: "Date",
    },
    {
      Name: "CreateUser.UserName",
      Label: t("CreateUser"),
    },
  ];

  // Handle row double click
  const handleRowDoubleClick = (rowData) => {
    edit(rowData);
  };

  // Handle selection change
  const handleSelectionChange = (selectedRows) => {
    if (selectedRows.length === 1) {
      setCurrent(selectedRows[0]);
    } else {
      setCurrent(null);
    }
  };

  return (
    <PageContainer>
      <FormDialog saved={refreshData} formName={formName} />
      {confirmDialog}

      <MergeDialog
        visible={mergeVisible}
        close={() => setMergeVisible(false)}
        merged={refreshData}
      />

      <UniCard
        title={t("Organization")}
        color="warning"
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingLeft: "0px",
            paddingRight: "0px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flex: "0 0 auto" }}>
            <Toolbar
              clickCreate={create}
              clickRefresh={refreshData}
              clickDelete={deleteRow}
              clickEdit={edit}
              clickMerge={() => setMergeVisible(true)}
              clickExport={exportData}
              hideExport={true}
            />
          </div>
          <div style={{ flex: "1 1 auto" }}>
            <Filter formName={filterFormName} filter={filter} />
          </div>
        </div>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <BaseGrid
            Data={dataSource || []}
            Fields={fields}
            PK="Id"
            ShowData={handleRowDoubleClick}
            SelectRow={handleSelectionChange}
            PageSize={25}
            OrderBy={true}
            FillHeight={true}
            EnableColumnResizing={true}
            SearchField={searchByText}
            widthPattern="40r, 250, 300, 150, 150, 110c, 120"
          />
        </div>
      </UniCard>
    </PageContainer>
  );
};
