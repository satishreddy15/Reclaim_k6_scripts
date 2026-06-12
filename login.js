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
  const usersPool = Array.from({ length: 10 }, (_, i) => {
    const uniqueId = 6000 + i; 
    return {
      id: uniqueId,
      email: `satish.techvedika+${uniqueId}@gmail.com`,
      password: `Password1@33`,
    };
  });

  usersPool.forEach((user) => {
    const signupPayload = JSON.stringify({
      email: user.email,
      password: user.password,
      isStaff: false,
    });

    http.post(`${BASE_URL}/auth/register`, signupPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return { users: usersPool };
}

export default function (data) {
  const usersPool = data.users;
  const randomUser = usersPool[Math.floor(Math.random() * usersPool.length)];

  const loginPayload = JSON.stringify({
    email: randomUser.email,
    password: randomUser.password,
    isStaff: false,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const loginResponse = http.post(
    `${BASE_URL}/auth/login`,
    loginPayload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[LOGIN EMAIL]: ${randomUser.email}`);
  console.log(`[RESPONSE STATUS]: ${loginResponse.status}`);
  console.log(`[RESPONSE BODY]: ${loginResponse.body}`);
  console.log(`========================================\n`);

  check(loginResponse, {
    'Login Status 200 (Success)': (res) => res.status === 200,
  });

  sleep(1);
}



























