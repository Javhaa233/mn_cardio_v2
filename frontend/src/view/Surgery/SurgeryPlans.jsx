import React, { Component } from "react";

// translation
import { withTranslation } from "react-i18next";

import UniCard from "customComponents/UniCard";
import SugeryPlansList from "customComponents/InPatient/SugeryPlansList";

class SurgeryPlansPage extends Component {
  render() {
    const { t } = this.props;
    return (
      <UniCard title={t("Surgery plan")} color="info">
        <SugeryPlansList
          ObjectName={"SurgeryPlans"}
          color={"rose"}
          Title={"Surgery plan"}
          CustomRender={true}
        />
      </UniCard>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(SurgeryPlansPage);
