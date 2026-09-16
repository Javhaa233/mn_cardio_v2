import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import "./TCD.css";

const TCD = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const fetchData = () => {
    // Was a raw fetch to https://backend.telemedicine.mn/BaseObject/ carrying the
    // user's MnCardioToken from localStorage - a live session token sent to another
    // environment's backend, around config/Server.js and both proxies. See the same
    // note in Visit2.jsx. BaseCrudHelper attaches the token centrally and keeps the
    // request on this deployment's own /api.
    const user = Helper.AuthHelper.GetLogedUserLocal();
    if (!user) return;

    Helper.BaseCrudHelper.BaseGetList(
      {
        ObjectName: "PCathlab",
        SearchOption: {
          WhereType: "Contains",
          FindType: "AllData",
          OrderBy: { Field: "id_data", Type: "desc" },
          PageOption: { Limit: 1000, Page: 0 },
          SearchField: [
            { Field: "user_mod", Value: user.UserName, Op: "Equals" },
          ],
        },
      },
      (resData) => {
        if (resData && resData.Success) setData(resData);
      },
    );
  };
  useEffect(() => {
    fetchData();
  }, []);
  return data ? (
    <>
      <table id="tcd">
        <thead>
          <tr>
            <th>Үүсгэсэн огноо</th>
            <th>Эмч</th>
            <th>Байгууллага</th>
            <th>Аймаг/хот</th>
            <th>Сум/дүүрэг</th>
            <th>Баг/хороо</th>
            <th>Өвчтөний нэр</th>
            <th>Хаяг</th>
            <th>Онош</th>
          </tr>
        </thead>
        <tbody>
          {data.Data.map((d) => {
            return (
              <tr key={d.id_data || d.Patient.id_data}>
                <td>{d.date_creation}</td>
                <td>{d.DoctorsProfile.FullName}</td>
                <td>{d.Organization.Name}</td>
                <td>{d.Organization.DictProvinceCity.name}</td>
                <td>{d.Organization.DictSoumDistrict.name}</td>
                <td>{d.Organization.DictBagKhoroo.name}</td>
                <td>{d.Patient.FullName}</td>
                <td>{d.Patient.p_address}</td>
                <td>{d.Conclusion}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  ) : (
    <div>{t("Loading ...")}</div>
  );
};

export default TCD;
