import React, { createRef } from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import SurgeryBeforeVisitsCheckReport from "customComponents/Report/SurgeryBeforeVisitsCheckReport";
import BaseDialog from "customComponents/BaseDialog";
// helper
import Helper from "helper";

class SurgeryBeforeVisitsCheckForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Dialog: null };
    // refs
    this.Report = createRef();
  }

  GetData = async () => {
    const { DoctorsTeamPatientId } = this.props;
    const { ObjectName } = this.state;
    if (DoctorsTeamPatientId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        {
          Field: "DoctorsTeamPatientId",
          Op: "Equals",
          Value: DoctorsTeamPatientId,
        },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData) {
            let EditObject = null;
            EditObject = resData.Success
              ? Object.assign({}, resData.Data)
              : null;
            this.setState({ EditObject, isLoading: false });
          }
        },
      );
    }
  };

  Save = async (callback) => {
    const { DoctorsTeamPatientId } = this.props;
    const { ObjectName, EditObject } = this.state;
    if (Object.keys(this.ModifyObject).length > 0) {
      var Data = null;
      if (EditObject !== null) {
        Data = { ...this.ModifyObject, Id: EditObject.Id };
        await Helper.BaseCrudHelper.BaseUpdate(
          { ObjectName, Data },
          (resData) => resData && this.SaveCallBack(resData, callback),
        );
      } else {
        Data = { ...this.ModifyObject, DoctorsTeamPatientId };
        await Helper.BaseCrudHelper.BaseCreate(
          { ObjectName, Data },
          (resData) => resData && this.SaveCallBack(resData, callback),
        );
      }
    }
  };

  SaveCallBack = (resData, callback) => {
    if (resData) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        resData.Message,
        resData.Success,
        () => {
          this.setState({ Alert: null });
          callback && callback(resData);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  Print = (callback) => {
    this.setState({
      Dialog: (
        <BaseDialog
          Close={() => this.setState({ Dialog: null })}
          Title="Surgery Before Visits Check"
          Print={() => this.Report.Print && this.Report.Print(callback)}
          ShowPrint={true}
        >
          <SurgeryBeforeVisitsCheckReport ref={(ref) => (this.Report = ref)} />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, Dialog } = this.state;
    return (
      <div>
        {Dialog}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={12}>
            {Fields ? (
              <div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("Tsus")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("BioHimi")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("TsusBvlegneltINR")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("VirusMarker")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ZvrhTsahBichleg")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ZvrhEho")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("Spirometr")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("TseejRentgen")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("HevlinEho")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("TitemSudasDoturh")}
                  md={6}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("GolSudasTomo")}
                  md={6}
                />
              </div>
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default SurgeryBeforeVisitsCheckForm;
