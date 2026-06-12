import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    http_req_duration: ['p(95)<8000'],
  },
};

const BASE_URL = 'https://dev.helloreclaim.com';

export function setup() {
  return {
    accessToken:
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Hm0BhSfvHVNXoqn0.hD-eXkupJC0HiDguOjqmuoqnV5tMKvE-qGWURjIFYd2wTbmHbl7v9vGI97Hib4Uy-5OMFxWqBcFiN3lneYFMIF87C3lO-SBvdk_ajsJD7Ja84qr2yySSpAluhn-B6QGrRxxfTp76RXbGTayVWSruIAAm5Izo38Kh1k9stO8vIZOn4TSjgA96YIYVLTM5yPz3WKTdZgiutTC08VHM_Jocm3HTl19NUrBVjybAmJ-eAhP8YCx2bHdZ2sMaHWTt4vXRl4clNZJS1hVd4sUjhk2UYBTlfHMYX7kWeDf29gPFsD94577O8OBA9ILX6q68sJm1waN90i3z.Dgrm_K-6hgU24-wEMXlfMg',
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
    `${BASE_URL}/admin/airlines/getAirlinesList`,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Airlines List API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Airlines List Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}