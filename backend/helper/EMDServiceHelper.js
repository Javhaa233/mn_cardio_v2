const axios = require('axios');
const { URLSearchParams } = require('url');

/**
 * Every call here goes to a government service we do not control.
 *
 * Without a timeout axios waits on the OS default, so when st.health.gov.mn is
 * down the request holds a worker for 70+ seconds and the caller sees a 502
 * rather than a clean "upstream unavailable". Endpoints that call these
 * helpers had to be excluded from the acceptance sweep for exactly that.
 */
const UPSTREAM_TIMEOUT_MS =
  Number(process.env.EMD_TIMEOUT_MS) > 0 ? Number(process.env.EMD_TIMEOUT_MS) : 15000;

/**
 * Log an upstream failure in one line.
 *
 * console.log(ex) on an axios error prints the whole error object, config
 * included - and for getToken() that config carries EMD_USERNAME and
 * EMD_PASSWORD in the form body. Never print the raw error.
 */
const LogUpstream = (Where, ex) => {
  const Status = ex && ex.response ? ex.response.status : null;
  const Code = ex && ex.code ? ex.code : null;
  console.log(
    '[EMDService/' + Where + '] upstream failed' +
      (Status ? ' status=' + Status : '') +
      (Code ? ' code=' + Code : '') +
      ' msg=' + ((ex && ex.message) || 'unknown')
  );
};

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
      timeout: UPSTREAM_TIMEOUT_MS,
    });
    if (res.status === 200) return res.data.access_token;
    return null;
  } catch (ex) {
    LogUpstream('getToken', ex);
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
      timeout: UPSTREAM_TIMEOUT_MS,
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    LogUpstream('getTablet', ex);
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
      timeout: UPSTREAM_TIMEOUT_MS,
    });

    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    LogUpstream('getTabletByDiagnosis', ex);
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
      timeout: UPSTREAM_TIMEOUT_MS,
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    LogUpstream('getPatient', ex);
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
      timeout: UPSTREAM_TIMEOUT_MS,
    });
    if (res.status === 200) return res.data;
    return null;
  } catch (ex) {
    LogUpstream('savePrescription', ex);
    return null;
  }
};
