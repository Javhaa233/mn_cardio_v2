import React, { createRef } from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// SVG
import VentriculographyLAO from "customComponents/Forms/Cathlab/VentriculographyLAO";
import VentriculographyRAO from "customComponents/Forms/Cathlab/VentriculographyRAO";
import Coronary from "customComponents/Forms/Cathlab/Coronary";

// Helpers
import Helper from "helper";

class CathlabForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    // refs
    this.CoronaryPanel = createRef();
    this.VentriculographyLAOPanel = createRef();
    this.VentriculographyRAOPanel = createRef();
  }

  ChangeValue = (Field, Value) => {
    // 1. Keep the base logic (updating ModifyObject for saving)
    this.ModifyObject[Field] = Value;
    this.MarkDirty();

    // 2. Update the state to trigger a re-render
    // We update EditObject so that GetConfigField() picks up the new value
    this.setState(
      (prevState) => ({
        EditObject: {
          ...prevState.EditObject,
          [Field]: Value,
        },
      }),
      () => {
        // Callback after setState completes
      },
    );
  };

  GetData = async () => {
    const { Fields } = this.state;
    const { DataId, ObjectName, PatientId, PatRegNo } = this.props;
    if (Fields && ObjectName && DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "id_data",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );

      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) => {
          this.setState({
            isLoading: false,
            EditObject:
              resData && resData.Data
                ? Object.assign({}, resData.Data)
                : this.state.EditObject,
          });
        },
      );
    } else if (Fields && ObjectName && !DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/CathLab/GetLastCathLabId",
        { PatientId, PatRegNo },
        async (resData) => {
          let LastId = null;
          if (resData && resData.Success && resData.Data) {
            LastId = resData.Data.DataId;
            if (LastId) {
              var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
              SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                "id_data",
                LastId,
                SearchOption.SearchField,
                "Equals",
              );

              await Helper.BaseCrudHelper.BaseGetDetail(
                { ObjectName, SearchOption },
                (resData) => {
                  this.setState({
                    isLoading: false,
                    EditObject:
                      resData && resData.Data
                        ? Object.assign(
                            {},
                            {
                              ...resData.Data,
                              cath_lab_operation_procedure: [],
                              doctors_name: [],
                              cath_lab_operation_date: null,
                              PatientId: null,
                              OrganizationId: null,
                              Conclusion: null,
                            },
                          )
                        : null,
                  });
                },
              );
            } else {
              this.setState({ isLoading: false });
            }
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Save = async (callback) => {
    const { PatientId, PatRegNo } = this.props;
    if (PatientId && PatRegNo) {
      const CoronaryList =
        this.CoronaryPanel.PolygonCathElements &&
        this.CoronaryPanel.PolygonCathElements();
      const VentriculographyLAOList =
        this.VentriculographyLAOPanel.PolygonCathElements &&
        this.VentriculographyLAOPanel.PolygonCathElements();
      const VentriculographyRAOList =
        this.VentriculographyRAOPanel.PolygonCathElements &&
        this.VentriculographyRAOPanel.PolygonCathElements();

      await Helper.BaseCrudHelper.CallService(
        "/CathLab/CustomSave",
        {
          PatientId,
          PatRegNo,
          Data: JSON.stringify({
            CathLabData: this.ModifyObject,
            CathLabElements: [
              ...CoronaryList,
              ...VentriculographyLAOList,
              ...VentriculographyRAOList,
            ],
          }),
        },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { EditObject } = this.state;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12} style={{ margin: "10px" }}>
          <BaseDate
            Config={this.GetConfigField("cath_lab_operation_date")}
            ChangeValue={this.ChangeValue}
          />
          <BaseCheckBox
            Value={
              EditObject && EditObject["cath_lab_operation_procedure"]
                ? EditObject["cath_lab_operation_procedure"]
                : []
            }
            ChangeValue={(name, value) =>
              this.ChangeValue("cath_lab_operation_procedure", value)
            }
            Config={this.GetConfigField("cath_lab_operation_procedure")}
          />
          <BaseCheckBox
            Value={
              EditObject && EditObject["doctors_name"]
                ? EditObject["doctors_name"]
                : []
            }
            ChangeValue={(name, value) =>
              this.ChangeValue("doctors_name", value)
            }
            Config={this.GetConfigField("doctors_name")}
          />
        </GridItem>
        <GridItem xs={12} md={12}>
          <Coronary
            Data={EditObject}
            ref={(ref) => (this.CoronaryPanel = ref)}
          />
          <div style={{ height: "10px", width: "100%" }}></div>
          <VentriculographyLAO
            Data={EditObject}
            ref={(ref) => (this.VentriculographyLAOPanel = ref)}
          />
          <div style={{ height: "10px", width: "100%" }}></div>
          <VentriculographyRAO
            Data={EditObject}
            ref={(ref) => (this.VentriculographyRAOPanel = ref)}
          />
        </GridItem>
        <GridItem xs={12} md={12} style={{ margin: "10px" }}>
          <BaseTextArea
            Config={this.GetConfigField("Conclusion")}
            ChangeValue={this.ChangeValue}
            Rows={8}
            LabelOnTop={true}
          />
        </GridItem>
      </GridContainer>
    );
  };
}

export default CathlabForm;
