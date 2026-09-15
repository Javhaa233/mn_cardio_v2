import { useTranslation } from "react-i18next";
import "react";
// translation
import { withTranslation } from "react-i18next";

import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import BaseList from "baseComponents/BaseList";
import BaseDetailView from "baseComponents/BaseDetailView";

import DivLoading from "customComponents/DivLoading";
import LinkObjectView from "customComponents/Profile/ColumnActions/LinkObjectView";
import RangeDate from "customComponents/RangeDate";
import UniCard from "customComponents/UniCard";

import Helper from "helper";

class UserActionHistoryAdmin extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Config: {}, DialogData: null };
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    this.setState({ isLoading: true });
    const ObjectName = this.props.ObjectName || "vwUserActionHistory";
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName, SearchOption: this.SearchOption },
      (resData) => {
        if (resData) {
          if (resData.Success === false) this.ShowAlert(resData.Message, false);
          this.setState({
            Data: resData.Data,
            GridOption: Object.assign({}, resData.Option),
          });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "LogDate",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData();
  };

  Refresh = () => {
    if (
      this.SearchOption.SearchField &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "LogDate",
      );
      this.GetData(false);
    }
  };

  ShowDataLinkData = (data) => {
    // Check if required data is present before opening dialog
    if (!data.LinkObjectName || !data.LinkObjectId) {
      this.ShowAlert("Link object data is missing", false);
      return;
    }

    this.setState({
      DialogData: (
        <BaseDetailView
          HideSave={true}
          formSize={{ height: "600px", width: "900px" }}
          Save={(resData) => {
            if (resData && resData.Success) {
              this.setState({ DialogData: null });
              this.GetData();
            }
          }}
          DataId={data.LinkObjectId}
          IsNew={false}
          ObjectName={data.LinkObjectName}
          LayoutPattern={`
1 | 2 
  | 3
  | 4
5 | 6
`}
          Close={() => this.setState({ DialogData: null })}
        />
      ),
    });
  };

  CustomRender = () => {
    const { Data, DialogData, GridOption, isLoading } = this.state;
    const { t } = this.props;

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "100%",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {DialogData}
        {/* Was a Creative Tim Card with the floating cyan title pill. */}
        <UniCard title={t("Logs")} cardBodyStyle={{ gap: "8px" }}>
          <div style={{ flex: "0 0 auto", marginTop: "1px" }}>
            <RangeDate ChangeValue={this.SetSearchOption} />
          </div>
          <div
            style={{
              flex: "1 1 auto",
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {isLoading ? <DivLoading WithoutCard /> : null}
            <BaseGrid
              Data={Data}
              Option={GridOption}
              TextLength={200}
              ChangePage={this.PageLimitChange}
              SearchField={this.SearchField}
              PageSize={20}
              OrderBy={this.OrderBy}
              FillHeight={true}
              widthPattern="40c, 120, 120, 120, 120, 120, 120c, 220c"
              RowActions={[
                {
                  Component: <LinkObjectView />,
                  onClick: (Data) => this.ShowDataLinkData(Data),
                },
              ]}
              HideCheck={true}
              Fields={[
                { Label: t("Last name"), Name: "DoctorsProfile.lastname" },
                { Label: t("First name"), Name: "DoctorsProfile.firstname" },
                {
                  Label: t("ObjectName"),
                  Name: "ObjectNameDic.ObjectNameMn",
                },
                { Label: t("LinkObjectName"), Name: "LinkObjectName" },
                { Label: t("NotesDetail"), Name: "NotesDetail" },
                { Label: t("LogDate"), Name: "LogDate", Type: "Date" },
              ]}
            />
          </div>
        </UniCard>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  UserActionHistoryAdmin,
);
