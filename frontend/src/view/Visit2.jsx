import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Helper from "helper";
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
    // This used to raw-fetch https://backend.telemedicine.mn/BaseObject/ with the
    // user's MnCardioToken read straight out of localStorage - i.e. it sent a live
    // session token to a DIFFERENT environment's backend, bypassing the axios
    // instance in config/Server.js, the Vite dev proxy and the production reverse
    // proxy. In dev and on test that leaked the token off-box entirely.
    //
    // BaseCrudHelper is how every other screen talks to the API: relative /api URL,
    // token attached centrally, 401 handled centrally. It is callback-style, not
    // promise-style.
    let active = true;
    setLoading(true);
    Helper.BaseCrudHelper.BaseGetList(
      {
        ObjectName: "Visit",
        SearchOption: {
          WhereType: "Contains",
          FindType: "AllData",
          OrderBy: { Field: "id_data", Type: "desc" },
          PageOption: { Limit: pageSize, Page: currentPage },
          SearchField: [{ Field: "id", Value: 320, Op: "Equals" }],
        },
      },
      (resData) => {
        if (!active) return;
        if (resData && resData.Success) {
          setData(resData);
          const totalItems = resData.Data ? resData.Data.length : 0;
          setTotalPages(Math.ceil(totalItems / pageSize));
          setError(null);
        } else {
          setError((resData && resData.Message) || t("Алдаа гарлаа"));
        }
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [currentPage, pageSize, t]);

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
