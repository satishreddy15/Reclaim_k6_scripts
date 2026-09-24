import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { SharedArray } from 'k6/data';
import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';


export const options = {

    scenarios: {

        createbooking_test: {

            executor: 'per-vu-iterations',

            // Number of Virtual Users
            vus: 10,

            // Each VU executes 1 iteration
            iterations: 1,

            // Enough time for Login + Create Booking
            maxDuration: '2m',

            gracefulStop: '30s',
        },
    },

    thresholds: {
        http_req_duration: [
            'p(95)<15000'
        ],
    },
};

const BASE_URL =
    'https://dev.helloreclaim.com';

const LOGIN_ENDPOINT =
    '/auth/login';

const CREATE_BOOKING_ENDPOINT =
    '/booking/create-booking';

const users = new SharedArray(
    'users',
    function () {

        const csv =
            open('./LoadTestUsers.csv');

        const parsed =
            Papa.parse(csv, {

                header: true,

                skipEmptyLines: true,

            });


        if (
            !parsed.data ||
            parsed.data.length === 0
        ) {

            throw new Error(
                'LoadTestUsers.csv is empty or could not be parsed.'
            );
        }


        console.log(
            `Users Loaded: ${parsed.data.length}`
        );


        return parsed.data;
    }
);

function numberToLetters(num) {

    let result = '';


    while (num > 0) {

        num--;

        result =
            String.fromCharCode(
                65 + (num % 26)
            ) + result;

        num =
            Math.floor(num / 26);
    }


    // Always return at least 3 characters

    return result.padStart(
        3,
        'A'
    );
}


function generateLastName(userNumber) {

    const letters =
        numberToLetters(userNumber);


    return (
        letters.charAt(0).toUpperCase() +
        letters.slice(1).toLowerCase()
    );
}

function generatePhoneNumber(userNumber) {

    return (
        `99234${String(
            10000 + userNumber
        ).slice(-5)}`
    );
}

function generateFlightNumber(vu) {

    return (
        `AD${String(

            1000 +

            (
                (vu * 100) +
                Math.floor(
                    Math.random() * 900
                )
            ) % 9000

        )}`
    );
}

