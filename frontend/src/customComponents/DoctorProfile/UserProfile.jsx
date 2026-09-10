import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Avatar from "@mui/material/Avatar";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";
import { useChatContext } from "customComponents/Chat/ChatContext";

export default function UserProfile(props) {
  const { t } = useTranslation();

  const { DoctorId = null, UserId = null, isChatPending = false } = props;

  const [Data, setData] = useState({});
  const [Loading, setLoading] = useState(false);
  const [Alert, setAlert] = useState(null);
  // Null when this profile is rendered in a layout with no chat dock.
  const chat = useChatContext();

  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DoctorId, UserId]);

  const GetData = async () => {
    if (DoctorId) {
      setLoading(true);
      await Helper.DoctorsProfileHelper.GetDoctorsProfileInfo(
        DoctorId,
        (resData) => {
          resData && setData(Array.isArray(resData.Data) ? resData.Data : []);
          setLoading(false);
        },
      );
    } else if (UserId) {
      setLoading(true);
      await Helper.DoctorsProfileHelper.GetDoctorsProfileInfoByUserId(
        UserId,
        (resData) => {
          resData && setData(resData.Data);
          setLoading(false);
        },
      );
    }
  };
  /**
   * Open a conversation with this doctor.
   *
   * THREE bugs used to live here and together they made chat unstartable:
   *
   * 1. Both this and the old CheckChatRoom passed `Data.id`. DoctorsProfile maps
   *    the DB column `id` to the ATTRIBUTE `UserId`
   *    (backend/model/Doctor/DoctorsProfile.js:11), so `Data.id` is always
   *    undefined and the request named nobody.
   * 2. `AddedChat` initialised to `true` and was only ever cleared by a
   *    successful CheckChatRoom. Since (1) guaranteed that call failed, the
   *    button never rendered - and it is the only "start a chat" entry point in
   *    the app. The state is gone rather than fixed: initialising a gate to
   *    "hidden" and relying on a network call to reveal it means any failure
   *    silently removes the feature.
   * 3. Check-then-create was two round trips with a race between them.
   *    StartChat is idempotent - it returns the existing room or makes one.
   */
  const StartChat = () => {
    const TargetUserId = Data.UserId;
    if (!TargetUserId) return;

    if (chat) {
      chat.StartChat(
        { UserId: TargetUserId, UserType: "S" },
        (ok, _roomId, message) => {
          if (!ok) {
            setAlert(
              Helper.BaseCrudHelper.ShowAlert(
                message || t("Алдаа гарлаа"),
                false,
                () => setAlert(null),
              ),
            );
          }
        },
      );
      return;
    }

    // No dock in this layout - still create the room, and say so.
    Helper.ChatHelper.StartChat(
      { UserId: TargetUserId, UserType: "S" },
      (resData) => {
        setAlert(
          Helper.BaseCrudHelper.ShowAlert(
            (resData && resData.Message) || t("Алдаа гарлаа"),
            !!(resData && resData.Success),
            () => setAlert(null),
          ),
        );
      },
    );
  };

  //   const GetProvice = (DoctorInfo) => {
  //     var Provice = "";
  //     Provice += DoctorInfo.Organization.DictProvinceCity
  //       ? DoctorInfo.Organization.DictProvinceCity.name
  //       : "";

  //     Provice += DoctorInfo.Organization.DictSoumDistrict
  //       ? " " + DoctorInfo.Organization.DictSoumDistrict.name
  //       : "";

  //     Provice += DoctorInfo.Organization.DictBagKhoroo
  //       ? " " + DoctorInfo.Organization.DictBagKhoroo.name
  //       : "";
  //     return Provice;
  //   };

  return (
    <GridContainer style={{ width: "100%", margin: "0" }}>
      <GridItem xs={12} sm={12} md={12}>
        <div style={{ position: "relative" }}>
          {Loading ? (
            <BaseLoading />
          ) : Object.keys(Data).length > 0 ? (
            <div>
              {Alert}
              <div
                style={{
                  display: "flex",
                  marginBottom: "15px",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Avatar
                  style={{ width: "80px", height: "80px" }}
                  src={
                    Data.Files && Data.Files.length > 0
                      ? Data.Files[0].FileSrc
                      : ""
                  }
                />
              </div>
              <BaseInfo
                Label="Personal number"
                Value={Data.personal_number}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="Last name"
                Value={Data.lastname}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="First name"
                Value={Data.firstname}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="User name"
                Value={Data.Users ? Data.Users.UserName : ""}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              {/* <Divider style={{ margin: "0 -15px" }} />
            <BaseInfo
              Label="Birth date"
              Value="1960-12-06"
              Size="15px"
              md={4}

              LabelWeight="500"
              ValueWeight="400"
              Left
            /> */}
              <BaseInfo
                Label="Email"
                Value={Data.email}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="Telephone"
                Value={Data.telephone}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="Skype"
                Value={Data.skype}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              {/* <BaseInfo
                Label="Province, City"
                Value={Data.province_cityObj ? Data.province_cityObj.Label : ""}
                Size="15px"
                md={5}

                LabelWeight="500"
                ValueWeight="400"
              /> */}
              <BaseInfo
                Label="Province/City"
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
                Value={
                  Data.addr_prov_cityObj ? Data.addr_prov_cityObj.name : ""
                }
              />
              <BaseInfo
                Label="Soum/District"
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
                Value={
                  Data.addr_soum_distObj ? Data.addr_soum_distObj.name : ""
                }
              />
              <BaseInfo
                Label="Bag/Khoroo"
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
                Value={Data.DictBagKhoroo ? Data.DictBagKhoroo.name : ""}
              />
              <BaseInfo
                Label="Organization"
                Value={Data.Organization ? Data.Organization.Name : ""}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              {/* <BaseInfo
                Label="Province"
                Value={Data.Organization ? GetProvice(Data) : ""}
                Size="15px"
                md={5}

                LabelWeight="500"
                ValueWeight="400"
              /> */}
              {/* <BaseInfo
                Label="Workplace"
                Value={Data.organisation}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
              /> */}
              <BaseInfo
                Label="Profession"
                Value={Data.profession}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="Professional degrees"
                Value={Data.professional_degrees}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              <BaseInfo
                Label="Experiences"
                Value={Data.experiences}
                Size="15px"
                md={5}
                LabelWeight="500"
                ValueWeight="400"
                Left
              />
              {/* Rendered unconditionally. StartChat is idempotent, so this is
                  "open the conversation", not "create a duplicate one". */}
              {Data.UserId && (
                <div style={{ margin: "15px 0px 0" }}>
                  <Button
                    color={isChatPending ? "success" : "info"}
                    style={{
                      float: "right",
                      margin: "0",
                      padding: "8px 10px",
                      position: "relative",
                      "&:hover": { zIndex: "2" },
                    }}
                    onClick={StartChat}
                    size="sm"
                  >
                    {t("Чат бичих")}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <BaseNoData />
          )}
        </div>
      </GridItem>
    </GridContainer>
  );
}
