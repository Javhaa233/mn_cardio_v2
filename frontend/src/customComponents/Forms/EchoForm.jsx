import React, { createRef } from "react";
// @mui/material components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
// @mui/icons-material
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseField from "baseComponents/BaseField";
import EchoExamination from "customComponents/Forms/Echo/EchoExamination";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
// helper
import Helper from "helper";

const styles = {
  root: { margin: "16px 0", "&::before": { opacity: 0 } },
  divider: { marginBottom: "12px" },
};

class EchoForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, NewObject: null };
    this.ModifyObject = { echo_date: Helper.ObjectHelper.getDateYMD() };
    // refs
    this.EchoSVGPanel = createRef();
  }

  GetData = async () => {
    const { Fields } = this.state;
    const { DataId, ObjectName, PatientId } = this.props;
    this.setState({ isLoading: true });
    if (Fields && ObjectName && !DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/Echo/GetLastEchoId",
        { PatientId },
        async (resData) => {
          if (resData && resData.Success && resData.Data) {
            const LastId = resData.Data.DataId;
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
                if (resData) {
                  this.setState({
                    isLoading: false,
                    NewObject: Object.assign(resData.Data, {
                      PatientId: null,
                      OrganizationId: null,
                    }),
                  });
                }
              },
            );
          }
        },
      );
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
    if (Value) {
      await Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: ObjectName,
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => {
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
        },
      );
    }
  };

  Print = async (callback) => {
    const { PatientId } = this.props;
    let alert = null;

    // First get the last Echo ID for this patient
    if (PatientId) {
      await Helper.BaseCrudHelper.CallService(
        "/Echo/GetLastEchoId",
        { PatientId },
        async (resData) => {
          if (
            resData &&
            resData.Success &&
            resData.Data &&
            resData.Data.DataId
          ) {
            const DataId = resData.Data.DataId;
            await Helper.BaseCrudHelper.BasePrintReport(
              {
                Url: "/Echo/PrintReport",
                Data: { Id: DataId },
                FileName: "EchoExamination.pdf",
              },
              (Success) => {
                alert = Helper.BaseCrudHelper.ShowAlert(
                  Success ? "Successfully printed" : "Error",
                  Success,
                  () => {
                    this.setState({ Alert: null });
                    callback && callback();
                  },
                );
                this.setState({ Alert: alert });
              },
            );
          } else {
            alert = Helper.BaseCrudHelper.ShowAlert(
              "No data found to print",
              false,
              () => {
                this.setState({ Alert: null });
                callback && callback();
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Patient information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  Save = async (callback) => {
    const { PatientId } = this.props;

    let alert = null;
    if (PatientId) {
      const ElementsList =
        this.EchoSVGPanel.PolygonElements &&
        this.EchoSVGPanel.PolygonElements();

      await Helper.BaseCrudHelper.CallService(
        "/Echo/CustomSave",
        {
          PatientId,
          Data: JSON.stringify({
            EchoData: this.ModifyObject,
            ExaminationEchoNotations: ElementsList,
          }),
        },
        async (resData) => {
          if (resData) {
            if (resData.Success && resData.Data && this.ModifyObject["Files"]) {
              await this.uploadFile(resData.Data.DataId, callback);
            } else {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback(resData.Success);
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

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));

    var newVal = 0;
    let lvddValue = 0;
    let pwdValue = 0;
    let lvdsValue = 0;
    let ivsdValue = 0;
    if (this.ModifyObject["lvdd"] && this.ModifyObject["pwd"]) {
      newVal = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      pwdValue = isNaN(parseFloat(this.ModifyObject["pwd"]))
        ? 0
        : parseFloat(this.ModifyObject["pwd"]);

      newVal = lvddValue !== 0 ? (2 * pwdValue) / lvddValue : 0;

      this.ModifyObject["rwt"] = parseFloat(newVal.toFixed(2));
      document.getElementById("rwt").value = parseFloat(newVal.toFixed(2));
    }

    if (this.ModifyObject["lvdd"] && this.ModifyObject["lvds"]) {
      newVal = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      lvdsValue = isNaN(parseFloat(this.ModifyObject["lvds"]))
        ? 0
        : parseFloat(this.ModifyObject["lvds"]);

      newVal =
        lvddValue !== 0 ? (100 * (lvddValue - lvdsValue)) / lvddValue : 0;

      this.ModifyObject["fs"] = parseFloat(newVal.toFixed(2));
      document.getElementById("fs").value = parseFloat(newVal.toFixed(2));
    }

    if (this.ModifyObject["lvdd"] && this.ModifyObject["lvds"]) {
      var efValue = 0;
      var svValue = 0;
      var edvValue = 0;
      var esvValue = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      lvdsValue = isNaN(parseFloat(this.ModifyObject["lvds"]))
        ? 0
        : parseFloat(this.ModifyObject["lvds"]);

      edvValue = (7 * lvddValue * lvddValue * lvddValue) / (2.4 + lvddValue);
      esvValue = (7 * lvdsValue * lvdsValue * lvdsValue) / (2.4 + lvdsValue);

      svValue = edvValue - esvValue;
      efValue = edvValue !== 0 ? ((edvValue - esvValue) / edvValue) * 100 : 0;

      this.ModifyObject["ef"] = parseFloat(efValue.toFixed(2));
      document.getElementById("ef").value = parseFloat(efValue.toFixed(2));
      this.ModifyObject["sv"] = parseFloat(svValue.toFixed(2));
      document.getElementById("sv").value = parseFloat(svValue.toFixed(2));
    }

    if (
      this.ModifyObject["lvdd"] &&
      this.ModifyObject["ivsd"] &&
      this.ModifyObject["pwd"]
    ) {
      newVal = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      ivsdValue = isNaN(parseFloat(this.ModifyObject["ivsd"]))
        ? 0
        : parseFloat(this.ModifyObject["ivsd"]);
      pwdValue = isNaN(parseFloat(this.ModifyObject["pwd"]))
        ? 0
        : parseFloat(this.ModifyObject["pwd"]);

      newVal =
        0.8 *
          1.04 *
          (Math.pow(lvddValue + ivsdValue + pwdValue, 3) -
            Math.pow(lvddValue, 3)) +
        0.6;
      this.ModifyObject["lv_mass"] = parseFloat(newVal.toFixed(2));
      document.getElementById("lv_mass").value = parseFloat(newVal.toFixed(2));
    }

    if (this.ModifyObject["e"] && this.ModifyObject["a"]) {
      // eslint-disable-next-line no-redeclare
      var newVal = null;

      var eValue = isNaN(parseFloat(this.ModifyObject["e"]))
        ? 0
        : parseFloat(this.ModifyObject["e"]);
      var aValue = isNaN(parseFloat(this.ModifyObject["a"]))
        ? 0
        : parseFloat(this.ModifyObject["a"]);

      newVal = aValue !== 0 ? eValue / aValue : 0;
      this.ModifyObject["e_div_a"] = parseFloat(newVal.toFixed(2));
      document.getElementById("e_div_a").value = parseFloat(newVal.toFixed(2));
    }

    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, NewObject } = this.state;
    const FileConfig = this.GetConfigField("Files");
    const LabelWidth = this.props.LabelWidth || 50;

    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <GridContainer>
              {/* Header Fields */}
              <GridItem xs={12} md={6}>
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("echo_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("doctor_name")}
                  FullWidth
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              <GridItem xs={12} md={12}>
                <div
                  style={{ borderBottom: "1px solid #ccc", margin: "10px 0" }}
                ></div>
              </GridItem>

              {/* Basic Measurements - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("aorta")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("left_atrium")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvdd")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Ventricular Measurements - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("lvds"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("ivsd"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("ivss"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Wall Measurements - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("pwd"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("pws"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rwt")}
                  Id="rwt"
                  Disabled={true}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Calculated Values - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Id="ef"
                  Config={this.GetConfigField("ef")}
                  Disabled={true}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("fs")}
                  Id="fs"
                  Disabled={true}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sv")}
                  Id="sv"
                  Disabled
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Additional Measurements - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lv_mass")}
                  Id="lv_mass"
                  Disabled
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("e"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("a"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Ratios and Gradients - 3 columns */}
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("e_div_a")}
                  Id="e_div_a"
                  Disabled={true}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("aopg"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("pvpg"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Valve Conditions - 2 columns */}
              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("aortic_stenosis")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("aortic_regurgitation")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("mitral_regurgitation")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tricuspid_stenosis")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tricuspid_regurgitation")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("pulmonary_stenosis")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              <GridItem xs={12} md={6}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("pulmonary_regurgitation")}
                  LabelWidth={LabelWidth}
                />
              </GridItem>
              <GridItem xs={12} md={6}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={{ ...this.GetConfigField("spap"), Type: "Number" }}
                  LabelWidth={LabelWidth}
                />
              </GridItem>

              {/* Comments */}
              <GridItem xs={12} md={12}>
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("comment")}
                  FullWidth={true}
                  rows={2}
                  LabelWidth={20}
                />
              </GridItem>

              {/* Advanced Echo Accordion */}
              <GridItem xs={12} md={12}>
                <Accordion
                  elevation={0}
                  variant="outlined"
                  square
                  sx={styles.root}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <BaseLabel Label="Advanced echo" Size="18px" Weight="500" />
                  </AccordionSummary>
                  <AccordionDetails style={{ display: "block" }}>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={{
                            ...this.GetConfigField("lvvold"),
                            Type: "Number",
                          }}
                          LabelWidth={LabelWidth}
                        />
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={{
                            ...this.GetConfigField("lvvols"),
                            Type: "Number",
                          }}
                          LabelWidth={LabelWidth}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={{
                            ...this.GetConfigField("rvd"),
                            Type: "Number",
                          }}
                          LabelWidth={LabelWidth}
                        />
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={{
                            ...this.GetConfigField("ivc"),
                            Type: "Number",
                          }}
                          LabelWidth={LabelWidth}
                        />
                      </GridItem>
                    </GridContainer>
                  </AccordionDetails>
                </Accordion>
              </GridItem>

              {/* Mitral Regurgitation Accordion */}
              <GridItem xs={12} md={12}>
                <Accordion
                  elevation={0}
                  variant="outlined"
                  square
                  sx={styles.root}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <BaseLabel
                      Label="Mitral regurgitation"
                      Size="18px"
                      Weight="500"
                    />
                  </AccordionSummary>
                  <AccordionDetails style={{ display: "block" }}>
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("annulus_size_morph")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("leaflet_mobility")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("leaf_mob_flail")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("leaf_mob_prolapse")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("res_tet_leaflets")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mitral_stenosis")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("carpentier_class")}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("submitral_morph")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mr_mrchanism")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mr_jets")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mr_jet_dur")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mr_jet_dir")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("pul_vein_flow_pro")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mitral_inflow_pro")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("vena_contrata_width"),
                        Type: "Number",
                      }}
                      LabelWidth={LabelWidth}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("vena_contrata_area"),
                        Type: "Number",
                      }}
                      LabelWidth={LabelWidth}
                    />
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("threshold_vals_mr")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("left_atrial_size")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("left_vent_size")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />

                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("right_vent_size")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("right_vent_sys_fun")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tricus_annulus")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tricus_valv_reg")}
                      boxMd={6}
                      LabelWidth={LabelWidth}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("pa_sys_pressure"),
                        Type: "Number",
                      }}
                      LabelWidth={LabelWidth}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={{
                        ...this.GetConfigField("est_ra_pressure"),
                        Type: "Number",
                      }}
                      LabelWidth={LabelWidth}
                    />
                  </AccordionDetails>
                </Accordion>
              </GridItem>

              {/* Echo Examination */}
              <GridItem
                xs={12}
                md={12}
                style={{ marginBottom: "10px", marginTop: "10px" }}
              >
                <EchoExamination
                  ref={(ref) => (this.EchoSVGPanel = ref)}
                  Data={NewObject ? NewObject.ExaminationEchoNotation : null}
                />
              </GridItem>

              {/* Files */}
              <GridItem xs={12} md={12}>
                <BaseField
                  WithLabel={true}
                  Config={{ ...FileConfig }}
                  Value={
                    FileConfig && Array.isArray(FileConfig.Value)
                      ? FileConfig.Value
                      : []
                  }
                  ChangeValue={this.ChangeValue}
                />
              </GridItem>
            </GridContainer>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default EchoForm;
