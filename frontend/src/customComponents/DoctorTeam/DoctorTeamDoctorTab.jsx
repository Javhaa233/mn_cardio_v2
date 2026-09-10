import { useTranslation } from "react-i18next";
// react
import { createRef, forwardRef } from "react";
// translation
import { withTranslation } from "react-i18next";
// @material-ui core components
import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
// @material-ui icons
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// custom components
import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import BaseDialog from "customComponents/BaseDialog";
import EditDoctorForm from "customComponents/DoctorTeam/EditDoctorForm";
// helper
import Helper from "helper";

class DoctorTeamDoctorTab extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DialogData: null,
      Alert: null,
      DoctorTeamId: props.DoctorTeamId || null,
    };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 10;
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

    // refs
    this.EditForm = createRef();
    this.DialogRef = createRef();

    // Forward ref to parent
    if (props.innerRef) {
      props.innerRef.current = this;
    }
  }

  componentDidUpdate(prevProps) {
    // Update ref if it changes
    if (this.props.innerRef && this.props.innerRef !== prevProps.innerRef) {
      this.props.innerRef.current = this;
    }
  }

  setTeamId = (teamId) => {
    const { DoctorTeamId } = this.state;
    if (teamId !== DoctorTeamId) {
      this.setState({ DoctorTeamId: teamId }, () => {
        this.GetData();
      });
    }
  };

  GetData = async () => {
    const { DoctorTeamId } = this.state;
    console.log(
      "DoctorTeamDoctorTab.GetData called, DoctorTeamId:",
      DoctorTeamId,
    );
    this.setState({ isLoading: true });
    if (DoctorTeamId) {
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "team_id",
        DoctorTeamId,
        this.SearchOption.SearchField,
        "Equals",
      );
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "rec_status",
        "2",
        this.SearchOption.SearchField,
        "NotEquals",
      );
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "LookupDoctorTeam", SearchOption: this.SearchOption },
        (resData) => {
          console.log("DoctorTeamDoctorTab.GetData response:", resData);
          if (resData) {
            if (resData.Success === false) {
              this.ShowAlert(resData.Message, false);
            }
            this.setState({
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
          }
        },
      );
    } else {
      this.setState({ Data: [], GridOption: {}, isLoading: false });
    }
  };

  RemoveDoctor = async (data) => {
    const { t } = this.props;
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      t("RemoveDoctorConfirm"),
      async () => {
        this.setState({ Alert: null });
        await Helper.DoctorTeamHelper.RemoveDoctor(data, (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                this.GetData();
              },
            );
            this.setState({ Alert: alert });
          }
        });
      },
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  ShowDialog = () => {
    const { DoctorTeamId } = this.state;
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Save={(stopLoading) => {
            this.EditForm.Save &&
              this.EditForm.Save((resData) => {
                if (resData && resData.Success) {
                  this.setState({ DialogData: null });
                  this.GetData();
                } else {
                  stopLoading && stopLoading();
                }
              });
          }}
          ShowSave={true}
          Width={600}
          Height={550}
        >
          <EditDoctorForm
            ref={(ref) => (this.EditForm = ref)}
            DoctorTeamId={DoctorTeamId}
            ObjectName="LookupDoctorTeam"
          />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { Data, GridOption, DialogData, Alert, isLoading } = this.state;
    const { t } = this.props;

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          position: "relative",
        }}
      >
        {Alert}
        {DialogData}
        {isLoading && <DivLoading WithoutCard />}

        {/* GRID AREA */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BaseGrid
            OrderBy={this.OrderBy}
            Fields={[
              { Label: t("Last name"), Name: "DoctorsProfile.lastname" },
              { Label: t("First name"), Name: "DoctorsProfile.firstname" },
              {
                Label: t("Organization"),
                Name: "DoctorsProfile.Organization.Name",
              },
              {
                Label: t("City"),
                Name: "DoctorsProfile.Organization.DictProvinceCity.name",
              },
              {
                Label: t("Dict or soum"),
                Name: "DoctorsProfile.Organization.DictSoumDistrict.name",
              },
              { Label: t("Privilege admin"), Name: "privilege_admin" },
              { Label: t("Remove patient"), Name: "privilege_delete_patient" },
              { Label: t("Add patient"), Name: "privilege_add_patient" },
            ]}
            RowActions={[
              {
                Component: (
                  <RowActionButton
                    label={t("Remove")}
                    icon={<RemoveCircleIcon />}
                    danger
                  />
                ),
                onClick: (data) => {
                  this.RemoveDoctor({
                    TeamId: data.team_id,
                    DoctorId: data.doctor_id,
                    id_data: data.id_data,
                  });
                },
              },
            ]}
            ChangePage={this.PageLimitChange}
            SearchField={this.SearchField}
            Data={Data}
            Option={GridOption}
            PageSize={10}
            HideNumber
            HideCheck
            SearchFieldData={[]}
            FieldFilter={false}
            PK="id_data"
            ShowData={() => {}}
            widthPattern="120l, 120l, 200l, 120, 120, 80c, 80c, 80c, 40c"
          />
        </div>
      </div>
    );
  };
}
const TranslatedDoctorTeamDoctorTab = withTranslation()(DoctorTeamDoctorTab);

export default forwardRef((props, ref) => (
  <TranslatedDoctorTeamDoctorTab {...props} innerRef={ref} />
));
