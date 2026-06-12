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
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..QRH7q3sp8hYR1udT.r32f_pCTTwFOSRaBwujqOO5RZFLOjRKhcj2Kjm7Y0R-s7Efb3o6jkeUvIvykau_c19lT6dprZdN_WWa3UsT8a4Zh1zwrGF-2tltHnPChEVXx0ONq9fcSryuH6pS66dvyxUAbpQX1enbSm_CYWZbg5gWkphBcnC3W7brw3uCqJkGb0D_8fEWFqXid2JZBJrLnBCFlMofF0KUxLDE0YeVlXLDyOLkhTGTAEVXInGCG9JkGVcPjVFjSRsnRctLgB_39Y7XlYcFlj6ZMPeKEiWu1yCJxE3E6_iIrbTW9jWLkg1Y86M89XXrQYlGgnkRnrvnCBU7XFYXm.zPjQMC8EmFkhJPgQyZ8VlQ',
  };
}

export default function (data) {

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.accessToken}`,
    },
  };

  // Admin Bookings List API
  const response = http.get(
    `${BASE_URL}/admin/bookings/list`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Admin Booking List`);
  console.log(`[REQUEST URL]: ${BASE_URL}/admin/bookings/list`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Admin Booking List Status is 200': (res) => res.status === 200,
  });

  sleep(1);
}