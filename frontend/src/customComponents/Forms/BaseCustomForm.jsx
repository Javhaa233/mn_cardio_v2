import React, { Component } from "react";
// custom components
import BaseLoading from "customComponents/BaseLoading";
import LoadError from "customComponents/LoadError";
// helper
import Helper from "helper";
import i18n from "i18n";
import { loadFormConfig, getFieldWithValue } from "baseComponents/formHelpers";
import store from "store";
import { setTabDirty } from "store/reducers/system/tabs";
import { TabContext } from "customComponents/PageTabs/TabContext";

class BaseCustomForm extends Component {
  // Gives every clinical form the key of the tab it is rendered in, so it can
  // report unsaved edits. null outside the tab host, where MarkDirty no-ops.
  static contextType = TabContext;

  constructor(props) {
    super(props);
    this.state = {
      Config: props.Config || null,
      Fields: props.Config && props.Config.Fields ? props.Config.Fields : [],
      EditObject: null,
      Alert: null,
      isLoading: true,
      ConfigError: false,
      ObjectName: props.ObjectName || null,
    };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.ModifyObject = {};
  }

  componentDidMount() {
    const { ObjectName } = this.props;
    const { Config, Fields } = this.state;
    process.env.NODE_ENV === "development" && console.log({ ObjectName });
    if ((!Config || !Fields) && ObjectName) this.GetFormConfig();
    else this.setState({ isLoading: false });
  }

  /**
   * Tells the tab this form has unsaved edits, so closing it asks first.
   *
   * Class components cannot use the useTabDirty hook, so this reads the tab key
   * off context and dispatches directly. Guarded on a local flag because
   * ChangeValue fires on every keystroke and only the transitions matter.
   *
   * Known limit: a form that saves WITHOUT being remounted stays marked dirty,
   * so closing it still prompts. That fails safe (it warns when it need not,
   * never the reverse); a form can clear it explicitly with MarkDirty(false)
   * after a successful save.
   */
  MarkDirty = (dirty = true) => {
    const key = this.context && this.context.tabKey;
    if (!key) return;
    if (this.IsDirty === dirty) return;
    this.IsDirty = dirty;
    store.dispatch(setTabDirty({ key, dirty }));
  };

  componentWillUnmount() {
    this.MarkDirty(false);
  }

  ChangeValueBefore = (Field, Value) => {};

  ChangeValue = (Field, Value) => {
    this.ChangeValueBefore(Field, Value);
    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {};

  GetData = async () => this.setState({ isLoading: false });

  GetFormConfig = async () => {
    const { ObjectName } = this.state;
    this.setState({ isLoading: true, ConfigError: false });
    process.env.NODE_ENV === "development" && console.log({ ObjectName });

    // Safety timeout to prevent infinite loading. Giving up silently used to
    // drop the form into the same blank-boxes state as an outright failure,
    // so the timeout now lands in the explicit error state too.
    const timeoutId = setTimeout(() => {
      process.env.NODE_ENV === "development" &&
        console.warn("GetFormConfig timeout - config could not be loaded");
      this.FailFormConfig();
    }, 10000); // 10 second timeout

    await loadFormConfig(
      ObjectName,
      (config) => {
        clearTimeout(timeoutId);
        process.env.NODE_ENV === "development" &&
          console.log("GetConfigData response:", config);
        this.setState({ Config: config, Fields: config.Fields }, () =>
          this.GetData(),
        );
      },
      () => {
        clearTimeout(timeoutId);
        this.FailFormConfig();
      },
    );
  };

  /**
   * Without a field config `GetConfigField` returns null for every field, so
   * `CustomRender()` draws a skeleton of empty, label-less boxes with a live
   * Save button. Record the failure so `render` shows an explanation instead,
   * and swap `Save` for a refusal so nothing in this state can be written -
   * subclasses declare `Save` as an instance field, so replacing it on the
   * instance reaches all of them without editing any of them.
   */
  FailFormConfig = () => {
    if (!this.SaveBeforeConfigError) {
      this.SaveBeforeConfigError = this.Save;
      this.Save = this.RefuseSave;
    }
    this.setState({ isLoading: false, ConfigError: true });
  };

  RefuseSave = async (callback) =>
    callback &&
    callback({
      Data: {
        Success: false,
        Message: i18n.t(
          "Маягтын тохиргоо ачаалагдаагүй тул хадгалах боломжгүй",
        ),
        Data: [],
      },
    });

  RetryFormConfig = () => {
    if (this.SaveBeforeConfigError) {
      this.Save = this.SaveBeforeConfigError;
      this.SaveBeforeConfigError = null;
    }
    this.GetFormConfig();
  };

  Save = async (callback) =>
    callback &&
    callback({ Data: { Succss: false, Message: "Not save", Data: [] } });

  CustomRender = () => {
    return <div></div>;
  };

  /*
  GetConfigField = (FieldName) => {
    const { EditObject, Fields } = this.state;
    const Field = Helper.BaseCrudHelper.GetFieldByName(FieldName, Fields);
    if (Field) {
      Field["Value"] =
        EditObject && EditObject[FieldName] ? EditObject[FieldName] : "";
      return Field;
    } else {
      return null;
    }
  };
*/

  GetConfigField = (FieldName) => {
    const { EditObject, Fields } = this.state;
    const field = getFieldWithValue(FieldName, Fields, EditObject);

    // Clear DataFilter for organization_id to show all organizations
    if (FieldName === "organization_id" && field) {
      field.DataFilter = [];
    }

    return field;
  };
  render() {
    const { Alert, isLoading, ConfigError } = this.state;
    if (ConfigError) {
      return (
        <div style={{ height: "100%" }}>
          <LoadError
            Message="Маягтын тохиргоог ачаалж чадсангүй"
            Retry={this.RetryFormConfig}
          />
        </div>
      );
    }
    if (isLoading === false) {
      return (
        <div style={{ height: "100%" }}>
          {Alert}
          {this.CustomRender()}
        </div>
      );
    } else {
      return <BaseLoading />;
    }
  }
}

export default BaseCustomForm;
