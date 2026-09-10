import { useTranslation } from "react-i18next";
// translation
import { withTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

class EditDoctorForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  Save = async (callback) => {
    const { DoctorTeamId } = this.props;

    if (!DoctorTeamId || !this.ModifyObject["doctor_id"]) {
      callback && callback({ Success: false });
      return;
    }

    try {
      // First, get the current team's name
      const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Value: DoctorTeamId, Op: "Equals" },
      ];

      Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "DoctorsTeam", SearchOption },
        (teamDetailRes) => {
          const currentTeamName = teamDetailRes?.Data?.name || "this team";

          // Check if doctor is already in this specific team by querying LookupDoctorTeam
          const CheckSearchOption = Helper.BaseCrudHelper.GetSearchOption();
          CheckSearchOption.SearchField = [
            {
              Field: "doctor_id",
              Value: this.ModifyObject["doctor_id"],
              Op: "Equals",
            },
            { Field: "team_id", Value: DoctorTeamId, Op: "Equals" },
            { Field: "rec_status", Value: "2", Op: "NotEquals" }, // Not deleted
          ];

          Helper.BaseCrudHelper.BaseGetList(
            { ObjectName: "LookupDoctorTeam", SearchOption: CheckSearchOption },
            (checkRes) => {
              // If record exists, member is already in the team
              if (checkRes?.Data && checkRes.Data.length > 0) {
                const alert = Helper.BaseCrudHelper.ShowAlert(
                  `Member is already added to team: "${currentTeamName}"`,
                  false,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
                // Important: call callback to reset dialog loading state
                callback && callback({ Success: false });
                return;
              }

              // Proceed with saving if not already in team
              Helper.DoctorTeamHelper.SaveDoctor(
                { ...this.ModifyObject, team_id: DoctorTeamId },
                (resData) => {
                  if (resData) {
                    // Enhance the error message if backend returns duplicate error
                    let message = resData.Message;
                    if (
                      !resData.Success &&
                      message &&
                      (message.toLowerCase().includes("already") ||
                        message.toLowerCase().includes("duplicate"))
                    ) {
                      message = `Member is already added to team: "${currentTeamName}"`;
                    }

                    const alert = Helper.BaseCrudHelper.ShowAlert(
                      message,
                      resData.Success,
                      () => {
                        this.setState({ Alert: null });
                      },
                    );
                    this.setState({ Alert: alert });
                    // Important: call callback to reset dialog loading state
                    callback && callback(resData);
                  } else {
                    // If no response, still call callback
                    callback && callback({ Success: false });
                  }
                },
              );
            },
          );
        },
      );
    } catch (error) {
      console.error("Error in Save:", error);
      callback && callback({ Success: false });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    return (
      <div style={{ padding: "0 10px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px", fontWeight: 700 }}>
          {t("Add member to team")}
        </h3>
        <GridContainer>
          <GridItem xs={12}>
            <BaseField
              Value={this.ModifyObject["doctor_id"]}
              Config={{
                ...this.GetConfigField("doctor_id"),
                Label: t("User name"),
              }}
              ChangeValue={this.ChangeValue}
              WithLabel
            />
          </GridItem>
          <GridItem xs={12}>
            <BaseField
              Value={this.ModifyObject["privilege_admin"]}
              Config={this.GetConfigField("privilege_admin")}
              ChangeValue={this.ChangeValue}
            />
          </GridItem>
          <GridItem xs={12}>
            <BaseField
              Value={this.ModifyObject["privilege_add_patient"]}
              Config={this.GetConfigField("privilege_add_patient")}
              ChangeValue={this.ChangeValue}
            />
          </GridItem>
          <GridItem xs={12}>
            <BaseField
              Value={this.ModifyObject["privilege_delete_patient"]}
              Config={this.GetConfigField("privilege_delete_patient")}
              ChangeValue={this.ChangeValue}
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(EditDoctorForm);
