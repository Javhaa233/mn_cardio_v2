import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useTranslation } from "react-i18next";
import React, { createRef } from "react";

import PatientSendPage from "customComponents/DetailViews/PatientSendPage";
import BaseTable from "customComponents/BaseTable";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";

import Helper from "helper";

class PatientSendPageTable extends BaseList {
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
    this.PatientSendPage = createRef();
    this.DialogRef = createRef();
  }

  // SetPatientId = (PatientId) => {
  //   this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
  //     "PatientId",
  //     PatientId,
  //     this.SearchOption.SearchField,
  //     "Equals"
  //   );
  //   this.setState({ PatientId }, () => {
  //     this.GetData(true);
  //   });
  // };

  SetPatRegNo = (PatRegNo) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "PatRegNo",
      PatRegNo,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ PatRegNo }, () => this.GetData(true));
  };

  GetData = async (FirstCheck) => {
    const { PatientId, PatRegNo } = this.state;
    if (PatRegNo) {
      this.setState({ isLoading: true });
      await Helper.BaseCrudHelper.BaseGetList(
        { ObjectName: "PatientSendPage", SearchOption: this.SearchOption },
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
        //   if (this.PatientSendPage) {
        //     this.PatientSendPage.Print((Data) =>
        //       this.DialogRef.setState({ PrintLoading: false })
        //     );
        //   }
        // }}
        // ShowPrint={true}
      >
        <PatientSendPage
          ref={(ref) => (this.PatientSendPage = ref)}
          DataId={data.Id}
          ObjectName="PatientSendPage"
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
                { Label: t("Send date"), Name: "SendDate", Type: "Date" },
                { Label: t("Type"), Name: "type", Type: "Date" },
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

export default PatientSendPageTable;
