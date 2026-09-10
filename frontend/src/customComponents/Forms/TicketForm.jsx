import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import SimpleSelect from "customComponents/SimpleSelect";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";

const styles = {
  customButton: {
    borderRadius: "0",
    marginRight: "10px",
    padding: "10px 12px",
    position: "relative",
    float: "left",
    "&:hover": { zIndex: "2" },
  },
  addButton: {
    borderRadius: "0",
    margin: "0 5px",
    padding: "12px 15px",
    position: "relative",
    boxShadow: "none",
    float: "left",
    "&:hover": { zIndex: "2", boxShadow: "none" },
  },
  commentTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#ccc" },
      "&.Mui-focused fieldset": { borderColor: "#ccc", borderWidth: "1px" },
    },
  },
  titleBody: {
    color: "#3C4858",
    textDecoration: "none",
    marginTop: "20px",
    marginBottom: "0",
  },
};

class TicketForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.ModifyObject = { ticket_type: null };
  }

  Save = async (callback) => {
    const { PatientId } = this.props;
    let alert = null;
    if (PatientId) {
      let ticketType = this.ModifyObject["ticket_type"];
      if (!ticketType && ticketType === "-1") {
        alert = Helper.BaseCrudHelper.ShowAlert(
          "Хэлбэрээ сонгоно уу?",
          false,
          () => {
            this.setState({ Alert: null });
            callback && callback(false);
          },
        );
        this.setState({ Alert: alert });
        return;
      }
      await Helper.AdviceHelper.CustomSave(
        { ...this.ModifyObject, adv_id_patient: PatientId },
        (resData) => {
          if (resData) {
            if (resData.Success) {
              callback && callback(resData.Success, resData.Data);
            } else {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData.Success, resData.Data);
                },
              );
              this.setState({ Alert: alert });
            }
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback(false);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <div style={{ display: "flex" }}></div>
            </GridItem>
          </GridContainer>
          <GridContainer style={{ marginTop: "15px" }}>
            <GridItem xs={12} sm={12} md={12}>
              <SimpleSelect
                Config={this.GetConfigField("ticket_type")}
                ChangeValue={(value) => this.ChangeValue("ticket_type", value)}
                Variant="outlined"
                FullWidth={true}
                DefaultValue="Type"
              />
            </GridItem>
          </GridContainer>
          <h4 style={styles.titleBody}>{t("Body")}</h4>
          <BaseTextArea
            id="outlined-basic"
            variant="outlined"
            multiline
            minRows="4"
            fullWidth
            onChange={(event) => this.ChangeValue("Body", event.target.value)}
            sx={styles.commentTextField}
          />
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(TicketForm);
