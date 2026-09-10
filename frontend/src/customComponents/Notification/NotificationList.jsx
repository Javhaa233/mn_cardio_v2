import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import React from "react";
// default components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import NotificationListItem from "customComponents/Notification/NotificationListItem";
import BaseList from "baseComponents/BaseList";
import DivLoading from "customComponents/DivLoading";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

class NotificationList extends BaseList {
  constructor(props) {
    super(props);
    this.SearchOption.PageOption.Limit = 5;
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = this.LogedUser
      ? [{ Field: "ToUserId", Value: this.LogedUser.Id, Op: "Equals" }]
      : [];
  }

  GetData = async () => {
    if (this.LogedUser) {
      this.setState({ isLoading: true });
      await Helper.NotificationHelper.GetListData(
        this.SearchOption,
        (resData) => {
          if (resData) {
            this.setState({ Data: resData.Data, GridOption: resData.Option });
            this.setState({ isLoading: false });
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { GridOption, Data, isLoading } = this.state;
    return (
      <div style={{ position: "relative" }}>
        {isLoading ? <DivLoading /> : null}
        <Card style={{ margin: "10px" }}>
          <CardBody style={{ padding: "8px", minHeight: "180px" }}>
            {Array.isArray(Data) && (
              <>
                {Data.length === 0 ? (
                  <BaseNoData Text="Мэдэгдэл ирээгүй байна" />
                ) : (
                  Data.map((item, index) => (
                    <NotificationListItem
                      key={index}
                      Data={item}
                      onClick={() => {
                        Helper.NotificationHelper.Seen(item, () => {
                          if (item.LinkObjectName + "" === "Advice")
                            customHistory.push(
                              "/admin/AdviceComment?AdviceId=" +
                                item.LinkObjectId,
                            );
                        });
                      }}
                    />
                  ))
                )}
              </>
            )}
          </CardBody>
          <Paginition
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={5}
            RowsPerPageOptions={[5]}
          />
        </Card>
      </div>
    );
  };
}

export default NotificationList;
