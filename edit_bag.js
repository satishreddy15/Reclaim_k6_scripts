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
    accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ExZfFp11U09CqtrV.WWqFl2oys7Ye69w0hnlGSJQ9x0HB7uRiwz1_BDhA7P67juXtl02ijB7w_gl1tcactScYw9DecpSNCQjMlhPChXa9qy_CH_FuCd8Sqn1iqoW0URvTKv-qc7o8usKMDnKGaNtkQbglIz8aoHPIxqB3NZ_lc7KBI5hFlFbt49bFBaAgxjroPlCj8UE31kVP-zQITRjOWKaZkt6JqofZzaBcadhLdVikS_WlYL_dU3_n5YHb7KieAqdvoWZmdsCGdeJ1xLfPYmnH0RQJBiak0oENR0fs1Y_gzPLieYTpWgXcEutBspB6thy8YKYDDD91TZRd.m4t3JXAnXjcVEs2h9_VzdA',
    referenceNumber: 'RCJMS58AVB',
  };
}

export default function (data) {

  const payload = JSON.stringify({
    bagTag: '86214343',
    bagId: 'b8b2ad4e-ddd8-4878-aaeb-e116469a4320',
    bagType: 'Checked',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.patch(
    `${BASE_URL}/associate/bags/editBag/${data.referenceNumber}`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Edit Bag API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Edit Bag Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}




