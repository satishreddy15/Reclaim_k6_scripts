import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    scenarios: {
        signup_test: {
            executor: 'per-vu-iterations',

            // Run 150 users concurrently
            vus: 90,

            // Each VU creates only ONE user
            iterations: 1,

            // Enough time for the complete test
            maxDuration: '110m',

            gracefulStop: '30s',
        },
    },

    thresholds: {
        http_req_duration: ['p(95)<40000'],
    },
};

const BASE_URL = 'https://stg-web.helloreclaim.com';

const users = new SharedArray('users', function () {
    const csv = open('./LoadTestUsers.csv');

    const parsed = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
    });

    console.log(`Users loaded from CSV: ${parsed.data.length}`);

    return parsed.data;
});

// Number of users to test
const TOTAL_USERS = 250;

// Maximum retries for temporary 5xx errors
const MAX_RETRIES = 3;

function numberToLetters(num) {
    let result = '';

    while (num > 0) {
        num--;
        result =
            String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
    }

    // Always make sure the result has at least 3 characters
    return result.padStart(3, 'A');
}

export function setup() {
    // Generate ONE common timestamp for all users
    const commonTimestamp = new Date().toISOString();

    // Give all VUs enough time to initialize
    // before releasing them together.
    const releaseAt = Date.now() + 5000;

    console.log('==============================================');
    console.log('COMMON TEST DETAILS');
    console.log(`Total Users      : ${TOTAL_USERS}`);
    console.log(`Common Timestamp : ${commonTimestamp}`);
    console.log(`Release At       : ${releaseAt}`);
    console.log(
        `Release Time     : ${new Date(releaseAt).toISOString()}`
    );
    console.log('==============================================');

    return {
        releaseAt: releaseAt,
        commonTimestamp: commonTimestamp,
    };
}

export default function (data) {

    const userIndex = __VU - 1;

    if (__VU > TOTAL_USERS) {
        console.error(
            `VU ${__VU} is greater than configured TOTAL_USERS ${TOTAL_USERS}`
        );
        return;
    }

    if (userIndex >= users.length) {
        throw new Error(
            `CSV does not contain user for VU ${__VU}. ` +
            `Required CSV row: ${userIndex + 1}`
        );
    }

    const user = users[userIndex];

    const email = String(user.Email || '').trim();
    const password = String(user.Password || '').trim();

    if (!email || !password) {
        throw new Error(
            `Invalid CSV data at row ${userIndex + 1}. ` +
            `Email or Password is empty.`
        );
    }

    const match = email.match(/\+(\d+)@/);

    const userNumber = match
        ? Number(match[1])
        : userIndex + 1;

    const lastName = numberToLetters(userNumber);

    const name = `satish.techvedika ${lastName}`;

    const phone =
        `99234${String(10000 + userNumber).slice(-5)}`;

    const payloadObject = {
        email: email,
        password: password,
        name: name,
        phone: phone,
        countryCode: '+91',
        country: 'India',
        role: 'CONSUMER',
        isActive: true,
    };

    const payload = JSON.stringify(payloadObject);

    const params = {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        timeout: '30s',
    };

    const currentTime = Date.now();

    const waitMilliseconds =
        data.releaseAt - currentTime;

    if (waitMilliseconds > 0) {
        console.log(
            `VU ${__VU} | User ${userNumber} | ` +
            `Waiting ${waitMilliseconds} ms for common release`
        );

        sleep(waitMilliseconds / 1000);
    }

    const requestStart = Date.now();

    console.log('==============================================');
    console.log(`VU              : ${__VU}`);
    console.log(`User Index      : ${userIndex}`);
    console.log(`Name            : ${name}`);
    console.log(`Email           : ${email}`);
    console.log(`Request Start   : ${requestStart}`);
    console.log(
        `Request ISO     : ${new Date(requestStart).toISOString()}`
    );
    console.log(`Common Timestamp: ${data.commonTimestamp}`);
    console.log('==============================================');

    let response = null;
    let attempt = 0;

    /*
     * Retry only temporary 5xx errors.
     */

    while (attempt <= MAX_RETRIES) {
        attempt++;

        response = http.post(
            `${BASE_URL}/auth/register`,
            payload,
            params
        );

        const requestEnd = Date.now();

        console.log(
            `VU ${__VU} | ` +
            `User ${userNumber} | ` +
            `Attempt ${attempt} | ` +
            `Status ${response.status} | ` +
            `Duration ${response.timings.duration} ms | ` +
            `Start ${requestStart} | ` +
            `End ${requestEnd}`
        );

        /*
         * Successful registration
         */
        if (
            response.status === 200 ||
            response.status === 201
        ) {
            break;
        }

        /*
         * Client-side errors should NOT be retried.
         */
        if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 403 ||
            response.status === 409 ||
            response.status === 422
        ) {
            break;
        }

        /*
         * Retry temporary server errors.
         */
        if (
            response.status >= 500 &&
            response.status <= 599 &&
            attempt <= MAX_RETRIES
        ) {
            const waitTime = attempt * 2;

            console.warn(
                `VU ${__VU} received ${response.status}. ` +
                `Retrying after ${waitTime}s...`
            );

            sleep(waitTime);

            continue;
        }

        break;
    }

    const finalTime = Date.now();

    console.log('==============================================');
    console.log(`VU              : ${__VU}`);
    console.log(`User Index      : ${userIndex}`);
    console.log(`Name            : ${name}`);
    console.log(`Email           : ${email}`);
    console.log(`Attempts        : ${attempt}`);
    console.log(`Status          : ${response.status}`);
    console.log(
        `Duration        : ${response.timings.duration} ms`
    );
    console.log(`Request Start   : ${requestStart}`);
    console.log(`Final Time      : ${finalTime}`);
    console.log(`Response        : ${response.body}`);
    console.log('==============================================');

    check(response, {
        'Signup Successful': (r) =>
            r.status === 200 ||
            r.status === 201,
    });
}



























