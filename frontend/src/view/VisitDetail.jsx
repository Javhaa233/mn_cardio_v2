import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

const VisitDetail = (props) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(props.detail.id_data);
  useEffect(() => {
    const fetchData = async () => {
      const url = "https://backend.telemedicine.mn/Visit/GetVisitsByPatient/"; // Your API URL
      const token = window.localStorage.getItem("MnCardioToken"); // Replace with your actual token
      const requestData = {
        ObjectName: "Visit",
        WhereType: "Contains",
        FindType: "AllData",
        PageSize: 20,
        PageNumber: 0,
        SearchField: [
          {
            Field: "id_data",
            Value: parseInt(props.detail.id_data),
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
            Authorization: `Bearer ${token}`, // Include Bearer token
          },
          body: JSON.stringify(requestData), // Send the request data
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setData(result.Data[0]); // Store the result in state
        console.log(result.Data[0]);
      } catch (error) {
        setError(error.message); // Handle any errors
      } finally {
        setLoading(false); // Set loading state to false once the request is complete
      }
    };

    fetchData();
  }, [props.detail.id_data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  console.log(data.chief_complaintObj);
  let chief_complaintObj = "";
  if (data.chief_complaintObj.length > 0) {
    data.chief_complaintObj.map((ch) => {
      chief_complaintObj += ch.Label + ", ";
    });
  }
  return (
    <div id="container_visitdetail">
      <div id="visitdetail">
        <div id="header_visitdetail">
          <span style={{ fontSize: "1rem" }}>Үзлэг</span>
          <span
            className="MuiIconButton-label"
            onClick={() => props.setDetail(false)}
            style={{ cursor: "pointer", marginLeft: "700px" }}
          >
            <svg
              className="MuiSvgIcon-root"
              focusable="false"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </span>
        </div>

        <div id="visitdetailcontents">
          <p>
            Date of visit:
            <span className="fontweightbold" style={{ marginLeft: "1rem" }}>
              {data.date_creation}
            </span>
          </p>
          <p>
            Doctor:{" "}
            <span className="fontweightbold" style={{ marginLeft: "1rem" }}>
              {data.DoctorsProfile.FullName}
            </span>
          </p>
          <div style={{ marginTop: "1rem" }}>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Үндсэн зовиур: </p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{chief_complaintObj}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Бусад үндсэн зовиур:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.other_chief_complaint}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Үзлэгийн тэмдэглэл:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.Notes}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Систолийн даралт:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>abc{data["s_bp"]}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Диастолын даралт:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.d_bp}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Зүрхний хэмнэл: </p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.pe_vs_heart}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Цочмог сул саа саажилттай эсэх:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.paralysis === "n" ? "No" : ""}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>INR:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.inr}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Жин:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.weight}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Үндсэн онош:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.main_diagnosis}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Үндсэн оношийн дэлгэрэнгүй:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.main_diagnosis_notes}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>ICD10: </p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.icd10 === null ? "" : data.icd10}</p>
              </div>
            </div>

            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Үндсэн өөрчлөлтүүд:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.major_findings}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Эмчилгээ: </p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.c_treatment}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Шилжүүлэг:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.referred_by_13a}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Ажилбарын нэр:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p>{data.c_procedure}</p>
              </div>
            </div>
            <div className="divwithbottomborder">
              <div style={{ width: "200px", textAlign: "right" }}>
                <p>Хавсаргасан файл:</p>
              </div>
              <div style={{ paddingLeft: "1rem" }}>
                <p></p>
              </div>
            </div>
          </div>
        </div>
        <div id="bottom_visitdetail">
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-text jss71 jss95 jss73"
            tabIndex="0"
            type="button"
            style={{ float: "left", margin: "4px" }}
          >
            <span
              className="MuiButton-label"
              onClick={() => props.setDetail(false)}
              style={{
                cursor: "pointer",
                background: "#9c27b0",
                padding: ".25rem 1rem",
                borderRadius: "3px",
                color: "white",
              }}
            >
              <span className="MuiButton-startIcon MuiButton-iconSizeMedium">
                <svg
                  className="MuiSvgIcon-root"
                  focusable="false"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
                </svg>
              </span>
              Буцах
            </span>
          </button>
        </div>
      </div>
      <div id="background_visitdetail"></div>
    </div>
  );
};

export default VisitDetail;
