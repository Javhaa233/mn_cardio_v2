import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import ChangePasswordDialog from "customComponents/Profile/ChangePasswordDialog";
import ProfileEditDialog from "customComponents/Profile/ProfileEditDialog";
import {
  CONTACT_UPDATED_EVENT,
  ContactInfoDialog,
} from "customComponents/Profile/ContactInfoPrompt";
import Helper from "helper";
import { colors } from "@/theme/colors";
import { elevation, radius, space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

const IsBlank = (Value) =>
  Value === null || Value === undefined || String(Value).trim() === "";

const buttonSx = (rank) => ({ ...gridToolbarButtonSx[rank], height: "34px" });

const sectionGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
  gap: space[4],
  alignItems: "start",
};

/**
 * One titled block of label/value rows.
 *
 * A definition list on a CSS grid, not a <table>: `_misc.scss` styles bare
 * tables at element level across ~72 routes. Rows collapse to label-over-value
 * below `sm`.
 */
function ProfileSection({ Icon, Title, Rows }) {
  const { t } = useTranslation();
  return (
    <Box
      component="section"
      aria-label={t(Title)}
      sx={{
        minWidth: 0,
        overflow: "hidden",
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.md,
        boxShadow: elevation[1],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[2],
          padding: `${space[3]} ${space[4]}`,
          backgroundColor: colors.brand.tint,
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 20, color: colors.brand.cyanInk }} />
        <Typography
          variant="h5"
          component="div"
          sx={{ color: colors.brand.ink }}
        >
          {t(Title)}
        </Typography>
      </Box>
      <Box component="dl" sx={{ margin: 0 }}>
        {Rows.map((Row) => (
          <Box
            key={Row.Label}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "190px minmax(0, 1fr)" },
              columnGap: space[4],
              rowGap: space[1],
              alignItems: "center",
              padding: `${space[3]} ${space[4]}`,
              borderBottom: `1px solid ${colors.brand.hairline}`,
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Box
              component="dt"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: space[2],
                minWidth: 0,
                color: colors.brand.inkDim,
              }}
            >
              <Row.Icon aria-hidden sx={{ fontSize: 18 }} />
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "inherit" }}
              >
                {t(Row.Label)}
              </Typography>
            </Box>
            <Box component="dd" sx={{ margin: 0, minWidth: 0 }}>
              {IsBlank(Row.Value) ? (
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    fontStyle: "italic",
                    // A missing REQUIRED value reads as a gap to fill, not as
                    // neutral empty space.
                    color: Row.Required
                      ? colors.brand.cyanInk
                      : colors.brand.inkDim,
                  }}
                >
                  {t("Not filled")}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    color: colors.brand.ink,
                    fontWeight: 500,
                    overflowWrap: "anywhere",
                  }}
                >
                  {Row.Value}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Same footprint as the loaded page, so nothing jumps when data arrives. */
function ProfileSkeleton() {
  return (
    <Box
      aria-busy="true"
      sx={{ display: "flex", flexDirection: "column", gap: space[4] }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[5],
          padding: space[6],
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: radius.md,
        }}
      >
        <Skeleton variant="circular" width={88} height={88} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="45%" height={34} />
          <Skeleton width="30%" />
          <Skeleton width="55%" />
        </Box>
      </Box>
      <Box sx={sectionGridSx}>
        <Skeleton variant="rounded" height={190} />
        <Skeleton variant="rounded" height={330} />
      </Box>
    </Box>
  );
}

