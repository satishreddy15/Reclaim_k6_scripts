import http from 'k6/http';
import { check, fail } from 'k6';
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

const BASE_URL = 'https://stg.helloreclaim.com';

const LOGIN_ENDPOINT = '/auth/login';
const DELETE_ACCOUNT_ENDPOINT = '/auth/deleteAccount';

const users = new SharedArray('users', function () {
    const csv = open('./LoadTestUsers.csv');

    const parsed = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
        throw new Error(
            'LoadTestUsers.csv is empty or could not be parsed.'
        );
    }

    console.log(`Users loaded from CSV: ${parsed.data.length}`);

    return parsed.data;
});

export default function () {

    const userIndex = __VU - 1;

    if (userIndex >= users.length) {
        fail(
            `VU ${__VU} does not have a corresponding user in CSV. ` +
            `Required CSV row: ${userIndex + 1}`
        );
    }

    const user = users[userIndex];

    const email = String(user.Email || '').trim();
    const password = String(user.Password || '').trim();

    if (!email || !password) {
        fail(
            `Invalid CSV data at row ${userIndex + 1}. ` +
            `Email or Password is empty.`
        );
    }

    console.log('==============================================');
    console.log(`VU       : ${__VU}`);
    console.log(`CSV Row  : ${userIndex + 1}`);
    console.log(`Email    : ${email}`);
    console.log('==============================================');

    const loginPayload = JSON.stringify({
        email: email,
        password: password,
    });

    const loginParams = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        timeout: '30s',
    };

    const loginResponse = http.post(
        `${BASE_URL}${LOGIN_ENDPOINT}`,
        loginPayload,
        loginParams
    );

    console.log(`Login Status : ${loginResponse.status}`);
    console.log(`Login Time   : ${loginResponse.timings.duration} ms`);

    if (
        loginResponse.status !== 200 &&
        loginResponse.status !== 201
    ) {
        console.log(`Login Response : ${loginResponse.body}`);

        fail(
            `Login failed for ${email}. ` +
            `HTTP Status: ${loginResponse.status}`
        );
    }

    let loginBody;

    try {
        loginBody = loginResponse.json();
    } catch (error) {
        fail(`Invalid JSON response from Login API for ${email}`);
    }

    const accessToken =
        loginBody?.accessToken ||
        loginBody?.data?.accessToken ||
        loginBody?.token ||
        loginBody?.data?.token;

    if (!accessToken) {
        console.log(`Login Response : ${loginResponse.body}`);

        fail(
            `Access token was not found in login response for ${email}`
        );
    }

    const deleteParams = {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        timeout: '30s',
    };

    console.log(`Deleting account : ${email}`);

    const deleteResponse = http.del(
        `${BASE_URL}${DELETE_ACCOUNT_ENDPOINT}`,
        null,
        deleteParams
    );

    console.log('==============================================');
    console.log(`VU       : ${__VU}`);
    console.log(`CSV Row  : ${userIndex + 1}`);
    console.log(`Email    : ${email}`);
    console.log(`Status   : ${deleteResponse.status}`);
    console.log(`Duration : ${deleteResponse.timings.duration} ms`);
    console.log(`Response : ${deleteResponse.body}`);
    console.log('==============================================');

    const deleteSuccessful = check(deleteResponse, {
        'Delete Account - Status 200 and Success Message': (r) =>
            r.status === 200 &&
            r.body.includes('Account deleted successfully'),
    });

    if (!deleteSuccessful) {
        fail(
            `Delete account failed for ${email}. ` +
            `HTTP Status: ${deleteResponse.status}. ` +
            `Response: ${deleteResponse.body}`
        );
    }
}





