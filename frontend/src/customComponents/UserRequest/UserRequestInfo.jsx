import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
// @mui/material
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import IsActiveStatus from "customComponents/UserRequest/IsActiveStatus";
import {
  FormField,
  FormSection,
  OrganizationPicker,
  fieldLabelSx,
} from "customComponents/Profile/profileDialogParts";
// helper
import Helper from "helper";
import { space } from "@/theme/tokens";

// A self-registered account is a doctor account: role 2 or 3 only.
const DOCTOR_ROLES = ["2", "3"];

function RoleOptions(Config) {
  const Rows = Config && Array.isArray(Config.Fields) ? Config.Fields : [];
  const Field = Rows.flat().find((F) => F && F.Name === "RoleId");
  const Data = Field && Array.isArray(Field.Data) ? Field.Data : [];
  return Data.filter((Role) => DOCTOR_ROLES.includes(String(Role.Id)));
}

function Row({ Label, Value }) {
  return (
    <BaseInfo
      Label={Label}
      Value={Value}
      Size="15px"
      Left
      md={4}
      LabelWeight="500"
      ValueWeight="400"
    />
  );
}

const DateText = (Value) =>
  Value ? String(Value).replace("T", " ").slice(0, 16) : "";

/**
 * One doctor sign-up request. While it is pending, the administrator can
 * correct the organization, role and licence before approving, or give the
 * reason for declining. The list calls Confirm / Decline through the ref.
 */
