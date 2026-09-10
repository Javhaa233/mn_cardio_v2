import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import UniCard from "customComponents/UniCard";
import RangeDate from "customComponents/RangeDate";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useIsPhone } from "helper/useResponsive";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

import Helper from "helper";

// Grid chrome, used to size the grid to its rows in `Clean` mode instead of
// leaving a fixed block of empty space under short result sets.
// Keep these in step with BaseGrid: the footer is 36px tall now, not 32.
const HEADER_HEIGHT = 66; // title row (30) + filter row (36)
const ROW_HEIGHT = 36;
const FOOTER_HEIGHT = 38;
const MIN_ROWS = 3;

const BaseTable = (props) => {
  const { t } = useTranslation();
  const isPhone = useIsPhone();
  const [state, setState] = useState({
    Fields: props.Fields || [],
    StartDate: Helper.ObjectHelper.getDateYMD(),
    EndDate: Helper.ObjectHelper.getDateYMD(),
  });

  const handleDateRangeChange = (startDate, endDate) => {
    setState({ ...state, StartDate: startDate, EndDate: endDate });
    // Call Search after state update
    const { Search } = props;
    if (Search && startDate !== "" && endDate !== "") {
      Search(startDate, endDate);
    }
  };

  const GetTable = () => {
    const {
      Data,
      Refresh,
      Fields,
      PageSize = 5,
      HideFilter,
      ColumnActions,
      RowActions,
      OrderBy,
      SearchField,
      SearchFieldData,
      PageLimitChange,
      GridOption,
      ShowData,
      widthPattern,
      Height,
      Clean = false,
    } = props;

    // Calculate height for 5 rows: header(50px) + 5*row(36px) + footer(44px) = 274px
    let gridHeight = Height || "274px";

    // On a phone the grid is a card list, and this arithmetic describes a
    // table: a 66px two-row header and 36px rows that no longer exist. Pinning
    // a card list to 274px puts three cards in a box with its own scrollbar
    // inside a page that already scrolls. Let it size to its content instead.
    if (isPhone) {
      gridHeight = "auto";
    } else if (Clean) {
      // Shrink to the rows actually on screen, capped by the requested height.
      const rowCount = Array.isArray(Data) ? Data.length : 0;
      const visibleRows = Math.min(
        Math.max(rowCount, MIN_ROWS),
        PageSize || MIN_ROWS,
      );
      const fitted =
        HEADER_HEIGHT + visibleRows * ROW_HEIGHT + FOOTER_HEIGHT + 2;
      const cap = parseInt(gridHeight, 10);
      gridHeight = (isNaN(cap) ? fitted : Math.min(fitted, cap)) + "px";
    }

    return (
      <div>
        <div
          style={
            Clean
              ? {
                  padding: "8px 10px",
                  marginBottom: "8px",
                  border: `1px solid ${colors.brand.hairline}`,
                  borderRadius: radius.xs,
                  backgroundColor: colors.brand.tint,
                }
              : undefined
          }
        >
          <RangeDate ChangeValue={handleDateRangeChange} Refresh={Refresh} />
        </div>
        <BaseGrid
          PK={"id_data"}
          Fields={Fields ? Fields : []}
          Data={Data}
          PageSize={PageSize ? PageSize : 5}
          HideNumber={true}
          HideCheck={true}
          HideFilter={HideFilter ? HideFilter : false}
          ColumnActions={ColumnActions}
          RowActions={RowActions}
          OrderBy={OrderBy}
          SearchField={SearchField}
          SearchFieldData={SearchFieldData}
          ChangePage={PageLimitChange}
          Option={GridOption}
          ShowData={(EditData) => ShowData && ShowData(EditData)}
          FillHeight={false}
          Height={gridHeight}
          widthPattern={widthPattern}
          Clean={Clean}
        />
      </div>
    );
  };

  // `headerColor` is accepted and ignored - it used to pick one of six gradient
  // header pills. There is one card chrome now, and it comes from UniCard.
  const { WithoutCard, Title } = props;
  return (
    <div>
      {WithoutCard === true ? (
        GetTable()
      ) : (
        <UniCard
          title={t(Title)}
          cardStyle={{ margin: "5px 0", flex: "0 0 auto", height: "auto" }}
        >
          {GetTable()}
        </UniCard>
      )}
    </div>
  );
};

export default BaseTable;
