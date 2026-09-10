import { useTranslation } from "react-i18next";
import React, { createRef } from "react";

import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import OutPatientInfoReport from "customComponents/Report/OutPatientInfoReport";

import Helper from "helper";

class OutPatientInfoTable extends BaseList {
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
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };

    // refs
    this.OutPatientInfoReportRef = createRef();
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
      "CreateDate",
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
        (el) => el.Field !== "LogDate",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    if (data) {
      const DialogDatas = (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() => {
            // this.OutPatientInfoReportRef.Print &&
            //   this.OutPatientInfoReportRef.Print(() =>
            //     this.DialogRef.setState({ PrintLoading: false })
            //   );
            this.OutPatientInfoReportRef.NewPrint &&
              this.OutPatientInfoReportRef.NewPrint(() =>
                this.DialogRef.setState({ PrintLoading: false }),
              );
          }}
          ShowPrint={true}
        >
          <OutPatientInfoReport
            ref={(ref) => (this.OutPatientInfoReportRef = ref)}
            DataId={data.Id}
          />
        </BaseDialog>
      );
      this.setState({ DialogData: DialogDatas });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;
    const { Title, Color } = this.props;

    return (
      <div>
        {DialogData}
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {isLoading ? <DivLoading /> : null}
            <BaseTable
              Title={Title || "Outpatient Info"}
              headerColor={Color || "info"}
              Search={this.SetSearchOption}
              Refresh={this.Refresh}
              Data={Data}
              GridOption={GridOption}
              PageLimitChange={this.PageLimitChange}
              SearchField={this.SearchField}
              SearchFieldData={this.SearchOption.SearchField}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              FillHeight={false}
              Height="454px"
              Fields={[
                { Label: t("Date"), Name: "CreateDate", Type: "Date" },
                { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
              ]}
            />
          </div>
        )}
      </div>
    );
  };
}

export default OutPatientInfoTable;
