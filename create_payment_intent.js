import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { SharedArray } from 'k6/data';
import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    scenarios: {
        create_payment_intent_test: {
            executor: 'per-vu-iterations',

            // Change this to 1, 10, 25, 50, etc.
            vus: 10,

            // Each VU executes one complete flow
            iterations: 1,

            // Login + Create Booking + Payment Intent
            maxDuration: '3m',

            gracefulStop: '30s',
        },
    },

    thresholds: {
        http_req_duration: [
            'p(95)<15000',
        ],
    },
};


// ======================================================
// BASE URL
// ======================================================

const BASE_URL =
    'https://dev.helloreclaim.com';


// ======================================================
// ENDPOINTS
// ======================================================

const LOGIN_ENDPOINT =
    '/auth/login';

const CREATE_BOOKING_ENDPOINT =
    '/booking/create-booking';

const CREATE_PAYMENT_INTENT_ENDPOINT =
    '/payments/createPaymentIntent';


// ======================================================
// LOAD USERS FROM CSV
// ======================================================

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


// ======================================================
// NUMBER TO LETTERS
// ======================================================

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

    return result.padStart(3, 'A');
}


// ======================================================
// GENERATE LAST NAME
// ======================================================

function generateLastName(userNumber) {

    const letters =
        numberToLetters(userNumber);

    return (
        letters.charAt(0).toUpperCase() +
        letters.slice(1).toLowerCase()
    );
}


// ======================================================
// GENERATE PHONE NUMBER
// ======================================================

function generatePhoneNumber(userNumber) {

    return (
        `99234${String(
            10000 + userNumber
        ).slice(-5)}`
    );
}


// ======================================================
// GENERATE FLIGHT NUMBER
// ======================================================

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


// ======================================================
// MAIN TEST
// ======================================================

