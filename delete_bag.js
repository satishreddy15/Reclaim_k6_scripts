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
    accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..h3AjljmjWOKZu4Zt.UMM2g4RP7af5WY4iqEU1iA8ijR3ohP5cDP7RikoazqFvDfe5bFQZxlM8rE5CDUBbKmwjMwgqYl8idYdWSb6RuZr8Dl66MZKw3ru7kxJX2ug2PcuA1BjZulIK9YQ2KAqkftiGQjTN9QzkcBFmmaKgDSrHawMwj7U5CR0empnsk41cj67ruZuBha-7ZBhXvZgdIwg8kVlOfZFPyQt8weD8IFtIrxN5fa99zzG9XF3GJrs0jDitI9DLCugDt910IssETjDnDkdui-Geh0SAHu2pC9gqhjily0aembnEy7Xfq-UnRNmGucsfnb8vFkmpLEQD.ebD23_rkTmwgyUofZnzq7g',
    bagId: '101a82d5-dd16-4d11-bfca-d0ae81619f65',
  };
}

export default function (data) {

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.del(
    `${BASE_URL}/associate/bags/deleteBag/${data.bagId}`,
    null,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Delete Bag API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Delete Bag Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}

