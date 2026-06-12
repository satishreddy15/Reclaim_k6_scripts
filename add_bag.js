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
       'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..j-1YuKOz2c4rTo-O.4YU9PmqoUkJMhhBmLCAUyFYKIgOuwom-4CIUY_Z9FpPbulsBDWyA9J2J_PhCUasT-JGbGK2fYlBeQLWNaD9b-cBFKqPzj1_7RNYDwlKvhwxNxs7MUgDQOo3IQV_VeyL8wcavFhfQ9an_1wLlBkHOsmHRPIKQKVf2NWRTQAeOSEQpknUD3VE4c6EextWtAJRGOU_o7KVHVcltlhI8LX7Wg18hhxVKic9Hdd9CPKLzBQtfXIbERqwwKwkyheDpzjYwx29depHgWjtZSAJVnAdBgBZXVOXpKNrBDxH_MPklK5X6p1C8f1fuz-QBxAba_xVJ.xULIa5pVP2gXlY9gqVJ08Q',
 referenceNumber: 'RCJMS58AVB',
  };
}

export default function (data) {

  const payload = JSON.stringify({
    qrValue: "RLC-MIA233",
    type: "Carry_On",
    uploadId: "82ddc35e-914f-4d3c-8847-92e15df4179b"
        
 });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/associate/bags/addBag/${data.referenceNumber}`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Add Bag API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Add Bag Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}




