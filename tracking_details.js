import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<8000'],
  },
};

const BASE_URL = 'https://dev.helloreclaim.com';

export function setup() {

  return {
    trackingId: 'RCAGB528IL',
  };
}

export default function (data) {

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(
    `${BASE_URL}/booking/booking-events/track/${data.trackingId}`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Tracking Details`);
  console.log(`[TRACKING ID]: ${data.trackingId}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Tracking Details Status Check': (res) =>
      res.status >= 200 && res.status < 500,
  });

  sleep(1);
}