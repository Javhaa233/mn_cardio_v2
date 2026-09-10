import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";

import SearchIcon from "@mui/icons-material/Search";

import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import GridToolbar, { ToolbarField } from "customComponents/GridToolbar";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import SimpleSelect from "customComponents/SimpleSelect";
import BaseLoadButton from "customComponents/BaseLoadButton";
import CustomTextField from "customComponents/Forms/Components/CustomTextField";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";
import IsType from "customComponents/NationalRegistry/Components/IsType";
import UniCard from "customComponents/UniCard";

// views
import SurgeryPlans from "customComponents/DetailViews/SurgeryPlans";
// helper
import Helper from "helper";

class SurgeryPlansTable extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Config: {}, DialogData: null };

    this.Category = props.Category || null;
    this.SearchOption.PageOption = { Page: 0, Limit: 20 };
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = null;

    // refs
    this.DialogRef = createRef();
    this.SurgeryPlansRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const { Category } = this;
    if (Category) {
      this.setState({ isLoading: true });
      const ReqData = Helper.BaseCrudHelper.GetRequestData(
        "SurgeryPlans",
        this.SearchOption,
      );
      await Helper.BaseCrudHelper.CallService(
        "/SurgeryPlans/GetList",
        ReqData,
        (resData) => {
          resData &&
            this.setState({ Data: resData.Data, GridOption: resData.Option });
          this.setState({ isLoading: false });
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
    this.GetData();
  };

  Refresh = () => {};

  ShowData = (data) => {
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
        >
          <SurgeryPlans
            ref={(ref) => (this.SurgeryPlansRef = ref)}
            DataId={data.Id}
          />
        </BaseDialog>
      ),
    });
  };

  CustomRender = () => {
    const { t, color, Title } = this.props;
    const { Data, DialogData, GridOption, isLoading } = this.state;

    return (
      <div>
        {DialogData}
        <div style={{ position: "relative" }}>
          {isLoading ? <DivLoading /> : null}
          <UniCard
            title={t(Title || "Congenital malformation")}
            showHeader={true}
          >
            <GridToolbar>
              <ToolbarField width={200}>
                <SimpleSelect
                  ChangeValue={(Value) => {
                    if (Value !== "-1") {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "n_type",
                          Value,
                          this.SearchOption.SearchField,
                          "Equals",
                        );
                    } else {
                      this.SearchOption.SearchField =
                        Helper.BaseCrudHelper.SetSearchField(
                          "n_type",
                          "inactive",
                          this.SearchOption.SearchField,
                          "NotEquals",
                        );
                    }
                  }}
                  DefaultValue="-- Select --"
                  FullWidth={true}
                  Variant={"outlined"}
                  Config={{
                    Name: "n_type",
                    Config: { IdField: "Value", TextField: "Value" },
                    Data: [{ Value: "Насанд хүрэгчид" }, { Value: "Хүүхэд" }],
                  }}
                />
              </ToolbarField>
              <ToolbarField>
                <CustomTextField
                  placeholder={"Personal No"}
                  ChangeValue={(Value) => {
                    this.SearchOption.SearchField =
                      Helper.BaseCrudHelper.SetSearchField(
                        "PatRegNo",
                        Value,
                        this.SearchOption.SearchField,
                        "Contains",
                      );
                  }}
                />
              </ToolbarField>
              <BaseLoadButton
                ButtonText="Хайх"
                Color="success"
                Icon={SearchIcon}
                onClick={(callback) => {
                  this.GetData();
                  callback && callback();
                }}
              />
            </GridToolbar>
            <BaseGrid
              PK={"Id"}
              TextLength={20}
              Fields={[
                { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
                { Label: t("Personal number"), Name: "PatRegNo" },
                { Label: t("Баталгаажилт"), Name: "is_confirm" },
                {
                  Label: t("Create date"),
                  Name: "CreatedDate",
                  Type: "Date",
                },
              ]}
              Data={Data}
              PageSize={20}
              HideNumber={true}
              HideCheck={true}
              HideFilter={true}
              ColumnActions={[
                { Field: "PatRegNo", Component: <ShowPatient /> },
                { Field: "is_confirm", Component: <IsActive /> },
              ]}
              OrderBy={this.OrderBy}
              ChangePage={this.PageLimitChange}
              Option={GridOption}
              ShowData={this.ShowData}
              SearchField={(Field, Text) => this.SearchField(Field, Text)}
            />
          </UniCard>
        </div>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(SurgeryPlansTable);
