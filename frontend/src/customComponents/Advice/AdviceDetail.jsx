import React, { useEffect, useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
// @mui/icons-material
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

// custom components
import Comment from "customComponents/Advice/Comment";
import CreateComment from "customComponents/Advice/CreateComment";
import BaseDialog from "customComponents/BaseDialog";
import FollowUpForm from "customComponents/Forms/FollowUpForm";
import FollowUp from "customComponents/DetailViews/FollowUp";
import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoading from "customComponents/BaseLoading";
import BaseField from "baseComponents/BaseField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import Typography from "@mui/material/Typography";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

// Square corners and float were the template's button-group look; the bar is
// a flex row with a gap now, and each button carries its own rank.
const CustomButton = styled(Button)(() => ({
  position: "relative",
  marginRight: "8px",
}));

const AddButton = styled(Button)(() => ({
  margin: "0 5px",
  padding: "4px 8px 2px",
  position: "relative",
  float: "left",
  "&:hover": { zIndex: "2", boxShadow: "none" },
}));

export default function AdviceDetail(props) {
  const { t } = useTranslation();

  const { Config = null, DataId = null, InDialog = false } = props;

  const [EditObject, setEditObject] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(Config);
  const [Fields, setFields] = useState([]);
  const [DialogData, setDialogData] = useState(null);

  const [Comments, setComments] = useState([]);
  const [Alert, setAlert] = useState(null);
  const [Finish, setFinish] = useState(false);
  const [ListFields, setListFields] = useState([]);

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  var ModifyObject = {};

  const FollowUpFormRef = useRef(null);

  useEffect(() => {
    getConfigData();
  }, []);

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Config, currentConfig, DataId]);

  useEffect(() => {
    GetComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EditObject]);

  const getConfigData = async () => {
    await Helper.BaseCrudHelper.GetConfigData("Advice", async (resData) => {
      if (resData && resData.Success && resData.Data) {
        setCurrentConfig(resData.Data);
        setFields(resData.Data.Fields);
        setListFields(Helper.BaseCrudHelper.GetFieldList(resData.Data.Fields));
      }
    });
  };

  const getDetail = async () => {
    if (DataId && currentConfig) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: currentConfig.PK, Op: "Equals", Value: DataId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "Advice", SearchOption },
        (resData) => {
          if (resData) {
            setEditObject(Object.assign({}, resData.Data));
            setFinish(true);
          }
        },
      );
    } else {
      setEditObject({});
      setComments([]);
      setFinish(true);
    }
  };

  const SetInsertForm = () => {
    setDialogData(
      <BaseDialog
        Close={() => setDialogData(null)}
        Title="Follow Up"
        Save={() => {
          if (FollowUpFormRef.current && FollowUpFormRef.current.Save) {
            FollowUpFormRef.current.Save((resData) => {
              setDialogData(null);
              if (resData && resData.Success) {
                // Optionally show success feedback
              }
            });
          }
        }}
        ShowSave={true}
      >
        <FollowUpForm
          ref={FollowUpFormRef}
          ObjectName="FollowUp"
          AdviceId={EditObject.id_data}
        />
      </BaseDialog>,
    );
  };

  const SetFollowUpDialog = () => {
    setDialogData(
      <BaseDialog
        Close={() => setDialogData(null)}
        Title="View current full examination"
      >
        <FollowUp
          AdviceId={EditObject.id_data}
          PatientId={EditObject.Patient ? EditObject.Patient.id_data : null}
        />
      </BaseDialog>,
    );
  };

  const GetConfigField = (FieldName, ListFields) => {
    var Field = ListFields.filter((s) => s.Name + "" === FieldName + "");
    if (Field.length === 1) {
      if (EditObject) Field[0]["Value"] = EditObject[FieldName];
      return Field[0];
    } else {
      return null;
    }
  };

  const GetComments = async () => {
    if (EditObject && EditObject.id_data)
      await Helper.AdviceHelper.GetComments(
        EditObject.id_data,
        (resData) => resData && setComments(resData.Data),
      );
  };

  const SaveComment = async ({ Comment, Files }, callback) => {
    const AdviceId = EditObject.id_data;
    if (
      (Comment !== "" &&
        Comment.length > 0 &&
        Comment.replace(/\s/g, "").length > 0) ||
      Files.length > 0
    ) {
      await Helper.AdviceHelper.SaveComment(AdviceId, Comment, (resData) => {
        if (resData && resData.Success && Files.length > 0) {
          uploadFile({ Id: resData.Data.DataId, Files: Files }, (success) => {
            if (success) {
              callback && callback();
              GetComments();
            }
          });
        } else {
          callback && callback();
          GetComments();
        }
      });
    }
  };

  const uploadFile = async ({ Id, Files }, callback) => {
    const Value = Files;
    if (Value) {
      await Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: "AdviceComment",
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => resData && callback && callback(resData.Success),
      );
    }
  };

  const ChangeValue = (Field, Value) => {
    ModifyObject[Field] = Value;
    process.env.NODE_ENV === "development" && console.log(ModifyObject);
  };

  const GetCommentView = () => {
    let commentView = [];
    if (Array.isArray(Comments)) {
      for (let i = 0; i < Comments.length; i++) {
        commentView.push(
          <Comment
            key={"Comment" + i}
            Data={Comments[i]}
            AdviceUserId={EditObject.id}
            ChangeLike={() => GetComments()}
          />,
        );
      }
    }
    return <div>{commentView}</div>;
  };

  const Save = async () => {
    let alert = null;
    let Id = null;
    Id = EditObject && EditObject.id_data ? EditObject.id_data : null;
    await Helper.AdviceHelper.CustomSave(
      { ...ModifyObject, id_data: Id },
      (resData) => {
        if (resData) {
          alert = Helper.BaseCrudHelper.ShowAlert(
            resData.Message,
            resData.Success,
            () => {
              setAlert(null);
              resData.Success && document.location.reload(); // = "/admin/MyTicket";
            },
          );
          setAlert(alert);
        }
      },
    );
  };

  return (
    <div>
      {DialogData}
      {Alert}
      {!currentConfig ||
      Finish === false ||
      !Fields ||
      !ListFields ||
      !EditObject ? (
        <BaseLoading />
      ) : (
        <GridContainer spacing={4}>
          <GridItem xs={12} sm={12} md={6}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    flexWrap: "wrap",
                    alignItems: "center",
                    rowGap: "8px",
                  }}
                >
                  {!InDialog && (
                    <CustomButton
                      color="info"
                      size="sm"
                      onClick={() => {
                        var pathArray = window.location.pathname.split("/");
                        if (pathArray.length >= 3)
                          customHistory.push("/admin/" + pathArray[2]);

                        document.location.reload();
                      }}
                    >
                      <i
                        style={{ marginRight: "8px" }}
                        className="fas fa-reply"
                      />
                      {t("Back")}
                    </CustomButton>
                  )}
                  <CustomButton
                    color="info"
                    size="sm"
                    onClick={SetFollowUpDialog}
                  >
                    {t("View current full examination")}
                  </CustomButton>
                  {EditObject && EditObject.id + "" === LogedUser.Id + "" && (
                    <CustomButton
                      color="info"
                      size="sm"
                      onClick={SetInsertForm}
                    >
                      {t("Edit examination")}
                    </CustomButton>
                  )}

                  {EditObject &&
                    (EditObject.id + "" === LogedUser.Id + "" ||
                      Helper.AuthHelper.CheckRole([1])) &&
                    EditObject.adv_ticket_closed !== "n" && (
                      <CustomButton
                        color="primary"
                        size="sm"
                        onClick={() => {
                          if (EditObject && EditObject.id_data) {
                            ModifyObject["adv_ticket_closed"] = "n";
                            Save();
                          }
                        }}
                      >
                        {t("Open")}
                      </CustomButton>
                    )}

                  {EditObject && (
                    <div>
                      {EditObject &&
                        (EditObject.id + "" === LogedUser.Id + "" ||
                          Helper.AuthHelper.CheckRole([1])) &&
                        EditObject.adv_ticket_closed === "n" && (
                          <CustomButton
                            color="primary"
                            size="sm"
                            onClick={() => {
                              if (EditObject && EditObject.id_data) {
                                ModifyObject["adv_ticket_closed"] = "y";
                                Save();
                              }
                            }}
                          >
                            {t("Close")}
                          </CustomButton>
                        )}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: colors.brand.inkDim,
                      marginLeft: "4px",
                    }}
                  >
                    <VisibilityIcon
                      style={{ marginRight: "4px", fontSize: "22px" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "400" }}>
                      {EditObject && EditObject.vwAdviceViews
                        ? EditObject.vwAdviceViews.ViewQty
                        : 0}
                    </span>
                  </div>
                </div>
              </GridItem>
            </GridContainer>
            {/* Three md=4 columns squeezed each inline label and its select into
                ~200px, so "Асуумж хаагдсан" wrapped against a clipped select.
                The patient field keeps its own row; the two selects share one. */}
            <GridContainer style={{ marginTop: "25px" }} rowSpacing={1}>
              <GridItem xs={12} sm={12} md={12}>
                <BaseField
                  ChangeValue={ChangeValue}
                  Value={EditObject ? EditObject.adv_id_patient : null}
                  Config={GetConfigField("adv_id_patient", ListFields)}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={6}>
                <SimpleSelect
                  disabled={true}
                  labelId="adv_ticket_closed-closed-label"
                  Config={GetConfigField("adv_ticket_closed", ListFields)}
                  ChangeValue={(Value) =>
                    ChangeValue("adv_ticket_closed", Value)
                  }
                  Variant="outlined"
                  FullWidth={true}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={6}>
                <SimpleSelect
                  labelId="ticket-type-label"
                  Config={GetConfigField("ticket_type", ListFields)}
                  ChangeValue={(Value) => ChangeValue("ticket_type", Value)}
                  Variant="outlined"
                  FullWidth={true}
                  DefaultValue="Type"
                />
              </GridItem>
            </GridContainer>
            <Typography
              variant="h5"
              component="div"
              sx={{ color: colors.brand.ink, mt: 2, mb: 1 }}
            >
              {t("Body")}
            </Typography>
            <div
              style={{
                border: `1px solid ${colors.brand.hairlineStrong}`,
                borderRadius: radius.sm,
              }}
            >
              <BaseTextArea
                Config={{
                  Name: "Body",
                  Value: EditObject ? EditObject.Body : "",
                }}
                Rows="10"
                HideLabel={true}
                ChangeValue={ChangeValue}
              />
            </div>
            <div
              style={{
                clear: "both",
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                margin: "15px 0 0 0",
              }}
            >
              <AddButton color="primary" onClick={Save}>
                {t("Save")}
              </AddButton>
            </div>
          </GridItem>
          <GridItem xs={12} sm={12} md={6}>
            <div>
              {/* component="div": a bare h3 is restyled by _misc.scss. */}
              <Typography
                variant="h3"
                component="div"
                sx={{ color: colors.brand.ink, my: 1.5 }}
              >
                {t("Comments")}
              </Typography>
            </div>
            {Finish ? (
              <>
                {GetCommentView()}
                <CreateComment
                  LogedUser={LogedUser}
                  AdviceId={EditObject.id_data ? EditObject.id_data : 0}
                  SaveComment={SaveComment}
                  IsDisabled={EditObject.adv_ticket_closed === "y"}
                />
              </>
            ) : (
              <BaseLoading />
            )}
          </GridItem>
        </GridContainer>
      )}
    </div>
  );
}
