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
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..LZmEd7sLpYtUvGF6.ax-Y8zEPn7qqjnPKEfLccM3t13eWyduvLD8hmBXg19idw_kH0JTfa9fX_u3fN7cFPGj1-pVw4UOcVqdpwIx8orceBZypOWO79sTfdg8hz9SKme4tTXfvvbeYUtXx67boryId4Ud41l6f8WGj0LUDjJwTJPPfkSZp0W_SFRQUinjU8wATe0kLYC9C_CwZaEMZMVe71cl10Ow45iJ8ZFdXZF9jgtUMSwwsfBeZ_ZM1kMFLla4a-ZpwwYHbo5_28WtWnwAFZKDAjvyRTNU-Z7W_qCxEqpvrRHRAErbYUb-8eCtHUKO61WALBpkwDEwa-OYyXKjJsO95.S_X2RTF8T-DpssM5aXOCOQ'
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
    `${BASE_URL}/admin/airports/getAirportsList`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Airports List API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Airports List Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}