export default function () {

    const userIndex =
        __VU - 1;


    if (
        userIndex >= users.length
    ) {

        fail(

            `No CSV user found for VU ${__VU}. ` +

            `Required CSV row: ${userIndex + 1}`

        );
    }


    const user =
        users[userIndex];

    const email =
        String(
            user.Email ||
            user.email ||
            ''
        ).trim();

    const password =
        String(
            user.Password ||
            user.password ||
            ''
        ).trim();


    // VALIDATE CSV DATA

    if (
        !email ||
        !password
    ) {

        fail(

            `Invalid CSV data at row ${userIndex + 1}. ` +

            `Email or Password is missing.`

        );
    }

    const match =
        email.match(/\+(\d+)@/);


    const userNumber =
        match
            ? Number(match[1])
            : userIndex + 1;


    // GENERATE DYNAMIC USER DETAILS

    const firstName =
        'Satish';


    const lastName =
        generateLastName(
            userNumber
        );


    const fullName =
        `${firstName} ${lastName}`;


    const phoneNumber =
        generatePhoneNumber(
            userNumber
        );


    const flightNumber =
        generateFlightNumber(
            __VU
        );


    // LOGIN PAYLOAD

    const loginPayload =
        JSON.stringify({

            email:
                email,

            password:
                password,

        });


    // LOGIN REQUEST PARAMETERS

    const loginParams = {

        headers: {

            Accept:
                'application/json',

            'Content-Type':
                'application/json',

        },

        timeout:
            '30s',
    };


    // ==================================================
    // LOGIN LOGS
    // ==================================================

    console.log(
        '=============================================='
    );

    console.log(
        `VU             : ${__VU}`
    );

    console.log(
        `CSV Row        : ${userIndex + 1}`
    );

    console.log(
        `Email          : ${email}`
    );

    console.log(
        `First Name     : ${firstName}`
    );

    console.log(
        `Last Name      : ${lastName}`
    );

    console.log(
        `Full Name      : ${fullName}`
    );

    console.log(
        `Phone Number   : ${phoneNumber}`
    );

    console.log(
        `Flight Number  : ${flightNumber}`
    );

    console.log(
        'Logging in...'
    );

    console.log(
        '=============================================='
    );


    // ==================================================
    // LOGIN API
    // ==================================================

    const loginResponse =
        http.post(

            `${BASE_URL}${LOGIN_ENDPOINT}`,

            loginPayload,

            loginParams

        );


    console.log(
        `Login Status : ${loginResponse.status}`
    );


    console.log(
        `Login Time   : ${loginResponse.timings.duration} ms`
    );


    // ==================================================
    // LOGIN STATUS VALIDATION
    // ==================================================

    if (

        loginResponse.status !== 200 &&

        loginResponse.status !== 201

    ) {

        console.log(
            `Login Response : ${loginResponse.body}`
        );


        fail(

            `Login failed for ${email}. ` +

            `HTTP Status: ${loginResponse.status}`

        );
    }


    // ==================================================
    // PARSE LOGIN RESPONSE
    // ==================================================

    let loginBody;


    try {

        loginBody =
            loginResponse.json();

    } catch (error) {

        fail(

            `Invalid JSON response from Login API for ${email}`

        );
    }


    // ==================================================
    // EXTRACT ACCESS TOKEN
    // ==================================================

    const accessToken =

        loginBody?.accessToken ||

        loginBody?.data?.accessToken ||

        loginBody?.token ||

        loginBody?.data?.token;


    // ==================================================
    // TOKEN VALIDATION
    // ==================================================

    if (!accessToken) {

        console.log(
            `Login Response : ${loginResponse.body}`
        );


        fail(

            `Access token was not found in login response for ${email}`

        );
    }


    console.log(
        'Login successful'
    );


    console.log(
        `Token received for VU ${__VU}`
    );


    const payload =
        JSON.stringify({

            airlineId:
                'b875b193-9384-4f0a-abcc-2834c557fb6e',


            airportId:
                '0031e52b-39af-4c62-b39b-6c538d2a8214',


            carryonBagsCount:
                2,


            checkBagsCount:
                0,


            confirmGuest:
                false,


            countryCode:
                '+91',


            dropLatitude:
                '25.8180725',


            dropLongitude:
                '-80.1220435',


            // Same email used during login

            email:
                email,


            // Dynamic flight number

            flightNumber:
                flightNumber,


            // Dynamic full name

            fullName:
                fullName,


            // Dynamic phone number

            phoneNumber:
                phoneNumber,


            pickupHotelId:
                '288e38a8-0ba5-4c67-814b-c02360229a7d',


            pickupLatitude:
                '25.8180725',


            pickupLocation:
                'Hotel Lake View Airport Zone',


            pickupLongitude:
                '-80.1220435',


            pickupType:
                'HOTEL',


            specialLuggage:
                true,


            timezone:
                'America/New_York',


            travelDate:
                '2026-10-30T15:05',

        });


    // ==================================================
    // BOOKING REQUEST PARAMETERS
    // ==================================================

    const bookingParams = {

        headers: {

            Authorization:
                `Bearer ${accessToken}`,

            'Content-Type':
                'application/json',

            Accept:
                'application/json',

            'User-Agent':
                'k6-load-test',

        },

        timeout:
            '30s',
    };


    // ==================================================
    // BOOKING LOGS
    // ==================================================

    console.log(
        '=============================================='
    );

    console.log(
        `VU             : ${__VU}`
    );

    console.log(
        `CSV Row        : ${userIndex + 1}`
    );

    console.log(
        `CSV Email      : ${email}`
    );

    console.log(
        `User Number    : ${userNumber}`
    );

    console.log(
        `First Name     : ${firstName}`
    );

    console.log(
        `Last Name      : ${lastName}`
    );

    console.log(
        `Full Name      : ${fullName}`
    );

    console.log(
        `Phone Number   : ${phoneNumber}`
    );

    console.log(
        `Flight Number  : ${flightNumber}`
    );

    console.log(
        'Authenticated  : Login API'
    );

    console.log(
        'Creating booking...'
    );

    console.log(
        '=============================================='
    );


    // ==================================================
    // CREATE BOOKING API
    // ==================================================

    const response =
        http.post(

            `${BASE_URL}${CREATE_BOOKING_ENDPOINT}`,

            payload,

            bookingParams

        );


    // ==================================================
    // RESPONSE LOGS
    // ==================================================

    console.log(
        `Status   : ${response.status}`
    );


    console.log(
        `Duration : ${response.timings.duration} ms`
    );


    console.log(
        `Response : ${response.body}`
    );


    // ==================================================
    // CREATE BOOKING VALIDATION
    // ==================================================

    const bookingCheck =
        check(

            response,

            {

                'Booking created Successfully':
                    (r) =>

                        r.status === 200 ||

                        r.status === 201,

            }

        );


    // ==================================================
    // EXPLICIT FAILURE LOG
    // ==================================================

    if (!bookingCheck) {

        console.log(
            'CREATE BOOKING FAILED'
        );

        console.log(
            `VU: ${__VU}`
        );

        console.log(
            `Email: ${email}`
        );

        console.log(
            `Status: ${response.status}`
        );

        console.log(
            `Response: ${response.body}`
        );
    }


    console.log(
        '=============================================='
    );


    // ==================================================
    // SMALL DELAY
    // ==================================================

    sleep(1);
}




































// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   vus: 1,
//   duration: '1s',
//   thresholds: {
//     http_req_duration: ['p(95)<9000'],
//   },
// };

// const BASE_URL = 'https://dev.helloreclaim.com';

// export function setup() {
//   return {
//     accessToken:
//       'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..72avLH_IPk8IHyfE.q1AhswulqKphEZ9u0HmSUT5ka_ZQsE8TC3R-6GoKdqKcuS4aL5QnwSEYmvOTjOGqB-gXZNpvpzikQ0bk_IqgVE5W4eEK-q5MDPI_LasiIIE-uTCSssbhgNlRLOPmqty3grIv8_gpDjpRZDwRN-5n04hj2KCAwmasXfJCCrPCafG6nV6Qi4bKkoMjK05rKuoGpSqIl-jNv6U-43gzBcr43RdZf_9Tg6f7wpAAbj5bAi4Xs6_5LFTsEtbhAZEJcsGICCPlCvKC02VZOROHFQydGni4EirA6bqh5uaT7daWaA4w269QP065GPnW4kLXrC3DcmIzhfY.Qz3QBB8M0dqyTqpU2Fmq1w',
//   };
// }

// export default function (data) {

//   const payload = JSON.stringify({
//     airlineId: "911002e4-df84-4c09-b0de-2ab417ce36c8",
//     airportId: "60f98ff4-a725-4aec-ba12-7e31a7d12a31",
//     carryonBagsCount: 3,
//     checkBagsCount: 0,
//     confirmGuest: false,
//     countryCode: "+91",
//     dropLatitude: "17.240283",
//     dropLongitude: "78.429358",
//     email: "satish.techvedika@gmail.com",
//     flightNumber: "AD8879",
//     fullName: "Satish Ch",
//     phoneNumber: "8675857856",
//     pickupHotelId: "11c1407b-9eb7-46d3-9418-cce58375b072",
//     pickupLatitude: "17.26193",
//     pickupLocation: "Hotel Lake View Airport Zone, Hyderabad",
//     pickupLongitude: "78.387971",
//     pickupType: "HOTEL",
//     specialLuggage: false,
//     timezone: "Asia/Calcutta",
//     travelDate: "2026-06-11T03:00"
//   });

//   const params = {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${data.accessToken}`,
//     },
//   };

//   const response = http.post(
//     `${BASE_URL}/booking/create-booking`,
//     payload,
//     params
//   );

//   console.log(`\n========================================`);
//   console.log(`[SCENARIO]: Create Booking API`);
//   console.log(`[RESPONSE STATUS]: ${response.status}`);
//   console.log(`[RESPONSE BODY]: ${response.body}`);
//   console.log(`========================================\n`);

//   check(response, {
//     'Create Booking Status Check': (res) =>
//       res.status >= 200 && res.status < 300,
//   });

  sleep(1);
}
