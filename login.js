import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    scenarios: {
        login_test: {
            executor: 'per-vu-iterations',

            // 10 virtual users
            vus: 100,

            // Each VU executes only 1 iteration
            iterations: 1,

           // Enough time for the complete test
            maxDuration: '90m',

            // Small graceful period
            gracefulStop: '30s',
        },
    },

    thresholds: {
        http_req_duration: ['p(95)<30000'],
    },
};

const BASE_URL = 'https://stg-web.helloreclaim.com';
// const BASE_URL = 'http://192.168.1.238';

// Load users from CSV only once
const users = new SharedArray('users', function () {
    const csv = open('./LoadTestUsers.csv');

    const parsed = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
    });

    console.log(`Users loaded from CSV: ${parsed.data.length}`);

    return parsed.data;
});

export default function () {

    // Assign one user per VU
    const user = users[(__VU - 1) % users.length];

    if (!user) {
        throw new Error(`No user found for VU ${__VU}`);
    }

    // Supports both Email/Password and email/password CSV headers
    const email = (user.Email || user.email || '').trim();
    const password = (user.Password || user.password || '').trim();

    if (!email || !password) {
        throw new Error(`Invalid CSV data: ${JSON.stringify(user)}`);
    }

    const payload = JSON.stringify({
        email: email,
        password: password,
        isStaff: false,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    const res = http.post(
        `${BASE_URL}/auth/login`,
        payload,
        params
    );

    console.log("========================================");
    console.log(`VU       : ${__VU}`);
    console.log(`Email    : ${email}`);
    console.log(`Status   : ${res.status}`);
    console.log(`Response : ${res.body}`);
    console.log("========================================");

    check(res, {
        'Login Successful': (r) => r.status === 200,
    });

    sleep(1);
}
































