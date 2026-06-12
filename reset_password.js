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

export function setup() {
  const uniqueId = Date.now();

  return {
    email: `satish.techvedika@gmail.com`,
    password: `Password1@33`,
    uniqueId,
  };
}

export default function (data) {

  const payload = {
    "email": data.email,
    "otp": "692343",
    "newPassword": "NewPassword@33",
    "confirmPassword": "NewPassword@33"
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(
    `${BASE_URL}/auth/resetPassword`,
    JSON.stringify(payload),
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Reset Password`);
  console.log(`[REQUEST PAYLOAD]: ${JSON.stringify(payload)}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Reset Password Status Check': (res) => res.status >= 200 && res.status < 500,
  });

  sleep(1);
}
