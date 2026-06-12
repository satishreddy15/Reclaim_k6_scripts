import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<7000'],
  },
};

const BASE_URL = 'https://dev.helloreclaim.com';

export function setup() {
  return {
    accessToken:
'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..269eyhQumJ0yZUNO.CVB75zTWMvQph6eXGmYtS3y01MRLjQnZf3cVEYUVqU-IWNFdLP0MJSL_LALdenOED_iu0szRvGQtD_J2jvlu61zpuY7VRxpMP4KsBt1-zjIgk86TfogH9ewytrme1Syxru_mavFiWAPJZ1gIfBaOoAgQaSiI3zNycAsrmPX7DkVmCw2EeXEcyTAe5_MXbSgvnwgR_eviCG3YUSfssOazJ5AILvzwJzyL72BU0YZBAvpCuFmc0craXc4BObDs9Sj9__IYwRqDeMm-VT1AKTu2HbZdZDlsRjkG7u2bg5kjgcYg4Tb1sjcAtnO4gJmF8E6gEMpzI3J1.il4XZJocGnOebcb3nrsV0Q'
};
}

export default function (data) {

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.get(
    `${BASE_URL}/api/admin/hubs/list`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Hubs List API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Hubs List Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}