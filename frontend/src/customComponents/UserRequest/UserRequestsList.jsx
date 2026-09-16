import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
// default components
import Button from "components/CustomButtons/Button";
// custom components
import RangeDate from "customComponents/RangeDate";
import UniCard from "customComponents/UniCard";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import BaseDialog from "customComponents/BaseDialog";
import BaseList from "baseComponents/BaseList";
import IsActiveStatus from "customComponents/UserRequest/IsActiveStatus";
import UserRequestInfo from "customComponents/UserRequest/UserRequestInfo";
// helper
import Helper from "helper";

// UserRequests.IsActive codes; "" shows every request.
const STATUS_FILTERS = [
  { Value: "0", Label: "Хүлээгдэж буй" },
  { Value: "1", Label: "Зөвшөөрсөн" },
  { Value: "2", Label: "Татгалзсан" },
  { Value: "", Label: "Бүгд" },
];

class UserRequestsList extends BaseList {
  constructor(props) {
    super(props);
    // Opens on the queue that needs a decision.
    this.state = { ...this.state, ReadMoreDialog: null, StatusFilter: "0" };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
    this.SearchOption.SearchField = [
      { Field: "IsActive", Value: "0", Op: "Equals" },
    ];
    this.InfoRef = null;
  }

  ChangeStatusFilter = (Value) => {
    this.setState({ StatusFilter: Value });
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "IsActive",
      Value,
      this.SearchOption.SearchField,
      "Equals",
    );
    this.GetData();
  };

  // The dialog's reply: close and reload on success, alert either way. A null
  // reply means the dialog marked a field itself and there is nothing to say.
  AfterDecision = (resData) => {
    if (!resData) return;
    if (resData.Success) {
      this.setState({ ReadMoreDialog: null });
      this.GetData();
    }
    const alert = Helper.BaseCrudHelper.ShowAlert(
      resData.Message,
      resData.Success,
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  GetData = async () => {
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "UserRequests", SearchOption: this.SearchOption },
      (resData) => {
        if (resData) {
          if (resData.Success === false) this.ShowAlert(resData.Message, false);
          this.setState({
            Data: resData.Data,
            GridOption: Object.assign({}, resData.Option),
          });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  ReadMore = (data) => {
    // Only a pending request can be decided; the server refuses the rest too.
    const Pending = data.IsActive + "" === "0";
    const DialogData = (
      <BaseDialog
        Close={() => this.setState({ ReadMoreDialog: null })}
        Title="Хэрэглэгчийн хүсэлт"
        Width="720px"
        Height={Pending ? "720px" : "520px"}
        SaveButtonText="Баталгаажуулах"
        ShowSave={Pending}
        ShowDecline={Pending}
        Save={(setLoading) => {
          if (!this.InfoRef) return setLoading && setLoading(false);
          this.InfoRef.Confirm((resData) => {
            setLoading && setLoading(false);
            this.AfterDecision(resData);
          });
        }}
        Decline={(setDeclineLoading) => {
          if (!this.InfoRef)
            return setDeclineLoading && setDeclineLoading(false);
          this.InfoRef.Decline((resData) => {
            setDeclineLoading && setDeclineLoading(false);
            this.AfterDecision(resData);
          });
        }}
      >
        <UserRequestInfo Id={data.Id} ref={(ref) => (this.InfoRef = ref)} />
      </BaseDialog>
    );
    this.setState({ ReadMoreDialog: DialogData });
  };

  CustomRender = () => {
    const {
      Alert,
      Data,
      GridOption,
      Config,
      ReadMoreDialog,
      isLoading,
      StatusFilter,
    } = this.state;
    const { t } = this.props;

    if (!Config) {
      return null;
    } else {
      var FieldLists = Helper.BaseCrudHelper.GetFieldList(Config.Fields);
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {Alert}
          {ReadMoreDialog}
          <div
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Was a Creative Tim Card whose CardHeader drew a floating cyan pill
                over the top edge. UniCard is the frame every other list uses. */}
            <UniCard
              title={Config.TitleObject ? t(Config.TitleObject.Title + "") : ""}
              cardBodyStyle={{ gap: "8px" }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  marginTop: "0px",
                  width: "100%",
                  maxWidth: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Plain label beside the field, like RangeDate's "Хугацаа":
                    a floating MUI label collides with the legacy styles here. */}
                <label htmlFor="user-request-status" style={{ fontSize: 14 }}>
                  {t("Status")}
                </label>
                <TextField
                  select
                  size="small"
                  id="user-request-status"
                  value={StatusFilter}
                  onChange={(e) => this.ChangeStatusFilter(e.target.value)}
                  sx={{ minWidth: 180 }}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  {STATUS_FILTERS.map((Option) => (
                    <MenuItem key={Option.Label} value={Option.Value}>
                      {t(Option.Label)}
                    </MenuItem>
                  ))}
                </TextField>
                <RangeDate
                  ChangeValue={(StartDate, EndDate) => {
                    this.SearchOption.SearchField =
                      Helper.BaseCrudHelper.SetSearchField(
                        "CreateDate",
                        [StartDate, EndDate],
                        this.SearchOption.SearchField,
                        "Between",
                      );
                    this.GetData();
                  }}
                />
              </div>
              <div
                style={{
                  flex: "1 1 auto",
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {isLoading ? <DivLoading WithoutCard /> : null}
                <BaseGrid
                  Fields={FieldLists}
                  HideNumber={false}
                  Data={Data}
                  Option={GridOption}
                  TextLength={50}
                  OrderBy={this.OrderBy}
                  SearchField={this.SearchField}
                  SearchFieldData={this.SearchOption.SearchField}
                  PK={Config.PK ? Config.PK : "Id"}
                  ChangePage={this.PageLimitChange}
                  HideCheck={true}
                  FillHeight={true}
                  widthPattern="50c, 50c, 120l, 120, 120, 200, 100, 200, 150c, 120c, 120"
                  ColumnActions={[
                    {
                      Field: "IsActive",
                      Component: <IsActiveStatus />,
                      onClick: () => {},
                    },
                  ]}
                  RowActions={[
                    {
                      Component: (
                        <Button
                          color="info"
                          size="sm"
                          style={{ padding: "4px 8px 3px" }}
                        >
                          {t("Read more")}
                        </Button>
                      ),
                      onClick: (data) => this.ReadMore(data),
                    },
                  ]}
                />
              </div>
            </UniCard>
          </div>
        </div>
      );
    }
  };
}

export default withTranslation(undefined, { withRef: true })(UserRequestsList);
