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
  const usersPool = Array.from({ length: 10 }, (_, i) => {
    const uniqueId = 6000 + i;

    return {
      id: uniqueId,
      // email: `satish.techvedika+${uniqueId}@gmail.com`,
        email: `satish.techvedika@gmail.com`,

    };
  });

  return { users: usersPool };
}

export default function (data) {
  const usersPool = data.users;

  const randomUser =
    usersPool[Math.floor(Math.random() * usersPool.length)];

  const forgotPasswordPayload = JSON.stringify({
    email: randomUser.email,
    isStaff: false,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const forgotPasswordResponse = http.post(
    `${BASE_URL}/auth/forgotPassword`,
    forgotPasswordPayload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[FORGOT PASSWORD EMAIL]: ${randomUser.email}`);
  console.log(`[RESPONSE STATUS]: ${forgotPasswordResponse.status}`);
  console.log(`[RESPONSE BODY]: ${forgotPasswordResponse.body}`);
  console.log(`========================================\n`);

  check(forgotPasswordResponse, {
    'Forgot password Status 200 (Success)': (res) => res.status === 200,
  });

  sleep(1);
}