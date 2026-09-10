import { withTranslation } from "react-i18next";
import React, { Component } from "react";

import SimpleSelect from "customComponents/SimpleSelect";
// helper
import Helper from "helper";

class DictAttributes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ProvinceData: [],
      SoumData: [],
      BagData: [],
      ProvinceCityId: null,
      SoumDistrictId: null,
      BagKhorooId: null,
    };

    this.ModifyObject = {
      ProvinceCityId: null,
      SoumDistrictId: null,
      BagKhorooId: null,
    };
  }

  componentDidMount() {
    this.GetProvinceData({
      ObjectName: "DictProvinceCity",
      Option: { Field: "name", Type: "NotEquals", Value: "" },
    });
  }

  GetProvinceData = async ({ ObjectName, Option }) => {
    const ReqData = { ObjectName, Option };
    await Helper.BaseCrudHelper.CallServiceWithoutToken(
      "UserRequest/GetProvinceData",
      ReqData,
      (resData) => {
        if (resData.Success) {
          if (ObjectName === "DictProvinceCity") {
            this.setState({ ProvinceData: resData.Data });
          } else if (ObjectName === "DictSoumDistrict") {
            this.setState({ SoumData: resData.Data, BagData: [] });
          } else if (ObjectName === "DictBagKhoroo") {
            this.setState({ BagData: resData.Data });
          }
        }
      },
    );
  };

  HandleChange = (Field, RawValue) => {
    const Value =
      RawValue === "-1" || RawValue === "" || RawValue == null
        ? null
        : RawValue;
    this.ModifyObject[Field] = Value;
    const stateUpdate = { [Field]: Value };

    if (Field === "ProvinceCityId") {
      this.ModifyObject["SoumDistrictId"] = null;
      this.ModifyObject["BagKhorooId"] = null;
      stateUpdate.SoumDistrictId = null;
      stateUpdate.BagKhorooId = null;
      if (Value !== null) {
        this.GetProvinceData({
          ObjectName: "DictSoumDistrict",
          Option: { Field: "id_province", Type: "Equals", Value },
        });
      } else {
        stateUpdate.SoumData = [];
        stateUpdate.BagData = [];
      }
    }
    if (Field === "SoumDistrictId") {
      this.ModifyObject["BagKhorooId"] = null;
      stateUpdate.BagKhorooId = null;
      if (Value !== null) {
        this.GetProvinceData({
          ObjectName: "DictBagKhoroo",
          Option: { Field: "id_soum", Type: "Equals", Value },
        });
      } else {
        stateUpdate.BagData = [];
      }
    }

    this.setState(stateUpdate);

    const { ChangeValue } = this.props;
    ChangeValue && ChangeValue(this.ModifyObject);
  };

  render() {
    const { t } = this.props;
    const {
      ProvinceData,
      SoumData,
      BagData,
      ProvinceCityId,
      SoumDistrictId,
      BagKhorooId,
    } = this.state;
    return (
      <>
        <div style={{ width: "140px" }}>
          <SimpleSelect
            Config={{
              Name: "ProvinceCityId",
              Config: { IdField: "id_data", TextField: "name" },
              Data: ProvinceData,
              NewValue: ProvinceCityId,
            }}
            Value={ProvinceCityId}
            ChangeValue={(val) => this.HandleChange("ProvinceCityId", val)}
            defaultValueLabel={t("Province/city")}
            Variant="outlined"
            FullWidth
          />
        </div>
        <div style={{ width: "140px" }}>
          <SimpleSelect
            key={`soum-${ProvinceCityId ?? "none"}`}
            Config={{
              Name: "SoumDistrictId",
              Config: { IdField: "id_data", TextField: "name" },
              Data: SoumData,
              NewValue: SoumDistrictId,
            }}
            Value={SoumDistrictId}
            ChangeValue={(val) => this.HandleChange("SoumDistrictId", val)}
            defaultValueLabel={t("Soum/district")}
            Variant="outlined"
            FullWidth
          />
        </div>
        <div style={{ width: "140px" }}>
          <SimpleSelect
            key={`bag-${SoumDistrictId ?? "none"}`}
            Config={{
              Name: "BagKhorooId",
              Config: { IdField: "id_data", TextField: "name" },
              Data: BagData,
              NewValue: BagKhorooId,
            }}
            Value={BagKhorooId}
            ChangeValue={(val) => this.HandleChange("BagKhorooId", val)}
            defaultValueLabel={t("Bag/khoroo")}
            Variant="outlined"
            FullWidth
          />
        </div>
      </>
    );
  }
}

export default withTranslation()(DictAttributes);
