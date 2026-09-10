import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useTranslation } from "react-i18next";
import React, { createRef } from "react";

import PatientTransfer from "customComponents/DetailViews/PatientTransfer";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";

import Helper from "helper";

class PatientTransferTable extends BaseList {
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
    this.PatientTransfer = createRef();
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
    const { PatientId } = this.state;
    if (PatientId) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "PatientTransfer", SearchOption: this.SearchOption },
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
        (el) => el.Field !== "CreateDate",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    const DialogDatas = (
      <BaseDialog
        ref={(ref) => (this.DialogRef = ref)}
        Close={() => this.setState({ DialogData: null })}
        // Print={() => {
        //   if (this.PatientTransfer) {
        //     this.PatientTransfer.Print((Data) =>
        //       this.DialogRef.setState({ PrintLoading: false })
        //     );
        //   }
        // }}
        // ShowPrint={true}
      >
        <PatientTransfer
          ref={(ref) => (this.PatientTransfer = ref)}
          DataId={data.Id}
          ObjectName="PatientTransfer"
        />
      </BaseDialog>
    );
    this.setState({ DialogData: DialogDatas });
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <BaseGrid
              FillHeight={false}
              Height="454px"
              headerColor="success"
              Data={Data}
              GridOption={GridOption}
              PageLimitChange={this.PageLimitChange}
              ShowData={this.ShowData}
              OrderBy={this.OrderBy}
              Fields={[
                {
                  Label: t("Transfered date"),
                  Name: "TransferedDate",
                  Type: "Date",
                },
                { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                {
                  Label: t("From"),
                  Name: "FromOrganization.Name",
                  Type: "Date",
                },
                { Label: t("To"), Name: "ToOrganization.Name", Type: "Date" },
                { Label: t("Create date"), Name: "CreateDate", Type: "Date" },
              ]}
              SearchField={(Field, Text) => this.SearchField(Field, Text)}
            />
          </div>
        )}
      </div>
    );
  };
}

export default PatientTransferTable;
