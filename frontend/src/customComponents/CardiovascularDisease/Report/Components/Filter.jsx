import { withTranslation } from "react-i18next";
import React, { Component } from "react";

import RangeDate from "customComponents/RangeDate";

import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import DictAttributes from "customComponents/CardiovascularDisease/Tables/Components/DictAttributes";

// helper
import Helper from "helper";

class Filter extends Component {
  constructor(props) {
    super(props);

    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.RoleId = this.LogedUser ? this.LogedUser.RoleId : null;
    this.Doctor = this.LogedUser ? this.LogedUser.Doctor : null;
    this.Organization = this.Doctor ? this.Doctor.Organization : null;

    this.SearchOption = {
      StartDate: null,
      EndDate: null,
      OrganizationId: this.Doctor ? this.Doctor.OrganizationId : null,
      ProvinceCityId: null,
      SoumDistrictId: null,
      BagKhorooId: null,
      CreateUserId: null,
      offset: 0,
      limit: 100,
    };
  }

  handleChangeDate = (StartDate, EndDate) => {
    this.SearchOption.StartDate = StartDate;
    this.SearchOption.EndDate = EndDate;
    this.props.ChangeValue && this.props.ChangeValue(this.SearchOption);
  };

  handleOrganizationChange = (Value) => {
    this.SearchOption.OrganizationId = Value;
    this.props.ChangeValue && this.props.ChangeValue(this.SearchOption);
  };

  handleUserChange = (Value) => {
    this.SearchOption.CreateUserId = Value;
    this.props.ChangeValue && this.props.ChangeValue(this.SearchOption);
  };

  handleDictChange = (ModifyObject) => {
    this.SearchOption.ProvinceCityId = ModifyObject["ProvinceCityId"];
    this.SearchOption.SoumDistrictId = ModifyObject["SoumDistrictId"];
    this.SearchOption.BagKhorooId = ModifyObject["BagKhorooId"];
    this.props.ChangeValue && this.props.ChangeValue(this.SearchOption);
  };

  render() {
    const { t } = this.props;
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          width: "100%",
        }}
      >
        {this.props.Actions ? (
          <div style={{ flexShrink: 0 }}>{this.props.Actions}</div>
        ) : null}
        <div style={{ flexShrink: 0 }}>
          <RangeDate
            ChangeValue={this.handleChangeDate}
            Refresh={() =>
              this.props.ChangeValue &&
              this.props.ChangeValue(this.SearchOption)
            }
          />
        </div>
        <div style={{ width: "140px", flexShrink: 0 }}>
          <BaseLookUpGridLoad
            Config={{
              Name: "OrganizationId",
              Label: t("Organization"),
              Config: {
                ObjectName: "Organization",
                IdField: "Id",
                TextField: "Name",
                MinTextLength: 0,
                SearchType: "AllData",
                Fields: [
                  { Name: "ParentOrganization.Name", Label: t("Parent") },
                  { Name: "Name", Label: t("Name") },
                ],
              },
            }}
            ChangeValue={this.handleOrganizationChange}
            Value={this.SearchOption.OrganizationId}
            InitialText={this.Organization ? this.Organization.Name : ""}
            Variant="outlined"
            FullWidth
          />
        </div>
        <div style={{ width: "140px", flexShrink: 0 }}>
          <BaseLookUpGridLoad
            Config={{
              Name: "CreateUserId",
              Label: t("Create user"),
              Config: {
                ObjectName: "Users",
                IdField: "Id",
                TextField: "UserName",
                MinTextLength: 0,
                SearchType: "AllData",
                Fields: [
                  { Name: "UserName", Label: t("User name") },
                  { Name: "LastName", Label: t("Last name") },
                  { Name: "FirstName", Label: t("First name") },
                ],
              },
            }}
            ChangeValue={this.handleUserChange}
            Value={this.SearchOption.CreateUserId}
            Variant="outlined"
            FullWidth
          />
        </div>
        <DictAttributes ChangeValue={this.handleDictChange} />
      </div>
    );
  }
}

export default withTranslation()(Filter);
