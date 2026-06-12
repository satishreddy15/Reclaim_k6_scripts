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

// Access Token
const ACCESS_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..04bHaUyurx8HF1tg.sAlXQ7lrT2f5z3w3HS-NcCMNEe7XnIgVU9JC7Q27VsF2ozDjZRbLl_pEwStzLd-PGmxX25qYhpCRicgyXs90-geGwISgxTCgrVW1l7WQqTayPtW7TwAZq2Cpw5TMybXApYFe6rRJQ18Gj0c0mb5bT7yG37SkQbpnUFL9EUphG2EjFWvO4rgy0k_zyiJrbVCpS8d8YcgttzoyF2zwl21myb3TxWPkNiOMuTujvrWSKmx-LRooR9lRi0DUG8rB3ldd4cijhnaMpa8v-4WVctUPR1yiBn_uZcB-juRBOB0WB1fORlQyGq0dLfGjTmDa9Fts25QQroM.bSMbZ9rE6ahsm6fVReMbGw';

export default function () {

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  };

  // GET request should NOT have payload
  const response = http.get(
    `${BASE_URL}/auth/userProfile`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: User Profile`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'User Profile Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}