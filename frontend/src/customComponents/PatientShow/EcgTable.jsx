import { useTranslation } from "react-i18next";
import React from "react";

import Ecg from "customComponents/DetailViews/Ecg";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";

import Helper from "helper";

class EcgTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      FirstDataCheck: true,
      PatientId: null,
      DialogData: null,
    };
    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
  }

  SetPatientId = (PatientId) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatientId",
      PatientId,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatientId }, () => this.GetData(true));
  };

  GetData = async (FirstCheck) => {
    const { ObjectName, PatientId } = this.state;
    if (PatientId) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName, SearchOption: this.SearchOption },
        (resData) => {
          if (resData && resData.Data) {
            if (resData.Data.length === 0 && FirstCheck)
              this.setState({ FirstDataCheck: true });
            else this.setState({ FirstDataCheck: false });
            this.setState({
              Data: resData.Data,
              GridOption: resData.Option,
              isLoading: false,
            });
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    }
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "date_creation",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData(false);
  };

  Refresh = () => {
    if (
      this.SearchOption.SearchField &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "date_creation",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    this.setState({
      DialogData: (
        <BaseDialog Close={() => this.setState({ DialogData: null })}>
          <Ecg DataId={data.id_data} ObjectName="EcgExamination" />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;
    const { Title, Color } = this.props;

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              Height="454px"
              Title={Title || "ECG"}
              headerColor={Color || "info"}
              Data={Data}
              GridOption={GridOption}
              PageLimitChange={this.PageLimitChange}
              SearchField={this.SearchField}
              SearchFieldData={this.SearchOption.SearchField}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Fields={[
                { Label: t("Create date"), Name: "date_creation" },
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                { Label: t("Organization"), Name: "Organization.Name" },
                {
                  Label: t("City"),
                  Name: "Organization.DictProvinceCity.name",
                },
                {
                  Label: t("Soum"),
                  Name: "Organization.DictSoumDistrict.name",
                },
                {
                  Label: t("Bag/Khoroo"),
                  Name: "Organization.DictBagKhoroo.name",
                },
              ]}
            />
          </div>
        )}
      </div>
    );
  };
}

export default EcgTable;
