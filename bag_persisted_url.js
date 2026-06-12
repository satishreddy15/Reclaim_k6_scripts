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
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..MvWmQ1HN0_xDnTZM.WJsZL7wUxvS6Ikl8nDHOPV-i_M4ohkEsR0YqvScF7SaGumy7AXVXQlTnHC7hwTacGTRjaLXcQPIe2PK7axj-oHTbqe7uQpWsAPtJUAPY08muI5m7_uwwYjfcncNuNDW0Bul086hNV3GcVsUvT5zp0uhiEHxLYRmOsSboWdlECBXz-qHc7W2166D5UhmYLREZvSNeszO40WkD5yMTqqkpAzMrtIAg_1iUup04TFlDv99A3YCGlBtPbbODAkooeaG2cUsUXTV5vtAW8ZPfrWuO-mdU_lbtc9p8Xl3IIknrosQ9powIeGDMGGTxRgTe5cas.LpXIBfMjZoM7fAKH4BYkgg',
    referenceNumber: 'RCICBKHSST',
  };
}

export default function (data) {

  const payload = JSON.stringify({
   
    "files": [
        {
            "fileName": "captured_photo_1781164170047.jpg",
            "contentType": "image/jpeg",
            "size": 54871
        }
    ]

})

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/associate/bags/requestPreSignedUrls/${data.referenceNumber}`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Request PreSigned URLs API`);
  console.log(`[REQUEST PAYLOAD]: ${payload}`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'PreSigned URL Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}