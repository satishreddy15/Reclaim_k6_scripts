import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
  },
};

const BASE_URL = 'https://dev.helloreclaim.com';

// old Access Token
const ACCESS_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..d4kkUJcOYMZi01n8.bfA15Z_sG48wpu4NPVQ-i7Vg6_8LRl-vG5ov5DIqsNJPv5lARAqCjvkyu8LYtH_TztssaDzvTE1BfAfnWeGhYm91Yu-BtOlSxkM0l4VX-4DcVDIYji4IUE8M7BlXiJZ1ijXETGyoIXKB9almiTgnWYjEYRDPU9yx2XYE2ndS_Tn9iYdhXMzushzmRcH4F-imJOX1MUl8dTs5IbEcknInemK6rxzgjDskYGt3BsDhRf-DIdxlZXyoaQd3nSL9yU5VyjXbviFyzddX5BsYMvvFJD84VKmfnEBEa6A1aAyMFRpZCuN5bT6bMSgj37aM6qakwgX2G5Q.uU_PEWBiQ8UI0dEOB8p-fg';

// Refresh Token
//const REFRESH_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..KEdVCccK6NY_QBUu.CRAc0wnjQtXPEM93QsMKS2FB259LQF77WZIx8-IXnuCaY_O6E8U1-bqfsrioGi6OALsMbIRXbSa2oo2mKEcXbiPLkR81ykLcPi8s95XTRdJ9Use-hcxAlJEksvZP2B0D3UQW0rhrashHghsOMOQGLwpE_LoyemqSwEUw.n5YPW4gIV5bg62j5xy-YtQ';

export default function () {

  const payload = {};

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/auth/logoutAll`,
    JSON.stringify(payload),
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Log Out All`);
  console.log(`[REQUEST HEADERS]: ${JSON.stringify(params.headers)}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Logged out All Successfully': (res) =>
      res.status === 200 || res.status === 201,
  });

  sleep(1);
}