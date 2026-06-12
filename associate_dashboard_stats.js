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
    accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..j-1YuKOz2c4rTo-O.4YU9PmqoUkJMhhBmLCAUyFYKIgOuwom-4CIUY_Z9FpPbulsBDWyA9J2J_PhCUasT-JGbGK2fYlBeQLWNaD9b-cBFKqPzj1_7RNYDwlKvhwxNxs7MUgDQOo3IQV_VeyL8wcavFhfQ9an_1wLlBkHOsmHRPIKQKVf2NWRTQAeOSEQpknUD3VE4c6EextWtAJRGOU_o7KVHVcltlhI8LX7Wg18hhxVKic9Hdd9CPKLzBQtfXIbERqwwKwkyheDpzjYwx29depHgWjtZSAJVnAdBgBZXVOXpKNrBDxH_MPklK5X6p1C8f1fuz-QBxAba_xVJ.xULIa5pVP2gXlY9gqVJ08Q',
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
    `${BASE_URL}/associate/dashboard/stats`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Associate Dashboard Stats API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Dashboard Stats Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}