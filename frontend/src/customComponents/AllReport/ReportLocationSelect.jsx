import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// custom components
import SingleSelect from "customComponents/AllReport/SingleSelect";
// helper
import Helper from "helper";

class ReportLocationSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.FieldObjects = {
      addr_prov_city: null,
      addr_soum_dist: null,
      addr_bag_khoroo: null,
    };

    this.SelectRef1 = createRef();
    this.SelectRef2 = createRef();
    this.SelectRef3 = createRef();
  }

  // withTranslation resolves the ref either to the wrapper or to the instance
  // depending on the version, so unwrap the same way the rest of the app does.
  Unwrap = (ref) =>
    ref && ref.getWrappedInstance ? ref.getWrappedInstance() : ref;

  componentDidMount() {
    this.GetProvinceData({
      ObjectName: "DictProvinceCity",
      Option: { Field: "name", Type: "NotEquals", Value: "" },
      Value: "-1",
    });
  }

  GetProvinceData = async ({ ObjectName, Option }) => {
    const t = this.props.t;
    const ReqData = { ObjectName, Option };
    await Helper.BaseCrudHelper.CallService(
      "Report/GetProvinceData",
      ReqData,
      (resData) => {
        if (resData && resData.Success) {
          const Ref1 = this.Unwrap(this.SelectRef1);
          const Ref2 = this.Unwrap(this.SelectRef2);
          const Ref3 = this.Unwrap(this.SelectRef3);
          if (ObjectName === "DictProvinceCity") {
            Ref1 && Ref1.GetData(resData.Data);
          } else if (ObjectName === "DictSoumDistrict") {
            Ref2 && Ref2.GetData(resData.Data);
            Ref3 && Ref3.GetData([]);
          } else if (ObjectName === "DictBagKhoroo") {
            Ref3 && Ref3.GetData(resData.Data);
          }
        }
      },
    );
  };

  ChangeValue = (Field, Value) => {
    const { FieldObjects } = this;
    const { ChangeValue } = this.props;

    FieldObjects[Field] = Value;
    this.ChangeValueBefore(Field, Value);
    ChangeValue && ChangeValue(FieldObjects);
  };

  ChangeValueBefore = (Field, Value) => {
    if (Field === "addr_prov_city") {
      this.GetProvinceData({
        ObjectName: "DictSoumDistrict",
        Option: { Field: "id_province", Type: "Equals", Value },
      });
      this.FieldObjects.addr_soum_dist = null;
      this.FieldObjects.addr_bag_khoroo = null;
    }

    if (Field === "addr_soum_dist") {
      this.GetProvinceData({
        ObjectName: "DictBagKhoroo",
        Option: { Field: "id_soum", Type: "Equals", Value },
      });
      this.FieldObjects.addr_bag_khoroo = null;
    }
  };

  render() {
    const { t } = this.props;
    const labelStyle = {
      padding: 0,
      margin: "0 0 2px 0", // 🔽 reduced gap
      lineHeight: "14px",
      fontSize: "12px",
    };

    return (
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "flex-end",
            gap: "12px",
            width: "100%",
          }}
        >
          {/* Province / City */}
          <div style={{ flex: "0 0 130px", minWidth: 120 }}>
            <h5 style={labelStyle}>{t("Province/City")}</h5>
            <SingleSelect
              ref={(ref) => (this.SelectRef1 = ref)}
              ChangeValue={this.ChangeValue}
              Name="addr_prov_city"
            />
          </div>

          {/* Soum / District */}
          <div style={{ flex: "0 0 130px", minWidth: 120 }}>
            <h5 style={labelStyle}>{t("Soum/district")}</h5>
            <SingleSelect
              ref={(ref) => (this.SelectRef2 = ref)}
              ChangeValue={this.ChangeValue}
              Name="addr_soum_dist"
            />
          </div>

          {/* Bag / Khoroo */}
          <div style={{ flex: "0 0 130px", minWidth: 120 }}>
            <h5 style={labelStyle}>{t("Bag/khoroo")}</h5>
            <SingleSelect
              ref={(ref) => (this.SelectRef3 = ref)}
              ChangeValue={this.ChangeValue}
              Name="addr_bag_khoroo"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  ReportLocationSelect,
);
