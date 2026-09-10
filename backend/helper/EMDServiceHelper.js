const axios = require('axios');
const { URLSearchParams } = require('url');

const getToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', 'health');
    params.append('grant_type', 'password');
    params.append('username', process.env.EMD_USERNAME);
    params.append('password', process.env.EMD_PASSWORD);

    const res = await axios({
      method: 'POST',
      url: 'https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: params,
    });
    if (res.status === 200) return res.data.access_token;
    return null;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

module.exports.getTokens = getToken;

module.exports.getTablet = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return [];
    }
    const res = await axios({
      method: 'GET',
      url: 'https://st.health.gov.mn/api/v2/service/service/getTablet',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

// By Diagnosis
module.exports.getTabletByDiagnosis = async (diagCode, PatRegNo) => {
  try {
    const token = await getToken();
    if (!token && diagCode && PatRegNo) return [];
    const res = await axios({
      method: 'GET',
      url:
        'https://st.health.gov.mn/api/v2/prescription/diagnosis/getTabletByDiagnosis?diagCode=' +
        diagCode +
        '&regNo=' +
        encodeURI(PatRegNo) +
        '&receiptType=1',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      // data: params,
    });

    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

module.exports.getPatient = async (PatRegNo) => {
  try {
    const token = await getToken();
    if (!token && PatRegNo) return null;

    const params = new URLSearchParams();
    params.append('regNo', PatRegNo);
    params.append('fingerPrint', '');
    params.append('isChild', false);
    params.append('parentRegNo', '');
    params.append('parentFingerPrint', '');
    params.append('authorRegNo', '');
    params.append('authorFingerPrint', '');

    const res = await axios({
      method: 'POST',
      url: 'https://st.health.gov.mn/api/v2/consumer/consumer/getCitizenInfo',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + token,
      },
      data: params,
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

module.exports.savePrescription = async (SentData, DoctorRegNo) => {
  try {
    const token = await getToken();
    if (!token && SentData && DoctorRegNo) return null;
    const res = await axios({
      method: 'POST',
      url: 'https://st.health.gov.mn/api/v2/prescription/prescription/savePrescription',
      headers: {
        'Content-Type': 'application/json',
        'Account-RegNo': encodeURI(DoctorRegNo),
        Authorization: 'Bearer ' + token,
      },
      data: JSON.stringify(SentData),
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};
