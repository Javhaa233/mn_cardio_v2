import React, { useMemo } from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";
import BaseDetailView from "baseComponents/BaseDetailView";

const DictProvinceCityDetail = (props) => {
  const { Config } = props;

  const mergedConfig = useMemo(() => {
    let fields = Config?.Fields ? [...Config.Fields] : [];

    // Hide the "name" field from the detail view (only show child grid)
    fields = fields.map((f) => {
      if (f.Name === "name" || f.Name === "Name") {
        return { ...f, EditField: false };
      }
      return f;
    });

    return { ...Config, Fields: fields };
  }, [Config]);

  return <BaseDetailView {...props} Config={mergedConfig} />;
};

export default function DictProvinceCity() {
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="DictProvinceCity"
        isDialog={false}
        HideRangeDate={true}
        GridHideCheck={true}
        HideExport={true}
        widthPattern="60c, 160, 160, 100c"
        CustomDetailView={DictProvinceCityDetail}
      />
    </PageContainer>
  );
}
