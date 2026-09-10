import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// default components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import TobeTicket from "customComponents/Advice/TobeTicket";
import DivLoading from "customComponents/DivLoading";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

class TobeTicketsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: [],
      GridOption: null,
      isLoading: false,
    };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 5;
    if (this.LogedUser) {
      this.SearchOption.SearchField = [
        { Field: "adv_ticket_closed", Value: "3", Op: "Equals" },
        { Field: "id", Value: this.LogedUser.Id, Op: "Equals" },
      ];
    }
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
  }

  componentDidMount() {
    this.GetData && this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    if (this.LogedUser) {
      this.setState({ isLoading: true });
      await Helper.AdviceHelper.GetList(this.SearchOption, (resData) => {
        if (resData) {
          this.setState({
            Data: resData.Data,
            GridOption: resData.Option,
            isLoading: false,
          });
        }
      });
    }
  };

  PageLimitChange = (Page, Limit) => {
    if (!this.SearchOption) return;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page,
      Limit,
    };
    this.GetData && this.GetData();
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, GridOption, isLoading } = this.state;

    return (
      <div style={{ position: "relative", minHeight: "180px" }}>
        {isLoading ? <DivLoading /> : null}
        <div>
          <div style={{ margin: "0px" }}>
            <h3
              style={{
                color: "#3C4858",
                textDecoration: "none",
                fontSize: "16px",
                marginTop: "10px",
                marginLeft: "6px",
              }}
            >
              {t("To be tickets")}
            </h3>
          </div>
          {Array.isArray(Data) && Data.length > 0 ? (
            <Card
              style={{
                margin: "0px 0px 0px 0px",
                minHeight: "180px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <CardBody style={{ padding: "8px" }}>
                {Data.map((Adv, index) => (
                  <TobeTicket
                    Data={Adv}
                    key={"Advice" + index}
                    onClick={() =>
                      customHistory.push(
                        "/admin/MyTicket?DataId=" + Adv.id_data,
                      )
                    }
                  />
                ))}
              </CardBody>
              <Paginition
                Option={GridOption}
                ChangePage={this.PageLimitChange}
                PageSize={5}
                RowsPerPageOptions={[5]}
              />
            </Card>
          ) : (
            <Card
              style={{
                margin: "0px 0px 0px 0px",
                minHeight: "180px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <CardBody
                style={{ padding: "8px", textAlign: "center", color: "#999" }}
              >
                {t("No tickets found")}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    );
  };

  render() {
    return this.CustomRender();
  }
}

export default withTranslation()(TobeTicketsList);
