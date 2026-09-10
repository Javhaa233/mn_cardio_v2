import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// @mui/icons-material
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import BaseList from "baseComponents/BaseList";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";
import RangeDate from "customComponents/RangeDate";
// theme
import { colors } from "@/theme/colors";
// helper
import Helper from "helper";

/**
 * The history half of "2.2 Миний тэмдэглэл".
 *
 * Reads stay on the legacy /BaseObject list because it returns
 * `blood_pressure2` and the newer /api/patient journal endpoint does not yet
 * select it - dropping the diastolic reading is not an acceptable trade for
 * the nicer envelope. See the report note; once that attribute is added this
 * should move to Helper.PatientApiHelper.GetJournal like the chart did.
 *
 * Loading, failure and empty are all drawn now. `isLoading` was being set and
 * never read, and an empty history rendered as a bare <List> under a pager
 * counting nothing.
 */
class PatientMonitoringList extends BaseList {
  constructor(props) {
    super(props);
    // BaseList starts with isLoading false, which flashed the empty state for
    // the whole config + first fetch round trip. The list is loading from the
    // moment it mounts, so say so.
    this.state = { ...this.state, isLoading: true, LoadFailed: false };
    this.SearchOption.PageOption.Limit = 10;
    this.SearchOption.SearchField = [
      { Field: "patient_id", Value: props.PatientId, Op: "Equals" },
    ];
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
  }

  GetData = async () => {
    this.setState({ isLoading: true, LoadFailed: false });
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "PatientMonitoring", SearchOption: this.SearchOption },
      (resData) => {
        // CallService hands back { Success: false, Data: null } on a network
        // failure, so an unusable payload has to land in the error state
        // rather than leaving the spinner up for good.
        if (resData && Array.isArray(resData.Data)) {
          this.setState({
            Data: resData.Data,
            GridOption: resData.Option,
            isLoading: false,
            LoadFailed: false,
          });
        } else {
          this.setState({ Data: [], isLoading: false, LoadFailed: true });
        }
      },
    );
  };

  SetSearchOption = (StartDate, EndDate) => {
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "date_creation",
      [StartDate, EndDate],
      this.SearchOption.SearchField,
      "Between",
    );
    this.GetData();
  };

  Refresh = () => {
    if (
      this.SearchOption.SearchField &&
      this.SearchOption.SearchField.length > 0
    ) {
      this.SearchOption.SearchField = this.SearchOption.SearchField.filter(
        (el) => el.Field !== "date_creation",
      );
    }
    this.GetData();
  };

  RenderBody = () => {
    const { t } = this.props;
    const { Data, isLoading, LoadFailed } = this.state;

    if (isLoading) return <BaseLoading />;

    if (LoadFailed) {
      return (
        <LoadError
          Message={t("Тэмдэглэлийн түүхийг ачаалж чадсангүй")}
          Retry={this.GetData}
        />
      );
    }

    if (!Array.isArray(Data) || Data.length === 0) {
      return <BaseNoData Text="Одоогоор бүртгэсэн тэмдэглэл алга байна" />;
    }

    return (
      <List style={{ padding: 0 }}>
        {Data.map((row, index) => (
          <ListItem
            key={row.id_data || index}
            style={{
              background: colors.background.primary,
              borderRadius: "8px",
              marginBottom: "8px",
              padding: "12px 16px",
              boxShadow: "0 1px 3px " + colors.shadow.light,
            }}
          >
            <div style={{ width: "100%", fontSize: "14px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  color: colors.text.secondary,
                  fontSize: "13px",
                }}
              >
                <AccessTimeIcon
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "6px",
                  }}
                />
                {row.date}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <div
                  style={{
                    background: colors.background.infoTint,
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {t("Даралт")}: {row.blood_pressure}
                  {row.blood_pressure2 ? "/" + row.blood_pressure2 : ""}
                </div>
                <div
                  style={{
                    background: colors.background.surfaceAlt,
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {t("Жин")}: {row.weight}
                  {t("кг")}
                </div>
              </div>
              {row.comment && (
                <div style={{ marginTop: "8px", color: colors.text.strong }}>
                  {t("Уусан эм")}: {row.comment}
                </div>
              )}
            </div>
          </ListItem>
        ))}
      </List>
    );
  };

  CustomRender = () => {
    const { Data, GridOption, isLoading, LoadFailed } = this.state;
    const HasRows = Array.isArray(Data) && Data.length > 0;
    return (
      <div>
        <div style={{ marginBottom: "10px" }}>
          <RangeDate
            ChangeValue={(StartDate, EndDate) => {
              this.SetSearchOption(StartDate, EndDate);
            }}
            Refresh={this.Refresh}
          />
        </div>
        {this.RenderBody()}
        {!isLoading && !LoadFailed && HasRows && (
          <Paginition
            Option={GridOption}
            ChangePage={this.PageLimitChange}
            PageSize={10}
            RowsPerPageOptions={[10]}
          />
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  PatientMonitoringList,
);
