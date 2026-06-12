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

// Access Token
const ACCESS_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..cxOjZITSnl1FusX1.ZyR0095EKUncx4FLSga1TdjhG9C_wlD4GzmFGXsEpg3fphy1b-4M8zp_nd0kc7fjtaK32FTiNxdxcR_F2q7nYeEU4y3B8MDiIXY3ZMV7P3A6hekOaRvNxr1AtWLO4HDwTMkXqBNocM7yoljQox_wJbGPRzC9ZJI9SxBtRATPU48ibKF0D_BF738O8yd298Fdx4kvIrzLgZULhMgdoks1Wz9oC7t0XZbHRRn5WhlpRjvqlUX9Q2pnWISnFBhW52F_iT9-0x6YYQsGlkumAtAOhmNziMA_Cr15g-Bfhl4kyXrSLsnWZd69TOgwdPt5UfVm9jWMwXU.aJGl-w2s46in0ZvLAU265g';

export default function () {

  const payload = {};

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/auth/logout`,
    JSON.stringify(payload),
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Log Out`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Log Out Status ': (res) =>
      res.status >= 200 && res.status < 500,
  });

  sleep(1);
}