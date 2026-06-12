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
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..94-jq86aILvwX4Vi.2l03tPMEx6a4uMXV-gCpPEJ0kkj54PqbgT0gT-b_2zW0hZiyacJQXr1hnJyl_4VmfOG8SaQc_IeKDA-gSyU69w1CHO4miKqO3BzajJA0pKc_UGMLEYfgpNhCZtGupRh0Dvv7-qM11hakVHvEVEIXdRy2E03L0qEC3j-EE-3tJ_3w0IZE-UHvsyk0RUzCB8KI7wnzLFRHYfMBQ_O9vFZ3_P8OOkKXOjFRKbIa_cKY2CjFITVGFni3ay67RbKb9xXXM7Amnv4riYTOjy9irm1cWKgtbw0EdkbWVsRdWniUPIdaAlLaqXzBq_S-1ERb3WzmaBxsGaE.WZHE68ylwFtgWR_FhZnbiw',
    referenceNumber: 'RCAGB528IL',
  };
}

export default function (data) {

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  // GET Booking Details API
  const response = http.get(
    `${BASE_URL}/booking/reference/${data.referenceNumber}`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Get Booking Details API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Particular Booking Details Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}