import { withTranslation } from "react-i18next";
import React from "react";
// custom components
import BaseDetailView from "baseComponents/BaseDetailView";
import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import LinkObjectView from "customComponents/Profile/ColumnActions/LinkObjectView";
// helper
import Helper from "helper";

class UserActionHistoryTable extends BaseList {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = { ...this.state, Config: {}, DialogData: null };

    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "LogDate", Type: "desc" };
    if (this.LogedUser) {
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "UserId",
        this.LogedUser.Id,
        this.SearchOption.SearchField,
        "Equals",
      );
    }
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
            Data: resData.Data || [],
            GridOption: resData.Option || {},
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
    const TempDialogData = (
      <BaseDetailView
        HideSave={true}
        Save={(Success) => {
          if (Success) {
            this.setState({ DetailView: null });
            this.GetData();
          }
        }}
        DataId={data.LinkObjectId}
        IsNew={false}
        ObjectName={data.LinkObjectName}
        Close={() => this.setState({ DialogData: null })}
      />
    );
    this.setState({ DialogData: TempDialogData });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading } = this.state;
    return (
      <div style={{ position: "relative" }}>
        {DialogData}
        {isLoading ? <DivLoading WithoutCard /> : null}
        <BaseGrid
          Data={Data}
          Option={GridOption}
          TextLength={200}
          WithoutCard
          FillHeight={false}
          HideCheck={true}
          ChangePage={this.PageLimitChange}
          OrderBy={this.OrderBy}
          RowActions={[
            {
              Component: <LinkObjectView />,
              onClick: (Data, Type) => this.ShowDataLinkData(Data),
            },
          ]}
          Fields={[
            { Label: t("ObjectName"), Name: "ObjectNameDic.ObjectName" },
            { Label: t("LinkObjectName"), Name: "LinkObjectName" },
            { Label: t("NotesDetail"), Name: "NotesDetail" },
            { Label: t("Date"), Name: "LogDate", Type: "Date" },
          ]}
          widthPattern="40r, 150, 150, 150, 100c, 250"
          SearchField={(Field, Text) => this.SearchField(Field, Text)}
        />
      </div>
    );
  };
}

export default withTranslation()(UserActionHistoryTable);
