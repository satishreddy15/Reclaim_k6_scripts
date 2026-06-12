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
    accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..1YXOpl8khcUp50Cn.QBX6Ll587UH3R3_F0xXyrKsvyaN8_GpBGl6838w9eSDYlcHjoiSo2HWbTpzpZbYp8i1UQY1C7YmX1rO9UsQME1ydlTUkw3rrJ-wtsIRIodjFffsuehQtfTT2m4hE61t0aSRQpMqknXo6x0s-5PHRyWLnOOlASyDdGcumv91qe5Eb0gmJErjunYZX6ljrGdJffABP-7HFBTY3voA8BGW1S7-bKTtXabds9rFfkn7aKY4vbFVKY30cH2WhGeXuYSNE2pwOk6izxwU1WCwg0bDmGz3ukHxaCJtjAie4LsHw5aEa-qZ80Z4QLMPUyLTqpvsu.evmoQulUeRJ0jabdLHqulw',
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
    `${BASE_URL}/associate/getQrCodes`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: QR Codes List API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'QR Codes List Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}

