import { withTranslation } from "react-i18next";
import React, { Component } from "react";

// translation
import Divider from "@mui/material/Divider";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";

class PatientTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: null, isLoading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ isLoading: true });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "PatientTransfer", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { t } = this.props;
    const { isLoading, Data, Alert } = this.state;
    if (isLoading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data && (
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Transfered date")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;
                        {Data.TransferedDate || ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right", marginRight: "40px" }}>
                      <UserDialogLink
                        UserId={Data.Users ? Data.Users.Id : null}
                      >
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          &nbsp;{Data.Users ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
                <BaseInfo
                  Label="Transfered doctor"
                  Value={
                    Data.DoctorsProfile ? Data.DoctorsProfile.firstname : ""
                  }
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo
                  Label="From"
                  Value={
                    Data.FromOrganization ? Data.FromOrganization.Name : ""
                  }
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo
                  Label="To"
                  Value={Data.ToOrganization ? Data.ToOrganization.Name : ""}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Transfered diagnosis"
                  Value={Data.JournalRef ? Data.JournalRef.jr_label : ""}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo Label="Comment" Value={Data.Comment} md={3} />
              </GridItem>
            </GridContainer>
          )}
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(PatientTransfer);
