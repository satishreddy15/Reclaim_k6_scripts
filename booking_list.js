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
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..72avLH_IPk8IHyfE.q1AhswulqKphEZ9u0HmSUT5ka_ZQsE8TC3R-6GoKdqKcuS4aL5QnwSEYmvOTjOGqB-gXZNpvpzikQ0bk_IqgVE5W4eEK-q5MDPI_LasiIIE-uTCSssbhgNlRLOPmqty3grIv8_gpDjpRZDwRN-5n04hj2KCAwmasXfJCCrPCafG6nV6Qi4bKkoMjK05rKuoGpSqIl-jNv6U-43gzBcr43RdZf_9Tg6f7wpAAbj5bAi4Xs6_5LFTsEtbhAZEJcsGICCPlCvKC02VZOROHFQydGni4EirA6bqh5uaT7daWaA4w269QP065GPnW4kLXrC3DcmIzhfY.Qz3QBB8M0dqyTqpU2Fmq1w',
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
    `${BASE_URL}/booking/bookingList`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Booking List API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Booking List Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}
