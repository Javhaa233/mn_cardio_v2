import React from "react";

import BaseCrudManager from "baseComponents/BaseCrudManager";
import AdviceDetail from "customComponents/Advice/AdviceDetail";

import Helper from "helper";

const MyTicket = () => {
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  SearchOption.SearchField = [
    { Field: "id", Value: LogedUser.Id, Op: "Equals" },
  ];
  SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <BaseCrudManager
        ObjectName="Advice"
        SearchOption={SearchOption}
        CustomDetailView={AdviceDetail}
        isDialog={false}
        GridHideCheck={true}
        HideExport={true}
        HideNew={true}
        widthPattern="50r, 50r, 120l, 120, 150, 150, 120c, 90r, 140, 150, 60l, 100c"
      />
    </div>
  );
};

export default MyTicket;
