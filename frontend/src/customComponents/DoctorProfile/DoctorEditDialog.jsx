import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import Helper from "helper";
import BaseField from "baseComponents/BaseField";
import {
  NormalizeEmail,
  NormalizePhone,
  ValidateEmail,
  ValidatePhone,
} from "helper/ContactValidation";
import { useIsCompact } from "helper/useResponsive";
import { setAlert } from "store/reducers/system";
import { colors } from "@/theme/colors";
import { elevation, space } from "@/theme/tokens";
import {
  DialogHeader,
  FormField,
  FormSection,
  OrganizationPicker,
  dialogActionSx,
  dialogPaperSx,
  fieldLabelSx,
} from "customComponents/Profile/profileDialogParts";

/**
 * Admin → Эмч: create or edit a doctor.
 *
 * Replaces Forms/DoctorsProfileForm, which put the old bordered label|input
 * rows (label at 40% width) into a gutterless two-column grid: cramped inputs,
 * two row styles mixed, no grouping, one-line inputs for the long text fields,
 * and every validation error in a popup. This follows ProfileEditDialog -
 * label above field, sections, inline errors - so a doctor's own profile
 * editor and the admin's look like the same product.
 *
 * The save flow is the old form's, unchanged, because the server contract is:
 *   1. Users   - BaseCreate / BaseUpdate (UserName, names, Email, RoleId, AppId)
 *   2. Profile - /DoctorProfile/CustomCreate (id = new Users.Id) or CustomUpdate
 *   3. Photo   - BaseUploadFile against the profile id, if one was chosen
 *
 * DataId: DoctorsProfile.id_data to edit, or null for a new doctor.
 * Config: the DoctorsProfile model config the list page already loaded - the
 * role options come from its RoleId field.
 */

const PROFILE_FIELDS = [
  "personal_number",
  "lastname",
  "firstname",
  "email",
  "telephone",
  "position",
  "profession",
  "professional_degrees",
  "experiences",
];

const Str = (Value) =>
  Value === null || Value === undefined ? "" : String(Value);

function EmptyValues() {
  const Values = { UserName: "", RoleId: "" };
  PROFILE_FIELDS.forEach((Key) => (Values[Key] = ""));
  return Values;
}

function ValuesFrom(Record) {
  const Values = EmptyValues();
  PROFILE_FIELDS.forEach((Key) => (Values[Key] = Str(Record[Key])));
  const Users = Record.Users || {};
  // Users.Email is what password reset mails; the profile copy follows it.
  Values.email = Str(Users.Email || Record.email);
  Values.UserName = Str(Users.UserName);
  Values.RoleId = Str(Users.RoleId);
  return Values;
}

function OrganizationFrom(Record) {
  const Obj = Record.Organization || Record.OrganizationIdObj;
  const Id = Record.OrganizationId || (Obj && Obj.Id) || null;
  return Id ? { Id, Name: (Obj && Obj.Name) || "" } : null;
}

function RoleOptions(Config) {
  const Rows = Config && Array.isArray(Config.Fields) ? Config.Fields : [];
  const Field = Rows.flat().find((F) => F && F.Name === "RoleId");
  return Field && Array.isArray(Field.Data) ? Field.Data : [];
}

