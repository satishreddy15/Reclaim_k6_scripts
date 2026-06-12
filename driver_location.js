import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<9000'],
  },
};

const BASE_URL = 'https://dev.helloreclaim.com';

export function setup() {
  return {
    accessToken:
 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..usVyYSVin-bZIEsm.AXfzaGhQfSmVD29CXuEFsDlsCFmU9JgYiiH4kJp7KIASqU_l8tXma6XyKhOEN5nxpxtAzD5n7W4u2OuEooToBH2f_FFZt6szErB9z10RJeCpJJ-Zyrhy-sMGJ2-oU6CS4B931yrEEhdTw6yL7kKJF6KApChJu70ciKoWnCmiPVz6HgkwPWvwnWAzaRwcjPBZTXsMfneldw22RZTo2TbUfIMq5z8kHMtkohmTghmc-Wiiu9BoChkMM7NS79TO55OQiV3m4owwXbwNbJPIUWuZLp3GRPwcR8JID5VwbNiw3oHcMQ2lUgh7SQWi64BLZQ9B.mnaTZ6_SO2sk4zgGIaqAeg',
};
}

export default function (data) {
  const payload = JSON.stringify({
    latitude: 17.44848422650091,
    longitude: 78.38310466047356,
    isLocationEnabled: true,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/associate/settings/driverLocation`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Driver Location API`);
  console.log(`[REQUEST PAYLOAD]: ${payload}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Driver Location Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}