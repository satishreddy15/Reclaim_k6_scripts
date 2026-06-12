import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<5000'], // Kept consistent with forgot password
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
      password: `Password1@33`,
    };
  });

  return { users: usersPool };
} 

export default function (data) {
  const usersPool = data.users;

  const randomUser = usersPool[Math.floor(Math.random() * usersPool.length)];


  const payload = JSON.stringify({
    email: randomUser.email,
    otp: '692343', // ⬅️ Replace with a valid OTP code for testing
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(
    `${BASE_URL}/auth/verifyResetOtp`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[VERIFY OTP EMAIL]: ${randomUser.email}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Verify otp Status 200 (Success)': (res) => res.status === 200,
  });

  sleep(1);
}