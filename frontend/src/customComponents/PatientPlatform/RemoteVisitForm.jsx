import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/icons-material
import SendIcon from "@mui/icons-material/Send";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
// custom components
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";

/**
 * 2.6 Цахим үзлэг — the compose half of the remote-examination screen.
 *
 * The request text goes through POST /api/patient/evisits, which takes only the
 * comment: the patient comes off the verified token, so no identifier is passed
 * from the browser.
 *
 * Attachments still ride the legacy upload route. /api/patient/evisits has no
 * file half, and the legacy route needs the new row's Id, so the upload is a
 * second step keyed on what the create returned. If the text lands and the file
 * does not, the user is told exactly that rather than being shown a bare
 * success.
 *
 * The textarea is driven by the declared `Comment` descriptor from
 * RemoteVisitConfig (CLAUDE.md §3) instead of a hand-written {Name, Label}
 * object, so its label, type and required flag follow the ModelConfig.
 */
class RemoteVisitForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Comment: "",
      Files: [],
      isSaving: false,
    };
  }

  // Keep the controlled textarea and ModifyObject in step, so the field can be
  // cleared once the request is away.
  ChangeValueAfter = (Field, Value) => {
    if (Field === "Comment") this.setState({ Comment: Value });
  };

  ShowMessage = (Message, Success, After) => {
    const alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () => {
      this.setState({ Alert: null });
      After && After();
    });
    this.setState({ Alert: alert });
  };

  UploadFiles = (Id, Files) =>
    new Promise((resolve) => {
      Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: this.state.ObjectName || "RemoteVisit",
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value: Files,
        },
        (resData) => resolve(!!(resData && resData.Success)),
      );
    });

  Save = async () => {
    const { t, Save } = this.props;
    const { Comment, Files, isSaving } = this.state;

    if (isSaving) return;

    const Text = (Comment || "").trim();
    if (!Text) {
      this.ShowMessage(t("Мэдээлэл дутуу байна"), false);
      return;
    }

    this.setState({ isSaving: true });
    const res = await Helper.PatientApiHelper.CreateEvisit({ Comment: Text });

    if (!res.success) {
      this.setState({ isSaving: false });
      this.ShowMessage(res.message || t("Хүсэлт илгээгдсэнгүй"), false);
      return;
    }

    const Id = res.data && res.data.Id;
    const Uploaded =
      Id && Array.isArray(Files) && Files.length > 0
        ? await this.UploadFiles(Id, Files)
        : true;

    this.ModifyObject = {};
    this.setState({ isSaving: false, Comment: "", Files: [] });

    this.ShowMessage(
      Uploaded
        ? res.message || t("Хүсэлт илгээгдлээ")
        : t("Хүсэлт илгээгдсэн ч файл хавсрагдсангүй"),
      Uploaded,
      () => Save && Save(true),
    );
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Comment, Files, isSaving } = this.state;
    const CommentField = this.GetConfigField("Comment");
    const FilesField = this.GetConfigField("Files");

    if (!CommentField) {
      return <BaseNoData Text={t("Маягтын тохиргоо олдсонгүй")} />;
    }

    return (
      <GridContainer>
        <GridItem xs={12} md={12}>
          <BaseTextArea
            Config={CommentField}
            Value={Comment}
            Rows={4}
            Disabled={isSaving}
            ChangeValue={this.ChangeValue}
            LabelOnTop
          />
          <BaseFileUpload
            Value={Files}
            Config={FilesField || { Name: "Files" }}
            ChangeValue={(value) => this.setState({ Files: value })}
            WithLabel={false}
          />
          <Button
            color="info"
            size="sm"
            style={{ float: "right" }}
            disabled={isSaving}
            onClick={() => this.Save()}
          >
            {isSaving ? t("Илгээж байна") : t("Илгээх")}
            <SendIcon
              style={{ marginLeft: "10px", width: "18px", height: "18px" }}
            />
          </Button>
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(RemoteVisitForm);
