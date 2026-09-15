import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormLabel from "@mui/material/FormLabel";
import Typography from "@mui/material/Typography";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import Helper from "helper";
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
import { CONTACT_UPDATED_EVENT } from "customComponents/Profile/ContactInfoPrompt";
import {
  DialogHeader,
  FormField,
  FormSection,
  OrganizationPicker,
  dialogActionSx,
  dialogPaperSx,
  fieldLabelSx,
} from "customComponents/Profile/profileDialogParts";

// DoctorsProfile columns this dialog edits. Only the ones that changed are
// sent (the server judges email/phone only when they are sent).
const TEXT_FIELDS = [
  "lastname",
  "firstname",
  "personal_number",
  "email",
  "telephone",
  "skype",
  "position",
  "profession",
  "professional_degrees",
  "experiences",
];

const Str = (Value) =>
  Value === null || Value === undefined ? "" : String(Value);

function InitialValues(Profile) {
  const Values = {};
  TEXT_FIELDS.forEach((Key) => (Values[Key] = Str(Profile[Key])));
  // Users.Email is what password reset mails; the profile copy follows it.
  Values.email = Str((Profile.Users && Profile.Users.Email) || Profile.email);
  return Values;
}

function InitialOrganization(Profile) {
  const Obj = Profile.OrganizationIdObj;
  const Id = Profile.OrganizationId || (Obj && Obj.Id) || null;
  return Id ? { Id, Name: (Obj && Obj.Name) || "" } : null;
}

/**
 * Edit your own profile. Mount while visible.
 * Profile: the object GetDoctorsProfileInfo returns.
 */
