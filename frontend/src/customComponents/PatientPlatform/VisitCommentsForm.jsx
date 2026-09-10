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
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// helper
import Helper from "helper";

/**
 * 2.3 Эмчээс асуух асуулт — the compose half of the patient/doctor thread.
 *
 * Sends through /api/patient/questions. That endpoint takes only the text: the
 * patient and the authoring account both come off the verified token, so no
 * identifier is passed from the browser and the screen no longer depends on
 * what `localStorage` happens to hold.
 *
 * The textarea is driven by the declared `comment` descriptor from
 * VisitCommentsConfig (CLAUDE.md §3) rather than a hand-written one, so its
 * label, type and required flag follow the ModelConfig.
 */
class VisitCommentsForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Comment: "", isSaving: false };
  }

  // Keep the controlled textarea and ModifyObject in step, so the field can be
  // cleared once the question is away.
  ChangeValueAfter = (Field, Value) => {
    if (Field === "comment") this.setState({ Comment: Value });
  };

  ShowMessage = (Message, Success, After) => {
    const alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () => {
      this.setState({ Alert: null });
      After && After();
    });
    this.setState({ Alert: alert });
  };

  Save = async () => {
    const { t, Save } = this.props;
    const { Comment, isSaving } = this.state;

    if (isSaving) return;

    const Text = (Comment || "").trim();
    if (!Text) {
      this.ShowMessage(t("Асуултаа бичнэ үү"), false);
      return;
    }

    this.setState({ isSaving: true });
    const res = await Helper.PatientApiHelper.CreateQuestion({
      comment: Text,
    });
    this.setState({ isSaving: false });

    if (!res.success) {
      this.ShowMessage(res.message || t("Асуулт илгээгдсэнгүй"), false);
      return;
    }

    this.ModifyObject = {};
    this.setState({ Comment: "" });
    this.ShowMessage(
      res.message || t("Асуулт эмчид илгээгдлээ"),
      true,
      () => Save && Save(true),
    );
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Comment, isSaving } = this.state;
    const CommentField = this.GetConfigField("comment");

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

export default withTranslation(undefined, { withRef: true })(VisitCommentsForm);
