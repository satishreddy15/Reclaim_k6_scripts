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
    accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..kfPoGJi8cJVEn4km.P1UWFl1KrrO_9GHH7o1R4heXxMywQSi1kwZFHCGTxahl1vZtGM4kkOeGqxiNSBzE70gkqRn5y9UJf3bvfLS5F9oKAvjwK0Zh2IEcBFGESXZF_E2F2VY6KFyvfzHGsbyeQNxyEl9X9ChwgMUv5rcHRWw-8qxzB_B9kCUExM0mcvU6suLTOlPacsXxTjySJbcYc3EQpAqbT9TrfXtPy-V2qCyjhe5NRuUPxXdys5MGE5uPPOaVi9KXrMTl4ggNa4wqQE0qV0FthspvOyCYKae5HiFRNRjd2PQgE0BVp71wJavNl8HJsJkX-RgiFVAcRwilfjAmLLC3.33EBmcU8eADL2NnOEGf5hQ',
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
    `${BASE_URL}/booking/waitlist`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Waitlist API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Waitlist Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}