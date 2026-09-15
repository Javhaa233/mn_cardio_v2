import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import RangeDate from "customComponents/RangeDate";
import UniCard from "customComponents/UniCard";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import BaseDialog from "customComponents/BaseDialog";
import BaseList from "baseComponents/BaseList";
import IsActiveStatus from "customComponents/UserRequest/IsActiveStatus";
import UserRequestInfo from "customComponents/UserRequest/UserRequestInfo";
// helper
import Helper from "helper";

class UserRequestsList extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, ReadMoreDialog: null };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    //   Refs
    this.DialogRef = createRef();
    this.InfoRef = createRef();
  }

  GetData = async () => {
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "UserRequests", SearchOption: this.SearchOption },
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

  ReadMore = (data) => {
    const DialogData = (
      <BaseDialog
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ ReadMoreDialog: null })}
        Title="Хэрэглэгчийн хүсэлт"
        Width="600px"
        Height="460px"
        SaveButtonText="Confirm"
        // ShowSave={true}
        // ShowDecline={true}
        ShowSave={data.ConfirmUserId ? false : true}
        ShowDecline={data.ConfirmUserId || data.DeclineUserId ? false : true}
        Save={(setLoading) => {
          this.InfoRef.Confirm &&
            this.InfoRef.Confirm((resData) => {
              setLoading && setLoading(false);
              if (resData) {
                if (resData.Success) {
                  this.setState({ ReadMoreDialog: null });
                  this.GetData();
                }
                const alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
              }
            });
        }}
        Decline={(setDeclineLoading) => {
          this.InfoRef.Decline &&
            this.InfoRef.Decline((resData) => {
              setDeclineLoading && setDeclineLoading(false);
              if (resData) {
                if (resData.Success) {
                  this.setState({ ReadMoreDialog: null });
                  this.GetData();
                }
                const alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
              }
            });
        }}
      >
        <UserRequestInfo Id={data.Id} ref={(ref) => (this.InfoRef = ref)} />
      </BaseDialog>
    );
    this.setState({ ReadMoreDialog: DialogData });
  };

  CustomRender = () => {
    const { Alert, Data, GridOption, Config, ReadMoreDialog, isLoading } =
      this.state;
    const { t } = this.props;

    if (!Config) {
      return null;
    } else {
      var FieldLists = Helper.BaseCrudHelper.GetFieldList(Config.Fields);
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
          {Alert}
          {ReadMoreDialog}
          <div
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Was a Creative Tim Card whose CardHeader drew a floating cyan pill
                over the top edge. UniCard is the frame every other list uses. */}
            <UniCard
              title={Config.TitleObject ? t(Config.TitleObject.Title + "") : ""}
              cardBodyStyle={{ gap: "8px" }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  marginTop: "0px",
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <RangeDate
                  ChangeValue={(StartDate, EndDate) => {
                    this.SearchOption.SearchField =
                      Helper.BaseCrudHelper.SetSearchField(
                        "CreateDate",
                        [StartDate, EndDate],
                        this.SearchOption.SearchField,
                        "Between",
                      );
                    this.GetData();
                  }}
                />
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
                  Fields={FieldLists}
                  HideNumber={false}
                  Data={Data}
                  Option={GridOption}
                  TextLength={50}
                  OrderBy={this.OrderBy}
                  SearchField={this.SearchField}
                  SearchFieldData={this.SearchOption.SearchField}
                  PK={Config.PK ? Config.PK : "Id"}
                  ChangePage={this.PageLimitChange}
                  HideCheck={true}
                  FillHeight={true}
                  widthPattern="50c, 50c, 120l, 120, 120, 200, 100, 200, 150c, 120c, 120"
                  ColumnActions={[
                    {
                      Field: "IsActive",
                      Component: <IsActiveStatus />,
                      onClick: () => {},
                    },
                  ]}
                  RowActions={[
                    {
                      Component: (
                        <Button
                          color="info"
                          size="sm"
                          style={{ padding: "4px 8px 3px" }}
                        >
                          {t("Read more")}
                        </Button>
                      ),
                      onClick: (data) => this.ReadMore(data),
                    },
                  ]}
                />
              </div>
            </UniCard>
          </div>
        </div>
      );
    }
  };
}

export default withTranslation(undefined, { withRef: true })(UserRequestsList);