const UserRequestInfo = forwardRef(function UserRequestInfo({ Id }, ref) {
  const { t } = useTranslation();
  const [Data, setData] = useState(null);
  const [Loading, setLoading] = useState(!!Id);
  const [Roles, setRoles] = useState([]);
  const [Organization, setOrganization] = useState(null);
  const [RoleId, setRoleId] = useState("2");
  const [License, setLicense] = useState("");
  const [Reason, setReason] = useState("");
  const [Errors, setErrors] = useState({});
  const ReasonRef = useRef(null);
  const LicenseRef = useRef(null);

  useEffect(() => {
    if (!Id) return undefined;
    let Alive = true;
    Helper.BaseCrudHelper.BaseGetDetailInfo(
      {
        ObjectName: "UserRequests",
        SearchOption: {
          SearchField: [{ Field: "Id", Value: Id, Op: "Equals" }],
        },
      },
      (resData) => {
        if (!Alive) return;
        const Row = resData && resData.Data;
        setData(Row || null);
        setLoading(false);
        if (Row) {
          setLicense(Row.License || "");
          setOrganization(
            Row.OrganizationId
              ? { Id: Row.OrganizationId, Name: Row.OrgName || "" }
              : null,
          );
        }
      },
    );
    Helper.BaseCrudHelper.GetConfigData("Users", (resData) => {
      if (Alive && resData && resData.Data) setRoles(RoleOptions(resData.Data));
    });
    return () => {
      Alive = false;
    };
  }, [Id]);

  const Pending = !!Data && String(Data.IsActive) === "0";

  useImperativeHandle(
    ref,
    () => ({
      Confirm: (callback) => {
        // The licence code is optional: almost no doctor in the system has one
        // yet, so requiring it here would block approvals for a reason nobody
        // has resolved. The organization is not optional.
        const Found = {};
        if (!Organization) Found.Organization = t("Байгууллагыг сонгоно уу");
        setErrors(Found);
        // null: the list shows nothing - the problem is marked on the field.
        if (Found.Organization) return callback && callback(null);
        Helper.BaseCrudHelper.CallService(
          "/UserRequest/Confirm",
          {
            Id,
            OrganizationId: Organization.Id,
            RoleId,
            License: License.trim(),
          },
          (resData) => callback && callback(resData),
        );
      },
      Decline: (callback) => {
        if (!Reason.trim()) {
          setErrors({ Reason: t("Татгалзсан шалтгаанаа бичнэ үү") });
          ReasonRef.current && ReasonRef.current.focus();
          return callback && callback(null);
        }
        setErrors({});
        Helper.BaseCrudHelper.CallService(
          "/UserRequest/Decline",
          { Id, Reason: Reason.trim() },
          (resData) => callback && callback(resData),
        );
      },
    }),
    [Id, Organization, RoleId, License, Reason, t],
  );

  const Address = useMemo(() => {
    if (!Data) return "";
    return [
      Data.addr_prov_cityObj,
      Data.addr_soum_distObj,
      Data.addr_bag_khorooObj,
    ]
      .map((Obj) => (Obj ? Obj.name : ""))
      .filter(Boolean)
      .join(", ");
  }, [Data]);

  if (Loading) return <BaseLoading />;
  if (!Data) return <BaseNoData />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: space[4] }}>
      <div>
        <Box sx={{ marginBottom: space[2] }}>
          <IsActiveStatus rowdata={Data} />
        </Box>
        <Row Label="User name" Value={Data.UserName} />
        <Row Label="Last name" Value={Data.LastName} />
        <Row Label="First name" Value={Data.FirstName} />
        <Row Label="Регистрийн дугаар" Value={Data.Registration} />
        <Row Label="Email" Value={Data.Email} />
        <Row Label="Telephone" Value={Data.Telephone} />
        <Row Label="Profession" Value={Data.Profession} />
        <Row
          Label="Мэргэжлийн үйл ажиллагааны зөвшөөрлийн дугаар"
          Value={Data.License}
        />
        <Row Label="Organization" Value={Data.OrgName} />
        <Row Label="Хаяг" Value={Address} />
        <Row Label="Create date" Value={DateText(Data.CreateDate)} />
        {Data.DecisionDate ? (
          <Row Label="Шийдвэрлэсэн огноо" Value={DateText(Data.DecisionDate)} />
        ) : null}
        {Data.DeclineReason ? (
          <Row Label="Татгалзсан шалтгаан" Value={Data.DeclineReason} />
        ) : null}
      </div>

      {Pending ? (
        <>
          <FormSection
            Id="user-request-approve"
            Icon={FactCheckOutlinedIcon}
            Title={t("Баталгаажуулах")}
            Description={t("Шаардлагатай бол засаад баталгаажуулна уу")}
          >
            <Box sx={{ minWidth: 0 }}>
              <FormLabel
                htmlFor="user-request-organization"
                required
                sx={fieldLabelSx}
              >
                {t("Organization")}
              </FormLabel>
              <OrganizationPicker
                Id="user-request-organization"
                Value={Organization}
                OnChange={(Value) => {
                  setOrganization(Value);
                  if (Errors.Organization)
                    setErrors((P) => ({ ...P, Organization: null }));
                }}
                Error={Errors.Organization}
              />
            </Box>
            <FormField
              Id="user-request-role"
              Label={t("Эрхийн төрөл")}
              Required
              select
              value={RoleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {(Roles.length
                ? Roles
                : DOCTOR_ROLES.map((Id) => ({ Id, Name: "Role " + Id }))
              ).map((Role) => (
                <MenuItem key={Role.Id} value={String(Role.Id)}>
                  {t(Role.Name)}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              Id="user-request-license"
              Label={t("Зөвшөөрлийн дугаар")}
              Required
              inputRef={LicenseRef}
              Error={Errors.License}
              value={License}
              slotProps={{ htmlInput: { maxLength: 50 } }}
              onChange={(e) => {
                setLicense(e.target.value);
                if (Errors.License) setErrors((P) => ({ ...P, License: null }));
              }}
            />
          </FormSection>

          <FormSection
            Id="user-request-decline"
            Icon={BlockOutlinedIcon}
            Title={t("Татгалзах")}
          >
            <FormField
              Id="user-request-reason"
              Label={t("Татгалзсан шалтгаан")}
              ContainerSx={{ gridColumn: "1 / -1" }}
              multiline
              minRows={2}
              inputRef={ReasonRef}
              Error={Errors.Reason}
              Hint={t("Хүсэлт гаргагчид и-мэйлээр болон нэвтрэх үед харагдана")}
              value={Reason}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              onChange={(e) => {
                setReason(e.target.value);
                if (Errors.Reason) setErrors((P) => ({ ...P, Reason: null }));
              }}
            />
          </FormSection>
        </>
      ) : null}
    </Box>
  );
});

export default UserRequestInfo;