export default function () {

    // ==================================================
    // GET USER FOR CURRENT VU
    // ==================================================

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


    // ==================================================
    // READ EMAIL
    // ==================================================

    const email =
        String(
            user.Email ||
            user.email ||
            ''
        ).trim();


    // ==================================================
    // READ PASSWORD
    // ==================================================

    const password =
        String(
            user.Password ||
            user.password ||
            ''
        ).trim();


    if (!email || !password) {

        fail(
            `Invalid CSV data at row ${userIndex + 1}. ` +
            `Email or Password is missing.`
        );
    }


    // ==================================================
    // USER NUMBER
    // ==================================================

    const match =
        email.match(/\+(\d+)@/);

    const userNumber =
        match
            ? Number(match[1])
            : userIndex + 1;


    // ==================================================
    // DYNAMIC USER DETAILS
    // ==================================================

    const firstName =
        'Satish';

    const lastName =
        generateLastName(userNumber);

    const fullName =
        `${firstName} ${lastName}`;

    const phoneNumber =
        generatePhoneNumber(userNumber);

    const flightNumber =
        generateFlightNumber(__VU);


    // ==================================================
    // LOG TEST INFORMATION
    // ==================================================

    console.log(
        '================================================'
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
        `Full Name      : ${fullName}`
    );

    console.log(
        `Phone Number   : ${phoneNumber}`
    );

    console.log(
        `Flight Number  : ${flightNumber}`
    );

    console.log(
        '================================================'
    );


    // ==================================================
    // STEP 1 - LOGIN
    // ==================================================

    console.log(
        'STEP 1: Login'
    );


    const loginPayload =
        JSON.stringify({

            email:
                email,

            password:
                password,

        });


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
    // GET ACCESS TOKEN
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


    const accessToken =
        loginBody?.accessToken ||
        loginBody?.data?.accessToken ||
        loginBody?.token ||
        loginBody?.data?.token;


    if (!accessToken) {

        fail(
            `Access token was not found for ${email}`
        );
    }


    console.log(
        `Login successful for VU ${__VU}`
    );


    // ==================================================
    // STEP 2 - CREATE BOOKING
    // ==================================================

    console.log(
        'STEP 2: Create Booking'
    );


    const bookingPayload =
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

            email:
                email,

            flightNumber:
                flightNumber,

            fullName:
                fullName,

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


    const bookingResponse =
        http.post(

            `${BASE_URL}${CREATE_BOOKING_ENDPOINT}`,

            bookingPayload,

            bookingParams

        );


    console.log(
        `Booking Status   : ${bookingResponse.status}`
    );

    console.log(
        `Booking Duration : ${bookingResponse.timings.duration} ms`
    );

    console.log(
        `Booking Response : ${bookingResponse.body}`
    );


    const bookingSuccess =
        bookingResponse.status === 200 ||
        bookingResponse.status === 201;


    // ==================================================
    // EXTRACT BOOKING ID
    // ==================================================

    let bookingId = null;

    if (bookingSuccess) {

        let bookingBody;

        try {

            bookingBody =
                bookingResponse.json();

        } catch (error) {

            console.log(
                'Create Booking returned invalid JSON.'
            );
        }


        if (bookingBody) {

            bookingId =
                bookingBody?.bookingId ||
                bookingBody?.data?.bookingId ||
                bookingBody?.data?.booking?.bookingId ||
                bookingBody?.booking?.bookingId ||
                bookingBody?.data?.id ||
                bookingBody?.id;
        }
    }


    if (!bookingId) {

        console.log(
            'Booking ID was not found.'
        );

        console.log(
            `Booking Response: ${bookingResponse.body}`
        );
    }


    if (bookingId) {

        console.log(
            `Booking created successfully`
        );

        console.log(
            `Booking ID : ${bookingId}`
        );
    }


    // ==================================================
    // STEP 3 - CREATE PAYMENT INTENT
    // ==================================================

    let paymentSuccess = false;

    let paymentResponse = null;


    if (bookingId) {

        console.log(
            'STEP 3: Create Payment Intent'
        );


        const paymentPayload =
            JSON.stringify({

                bookingId:
                    bookingId,

                amount:
                    53.37,

                currency:
                    'USD',

            });


        const paymentParams = {

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


        paymentResponse =
            http.post(

                `${BASE_URL}${CREATE_PAYMENT_INTENT_ENDPOINT}`,

                paymentPayload,

                paymentParams

            );


        console.log(
            `Payment Status   : ${paymentResponse.status}`
        );

        console.log(
            `Payment Duration : ${paymentResponse.timings.duration} ms`
        );

        console.log(
            `Payment Response : ${paymentResponse.body}`
        );


        // ----------------------------------------------
        // CHECK FOR FRONTEND HTML
        // ----------------------------------------------

        const contentType =
            paymentResponse.headers['Content-Type'] || '';


        const isHtmlResponse =

            contentType
                .toLowerCase()
                .includes('text/html') ||

            paymentResponse.body
                .trim()
                .startsWith('<!doctype html') ||

            paymentResponse.body
                .trim()
                .startsWith('<html');


        if (isHtmlResponse) {

            console.log(
                'Payment Intent returned frontend HTML.'
            );

            console.log(
                'Check the Payment Intent API endpoint.'
            );

        } else {

            paymentSuccess =
                paymentResponse.status === 200 ||
                paymentResponse.status === 201;
        }

    } else {

        console.log(
            'Payment Intent skipped because bookingId was not available.'
        );
    }


    const completeFlowSuccess =
        bookingSuccess &&
        !!bookingId &&
        paymentSuccess;


    check(null, {

        'Booking and Payment Intent flow completed successfully':
            () => completeFlowSuccess,

    });


    // ==================================================
    // FINAL RESULT
    // ==================================================

    console.log(
        '================================================'
    );

    console.log(
        `VU             : ${__VU}`
    );

    console.log(
        `Email          : ${email}`
    );

    console.log(
        `Booking ID     : ${bookingId || 'NOT CREATED'}`
    );

    console.log(
        `Booking        : ${
            bookingSuccess
                ? 'SUCCESS'
                : 'FAILED'
        }`
    );

    console.log(
        `Payment Intent : ${
            paymentSuccess
                ? 'SUCCESS'
                : 'FAILED'
        }`
    );

    console.log(
        `Complete Flow  : ${
            completeFlowSuccess
                ? 'SUCCESS'
                : 'FAILED'
        }`
    );

    console.log(
        '================================================'
    );


    sleep(1);
}


























// import http from 'k6/http';
// import { check, sleep, fail } from 'k6';
// import { SharedArray } from 'k6/data';
// import Papa from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// export const options = {
//     scenarios: {
//         create_payment_intent_test: {
//             executor: 'per-vu-iterations',

//             // Change to 1, 10, 25, 50, etc.
//             vus: 1,

//             // Each VU executes one complete flow
//             iterations: 1,

//             // Login + Create Booking + Payment Intent
//             maxDuration: '3m',

//             gracefulStop: '30s',
//         },
//     },

//     thresholds: {
//         http_req_duration: [
//             'p(95)<15000',
//         ],
//     },
// };

// // ==================================================
// // BASE URL
// // ==================================================

// const BASE_URL =
//     'https://stg.helloreclaim.com';

// // ==================================================
// // ENDPOINTS
// // ==================================================

// const LOGIN_ENDPOINT =
//     '/auth/login';

// const CREATE_BOOKING_ENDPOINT =
//     '/booking/create-booking';

// const CREATE_PAYMENT_INTENT_ENDPOINT =
//     '/payments/createPaymentIntent';

// const CLIENT_SECRET =
//     __ENV.CLIENT_SECRET || '';

// // ==================================================
// // LOAD USERS FROM CSV
// // ==================================================

// const users = new SharedArray(
//     'users',
//     function () {

//         const csv =
//             open('./LoadTestUsers.csv');

//         const parsed =
//             Papa.parse(csv, {
//                 header: true,
//                 skipEmptyLines: true,
//             });

//         if (
//             !parsed.data ||
//             parsed.data.length === 0
//         ) {
//             throw new Error(
//                 'LoadTestUsers.csv is empty or could not be parsed.'
//             );
//         }

//         console.log(
//             `Users Loaded: ${parsed.data.length}`
//         );

//         return parsed.data;
//     }
// );

// // ==================================================
// // NUMBER TO LETTERS
// // ==================================================

// function numberToLetters(num) {

//     let result = '';

//     while (num > 0) {

//         num--;

//         result =
//             String.fromCharCode(
//                 65 + (num % 26)
//             ) + result;

//         num =
//             Math.floor(num / 26);
//     }

//     return result.padStart(
//         3,
//         'A'
//     );
// }

// // ==================================================
// // GENERATE LAST NAME
// // ==================================================

// function generateLastName(userNumber) {

//     const letters =
//         numberToLetters(userNumber);

//     return (
//         letters.charAt(0).toUpperCase() +
//         letters.slice(1).toLowerCase()
//     );
// }

// // ==================================================
// // GENERATE PHONE NUMBER
// // ==================================================

// function generatePhoneNumber(userNumber) {

//     return (
//         `99234${String(
//             10000 + userNumber
//         ).slice(-5)}`
//     );
// }

// // ==================================================
// // GENERATE FLIGHT NUMBER
// // ==================================================

// function generateFlightNumber(vu) {

//     return (
//         `AD${String(
//             1000 +
//             (
//                 (vu * 100) +
//                 Math.floor(
//                     Math.random() * 900
//                 )
//             ) % 9000
//         )}`
//     );
// }

// // ==================================================
// // MAIN TEST
// // ==================================================

// export default function () {

//     // ==================================================
//     // GET CSV USER
//     // ==================================================

//     const userIndex =
//         __VU - 1;

//     if (
//         userIndex >= users.length
//     ) {

//         fail(
//             `No CSV user found for VU ${__VU}. ` +
//             `Required CSV row: ${userIndex + 1}`
//         );
//     }

//     const user =
//         users[userIndex];

//     // ==================================================
//     // EMAIL
//     // ==================================================

//     const email =
//         String(
//             user.Email ||
//             user.email ||
//             ''
//         ).trim();

//     // ==================================================
//     // PASSWORD
//     // ==================================================

//     const password =
//         String(
//             user.Password ||
//             user.password ||
//             ''
//         ).trim();

//     // ==================================================
//     // VALIDATE USER
//     // ==================================================

//     if (
//         !email ||
//         !password
//     ) {

//         fail(
//             `Invalid CSV data at row ${userIndex + 1}. ` +
//             `Email or Password is missing.`
//         );
//     }

//     // ==================================================
//     // EXTRACT USER NUMBER
//     // ==================================================

//     const match =
//         email.match(/\+(\d+)@/);

//     const userNumber =
//         match
//             ? Number(match[1])
//             : userIndex + 1;

//     // ==================================================
//     // DYNAMIC USER DETAILS
//     // ==================================================

//     const firstName =
//         'Satish';

//     const lastName =
//         generateLastName(
//             userNumber
//         );

//     const fullName =
//         `${firstName} ${lastName}`;

//     const phoneNumber =
//         generatePhoneNumber(
//             userNumber
//         );

//     const flightNumber =
//         generateFlightNumber(
//             __VU
//         );

//     // ==================================================
//     // STEP 1 - LOGIN
//     // ==================================================

//     console.log(
//         '================================================'
//     );

//     console.log(
//         'STEP 1: LOGIN'
//     );

//     console.log(
//         `VU        : ${__VU}`
//     );

//     console.log(
//         `CSV Row   : ${userIndex + 1}`
//     );

//     console.log(
//         `Email     : ${email}`
//     );

//     console.log(
//         '================================================'
//     );

//     const loginPayload =
//         JSON.stringify({
//             email:
//                 email,

//             password:
//                 password,
//         });

//     const loginParams = {

//         headers: {

//             Accept:
//                 'application/json',

//             'Content-Type':
//                 'application/json',
//         },

//         timeout:
//             '30s',
//     };

//     const loginResponse =
//         http.post(
//             `${BASE_URL}${LOGIN_ENDPOINT}`,
//             loginPayload,
//             loginParams
//         );

//     console.log(
//         `Login Status   : ${loginResponse.status}`
//     );

//     console.log(
//         `Login Duration : ${loginResponse.timings.duration} ms`
//     );

//     console.log(
//         `Login Response : ${loginResponse.body}`
//     );

//     const loginSuccess =
//         loginResponse.status === 200 ||
//         loginResponse.status === 201;

//     if (!loginSuccess) {

//         fail(
//             `Login failed for ${email}. ` +
//             `HTTP Status: ${loginResponse.status}`
//         );
//     }

//     // ==================================================
//     // EXTRACT ACCESS TOKEN
//     // ==================================================

//     let loginBody;

//     try {

//         loginBody =
//             loginResponse.json();

//     } catch (error) {

//         fail(
//             'Login response is not valid JSON.'
//         );
//     }

//     const accessToken =
//         loginBody?.accessToken ||
//         loginBody?.data?.accessToken ||
//         loginBody?.token ||
//         loginBody?.data?.token;

//     if (!accessToken) {

//         fail(
//             'Access token was not found in Login response.'
//         );
//     }

//     console.log(
//         'Login: SUCCESS'
//     );

//     // ==================================================
//     // STEP 2 - CREATE BOOKING
//     // ==================================================

//     console.log(
//         '================================================'
//     );

//     console.log(
//         'STEP 2: CREATE BOOKING'
//     );

//     console.log(
//         `VU            : ${__VU}`
//     );

//     console.log(
//         `Email         : ${email}`
//     );

//     console.log(
//         `Full Name     : ${fullName}`
//     );

//     console.log(
//         `Phone         : ${phoneNumber}`
//     );

//     console.log(
//         `Flight Number : ${flightNumber}`
//     );

//     console.log(
//         '================================================'
//     );

//     const bookingPayload =
//         JSON.stringify({

//             airportId:
//                 '3c452fff-1a12-40de-ac36-9a0e4db5f73a',

//             carryonBagsCount:
//                 2,

//             checkBagsCount:
//                 0,

//             confirmGuest:
//                 false,

//             countryCode:
//                 '+91',

//             dropLatitude:
//                 '17.406498',

//             dropLongitude:
//                 '78.477244',

//             email:
//                 email,

//             flightNumber:
//                 flightNumber,

//             fullName:
//                 fullName,

//             phoneNumber:
//                 phoneNumber,

//             pickupHotelId:
//                 'e0437a14-0136-4669-980c-5724d9b58256',

//             pickupLatitude:
//                 '17.406498',

//             pickupLocation:
//                 'Stage Hotel',

//             pickupLongitude:
//                 '78.477244',

//             pickupType:
//                 'HOTEL',

//             specialLuggage:
//                 true,

//             timezone:
//                 'Asia/Calcutta',

//             travelDate:
//                 '2026-10-30T15:05',
//         });

//     const bookingParams = {

//         headers: {

//             Authorization:
//                 `Bearer ${accessToken}`,

//             'Content-Type':
//                 'application/json',

//             Accept:
//                 'application/json',

//             'User-Agent':
//                 'k6-load-test',
//         },

//         timeout:
//             '30s',
//     };

//     const bookingResponse =
//         http.post(
//             `${BASE_URL}${CREATE_BOOKING_ENDPOINT}`,
//             bookingPayload,
//             bookingParams
//         );

//     console.log(
//         `Booking Status   : ${bookingResponse.status}`
//     );

//     console.log(
//         `Booking Duration : ${bookingResponse.timings.duration} ms`
//     );

//     console.log(
//         `Booking Response : ${bookingResponse.body}`
//     );

//     const bookingSuccess =
//         bookingResponse.status === 200 ||
//         bookingResponse.status === 201;

//     // ==================================================
//     // EXTRACT BOOKING ID
//     // ==================================================

//     let bookingId = null;

//     if (bookingSuccess) {

//         let bookingBody;

//         try {

//             bookingBody =
//                 bookingResponse.json();

//         } catch (error) {

//             console.log(
//                 'Create Booking returned invalid JSON.'
//             );
//         }

//         if (bookingBody) {

//             bookingId =
//                 bookingBody?.bookingId ||
//                 bookingBody?.data?.bookingId ||
//                 bookingBody?.data?.booking?.bookingId ||
//                 bookingBody?.booking?.bookingId ||
//                 bookingBody?.data?.id ||
//                 bookingBody?.id;
//         }
//     }

//     if (!bookingId) {

//         console.log(
//             'Booking ID was not found.'
//         );

//         console.log(
//             `Booking Response: ${bookingResponse.body}`
//         );
//     }

//     if (bookingId) {

//         console.log(
//             'Booking created successfully'
//         );

//         console.log(
//             `Booking ID : ${bookingId}`
//         );
//     }

//     // ==================================================
//     // STEP 3 - CREATE PAYMENT INTENT
//     // ==================================================

//     let paymentIntentCreated =
//         false;

//     let paymentResponse =
//         null;

//     let returnedClientSecret =
//         null;

//     if (bookingId) {

//         console.log(
//             '================================================'
//         );

//         console.log(
//             'STEP 3: CREATE PAYMENT INTENT'
//         );

//         console.log(
//             `Booking ID : ${bookingId}`
//         );

//         console.log(
//             '================================================'
//         );

//         const paymentPayload =
//             JSON.stringify({

//                 bookingId:
//                     bookingId,

//                 amount:
//                     53.37,

//                 currency:
//                     'USD',
//             });

//         const paymentParams = {

//             headers: {

//                 Authorization:
//                     `Bearer ${accessToken}`,

//                 'Content-Type':
//                     'application/json',

//                 Accept:
//                     'application/json',

//                 'User-Agent':
//                     'k6-load-test',
//             },

//             timeout:
//                 '30s',
//         };

//         paymentResponse =
//             http.post(
//                 `${BASE_URL}${CREATE_PAYMENT_INTENT_ENDPOINT}`,
//                 paymentPayload,
//                 paymentParams
//             );

//         console.log(
//             `Payment Status   : ${paymentResponse.status}`
//         );

//         console.log(
//             `Payment Duration : ${paymentResponse.timings.duration} ms`
//         );

//         console.log(
//             `Payment Response : ${paymentResponse.body}`
//         );

//         // ==================================================
//         // CHECK PAYMENT RESPONSE
//         // ==================================================

//         const contentType =
//             paymentResponse.headers['Content-Type'] || '';

//         const isHtmlResponse =
//             contentType
//                 .toLowerCase()
//                 .includes('text/html') ||
//             paymentResponse.body
//                 .trim()
//                 .startsWith('<!doctype html') ||
//             paymentResponse.body
//                 .trim()
//                 .startsWith('<html');

//         if (isHtmlResponse) {

//             console.log(
//                 'Payment Intent returned frontend HTML.'
//             );

//             console.log(
//                 'Check the Payment Intent API endpoint.'
//             );

//         } else {

//             paymentIntentCreated =
//                 paymentResponse.status === 200 ||
//                 paymentResponse.status === 201;

//             // ==============================================
//             // EXTRACT CLIENT SECRET FROM RESPONSE
//             // ==============================================

//             if (paymentIntentCreated) {

//                 try {

//                     const paymentBody =
//                         paymentResponse.json();

//                     returnedClientSecret =
//                         paymentBody?.clientSecret ||
//                         paymentBody?.data?.clientSecret ||
//                         paymentBody?.client_secret ||
//                         paymentBody?.data?.client_secret ||
//                         null;

//                 } catch (error) {

//                     console.log(
//                         'Payment response is not valid JSON.'
//                     );
//                 }
//             }
//         }

//     } else {

//         console.log(
//             'Payment Intent skipped because bookingId was not available.'
//         );
//     }

//     // ==================================================
//     // CLIENT SECRET INFORMATION
//     // ==================================================

//     console.log(
//         '================================================'
//     );

//     console.log(
//         'PAYMENT CLIENT SECRET'
//     );

//     console.log(
//         '================================================'
//     );

//     if (CLIENT_SECRET) {

//         console.log(
//             'Configured Client Secret : YES'
//         );

//         console.log(
//             'Client Secret Source     : Environment Variable'
//         );

//     } else {

//         console.log(
//             'Configured Client Secret : NO'
//         );

//         console.log(
//             'Use --env CLIENT_SECRET="..." when running k6.'
//         );
//     }

//     if (returnedClientSecret) {

//         console.log(
//             'API Returned Client Secret : YES'
//         );

//         console.log(
//             'Payment Intent Created      : YES'
//         );

//     } else {

//         console.log(
//             'API Returned Client Secret : NO'
//         );
//     }

//     console.log(
//         '================================================'
//     );


//     const flowSuccess =
//         bookingSuccess &&
//         !!bookingId &&
//         paymentIntentCreated;

//     check(null, {

//         // 'Booking created successfully':
//         //     () =>
//         //         bookingSuccess,

//         // 'Booking ID generated':
//         //     () =>
//         //         !!bookingId,

//         'Payment Intent created successfully':
//             () =>
//                 paymentIntentCreated,

//     });

//     // ==================================================
//     // FINAL RESULT
//     // ==================================================

//     console.log(
//         '================================================'
//     );

//     console.log(
//         `VU                  : ${__VU}`
//     );

//     console.log(
//         `Email               : ${email}`
//     );

//     console.log(
//         `Booking ID          : ${bookingId || 'NOT CREATED'}`
//     );

//     console.log(
//         `Booking             : ${
//             bookingSuccess
//                 ? 'SUCCESS'
//                 : 'FAILED'
//         }`
//     );

//     console.log(
//         `Payment Intent      : ${
//             paymentIntentCreated
//                 ? 'SUCCESS'
//                 : 'FAILED'
//         }`
//     );

//     console.log(
//         `Actual Payment      : NOT CONFIRMED`
//     );

//     console.log(
//         `Complete API Flow   : ${
//             flowSuccess
//                 ? 'SUCCESS'
//                 : 'FAILED'
//         }`
//     );

//     console.log(
//         '================================================'
//     );

//     sleep(1);
// }
