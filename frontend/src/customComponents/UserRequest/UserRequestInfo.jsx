import React, { Component } from "react";
// @mui/material components
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";

class UserRequestInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, Loading: false };
    this.Id = props.Id || null;
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    this.setState({ Loading: true });
    if (this.Id) {
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        {
          ObjectName: "UserRequests",
          SearchOption: {
            SearchField: [{ Field: "Id", Value: this.Id, Op: "Equals" }],
          },
        },
        (resData) =>
          resData && this.setState({ Loading: false, Data: resData.Data }),
      );
    }
  };

  Confirm = async (callback) => {
    const { Id } = this;
    if (Id)
      await Helper.BaseCrudHelper.CallService(
        "/UserRequest/Confirm",
        { Id },
        (resData) => callback && callback(resData),
      );
    else callback({ Success: false, Message: "No users found" });
  };

  Decline = async (callback) => {
    const { Id } = this;
    if (Id)
      await Helper.BaseCrudHelper.CallService(
        "/UserRequest/Decline",
        { Id },
        (resData) => callback && callback(resData),
      );
    else callback && callback({ Success: false, Message: "No users found" });
  };

  render() {
    const { t } = this.props;
    const { Data, Loading } = this.state;
    return (
      <GridContainer style={{ width: "100%", margin: "0" }}>
        <GridItem xs={12} sm={12} md={12}>
          <div style={{ position: "relative" }}>
            {Loading ? (
              <BaseLoading />
            ) : Data ? (
              <div>
                <BaseInfo
                  Label="User name"
                  Value={Data.UserName}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />

                <BaseInfo
                  Label="Last name"
                  Value={Data.LastName}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />

                <BaseInfo
                  Label="First name"
                  Value={Data.FirstName}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />
                {/* <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo Label="License number"
                  Value={Data.License}
                  Size="15px" Left
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400"
                /> */}

                <BaseInfo
                  Label="Email"
                  Value={Data.Email}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />

                <BaseInfo
                  Label="Telephone"
                  Value={Data.Telephone}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />

                <BaseInfo
                  Label="Organization"
                  Value={Data.OrgName}
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                />
                {/* <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo Label="Organization address"
                  Value={Data.OrgAddress}
                  Size="15px" Left
                  md={4} LabelWeight="500"
                  ValueWeight="400"
                />

                <BaseInfo Label="Profession"
                  Value={Data.Profession}
                  Size="15px" Left
                  md={4} LabelWeight="500"
                  ValueWeight="400"
                /> */}

                <BaseInfo
                  Label="Province/City"
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Value={
                    Data.addr_prov_cityObj ? Data.addr_prov_cityObj.name : ""
                  }
                />

                <BaseInfo
                  Label="Soum/District"
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Value={
                    Data.addr_soum_distObj ? Data.addr_soum_distObj.name : ""
                  }
                />

                <BaseInfo
                  Label="Bag/Khoroo"
                  Size="15px"
                  Left
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Value={
                    Data.addr_bag_khorooObj ? Data.addr_bag_khorooObj.name : ""
                  }
                />
              </div>
            ) : (
              <BaseNoData />
            )}
          </div>
        </GridItem>
      </GridContainer>
    );
  }
}

export default UserRequestInfo;
