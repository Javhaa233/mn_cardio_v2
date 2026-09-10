import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import AdviceTicket from "customComponents/Advice/AdviceTicket";
import DivLoading from "customComponents/DivLoading";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

class AdviceListSoum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: [],
      GridOption: null,
      isLoading: false,
    };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 5;
    this.SearchOption.SearchField = [
      { Field: "adv_ticket_closed", Value: "n", Op: "Equals" },
    ];
    this.SearchOption.OrderBy = { Field: "date_modif", Type: "desc" };
  }

  componentDidMount() {
    this.GetData && this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { FirstLoad } = this.props;
    this.setState({ isLoading: true });
    await Helper.AdviceHelper.GetListSoum(this.SearchOption, (resData) => {
      if (resData) {
        this.setState(
          { Data: resData.Data, isLoading: false, GridOption: resData.Option },
          () =>
            FirstLoad && FirstLoad(resData.Option ? resData.Option.Total : 0),
        );
      }
    });
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
      <div
        style={{
          position: "relative",
          minHeight: "180px",
          marginBottom: "15px",
        }}
      >
        {isLoading ? <DivLoading /> : null}
        <div>
          {Array.isArray(Data) && Data.length > 0 && (
            <div>
              <div style={{ margin: "10px 10px 0px 10px" }}>
                <h3
                  style={{
                    color: "#3C4858",
                    textDecoration: "none",
                    fontSize: "16px",
                    marginTop: "10px",
                    marginLeft: "6px",
                  }}
                >
                  {t("Active tickets(soum)")}
                </h3>
              </div>
              {Data.map((Adv, index) => (
                <AdviceTicket
                  Data={Adv}
                  key={"Advice" + index}
                  onClick={() =>
                    customHistory.push(
                      "/admin/AdviceComment?AdviceId=" + Adv.id_data,
                    )
                  }
                />
              ))}
              {/* Pagination */}
              <Paginition
                Option={GridOption}
                ChangePage={this.PageLimitChange}
                PageSize={5}
                RowsPerPageOptions={[5]}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    return this.CustomRender();
  }
}

export default withTranslation()(AdviceListSoum);
