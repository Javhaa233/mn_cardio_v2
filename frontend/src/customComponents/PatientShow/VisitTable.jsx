import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
import Visit from "customComponents/DetailViews/Visit";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog"; // Шинэ forwardRef бүхий хувилбар
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import Helper from "helper";

class VisitTable extends BaseList {
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
    this.VisitRef = createRef();
    this.DialogRef = createRef();
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
          if (resData?.Data) {
            this.setState({
              FirstDataCheck: resData.Data.length === 0 && FirstCheck,
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
      "visit_date",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData(false);
  };

  Refresh = () => {
    if (this.SearchOption.SearchField?.length > 0) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "visit_date",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    const { PatientId } = this.state;

    this.setState({
      DialogData: (
        <BaseDialog
          ref={this.DialogRef}
          Close={() => this.setState({ DialogData: null })}
          Print={(onComplete) => {
            const visit = this.VisitRef.current;
            if (visit?.Print) {
              visit.Print(() => {
                onComplete && onComplete();
              });
            } else {
              onComplete && onComplete();
            }
          }}
          ShowPrint={true}
        >
          <Visit
            ref={this.VisitRef}
            DataId={data.id_data}
            PatientId={PatientId}
            ObjectName="Visit"
          />
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
              Title={Title || "Visit"}
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
                { Label: t("Visit date"), Name: "visit_date", Type: "Date" },
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
                {
                  Label: t("Create date"),
                  Name: "date_creation",
                  Type: "Date",
                },
              ]}
            />
          </div>
        )}
      </div>
    );
  };
}

export default VisitTable;
