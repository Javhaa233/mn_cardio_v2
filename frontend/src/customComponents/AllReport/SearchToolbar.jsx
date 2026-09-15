import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import SearchIcon from "@mui/icons-material/Search";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import ReportRangeDate from "customComponents/AllReport/ReportRangeDate";
import ReportDoctorsSelect from "customComponents/AllReport/ReportDoctorsSelect";
import ReportLocationSelect from "customComponents/AllReport/ReportLocationSelect";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

class SearchToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      StartDate: Helper.ObjectHelper.getDateYMD(),
      EndDate: Helper.ObjectHelper.getDateYMD(),
      UserId: null,
      addr_prov_city: null,
      addr_soum_dist: null,
      addr_bag_khoroo: null,
      isLoading: false,
    };
  }

  render() {
    const {
      isLoading,
      StartDate,
      EndDate,
      UserId,
      addr_prov_city,
      addr_soum_dist,
      addr_bag_khoroo,
    } = this.state;
    const { t, SearchReport } = this.props;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "flex-end",
          gap: "12px",
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: "5px",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <ReportRangeDate
            ChangeValue={(StartDate, EndDate) =>
              this.setState({ StartDate, EndDate })
            }
            StartDate={StartDate}
          />
        </div>
        <div style={{ flex: "0 0 200px", minWidth: 160 }}>
          <ReportDoctorsSelect
            ChangeValue={(UserId) => this.setState({ UserId })}
            Value={UserId}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <ReportLocationSelect
            ChangeValue={({
              addr_prov_city,
              addr_soum_dist,
              addr_bag_khoroo,
            }) =>
              this.setState({ addr_prov_city, addr_soum_dist, addr_bag_khoroo })
            }
          />
        </div>
        <div
          style={{
            position: "relative",
            flex: "0 0 auto",
            minWidth: 100,
            width: 100,
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              this.setState({ isLoading: true });
              const SearchData = {
                StartDate,
                EndDate,
                UserId,
                addr_prov_city,
                addr_soum_dist,
                addr_bag_khoroo,
              };
              SearchReport &&
                SearchReport(SearchData, () => {
                  setTimeout(() => {
                    this.setState({ isLoading: false });
                  }, 2000);
                });
            }}
            startIcon={<SearchIcon />}
            disabled={isLoading}
            sx={{
              boxShadow: "none",
              textTransform: "none",
              whiteSpace: "nowrap",
              minWidth: "100px",
              height: "32px",
              width: "100%",
            }}
          >
            {t("Search")}
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              style={{
                color: colors.brand.cyanInk,
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -12,
                marginLeft: -12,
              }}
            />
          )}
        </div>
        {/* <Button
          color="info"
          style={{ width: "100%" }}
          onClick={() => {
            this.setState({
              StartDate: null,
              EndDate: null,
              UserId: null,
              addr_prov_city: null,
              addr_soum_dist: null,
              addr_bag_khoroo: null,
            });
          }}
          disabled={isLoading}
        >
          Цэвэрлэх
        </Button> */}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(SearchToolbar);
