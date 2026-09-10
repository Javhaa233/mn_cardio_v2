import React from "react";
// translation
import { withTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseDate from "customComponents/BaseEditControls/BaseDate";

import Helper from "helper";

/**
 * The entry half of "2.2 Миний тэмдэглэл".
 *
 * Stays on BaseCustomForm + /BaseObject: writes are scoped server side, and
 * the form engine is not something to reimplement here.
 *
 * Labels come from ModelConfigs/PatientMonitoringConfig.js and nowhere else.
 * This form used to spread each descriptor and overwrite `Label` inline, which
 * put the wording in two places and broke the rule that the server owns field
 * metadata (CLAUDE.md §3). Wording that reads wrong is a ModelConfig edit.
 */
class PatientMonitoringForm extends BaseCustomForm {
  Save = async () => {
    const { PatientId, Save, t } = this.props;
    const { ObjectName } = this.state;

    // Never post a placeholder owner. The screen guards against this too, but
    // a save is the point where a wrong patient_id becomes another patient's
    // record, so it is refused here as well.
    if (!PatientId) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        t("Өвчтөний бүртгэл олдсонгүй тул тэмдэглэл хадгалах боломжгүй"),
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
      return;
    }

    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName,
          Data: { ...this.ModifyObject, patient_id: PatientId, Files: null },
        },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                Save && Save(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { Fields } = this.state;
    const { t } = this.props;

    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("date")}
                FullWidth={true}
                md={4}
                LabelSize="12px"
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("blood_pressure")}
                md={4}
                LabelSize="12px"
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("blood_pressure2")}
                md={4}
                LabelSize="12px"
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("weight")}
                md={4}
                LabelSize="12px"
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("inr")}
                FullWidth={true}
                md={4}
                LabelSize="12px"
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("comment")}
                FullWidth={true}
                md={4}
                LabelSize="12px"
              />
              <Button
                color="success"
                size="sm"
                style={{ float: "right" }}
                onClick={() => this.Save()}
              >
                {t("Save")}
              </Button>
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  PatientMonitoringForm,
);
