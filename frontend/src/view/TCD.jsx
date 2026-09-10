import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./TCD.css";

const TCD = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const fetchData = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("MnCardioToken"),
    );
    let user = JSON.parse(window.localStorage.getItem("LogedUser"));
    const raw = JSON.stringify({
      ObjectName: "PCathlab",
      WhereType: "Contains",
      FindType: "AllData",
      OrderByField: "id_data",
      OrderByType: "desc",
      PageSize: 1000,
      PageNumber: 0,
      SearchField: [
        {
          Field: "user_mod",
          Value: user.UserName,
          Op: "Equals",
        },
      ],
      AppId: 1,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://backend.telemedicine.mn/BaseObject/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      })
      .catch((error) => console.error(error));
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
