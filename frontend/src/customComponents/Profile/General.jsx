import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation

import { Divider, Avatar } from "@mui/material";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseDialog from "customComponents/BaseDialog";
import BaseLoading from "customComponents/BaseLoading";
import DoctorForm from "customComponents/Forms/DoctorForm";
// helper
import Helper from "helper";

class General extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: {}, DialogData: null, isLoading: false };
    // refs
    this.DoctorForm = createRef();
  }

  GetData = async () => {
    const t = this.props.t;
    const Doctor = Helper.AuthHelper.GetLogedDoctorLocal();
    this.setState({ isLoading: true });
    if (Doctor) {
      await Helper.DoctorsProfileHelper.GetDoctorsProfileInfo(
        Doctor.id_data,
        (resData) => {
          if (resData && resData.Data) {
            this.setState({ Data: resData.Data, isLoading: false });
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  componentDidMount() {
    this.GetData();
  }

  SetEditForm = () => {
    const { Data } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          Title="Edit Profile"
          Save={() => {
            this.DoctorForm &&
              this.DoctorForm.Save(() => {
                this.setState({ DialogData: null });
                this.GetData();
              });
          }}
          ShowSave={true}
          Close={() => this.setState({ DialogData: null })}
        >
          <DoctorForm
            ref={(ref) => (this.DoctorForm = ref)}
            ObjectName="DoctorsProfile"
            DataId={Data ? Data.id_data : null}
          />
        </BaseDialog>
      ),
    });
  };
  render() {
    const { t } = this.props;
    const { Data, DialogData, isLoading } = this.state;
    return (
      <div style={{ position: "relative", minHeight: "100px" }}>
        {isLoading ? (
          <GridContainer style={{ width: "100%", margin: "0" }}>
            <GridItem xs={12} md={6}>
              <BaseLoading />
            </GridItem>
          </GridContainer>
        ) : (
          <div>
            {DialogData}
            <GridContainer style={{ width: "100%", margin: "0" }}>
              <GridItem xs={12} md={6}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Avatar
                    src={
                      Data.Files && Data.Files.length > 0
                        ? Data.Files[0].FileSrc
                        : null
                    }
                    style={{ width: "150px", height: "150px" }}
                    variant="square"
                  />
                </div>
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Personal number"
                  Value={Data.personal_number}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Last name"
                  Value={Data.lastname}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="First name"
                  Value={Data.firstname}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="User name"
                  Value={Data.Users ? Data.Users.UserName : ""}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                {/* <Divider style={{ margin: "0 -15px" }} />
            <BaseInfo
              Label="Birth date"
              Value="1960-12-06"
             
              md={4}
              
              LabelWeight="500"
              ValueWeight="400"
              Left
            /> */}
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Email"
                  Value={Data.email}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Telephone"
                  Value={Data.telephone}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Skype"
                  Value={Data.skype}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Organization"
                  Value={
                    Data.OrganizationIdObj ? Data.OrganizationIdObj.Name : ""
                  }
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                {/* <BaseInfo Label="Province, City"
                  Value={
                    Data.province_cityObj ? Data.province_cityObj.Label : ""
                  }
                 
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                />
                <Divider style={{ margin: "0 -15px" }} /> */}
                {/* <BaseInfo Label="Province/City"
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                  Value={
                    Data.addr_prov_cityObj ? Data.addr_prov_cityObj.name : ""
                  }
                />
                <Divider style={{ margin: "0 -15px" }} /> */}
                {/* <BaseInfo Label="Soum/District"
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                  Value={
                    Data.addr_soum_distObj ? Data.addr_soum_distObj.name : ""
                  }
                />
                <Divider style={{ margin: "0 -15px" }} /> */}
                {/* <BaseInfo Label="Bag/Khoroo"
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                  Value={Data.DictBagKhoroo ? Data.DictBagKhoroo.name : ""}
                /> */}
                {/* <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo Label="Workplace"
                  Value={Data.organisation}
                 
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                /> */}
                {/* <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo Label="Profession"
                  Value={Data.profession}
                 
                  md={4}
                   LabelWeight="500"
                  ValueWeight="400" Left
                /> */}
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Professional degrees"
                  Value={Data.professional_degrees}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <BaseInfo
                  Label="Experiences"
                  Value={Data.experiences}
                  md={4}
                  LabelWeight="500"
                  ValueWeight="400"
                  Left
                />
                <Divider style={{ margin: "0 -15px" }} />
                <div style={{ margin: "15px -15px 0" }}>
                  <Button
                    color="warning"
                    style={{
                      float: "right",
                      margin: "0",
                      padding: "8px 10px",
                      position: "relative",
                      "&:hover": { zIndex: "2" },
                    }}
                    onClick={() => {
                      this.SetEditForm();
                    }}
                    size="sm"
                  >
                    {t("Edit")}
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
          </div>
        )}
      </div>
    );
  }
}
export default withTranslation(undefined, { withRef: true })(General);