export default function DoctorEditDialog({ DataId, Config, OnClose, OnSaved }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const IsCompact = useIsCompact();
  const IsNew = !DataId;

  const [Record, setRecord] = useState(null);
  const [Loading, setLoading] = useState(!IsNew);
  const [Initial, setInitial] = useState(EmptyValues);
  const [Values, setValues] = useState(EmptyValues);
  const [InitialOrg, setInitialOrg] = useState(null);
  const [Organization, setOrganization] = useState(null);
  const [Photo, setPhoto] = useState(null);
  const [Errors, setErrors] = useState({});
  const [Saving, setSaving] = useState(false);
  const [Confirm, setConfirm] = useState(null);

  const Refs = {
    UserName: useRef(null),
    email: useRef(null),
    telephone: useRef(null),
  };
  const PhotoInput = useRef(null);

  const Roles = useMemo(() => RoleOptions(Config), [Config]);

  useEffect(() => {
    if (IsNew) return undefined;
    let Alive = true;
    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: "id_data", Op: "Equals", Value: DataId },
    ];
    Helper.BaseCrudHelper.BaseGetDetail(
      { ObjectName: "DoctorsProfile", SearchOption },
      (resData) => {
        if (!Alive) return;
        setLoading(false);
        if (!resData || !resData.Data) {
          setErrors({
            Form: (resData && resData.Message) || "Алдаа гарлаа",
          });
          return;
        }
        const Row = resData.Data;
        const Loaded = ValuesFrom(Row);
        setRecord(Row);
        setInitial(Loaded);
        setValues(Loaded);
        setInitialOrg(OrganizationFrom(Row));
        setOrganization(OrganizationFrom(Row));
      },
    );
    return () => {
      Alive = false;
    };
  }, [IsNew, DataId]);

  const Changed = useMemo(() => {
    const Result = {};
    Object.keys(Values).forEach((Key) => {
      if (Values[Key].trim() !== Initial[Key].trim())
        Result[Key] = Values[Key].trim();
    });
    const OrgId = Organization ? Organization.Id : null;
    if (OrgId !== (InitialOrg ? InitialOrg.Id : null))
      Result.OrganizationId = OrgId;
    return Result;
  }, [Values, Initial, Organization, InitialOrg]);

  const Dirty = Object.keys(Changed).length > 0 || !!Photo;

  const Bind = (Key) => ({
    value: Values[Key],
    disabled: Saving || Loading,
    onChange: (event) => {
      const Value = event.target.value;
      setValues((Prev) => ({ ...Prev, [Key]: Value }));
      if (Errors[Key] || Errors.Form)
        setErrors((Prev) => ({ ...Prev, [Key]: null, Form: null }));
    },
  });

  const Focus = (Key) => {
    const Ref = Refs[Key];
    Ref && Ref.current && Ref.current.focus();
  };

  const RequestClose = () => {
    if (Saving) return;
    if (!Dirty) return OnClose && OnClose();
    setConfirm(
      Helper.BaseCrudHelper.ShowConfirm(
        "Discard your unsaved changes?",
        () => {
          setConfirm(null);
          OnClose && OnClose();
        },
        () => setConfirm(null),
      ),
    );
  };

  const ChoosePhoto = async (event) => {
    const File = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!File) return;
    if (!/^image\//.test(File.type)) {
      setErrors((Prev) => ({ ...Prev, Photo: "Please choose an image file" }));
      return;
    }
    const FileSrc = await Helper.FileHelper.GetFileSrc(File);
    setPhoto({ FileSrc, File, Type: File.type, FileInfo: { Name: File.name } });
    setErrors((Prev) => ({ ...Prev, Photo: null }));
  };

  const Fail = (Message) => {
    setSaving(false);
    const Text = Message || "Алдаа гарлаа";
    if (/email|имэйл/i.test(Text)) {
      setErrors({ email: Text });
      Focus("email");
    } else if (/phone|утас/i.test(Text)) {
      setErrors({ telephone: Text });
      Focus("telephone");
    } else if (/user ?name|хэрэглэгчийн нэр/i.test(Text)) {
      setErrors({ UserName: Text });
      Focus("UserName");
    } else {
      setErrors({ Form: Text });
    }
  };

  const Finish = () => {
    dispatch(setAlert({ success: true, message: t("Successfully saved") }));
    setSaving(false);
    OnSaved && OnSaved();
  };

  const Validate = () => {
    const Next = {};
    if (!Values.UserName.trim()) Next.UserName = "Хэрэглэгчийн нэр оруулна уу";
    // Email and phone are required on a NEW account; on an edit only a changed
    // value is judged, so a legacy account without them can still be edited.
    if (IsNew || "email" in Changed) {
      const Error = ValidateEmail(Values.email);
      if (Error) Next.email = Error;
    }
    if (IsNew || "telephone" in Changed) {
      const Error = ValidatePhone(Values.telephone);
      if (Error) Next.telephone = Error;
    }
    return Next;
  };

  const Submit = (event) => {
    event.preventDefault();
    if (Saving || Loading || !Dirty) return;

    const Next = Validate();
    setErrors(Next);
    const First = ["UserName", "email", "telephone"].find((Key) => Next[Key]);
    if (First) return Focus(First);

    // What the profile row receives: everything on create, the diff on edit.
    const Profile = {};
    PROFILE_FIELDS.forEach((Key) => {
      if (IsNew ? Values[Key].trim() : Key in Changed)
        Profile[Key] = Values[Key].trim();
    });
    if (IsNew || "OrganizationId" in Changed)
      Profile.OrganizationId = Organization ? Organization.Id : null;
    if ("email" in Profile) Profile.email = NormalizeEmail(Profile.email);
    if ("telephone" in Profile)
      Profile.telephone = NormalizePhone(Profile.telephone);

    const Users = Record && Record.Users;
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal() || {};
    const AppId = (Record && Record.AppId) || LogedUser.AppId || null;
    if (IsNew && AppId) Profile.AppId = AppId;

    const UserData = { UserName: Values.UserName.trim() };
    if (Values.lastname.trim()) UserData.LastName = Values.lastname.trim();
    if (Values.firstname.trim()) UserData.FirstName = Values.firstname.trim();
    if (Profile.email) UserData.Email = Profile.email;
    if (Values.RoleId) UserData.RoleId = parseInt(Values.RoleId, 10);
    if (AppId) UserData.AppId = AppId;

    setSaving(true);

    const SavePhoto = (ProfileId) => {
      if (!Photo || !ProfileId) return Finish();
      Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: "DoctorsProfile",
            LinkedObjectId: ProfileId,
            FieldName: "Files",
          },
          Value: [Photo],
        },
        (resData) =>
          resData && resData.Success === false
            ? Fail(resData.Message || "The photo could not be saved")
            : Finish(),
      );
    };

    const SaveProfile = (UserId) => {
      const Done = (resData) => {
        if (!resData || !resData.Success)
          return Fail(resData && resData.Message);
        const ProfileId =
          (resData.Data && resData.Data.DataId) || DataId || null;
        SavePhoto(ProfileId);
      };
      if (IsNew) {
        Helper.BaseCrudHelper.BaseCreate(
          {
            ObjectName: "DoctorsProfile",
            Url: "/DoctorProfile/CustomCreate",
            Data: { ...Profile, Files: null, id: UserId },
          },
          Done,
        );
      } else {
        Helper.BaseCrudHelper.BaseUpdate(
          {
            ObjectName: "DoctorsProfile",
            Url: "/DoctorProfile/CustomUpdate",
            Data: { ...Profile, Files: null, id_data: DataId, UserId },
          },
          Done,
        );
      }
    };

    if (Users && Users.Id) {
      Helper.BaseCrudHelper.BaseUpdate(
        { ObjectName: "Users", Data: { ...UserData, Id: Users.Id } },
        (resData) =>
          resData && resData.Success
            ? SaveProfile(Users.Id)
            : Fail(resData && resData.Message),
      );
    } else {
      Helper.BaseCrudHelper.BaseCreate(
        { ObjectName: "Users", Data: UserData },
        (resData) => {
          if (!resData || !resData.Success)
            return Fail(resData && resData.Message);
          const UserId =
            resData.Data && (resData.Data.DataId || resData.Data.Id);
          if (!UserId) return Fail();
          SaveProfile(UserId);
        },
      );
    }
  };

  const PhotoSrc = Photo
    ? Photo.FileSrc
    : Record && Array.isArray(Record.Files) && Record.Files.length > 0
      ? Record.Files[0].FileSrc
      : null;
  const Initial1 = (Values.firstname || Values.lastname || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const Error = (Key) => (Errors[Key] ? t(Errors[Key]) : null);
  const Busy = Saving || Loading;

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      fullScreen={IsCompact}
      scroll="paper"
      aria-labelledby="doctor-edit-title"
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        RequestClose();
      }}
      PaperProps={{
        component: "form",
        noValidate: true,
        onSubmit: Submit,
        sx: IsCompact ? {} : dialogPaperSx,
      }}
    >
      {Confirm}
      <DialogHeader
        Icon={MedicalServicesOutlinedIcon}
        Title={IsNew ? t("Шинэ эмч бүртгэх") : t("Эмчийн мэдээлэл засах")}
        Description={t("Fields marked * are required")}
        TitleId="doctor-edit-title"
        OnClose={RequestClose}
        CloseDisabled={Saving}
      />

      <DialogContent
        dividers
        sx={{
          padding: { xs: space[4], sm: space[6] },
          display: "flex",
          flexDirection: "column",
          gap: space[5],
          position: "relative",
        }}
      >
        {Loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {/* Photo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: space[5],
                flexWrap: "wrap",
              }}
            >
              <Avatar
                src={PhotoSrc || undefined}
                alt=""
                sx={{
                  width: 88,
                  height: 88,
                  backgroundColor: colors.brand.cyanInk,
                  color: colors.brand.surface,
                  boxShadow: elevation[2],
                }}
              >
                {PhotoSrc ? null : (
                  <Typography
                    variant="h1"
                    component="span"
                    sx={{ color: "inherit" }}
                  >
                    {Initial1}
                  </Typography>
                )}
              </Avatar>
              <Box>
                <Button
                  type="button"
                  disableElevation
                  disabled={Busy}
                  startIcon={<PhotoCameraOutlinedIcon />}
                  onClick={() =>
                    PhotoInput.current && PhotoInput.current.click()
                  }
                  sx={dialogActionSx("neutral")}
                >
                  {PhotoSrc ? t("Change photo") : t("Зураг оруулах")}
                </Button>
                <input
                  ref={PhotoInput}
                  type="file"
                  accept="image/*"
                  hidden
                  aria-label={t("Change photo")}
                  onChange={ChoosePhoto}
                />
                <Typography
                  variant="caption"
                  component="div"
                  role={Errors.Photo ? "alert" : undefined}
                  sx={{
                    marginTop: space[1],
                    color: Errors.Photo
                      ? colors.status.danger
                      : colors.brand.inkDim,
                  }}
                >
                  {Errors.Photo ? t(Errors.Photo) : t("JPG or PNG image")}
                </Typography>
              </Box>
            </Box>

            <FormSection
              Id="doctor-edit-personal"
              Icon={BadgeOutlinedIcon}
              Title={t("Хувийн мэдээлэл")}
            >
              <FormField
                Id="doctor-edit-lastname"
                Label={t("Last name")}
                autoComplete="off"
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...Bind("lastname")}
              />
              <FormField
                Id="doctor-edit-firstname"
                Label={t("First name")}
                autoComplete="off"
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...Bind("firstname")}
              />
              <FormField
                Id="doctor-edit-personal-number"
                Label={t("Personal number")}
                placeholder="УБ90010101"
                slotProps={{ htmlInput: { maxLength: 20 } }}
                {...Bind("personal_number")}
              />
            </FormSection>

            <FormSection
              Id="doctor-edit-account"
              Icon={LockPersonOutlinedIcon}
              Title={t("Нэвтрэх эрх")}
            >
              <FormField
                Id="doctor-edit-username"
                Label={t("User name")}
                Required
                autoComplete="off"
                inputRef={Refs.UserName}
                Error={Error("UserName")}
                Hint={IsNew ? t("Нэвтрэхэд ашиглана") : null}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...Bind("UserName")}
              />
              <FormField
                Id="doctor-edit-role"
                Label={t("Эрхийн төрөл")}
                select
                {...Bind("RoleId")}
              >
                <MenuItem value="">
                  <em>{t("Сонгоно уу")}</em>
                </MenuItem>
                {Roles.map((Role) => (
                  <MenuItem key={Role.Id} value={String(Role.Id)}>
                    {t(Role.Name)}
                  </MenuItem>
                ))}
              </FormField>
            </FormSection>

            <FormSection
              Id="doctor-edit-contact"
              Icon={ContactMailOutlinedIcon}
              Title={t("Contact")}
            >
              <FormField
                Id="doctor-edit-email"
                Label={t("Email")}
                Required={IsNew}
                type="email"
                autoComplete="off"
                placeholder="name@example.mn"
                inputRef={Refs.email}
                Error={Error("email")}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...Bind("email")}
              />
              <FormField
                Id="doctor-edit-telephone"
                Label={t("Telephone")}
                Required={IsNew}
                type="tel"
                autoComplete="off"
                placeholder="99112233"
                inputRef={Refs.telephone}
                Error={Error("telephone")}
                Hint={t("8 digits, e.g. 99112233")}
                slotProps={{
                  htmlInput: { inputMode: "numeric", maxLength: 12 },
                }}
                {...Bind("telephone")}
              />
            </FormSection>

            <FormSection
              Id="doctor-edit-work"
              Icon={WorkOutlineOutlinedIcon}
              Title={t("Work information")}
            >
              <Box sx={{ minWidth: 0, gridColumn: "1 / -1" }}>
                <FormLabel htmlFor="doctor-edit-organization" sx={fieldLabelSx}>
                  {t("Organization")}
                </FormLabel>
                <OrganizationPicker
                  Id="doctor-edit-organization"
                  Value={Organization}
                  OnChange={setOrganization}
                  Disabled={Busy}
                />
              </Box>
              <FormField
                Id="doctor-edit-position"
                Label={t("Position")}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                {...Bind("position")}
              />
              <FormField
                Id="doctor-edit-profession"
                Label={t("Profession")}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                {...Bind("profession")}
              />
              <FormField
                Id="doctor-edit-degrees"
                Label={t("Professional degrees")}
                multiline
                minRows={2}
                maxRows={5}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                {...Bind("professional_degrees")}
              />
              <FormField
                Id="doctor-edit-experiences"
                Label={t("Experiences")}
                multiline
                minRows={2}
                maxRows={5}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                {...Bind("experiences")}
              />
            </FormSection>

            <FormSection
              Id="doctor-edit-departments"
              Icon={AccountTreeOutlinedIcon}
              Title={t("Departments")}
            >
              <Box sx={{ minWidth: 0, gridColumn: "1 / -1" }}>
                {IsNew ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.brand.inkDim,
                      padding: space[3],
                      borderRadius: "8px",
                      backgroundColor: colors.brand.tint,
                    }}
                  >
                    {t("Эмчийг хадгалсны дараа тасаг нэмэх боломжтой.")}
                  </Typography>
                ) : (
                  <BaseField
                    DataId={DataId}
                    Config={{
                      Name: "Departments",
                      Label: t("Departments"),
                      Type: "ListView",
                      Config: {
                        ObjectName: "DoctorTooDepartment",
                        Fields: ["dico", "value"],
                        ForiegnKey: "DoctorId",
                      },
                    }}
                  />
                )}
              </Box>
            </FormSection>
          </>
        )}

        {Errors.Form ? (
          <Typography
            variant="body2"
            role="alert"
            sx={{ color: colors.status.danger }}
          >
            {t(Errors.Form)}
          </Typography>
        ) : null}
      </DialogContent>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[3],
          padding: { xs: space[4], sm: `${space[4]} ${space[6]}` },
        }}
      >
        {Dirty ? (
          <Box
            role="status"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: space[2],
              color: colors.brand.inkMuted,
              minWidth: 0,
            }}
          >
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.brand.cyan,
              }}
            />
            <Typography
              variant="body2"
              component="span"
              sx={{ color: "inherit" }}
            >
              {t("Unsaved changes")}
            </Typography>
          </Box>
        ) : null}
        <Box sx={{ marginLeft: "auto", display: "flex", gap: space[2] }}>
          <Button
            type="button"
            disableElevation
            disabled={Saving}
            onClick={RequestClose}
            sx={dialogActionSx("neutral")}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            disableElevation
            disabled={Busy || !Dirty}
            startIcon={
              Saving ? <CircularProgress size={14} color="inherit" /> : null
            }
            sx={dialogActionSx("primary")}
          >
            {IsNew ? t("Бүртгэх") : t("Save")}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