function MetaItem({ Icon, children }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: space[1],
        minWidth: 0,
        color: colors.brand.inkMuted,
      }}
    >
      <Icon aria-hidden sx={{ fontSize: 18 }} />
      <Typography
        variant="body2"
        component="span"
        sx={{ color: "inherit", overflowWrap: "anywhere" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export default function General() {
  const { t } = useTranslation();
  const [Data, setData] = useState(null);
  const [IsLoading, setIsLoading] = useState(
    () => !!Helper.AuthHelper.GetLogedDoctorLocal(),
  );
  const [LoadFailed, setLoadFailed] = useState(false);
  // Which dialog is open: "edit" | "password" | "contact" | null.
  const [OpenDialog, setOpenDialog] = useState(null);
  const CloseDialog = () => setOpenDialog(null);

  const FetchProfile = useCallback(async () => {
    const Doctor = Helper.AuthHelper.GetLogedDoctorLocal();
    if (!Doctor) return;
    await Helper.DoctorsProfileHelper.GetDoctorsProfileInfo(
      Doctor.id_data,
      (resData) => {
        setIsLoading(false);
        if (resData && resData.Success && resData.Data) {
          setData(resData.Data);
          setLoadFailed(false);
        } else {
          setLoadFailed(true);
        }
      },
    );
  }, []);

  useEffect(() => {
    FetchProfile();
    // The contact prompt can save from anywhere in the app.
    window.addEventListener(CONTACT_UPDATED_EVENT, FetchProfile);
    return () =>
      window.removeEventListener(CONTACT_UPDATED_EVENT, FetchProfile);
  }, [FetchProfile]);

  if (IsLoading) return <ProfileSkeleton />;

  if (!Data) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space[3],
          padding: space[10],
        }}
      >
        <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
          {t(LoadFailed ? "Could not load the profile" : "No data")}
        </Typography>
        {LoadFailed ? (
          <Button
            disableElevation
            onClick={FetchProfile}
            sx={buttonSx("neutral")}
          >
            {t("Retry")}
          </Button>
        ) : null}
      </Box>
    );
  }

  // Users.Email is what password reset mails; the profile copy follows it.
  const Email = (Data.Users && Data.Users.Email) || Data.email || "";
  const Phone = Data.telephone || "";
  const EmailMissing = IsBlank(Data.Users ? Data.Users.Email : Data.email);
  const PhoneMissing = IsBlank(Phone);

  const FullName = [Data.lastname, Data.firstname].filter(Boolean).join(" ");
  const Initial = (Data.firstname || Data.lastname || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const Photo =
    Data.Files && Data.Files.length > 0 ? Data.Files[0].FileSrc : null;
  const Organization = Data.OrganizationIdObj
    ? Data.OrganizationIdObj.Name
    : "";
  const UserName = Data.Users ? Data.Users.UserName : "";
  const Role = [Data.position, Data.profession].filter(Boolean).join(" · ");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: space[4],
        width: "100%",
        maxWidth: "1200px",
        marginX: "auto",
        padding: { xs: space[1], md: space[2] },
        boxSizing: "border-box",
      }}
    >
      {/* Each dialog refreshes this page itself (CONTACT_UPDATED_EVENT). */}
      {OpenDialog === "edit" ? (
        <ProfileEditDialog
          Profile={Data}
          OnClose={CloseDialog}
          OnSaved={CloseDialog}
        />
      ) : null}
      {OpenDialog === "password" ? (
        <ChangePasswordDialog OnClose={CloseDialog} />
      ) : null}
      {OpenDialog === "contact" ? (
        <ContactInfoDialog
          Initial={{ Email, Phone }}
          Missing={{ Email: EmailMissing, Phone: PhoneMissing }}
          LaterLabel="Cancel"
          OnLater={CloseDialog}
          OnSaved={CloseDialog}
        />
      ) : null}

      {/* Identity */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: space[5],
          padding: { xs: space[4], md: space[6] },
          backgroundColor: colors.brand.surface,
          backgroundImage: `linear-gradient(120deg, ${colors.brand.tint} 0%, transparent 65%)`,
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: radius.md,
          boxShadow: elevation[1],
        }}
      >
        <Avatar
          src={Photo || undefined}
          alt={FullName}
          sx={{
            width: 88,
            height: 88,
            flexShrink: 0,
            backgroundColor: colors.brand.cyanInk,
            color: colors.brand.surface,
            border: `3px solid ${colors.brand.surface}`,
            boxShadow: elevation[2],
          }}
        >
          {Photo ? null : (
            <Typography variant="h1" component="span" sx={{ color: "inherit" }}>
              {Initial || <AccountCircleOutlinedIcon sx={{ fontSize: 48 }} />}
            </Typography>
          )}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{ color: colors.brand.ink, overflowWrap: "anywhere" }}
          >
            {FullName || UserName}
          </Typography>
          {Role ? (
            <Typography
              variant="body1"
              sx={{ color: colors.brand.inkMuted, marginTop: space[1] }}
            >
              {Role}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              columnGap: space[5],
              rowGap: space[1],
              marginTop: space[3],
            }}
          >
            {Organization ? (
              <MetaItem Icon={BusinessOutlinedIcon}>{Organization}</MetaItem>
            ) : null}
            {UserName ? (
              <MetaItem Icon={AccountCircleOutlinedIcon}>{UserName}</MetaItem>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: space[2],
            marginLeft: { sm: "auto" },
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          <Button
            disableElevation
            startIcon={<EditOutlinedIcon />}
            onClick={() => setOpenDialog("edit")}
            sx={buttonSx("primary")}
          >
            {t("Edit")}
          </Button>
          <Button
            disableElevation
            startIcon={<LockOutlinedIcon />}
            onClick={() => setOpenDialog("password")}
            sx={buttonSx("neutral")}
          >
            {t("Change password")}
          </Button>
        </Box>
      </Box>

      {/* Contact completeness - the same gap the post-login prompt asks about */}
      {EmailMissing || PhoneMissing ? (
        <Box
          role="status"
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: space[3],
            padding: `${space[3]} ${space[4]}`,
            backgroundColor: colors.brand.tint,
            borderLeft: `4px solid ${colors.brand.cyan}`,
            borderRadius: radius.sm,
          }}
        >
          <InfoOutlinedIcon
            aria-hidden
            sx={{ fontSize: 24, color: colors.brand.cyanInk }}
          />
          <Box sx={{ flex: 1, minWidth: "220px" }}>
            <Typography
              variant="body2"
              sx={{ color: colors.brand.ink, fontWeight: 600 }}
            >
              {t("Your contact details are incomplete")}
              {": "}
              {[EmailMissing && t("Email"), PhoneMissing && t("Telephone")]
                .filter(Boolean)
                .join(", ")}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
              {t(
                "Password recovery links and system notifications are sent to these.",
              )}
            </Typography>
          </Box>
          <Button
            disableElevation
            onClick={() => setOpenDialog("contact")}
            sx={buttonSx("primary")}
          >
            {t("Fill in")}
          </Button>
        </Box>
      ) : null}

      <Box sx={sectionGridSx}>
        <ProfileSection
          Icon={ContactMailOutlinedIcon}
          Title="Contact"
          Rows={[
            {
              Label: "Email",
              Icon: MailOutlineOutlinedIcon,
              Value: Email,
              Required: true,
            },
            {
              Label: "Telephone",
              Icon: PhoneOutlinedIcon,
              Value: Phone,
              Required: true,
            },
            {
              Label: "Skype",
              Icon: ChatBubbleOutlineOutlinedIcon,
              Value: Data.skype,
            },
          ]}
        />
        <ProfileSection
          Icon={WorkOutlineOutlinedIcon}
          Title="Work information"
          Rows={[
            {
              Label: "Organization",
              Icon: BusinessOutlinedIcon,
              Value: Organization,
            },
            {
              Label: "Position",
              Icon: BadgeOutlinedIcon,
              Value: Data.position,
            },
            {
              Label: "Profession",
              Icon: MedicalServicesOutlinedIcon,
              Value: Data.profession,
            },
            {
              Label: "Professional degrees",
              Icon: SchoolOutlinedIcon,
              Value: Data.professional_degrees,
            },
            {
              Label: "Experiences",
              Icon: WorkOutlineOutlinedIcon,
              Value: Data.experiences,
            },
            {
              Label: "Personal number",
              Icon: FingerprintOutlinedIcon,
              Value: Data.personal_number,
            },
          ]}
        />
      </Box>
    </Box>
  );
}
