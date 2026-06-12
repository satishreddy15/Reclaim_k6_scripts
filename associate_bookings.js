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
   'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..S_17WHfmUlD829Y8.DqbsaxJb8TSAepbKbrPp1rDA2Eail0zxN6yOIWH1z4vvaYRp5cor2xjrmuRG74nN-a9dRVaVl1sjrEq0cQbQncgPcSzT6oaRkKt6BFbeRv9P9raeLBpNBVWihx1gExGLm57V1V4siawrAdQPmAXnbtUYg9howfA-HzIFsebTmsw58iIlGfGzvztFyQNok5tkSYwbi_oIaSxqLtrsQDAHAzhoTSII0O5P6T6rlBMn9SBF8Pk2pAfsMBOUETZU2ub148SpLbQLV0VRTD7jIbooOiY-fbido7z0hpIWdqf_jT8rM5Li8uPnWKXpatzVIHNR.89Da3FPKtP2XxhwKyZgwZg'  
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
    `${BASE_URL}/associate/bookings/list`,
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