export default function ProfileEditDialog({ Profile, OnClose, OnSaved }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const IsCompact = useIsCompact();

  const [Initial] = useState(() => InitialValues(Profile));
  const [InitialOrg] = useState(() => InitialOrganization(Profile));
  const [Values, setValues] = useState(Initial);
  const [Organization, setOrganization] = useState(InitialOrg);
  const [Photo, setPhoto] = useState(null);
  const [Errors, setErrors] = useState({});
  const [Saving, setSaving] = useState(false);
  const [Confirm, setConfirm] = useState(null);
  const EmailRef = useRef(null);
  const PhoneRef = useRef(null);
  const PhotoInput = useRef(null);
  // Only ever called from event handlers, never during render.
  const Focus = (Key) => {
    const Ref = Key === "email" ? EmailRef : PhoneRef;
    Ref.current && Ref.current.focus();
  };

  const Changed = useMemo(() => {
    const Result = {};
    TEXT_FIELDS.forEach((Key) => {
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
    disabled: Saving,
    onChange: (event) => {
      const Value = event.target.value;
      setValues((Prev) => ({ ...Prev, [Key]: Value }));
      if (Errors[Key] || Errors.Form)
        setErrors((Prev) => ({ ...Prev, [Key]: null, Form: null }));
    },
  });

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
    if (/email/i.test(Text)) {
      setErrors({ email: Text });
      Focus("email");
    } else if (/phone/i.test(Text)) {
      setErrors({ telephone: Text });
      Focus("telephone");
    } else {
      setErrors({ Form: Text });
    }
  };

  const Finish = (Data) => {
    // Keep the stored session in step: the navbar shows the first name, and
    // the contact prompt reads the email and phone.
    const Names = {};
    if ("lastname" in Data) Names.lastname = Data.lastname;
    if ("firstname" in Data) Names.firstname = Data.firstname;
    if (Object.keys(Names).length > 0)
      Helper.AuthHelper.StoreDoctorFields(Names);
    Helper.AuthHelper.RefreshContact();

    dispatch(setAlert({ success: true, message: t("Successfully saved") }));
    window.dispatchEvent(new window.CustomEvent(CONTACT_UPDATED_EVENT));
    setSaving(false);
    OnSaved && OnSaved();
  };

  const Submit = (event) => {
    event.preventDefault();
    if (Saving || !Dirty) return;

    // Both are required on every account now (a legacy account without them is
    // asked to add them here too).
    const Next = {};
    const EmailError = ValidateEmail(Values.email);
    if (EmailError) Next.email = EmailError;
    const PhoneError = ValidatePhone(Values.telephone);
    if (PhoneError) Next.telephone = PhoneError;
    setErrors(Next);
    const First = ["email", "telephone"].find((Key) => Next[Key]);
    if (First) return Focus(First);

    const Data = { ...Changed };
    if ("email" in Data) Data.email = NormalizeEmail(Data.email);
    if ("telephone" in Data) Data.telephone = NormalizePhone(Data.telephone);

    setSaving(true);
    const SavePhoto = () => {
      if (!Photo) return Finish(Data);
      Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: "DoctorsProfile",
            LinkedObjectId: Profile.id_data,
            FieldName: "Files",
          },
          Value: [Photo],
        },
        (resData) =>
          resData && resData.Success === false
            ? Fail(resData.Message || "The photo could not be saved")
            : Finish(Data),
      );
    };

    if (Object.keys(Data).length === 0) return SavePhoto();
    Helper.BaseCrudHelper.BaseUpdate(
      {
        ObjectName: "DoctorsProfile",
        Data: { ...Data, id_data: Profile.id_data, Files: null },
      },
      (resData) =>
        resData && resData.Success
          ? SavePhoto()
          : Fail(resData && resData.Message),
    );
  };

  const PhotoSrc = Photo
    ? Photo.FileSrc
    : Profile.Files && Profile.Files.length > 0
      ? Profile.Files[0].FileSrc
      : null;
  const Initial1 = (Values.firstname || Values.lastname || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const Error = (Key) => (Errors[Key] ? t(Errors[Key]) : null);

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      fullScreen={IsCompact}
      scroll="paper"
      aria-labelledby="profile-edit-title"
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
        Icon={EditOutlinedIcon}
        Title={t("Edit Profile")}
        Description={t("Fields marked * are required")}
        TitleId="profile-edit-title"
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
        }}
      >
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
              disabled={Saving}
              startIcon={<PhotoCameraOutlinedIcon />}
              onClick={() => PhotoInput.current && PhotoInput.current.click()}
              sx={dialogActionSx("neutral")}
            >
              {t("Change photo")}
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
          Id="profile-edit-personal"
          Icon={BadgeOutlinedIcon}
          Title={t("Хувийн мэдээлэл")}
        >
          <FormField
            Id="profile-edit-lastname"
            Label={t("Last name")}
            autoComplete="family-name"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            {...Bind("lastname")}
          />
          <FormField
            Id="profile-edit-firstname"
            Label={t("First name")}
            autoComplete="given-name"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            {...Bind("firstname")}
          />
          <FormField
            Id="profile-edit-personal-number"
            Label={t("Personal number")}
            slotProps={{ htmlInput: { maxLength: 20 } }}
            {...Bind("personal_number")}
          />
        </FormSection>

        <FormSection
          Id="profile-edit-contact"
          Icon={ContactMailOutlinedIcon}
          Title={t("Contact")}
        >
          <FormField
            Id="profile-edit-email"
            Label={t("Email")}
            Required
            type="email"
            autoComplete="email"
            placeholder="name@example.mn"
            inputRef={EmailRef}
            Error={Error("email")}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            {...Bind("email")}
          />
          <FormField
            Id="profile-edit-telephone"
            Label={t("Telephone")}
            Required
            type="tel"
            autoComplete="tel"
            placeholder="99112233"
            inputRef={PhoneRef}
            Error={Error("telephone")}
            Hint={t("8 digits, e.g. 99112233")}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 12 } }}
            {...Bind("telephone")}
          />
          <FormField
            Id="profile-edit-skype"
            Label={t("Skype")}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            {...Bind("skype")}
          />
        </FormSection>

        <FormSection
          Id="profile-edit-work"
          Icon={WorkOutlineOutlinedIcon}
          Title={t("Work information")}
        >
          <Box sx={{ minWidth: 0 }}>
            <FormLabel htmlFor="profile-edit-organization" sx={fieldLabelSx}>
              {t("Organization")}
            </FormLabel>
            <OrganizationPicker
              Id="profile-edit-organization"
              Value={Organization}
              OnChange={setOrganization}
              Disabled={Saving}
            />
          </Box>
          <FormField
            Id="profile-edit-position"
            Label={t("Position")}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            {...Bind("position")}
          />
          <FormField
            Id="profile-edit-profession"
            Label={t("Profession")}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            {...Bind("profession")}
          />
          <FormField
            Id="profile-edit-degrees"
            Label={t("Professional degrees")}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            {...Bind("professional_degrees")}
          />
          <FormField
            Id="profile-edit-experiences"
            Label={t("Experiences")}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            {...Bind("experiences")}
          />
        </FormSection>

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
            disabled={Saving || !Dirty}
            startIcon={
              Saving ? <CircularProgress size={14} color="inherit" /> : null
            }
            sx={dialogActionSx("primary")}
          >
            {t("Save")}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
