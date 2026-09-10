// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
// custom components
import BaseSelectSingle from "baseComponents/Controls/BaseSelectSingle";
import BaseSelectSingleLoad from "baseComponents/Controls/BaseSelectSingleLoad";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseRadioBox from "baseComponents/Controls/BaseRadioBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseGridLookUp from "baseComponents/Controls/BaseGridLookUp";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseCheckBoxSingle from "baseComponents/Controls/BaseCheckBoxSingle";
import BaseCrudManager from "baseComponents/BaseCrudManager";
import BaseSelectMultiple from "baseComponents/Controls/BaseSelectMultiple";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import BaseImageSingle from "baseComponents/Controls/BaseImageSingle";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  labelSize,
  inputSize,
} from "customComponents/BaseEditControls/fieldRowStyles";
import { IconButton } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import React, { useRef } from "react";
// helper
import Helper from "helper";

const labelHorizontalSx = {
  color: "#75736c",
  fontSize: "14px",
  fontWeight: "400",
  lineHeight: "1",
  margin: 0,
  padding: 0,
  textAlign: "left",
};

export default function BaseField(props) {
  const { t } = useTranslation();
  const listViewRef = useRef(null);
  const generatedId = React.useId();
  const {
    Config = null,
    Value = "",
    DataId = null,
    disabled: disabledProp = false,
    WithLabel = true,
    md = 4.8,
    boxMd = 12,
    ChangeValue,
    LabelWidth,
    borderColor = "#eee",
    isLast,
    ObjectName,
    Id,
    FullWidth = true,
    FullHeight = false,
  } = props;

  // A field descriptor can now disable itself. renderDetailViewFields renders
  // fields generically and never passes `disabled`, so before this there was no
  // way to lock ONE field on a config-driven form without hand-writing its JSX
  // - and `EditField: false` is the wrong tool, because that removes the field
  // from the form rather than showing it read-only.
  const disabled = disabledProp || (Config && Config.Disabled === true);

  // One id per rendered field. It is handed to the control so the control can
  // put it on its real <input>, and to the <FormLabel> as htmlFor. Controls
  // that are groups (radio / checkbox lists) have no single input for htmlFor
  // to point at, so they get LabelledBy and name themselves with
  // aria-labelledby instead.
  const controlId = Id || generatedId;
  const labelId = controlId + "-label";

  if (!Config) return null;
  const effectiveMd = Math.min(
    11,
    Math.max(1, LabelWidth ? Math.round((LabelWidth / 100) * 12) : md),
  );

  const onChange = (value) => ChangeValue && ChangeValue(Config.Name, value);

  // Wrapper function to add bordered container layout
  // useFixedHeight: true for controls that need 30px height (BaseTextField, BaseDate, BaseCheckBoxSingle,
  // BaseSelectMultiple, BaseSelectSingle, BaseSelectSingleLoad, BaseLookUpGrid, BaseLookUpGridLoad, BaseFileUpload)
  const WrapWithBorderedLayout = (
    control,
    showLabel = true,
    useFixedHeight = true,
    // true when the control is a group (radio / checkbox list) that has no
    // single <input> for htmlFor to point at.
    isGroup = false,
  ) => {
    // Height belongs to the ROW, not to the cells. It used to be spread into
    // all three (container + label cell + control cell) as a flat
    // `height: 32px`, which is what stopped the cells stacking on a phone:
    // they were told to go full width and then capped at one row's height, so
    // the control landed on top of its own label. `fieldRowSx` makes the row
    // auto-height below `sm` and keeps the fixed height from `sm` up.
    const rowSx = (theme) =>
      fieldRowSx(theme, {
        borderColor,
        fixedHeight: useFixedHeight,
        fullHeight: FullHeight,
      });

    const translatedLabel = Config?.Label ? t(Config.Label) : "";
    const isRegistration =
      Config?.Name?.toLowerCase().includes("registration") ||
      Config?.Name?.toLowerCase().includes("p_registration") ||
      Config?.Label?.toLowerCase().includes("register") ||
      Config?.Label?.toLowerCase().includes("personal") ||
      translatedLabel.includes("Регистерийн дугаар") ||
      translatedLabel.includes("РД");
    const bottomLineStyle = isRegistration
      ? { borderBottom: "2px solid #75736c" }
      : {};

    const optionTypeLastStyle =
      ObjectName === "OptionTypes" && isLast
        ? { borderBottom: "1px solid #ddd" }
        : {};

    return (
      <GridContainer
        sx={(theme) => ({
          ...rowSx(theme),
          margin: 0,
          borderRadius: "0px",
          marginTop: "-1px",
          backgroundColor: "#fff",
          transition: "border-color 0.15s ease-in-out",
          ...bottomLineStyle,
          ...optionTypeLastStyle,

          /* SAME AS BaseTextField */
          "&:hover": {
            borderColor: borderColor,
          },
          "&:focus-within": {
            borderColor: borderColor,
          },
        })}
      >
        {showLabel && (
          <GridItem
            {...labelSize(effectiveMd)}
            sx={(theme) =>
              labelCellSx(theme, { borderColor, fullHeight: FullHeight })
            }
          >
            <FormLabel
              id={labelId}
              {...(isGroup ? { component: "span" } : { htmlFor: controlId })}
              sx={labelHorizontalSx}
            >
              {Config?.Label
                ? t(Config.Label) + ":" + (Config.Required ? " *" : "")
                : ""}
            </FormLabel>
          </GridItem>
        )}

        <GridItem
          {...inputSize(effectiveMd, showLabel)}
          sx={{
            ...inputCellSx({ fullHeight: FullHeight }),
            p: 0,

            /* REMOVE INNER BORDERS */
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
            "& .MuiInputBase-root": {
              height: "100%",
            },
          }}
        >
          {control}
        </GridItem>
      </GridContainer>
    );
  };

  if (Config.Type === "ListView" && Config.Config) {
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    if (
      Array.isArray(Config.Config.DataFilter) &&
      Config.Config.DataFilter.length > 0
    ) {
      SearchOption.SearchField.push(...Config.Config.DataFilter);
      SearchOption.SearchField.push(Config.Config.DataFilter[0]);
    }
    //  SearchOption.SearchField.push(Config.Config.DataFilter[0]);
    var NewObject = {};
    if (DataId) {
      NewObject = { [Config.Config.ForiegnKey]: DataId };
      SearchOption.SearchField.push({
        Field: Config.Config.ForiegnKey,
        Value: DataId,
        Op: "Equals",
      });
    } else {
      SearchOption.SearchField.push({
        Field: Config.Config.ForiegnKey,
        Value: "-1",
        Op: "Equals",
      });
    }
    if (
      Config.Config.ObjectName === "LookupDoctorTeam" ||
      Config.Config.ObjectName === "DoctorsTeamPatient"
    ) {
      SearchOption.SearchField.push({
        Field: "rec_status",
        Value: "2",
        Op: "NotEquals",
      });
    }
    let GridRowActions = [];
    if (Config.Config.ObjectName === "LookupDoctorTeam") {
      GridRowActions.push({
        Component: (
          <IconButton
            style={{ padding: "6px", margin: "-6px", color: "red" }}
            title={t("Remove")}
          >
            <RemoveCircleIcon fontSize="small" />
          </IconButton>
        ),
        onClick: (data) => {
          const resolvedDoctorId =
            data.doctor_id ||
            data.DoctorId ||
            data?.Users?.id_data ||
            data?.Doctor?.id_data;
          const resolvedTeamId = DataId || data.team_id || data.TeamId;
          console.log("[RemoveDoctor] row data:", data, "resolved:", {
            resolvedDoctorId,
            resolvedTeamId,
          });
          if (!resolvedDoctorId || !resolvedTeamId) {
            console.error("Missing doctor data:", {
              resolvedDoctorId,
              resolvedTeamId,
              rawData: data,
            });
            listViewRef.current?.ShowAlert(
              "Эмчийн мэдээлэл олдсонгүй (console дээр дэлгэрэнгүй)",
              false,
            );
            return;
          }
          listViewRef.current?.ShowConfirm(
            t("Remove participant confirm") ||
              "Багаас гаргахдаа итгэлтэй байна уу?",
            async () => {
              await Helper.DoctorTeamHelper.RemoveDoctor(
                {
                  doctor_id: resolvedDoctorId,
                  team_id: resolvedTeamId,
                  id_data: data.id_data,
                },
                (resData) => {
                  listViewRef.current?.ShowAlert(
                    resData?.Message || "Амжилттай",
                    resData?.Success,
                  );
                  if (resData?.Success) {
                    listViewRef.current?.BaseListRef?.current?.GetData?.();
                  }
                },
              );
            },
          );
        },
      });
    } else if (Config.Config.ObjectName === "DoctorsTeamPatient") {
      GridRowActions.push({
        Component: (
          <IconButton
            style={{ padding: "6px", margin: "-6px", color: "red" }}
            title={t("Remove")}
          >
            <RemoveCircleIcon fontSize="small" />
          </IconButton>
        ),
        onClick: (data) => {
          const resolvedPatientId =
            data.patient_id ||
            data.PatientId ||
            data?.Patient?.id_data ||
            data?.Patient?.id ||
            null;
          const resolvedTeamId = DataId || data.team_id || data.TeamId || null;
          console.log("[RemovePatient] row data:", data, "resolved:", {
            resolvedPatientId,
            resolvedTeamId,
          });
          if (!resolvedPatientId || !resolvedTeamId) {
            console.error("Missing patient data:", {
              resolvedPatientId,
              resolvedTeamId,
              rawData: data,
            });
            listViewRef.current?.ShowAlert(
              "Өвчтөний мэдээлэл олдсонгүй (console дээр дэлгэрэнгүй)",
              false,
            );
            return;
          }
          listViewRef.current?.ShowConfirm(
            t("Remove participant confirm") ||
              "Багаас гаргахдаа итгэлтэй байна уу?",
            async () => {
              await Helper.DoctorTeamHelper.RemovePatient(
                {
                  patient_id: resolvedPatientId,
                  team_id: resolvedTeamId,
                  DoctorsTeamPatientId: data.id_data,
                },
                (resData) => {
                  listViewRef.current?.ShowAlert(
                    resData?.Message || "Амжилттай",
                    resData?.Success,
                  );
                  if (resData?.Success) {
                    listViewRef.current?.BaseListRef?.current?.GetData?.();
                  }
                },
              );
            },
          );
        },
      });
    }

    return (
      <div
        style={{
          height: FullHeight
            ? "100%"
            : Config.Height || Config.Config?.Height || "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        <BaseCrudManager
          ref={listViewRef}
          ObjectName={Config.Config.ObjectName}
          SearchOption={SearchOption}
          NewObject={NewObject}
          HideNew={Config.HideNew}
          rootObject={false}
          extraActions={props.MasterSaveAction}
          GridRowActions={
            GridRowActions.length > 0 ? GridRowActions : undefined
          }
        />
      </div>
    );
  }

  if (Config.Type === "Text") {
    return WrapWithBorderedLayout(
      <BaseTextField
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
        FullWidth={FullWidth}
      />,
    );
  }

  if (Config.Type === "Number") {
    return WrapWithBorderedLayout(
      <BaseTextField
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "Password") {
    return WrapWithBorderedLayout(
      <BaseTextField
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "InputMask") {
    return WrapWithBorderedLayout(
      <BaseInputMask
        disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
        FullWidth={FullWidth}
      />,
    );
  }

  if (Config.Type === "TextArea") {
    return WrapWithBorderedLayout(
      <BaseTextArea
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
        FullWidth={FullWidth}
      />,
      true,
      false, // TextArea should not have fixed height
    );
  }

  if (Config.Type === "Date") {
    return WrapWithBorderedLayout(
      <BaseDate
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "Radio") {
    return WrapWithBorderedLayout(
      <BaseRadio
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        LabelledBy={labelId}
      />,
      true,
      true,
      true,
    );
  }

  if (Config.Type === "CheckBox") {
    return WrapWithBorderedLayout(
      <BaseCheckBox
        Disabled={disabled}
        Value={Value}
        Config={Config}
        ChangeValue={(name, val) => onChange(val)}
        WithLabel={false}
        HideLabel={true}
        md={md}
        boxMd={boxMd}
      />,
      false,
      false, // CheckBox should not have fixed height
      true,
    );
  }

  if (Config.Type === "SingleCheckBox") {
    return WrapWithBorderedLayout(
      <BaseCheckBoxSingle
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        LabelledBy={labelId}
      />,
      true,
      true,
      true,
    );
  }

  if (Config.Type === "RadioBox") {
    return WrapWithBorderedLayout(
      <BaseRadioBox
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        LabelledBy={labelId}
      />,
      true,
      false, // RadioBox should not have fixed height
      true,
    );
  }

  if (Config.Type === "MultipleSelect") {
    return WrapWithBorderedLayout(
      <BaseSelectMultiple
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "SingleSelect") {
    return WrapWithBorderedLayout(
      <BaseSelectSingle
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "SingleSelectLoad") {
    return WrapWithBorderedLayout(
      <BaseSelectSingleLoad
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "GridLookUpSingle") {
    return WrapWithBorderedLayout(
      <BaseGridLookUp
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "GridLookUpSingleLoad") {
    return WrapWithBorderedLayout(
      <BaseLookUpGridLoad
        Value={Value}
        Config={Config}
        InitialText={Config.InitialText || ""}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
    );
  }

  if (Config.Type === "File") {
    return WrapWithBorderedLayout(
      <BaseFileUpload
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        WithLabel={false}
        HideLabel={true}
        md={md}
        Id={controlId}
      />,
      true,
      false, // Use flexible height to fit the button
    );
  }

  if (Config.Type === "SingleImage") {
    return (
      <BaseImageSingle
        Value={Value}
        Config={Config}
        ChangeValue={onChange}
        square
        FullWidth={false}
        Id={controlId}
      />
    );
  }

  return null;
}
