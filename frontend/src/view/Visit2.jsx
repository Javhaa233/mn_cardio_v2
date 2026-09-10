import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./visit.css";

const Visit2 = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const url = "https://backend.telemedicine.mn/BaseObject/";
      const token = window.localStorage.getItem("MnCardioToken");
      const requestData = {
        ObjectName: "Visit",
        WhereType: "Contains",
        FindType: "AllData",
        OrderByField: "id_data",
        OrderByType: "desc",
        PageSize: pageSize,
        PageNumber: currentPage,
        SearchField: [
          {
            Field: "id",
            Value: 320,
            Op: "Equals",
          },
        ],
        AppId: 1,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        console.log(result); // Debug: Show the result to check the structure

        setData(result);

        // To calculate total pages, we use the length of the current data and the page size
        const totalItems = result.Data ? result.Data.length : 0;
        const totalPagesCalculated = Math.ceil(totalItems / pageSize); // Calculate total pages
        setTotalPages(totalPagesCalculated);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  if (loading) return <p>{t("Loading...")}</p>;
  if (error) return <p>{t("Error: {{error}}", { error })}</p>;

  let counter = 0;
  const noDataMessage = t("No data available");

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0); // Reset to first page when page size changes
  };

  return (
    <div>
      {data && data.Data && data.Data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("Patient Reg No")}</th>
              <th>{t("Doctor Name")}</th>
              <th>{t("Organization")}</th>
              <th>{t("Date Created")}</th>
              <th>{t("Last Name")}</th>
              <th>{t("First Name")}</th>
              <th>{t("Birth date")}</th>
              <th>{t("Age")}</th>
              <th>{t("Date de modification")}</th>
              <th>{t("Notes")}</th>
              <th>{t("Main diagnosis")}</th>
              <th>{t("ICD10")}</th>
              <th>{t("Treatments, Procedures, Referrals, Major findings")}</th>
            </tr>
          </thead>
          <tbody>
            {data.Data.map((patient) => {
              counter++;
              return (
                <tr key={patient.PatRegNo}>
                  <td>{counter}</td>
                  <td>{patient.PatRegNo}</td>
                  <td>{patient.DoctorsProfile.FullName}</td>
                  <td>{patient.Organization.Name}</td>
                  <td>{patient.date_creation}</td>
                  <td>{patient.Patient.p_lastname}</td>
                  <td>{patient.Patient.p_firstname}</td>
                  <td>{patient.Patient.p_birthday}</td>
                  <td>{patient.Patient.Age}</td>
                  <td>{patient.date_modif}</td>
                  <td>{patient.Notes}</td>
                  <td>{patient.main_diagnosis}</td>
                  <td>{patient.icd10}</td>
                  <td>{`${
                    patient.c_treatment ? patient.c_treatment : "No treatment"
                  } ${
                    patient.c_procedure ? patient.c_procedure : "No procedure"
                  }, ${
                    patient.referred_by_13a === "n" ? "13a No" : "13a Yes"
                  }, ${
                    patient.major_findings
                      ? patient.major_findings
                      : "No Major findings"
                  } `}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>{noDataMessage}</p>
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={prevPage} disabled={currentPage === 0}>
          {t("Previous")}
        </button>
        <span>
          {t("Page {{currentPage}} of {{totalPages}}", {
            currentPage: currentPage + 1,
            totalPages,
          })}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages - 1}>
          {t("Next")}
        </button>

        {/* Page size selector */}
        <select value={pageSize} onChange={changePageSize}>
          <option value={10}>{t("10")}</option>
          <option value={20}>{t("20")}</option>
          <option value={50}>{t("50")}</option>
        </select>
      </div>
    </div>
  );
};

export default Visit2;
