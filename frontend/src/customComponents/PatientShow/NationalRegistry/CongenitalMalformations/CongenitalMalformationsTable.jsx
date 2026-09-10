import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import BaseList from "baseComponents/BaseList";

import BaseTable from "customComponents/BaseTable";
import UniCard from "customComponents/UniCard";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";
import IsType from "customComponents/NationalRegistry/Components/IsType";
import IsCategory from "customComponents/NationalRegistry/Components/IsCategory";

import Neelttei from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Neelttei";
import Sudas from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Sudas";
import Katetr from "customComponents/DetailViews/NationalRegistry/CongenitalMalformations/Katetr";

// Forms
import NeeltteiForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/NeeltteiForm";
import SudasForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/SudasForm";
import KatetrForm from "customComponents/Forms/NationalRegistry/CongenitalMalformations/KatetrForm";

// helper
import Helper from "helper";

class CongenitalMalformationsTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Config: {},
      FirstDataCheck: true,
      PatRegNo: null,
      DialogData: null,
    };

    this.SearchOption.PageOption = { Page: 0, Limit: 10 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    // refs
    this.DialogRef = createRef();

    this.Neelttei = createRef();
    this.Sudas = createRef();
    this.Katetr = createRef();

    // forms
    this.NeeltteiForm = createRef();
    this.SudasForm = createRef();
    this.KatetrForm = createRef();
  }

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
    const { ObjectName, PatRegNo } = this.state;
    if (PatRegNo) {
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
      "CreatedDate",
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
        (el) => el.Field !== "CreatedDate",
      );
      this.GetData(false);
    }
  };

  ShowData = (data) => {
    const category = data.n_category;

    let tempDialog = null;
    let tempView = null;
    if (category === "neelttei") {
      if (data.is_confirm === "yes") {
        tempView = (
          <Neelttei ref={(ref) => (this.Neelttei = ref)} DataId={data.Id} />
        );
      } else {
        tempView = (
          <NeeltteiForm
            ref={(ref) => (this.NeeltteiForm = ref)}
            ObjectName="CongenitalMalformations"
            PatientRegNo={data.PatRegNo}
          />
        );
      }
      tempDialog = (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() => {
            this.Neelttei.Print &&
              this.Neelttei.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Save={(stopLoading) => {
            this.NeeltteiForm.Save &&
              this.NeeltteiForm.Save((Success) => {
                if (Success) {
                  this.GetData(false);
                  this.setState({ DialogData: null });
                }
                stopLoading && stopLoading();
              });
          }}
          Confirm={() => {
            this.NeeltteiForm.Confirm &&
              this.NeeltteiForm.Confirm(() => {
                this.DialogRef.setState({ ConfirmLoading: false });
              });
          }}
          ShowPrint={data.is_confirm === "yes"}
          ShowConfirm={data.is_confirm !== "yes"}
          ShowSave={data.is_confirm !== "yes"}
        >
          {tempView}
        </BaseDialog>
      );
    } else if (category === "sudsan_dotuurh") {
      if (data.is_confirm === "yes") {
        tempView = <Sudas ref={(ref) => (this.Sudas = ref)} DataId={data.Id} />;
      } else {
        tempView = (
          <SudasForm
            ref={(ref) => (this.SudasForm = ref)}
            ObjectName="CongenitalMalformations"
            PatientRegNo={data.PatRegNo}
          />
        );
      }

      tempDialog = (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() => {
            this.Sudas.Print &&
              this.Sudas.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Save={(stopLoading) => {
            this.SudasForm.Save &&
              this.SudasForm.Save((Success) => {
                if (Success) {
                  this.GetData(false);
                  this.setState({ DialogData: null });
                }
                stopLoading && stopLoading();
              });
          }}
          Confirm={() => {
            this.SudasForm.Confirm &&
              this.SudasForm.Confirm(() => {
                this.DialogRef.setState({ ConfirmLoading: false });
              });
          }}
          ShowPrint={data.is_confirm === "yes"}
          ShowConfirm={data.is_confirm !== "yes"}
          ShowSave={data.is_confirm !== "yes"}
        >
          {tempView}
        </BaseDialog>
      );
    } else if (category === "katetr") {
      if (data.is_confirm === "yes") {
        tempView = (
          <Katetr ref={(ref) => (this.Katetr = ref)} DataId={data.Id} />
        );
      } else {
        tempView = (
          <KatetrForm
            ref={(ref) => (this.KatetrForm = ref)}
            ObjectName="CongenitalMalformations"
            PatientRegNo={data.PatRegNo}
          />
        );
      }

      tempDialog = (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Print={() => {
            this.Katetr.Print &&
              this.Katetr.Print(() => {
                this.DialogRef.setState({ PrintLoading: false });
              });
          }}
          Save={(stopLoading) => {
            this.KatetrForm.Save &&
              this.KatetrForm.Save((Success) => {
                if (Success) {
                  this.GetData(false);
                  this.setState({ DialogData: null });
                }
                stopLoading && stopLoading();
              });
          }}
          Confirm={() => {
            this.KatetrForm.Confirm &&
              this.KatetrForm.Confirm(() => {
                // this.GetData(false);
                this.DialogRef.setState({ ConfirmLoading: false });
              });
          }}
          ShowPrint={data.is_confirm === "yes"}
          ShowConfirm={data.is_confirm !== "yes"}
          ShowSave={data.is_confirm !== "yes"}
        >
          {tempView}
        </BaseDialog>
      );
    } else {
      tempDialog = null;
    }

    this.setState({ DialogData: tempDialog });
  };

  CustomRender = () => {
    const { Data, DialogData, GridOption, isLoading, FirstDataCheck } =
      this.state;
    const { Title, t } = this.props;

    return (
      <div>
        {FirstDataCheck ? null : (
          <div style={{ position: "relative" }}>
            {DialogData}
            {isLoading ? <DivLoading /> : null}
            <UniCard title={t(Title || "Congenital Malformations")}>
              <BaseGrid
                FillHeight={false}
                Height="454px"
                Data={Data}
                GridOption={GridOption}
                PageLimitChange={this.PageLimitChange}
                ShowData={this.ShowData}
                OrderBy={this.OrderBy}
                Fields={[
                  { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
                  { Label: t("Төрөл"), Name: "n_type" },
                  { Label: t("Ангилал"), Name: "n_category" },
                  { Label: t("Баталгаажилт"), Name: "is_confirm" },
                  {
                    Label: t("Create date"),
                    Name: "CreatedDate",
                    Type: "Date",
                  },
                ]}
                ColumnActions={[
                  { Field: "n_type", Component: <IsType /> },
                  { Field: "n_category", Component: <IsCategory /> },
                  { Field: "is_confirm", Component: <IsActive /> },
                ]}
                SearchField={(Field, Text) => this.SearchField(Field, Text)}
              />
            </UniCard>
          </div>
        )}
      </div>
    );
  };
}

export default withTranslation()(CongenitalMalformationsTable);
