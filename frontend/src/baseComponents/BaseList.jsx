import React, { Component } from "react";

import Helper from "helper";

export default class BaseList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Config: props.Config || null,
      Data: [],
      GridOption: null,
      isLoading: false,
      Alert: null,
      DetailView: null,
    };

    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.SearchOption =
      props.SearchOption || Helper.BaseCrudHelper.GetSearchOption();
  }

  componentDidMount() {
    const { Config, Fields } = this.state;
    const { ObjectName } = this.props;
    if ((!Config || !Fields) && ObjectName) {
      this.GetConfigData && this.GetConfigData();
    } else {
      this.GetData && this.GetData();
    }
  }

  GetConfigData = async () => {
    const { ObjectName } = this.props;
    if (!ObjectName) return;
    await Helper.BaseCrudHelper.GetConfigData(ObjectName, (resData) => {
      if (resData && resData.Success && resData.Data) {
        this.setState({ Config: resData.Data }, () => {
          this.GetData && this.GetData();
        });
      }
    });
  };

  ShowAlert = (message, success) => {
    const alert = Helper.BaseCrudHelper.ShowAlert(message, success, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  ShowConfirm = (message, confirmFunc) => {
    const alert = Helper.BaseCrudHelper.ShowConfirm(message, confirmFunc, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  OrderBy = (Field, Type) => {
    if (!this.SearchOption) return;
    this.SearchOption.OrderBy = { Field, Type };
    this.GetData && this.GetData();
  };

  SearchField = (Field, SearchText) => {
    if (!this.SearchOption) return;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      Field,
      SearchText,
      this.SearchOption.SearchField || [],
    );
    this.GetData && this.GetData();
  };

  PageLimitChange = (Page, Limit) => {
    if (!this.SearchOption) return;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page,
      Limit,
    };
    this.GetData && this.GetData();
  };

  GetData = async () => {
    const { ObjectName } = this.props;
    if (this.CheckGetData && !this.CheckGetData()) return;
    if (!ObjectName) return;

    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName, SearchOption: this.SearchOption },
      (resData) => {
        if (resData) {
          this.setState({
            Data: resData.Data || [],
            GridOption: resData.Option || {},
            isLoading: false,
          });
        } else {
          this.setState({ isLoading: false });
        }
      },
    );
  };

  CustomRender = () => null;

  render() {
    const { t } = this.props;
    if (this.props.CustomRender === true) {
      return this.CustomRender();
    }
    return null;
  }
}
