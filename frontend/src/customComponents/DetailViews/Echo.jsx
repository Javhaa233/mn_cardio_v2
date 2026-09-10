import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseFilesInfo from "customComponents/BaseViewControls/BaseFilesInfo";
import BaseLoading from "customComponents/BaseLoading";
import EchoExamination from "customComponents/Forms/Echo/EchoExamination";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

/**
 * Echo Component
 *
 * A functional component for displaying echocardiography examination data.
 * This is a migrated version from the original class component.
 *
 * Benefits of the migration to functional component:
 * 1. Simpler and cleaner syntax
 * 2. Better performance due to removal of unnecessary lifecycle methods
 * 3. Easier to test and debug
 * 4. Uses hooks for state and side effects management
 * 5. More readable and maintainable code
 */
const Echo = ({ DataId }, ref) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { t } = useTranslation();

  const logedUser = Helper.AuthHelper.GetLogedUserLocal();

  // Fetch data when component mounts or DataId changes
  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DataId]);

  const GetData = async () => {
    setIsLoading(true);
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "id_data",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "ExaminationEcho", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            setData(Object.assign({}, resData.Data));
          }
          setIsLoading(false);
        },
      );
    } else {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    Print: (callback) => {
      Print(callback);
    },
  }));

  const Print = async (callback) => {
    let alert = null;
    if (DataId) {
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
              setAlert(null);
              callback && callback();
            },
          );
          setAlert(alert);
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data found", false, () => {
        setAlert(null);
        callback && callback();
      });
      setAlert(alert);
    }
  };

  if (isLoading) {
    return <BaseLoading />;
  } else {
    return (
      <div>
        {alert}
        {data && (
          <GridContainer style={{ width: "100%" }}>
            <GridItem xs={12} sm={12} md={12}>
              <GridContainer style={{ margin: "15px 0" }}>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "left" }}>
                    {t("Date of visit")}: {"\u00A0"}
                    <span style={{ fontWeight: "400" }}>
                      {data.date_creation || ""}
                    </span>
                  </div>
                </GridItem>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "right" }}>
                    <UserDialogLink UserId={data.id}>
                      {t("Doctor")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        {data.user_mod || ""}
                      </span>
                    </UserDialogLink>
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>
            {data.aorta ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="Aorta (cm)" Value={data.aorta} md={6} />
              </GridItem>
            ) : null}
            {data.left_atrium ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Left atrium (cm)"
                  Value={data.left_atrium}
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.lvdd ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="LVDd (cm)" Value={data.lvdd} md={6} />
              </GridItem>
            ) : null}
            {data.lvds ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="LVDs (cm)" Value={data.lvds} md={6} />
              </GridItem>
            ) : null}
            {data.ivsd ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="IVSd (cm)" Value={data.ivsd} md={6} />
              </GridItem>
            ) : null}
            {data.ivss ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="IVSs (cm)" Value={data.ivss} md={6} />
              </GridItem>
            ) : null}
            {data.pwd ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="PWd (cm)" Value={data.pwd} md={6} />
              </GridItem>
            ) : null}
            {data.pws ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="PWs (cm)" Value={data.pws} md={6} />
              </GridItem>
            ) : null}
            {data.rwt ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="RWT" Value={data.rwt} md={6} />
              </GridItem>
            ) : null}
            {data.ef ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="EF (%)" Value={data.ef} md={6} />
              </GridItem>
            ) : null}
            {data.fs ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="FS (%)" Value={data.fs} md={6} />
              </GridItem>
            ) : null}
            {data.sv ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="SV (ml)" Value={data.sv} md={6} />
              </GridItem>
            ) : null}
            {data.lv_mass ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="LV mass (gr)" Value={data.lv_mass} md={6} />
              </GridItem>
            ) : null}
            {data.e ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="E (m/s)" Value={data.e} md={6} />
              </GridItem>
            ) : null}
            {data.a ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="A (m/s)" Value={data.a} md={6} />
              </GridItem>
            ) : null}
            {data.e_div_a ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="E/A" Value={data.e_div_a} md={6} />
              </GridItem>
            ) : null}
            {data.aopg ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="AoPG (mmHg)" Value={data.aopg} md={6} />
              </GridItem>
            ) : null}
            {data.pvpg ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="PvPG (mmHg)" Value={data.pvpg} md={6} />
              </GridItem>
            ) : null}
            {data.aortic_stenosisObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Aortic stenosis"
                  Value={
                    data.aortic_stenosisObj ? data.aortic_stenosisObj.Label : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.aortic_regurgitationObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Aortic regurgitation"
                  Value={
                    data.aortic_regurgitationObj
                      ? data.aortic_regurgitationObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.mitral_regurgitationObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Mitral regurgitation"
                  Value={
                    data.mitral_regurgitationObj
                      ? data.mitral_regurgitationObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.tricuspid_stenosisObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Tricuspid stenosis"
                  Value={
                    data.tricuspid_stenosisObj
                      ? data.tricuspid_stenosisObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.aortic_regurgitationObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Tricuspid regurgitation"
                  Value={
                    data.aortic_regurgitationObj
                      ? data.aortic_regurgitationObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.pulmonary_stenosisObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Pulmonary stenosis"
                  Value={
                    data.pulmonary_stenosisObj
                      ? data.pulmonary_stenosisObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.pulmonary_regurgitationObj ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo
                  Label="Pulmonary regurgitation"
                  Value={
                    data.pulmonary_regurgitationObj
                      ? data.pulmonary_regurgitationObj.Label
                      : ""
                  }
                  md={6}
                />
              </GridItem>
            ) : null}
            {data.spap ? (
              <GridItem xs={12} sm={6} md={4}>
                <BaseInfo Label="SPAP (mmHg)" Value={data.spap} md={6} />
              </GridItem>
            ) : null}
            {data.comment ? (
              <GridItem xs={12} sm={12} md={12}>
                <BaseInfo
                  Label="Comment/Suggestive of"
                  Value={data.comment}
                  md={3}
                />
              </GridItem>
            ) : null}
            <GridContainer style={{ width: "100%", margin: 0 }}>
              <GridItem xs={12} sm={12} md={12}>
                <GroupPanel title={t("Advanced echo")}>
                  <GridContainer style={{ width: "100%", margin: 0 }}>
                    {data.lvvold ? (
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo
                          Label="LVVold (ml)"
                          Value={data.lvvold}
                          md={6}
                        />
                      </GridItem>
                    ) : null}
                    {data.lvvols ? (
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo
                          Label="LVVols (ml)"
                          Value={data.lvvols}
                          md={6}
                        />
                      </GridItem>
                    ) : null}
                    {data.rvd ? (
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo Label="RVd (cm)" Value={data.rvd} md={6} />
                      </GridItem>
                    ) : null}
                    {data.ivc ? (
                      <GridItem xs={12} sm={12} md={6}>
                        <BaseInfo Label="IVC" Value={data.ivc} md={6} />
                      </GridItem>
                    ) : null}
                  </GridContainer>
                </GroupPanel>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <GroupPanel title={t("Mitral regurgitation")}>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{ padding: "0 3px" }}
                  >
                    {data.annulus_size_morphObj &&
                    data.annulus_size_morphObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Annulus Size and Morphology"
                        TextField="Label"
                        Values={data.annulus_size_morphObj}
                        md={4}
                      />
                    ) : null}
                    {data.leaflet_mobilityObj &&
                    data.leaflet_mobilityObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Leaflet mobility"
                        TextField="Label"
                        Values={data.leaflet_mobilityObj}
                        md={4}
                      />
                    ) : null}
                    {data.leaf_mob_flailObj &&
                    data.leaf_mob_flailObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Anatomic localization"
                        TextField="Label"
                        Values={data.leaf_mob_flailObj}
                        md={4}
                      />
                    ) : null}
                    {data.leaf_mob_prolapseObj &&
                    data.leaf_mob_prolapseObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Anatomic localization"
                        TextField="Label"
                        Values={data.leaf_mob_prolapseObj}
                        md={4}
                      />
                    ) : null}
                    {data.res_tet_leafletsObj &&
                    data.res_tet_leafletsObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Restricted or Tethered Leaflets"
                        TextField="Label"
                        Values={data.res_tet_leafletsObj}
                        md={4}
                      />
                    ) : null}
                    {data.mitral_stenosisObj &&
                    data.mitral_stenosisObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Mitral Stenosis"
                        TextField="Label"
                        Values={data.mitral_stenosisObj}
                        md={4}
                      />
                    ) : null}
                    {data.carpentier_classObj &&
                    data.carpentier_classObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Carpentier Classification"
                        TextField="Label"
                        Values={data.carpentier_classObj}
                        md={4}
                      />
                    ) : null}
                    {data.submitral_morphObj &&
                    data.submitral_morphObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Submitral morphology"
                        TextField="Label"
                        Values={data.submitral_morphObj}
                        md={4}
                      />
                    ) : null}
                    {data.mr_mrchanismObj && data.mr_mrchanismObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="MR Mrchanism"
                        TextField="Label"
                        Values={data.mr_mrchanismObj}
                        md={4}
                      />
                    ) : null}
                    {data.mr_jetsObj && data.mr_jetsObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="MR Jets"
                        TextField="Label"
                        Values={data.mr_jetsObj}
                        md={4}
                      />
                    ) : null}
                    {data.mr_jet_durObj && data.mr_jet_durObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="MR Jet Duration"
                        TextField="Label"
                        Values={data.mr_jet_durObj}
                        md={4}
                      />
                    ) : null}
                    {data.mr_jet_dirObj && data.mr_jet_dirObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="MR Jet Direction"
                        TextField="Label"
                        Values={data.mr_jet_dirObj}
                        md={4}
                      />
                    ) : null}
                    {data.pul_vein_flow_proObj &&
                    data.pul_vein_flow_proObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Pulmonary Vein Flow Profile"
                        TextField="Label"
                        Values={data.pul_vein_flow_proObj}
                        md={4}
                      />
                    ) : null}
                    {data.mitral_inflow_proObj &&
                    data.mitral_inflow_proObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Mitral Inflow Profile"
                        TextField="Label"
                        Values={data.mitral_inflow_proObj}
                        md={4}
                      />
                    ) : null}
                    {data.vena_contrata_width ? (
                      <BaseInfo
                        Label="Vena Contrata width (mm)"
                        Value={data.vena_contrata_width}
                        md={4}
                      />
                    ) : null}
                    {data.vena_contrata_area ? (
                      <BaseInfo
                        Label="Vena Contrata area (cm^2)"
                        Value={data.vena_contrata_area}
                        md={4}
                      />
                    ) : null}
                    {data.threshold_vals_mrObj &&
                    data.threshold_vals_mrObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Threshold values specific for MR"
                        TextField="Label"
                        Values={data.threshold_vals_mrObj}
                        md={4}
                      />
                    ) : null}
                    {data.left_atrial_sizeObj &&
                    data.left_atrial_sizeObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Left atrial size"
                        TextField="Label"
                        Values={data.left_atrial_sizeObj}
                        md={4}
                      />
                    ) : null}
                    {data.left_vent_sizeObj &&
                    data.left_vent_sizeObj.length > 0 ? (
                      <BaseArrayInfo
                        Label="Left ventricular size"
                        TextField="Label"
                        Values={data.left_vent_sizeObj}
                        md={4}
                      />
                    ) : null}
                    {data.right_vent_sizeObj ? (
                      <BaseInfo
                        Label="Vena Contrata area (cm^2)"
                        Value={data.right_vent_sizeObj.Label}
                        md={4}
                      />
                    ) : null}
                    {data.right_vent_sys_funObj ? (
                      <BaseInfo
                        Label="Right ventricular systolic function"
                        Value={data.right_vent_sys_funObj.Label}
                        md={4}
                      />
                    ) : null}
                    {data.tricus_annulusObj ? (
                      <BaseInfo
                        Label="Tricuspid Annulus"
                        Value={data.tricus_annulusObj.Label}
                        md={4}
                      />
                    ) : null}
                    {data.tricus_valv_regObj ? (
                      <BaseInfo
                        Label="Tricuspid valve regurgitation"
                        Value={data.tricus_valv_regObj.Label}
                        md={4}
                      />
                    ) : null}
                    {data.pa_sys_pressure ? (
                      <BaseInfo
                        Label="PA systolic pressure (mm Hg)"
                        Value={data.pa_sys_pressure}
                        md={4}
                      />
                    ) : null}
                    {data.est_ra_pressure ? (
                      <BaseInfo
                        Label="Estimated RA pressure (mm Hg)"
                        Value={data.est_ra_pressure}
                        md={4}
                      />
                    ) : null}
                  </GridItem>
                </GroupPanel>
              </GridItem>
            </GridContainer>

            <GridItem xs={12} sm={12} md={12}>
              <EchoExamination
                Data={data.ExaminationEchoNotation || null}
                View
              />
            </GridItem>
            {data && data.Files && data.Files.length > 0 ? (
              <GridItem xs={12} sm={12} md={12}>
                <BaseFilesInfo
                  Data={data.Files}
                  Label="File attachment"
                  md={4}
                />
              </GridItem>
            ) : null}
          </GridContainer>
        )}
      </div>
    );
  }
};

// Forward ref and i18n translation
const ForwardedEcho = forwardRef(Echo);
export default ForwardedEcho;
