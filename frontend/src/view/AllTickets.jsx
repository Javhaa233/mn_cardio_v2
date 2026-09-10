import React from "react";
import PageContainer from "customComponents/PageContainer";

import BaseCrudManager from "baseComponents/BaseCrudManager";
import AdviceDetail from "customComponents/Advice/AdviceDetail";

import Helper from "helper";

export default function AllTickets() {
  var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Advice"
        SearchOption={SearchOption}
        CustomDetailView={AdviceDetail}
        isDialog={false}
        GridHideCheck={true}
        HideExport={true}
        widthPattern="40c, 40c, 150, 200, 120, 120, 120, 60, 200, 80, 60, 100c"
      />
    </PageContainer>
  );
}
