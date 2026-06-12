import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '1s',

    thresholds: {
        http_req_duration: ['p(95)<8000'],
    },
};

// API URLs
const CHANGE_PASSWORD_URL = 'https://dev.helloreclaim.com/auth/changePassword';
const REFRESH_TOKEN_URL = 'https://dev.helloreclaim.com/auth/refresh-token';

// Access Token
const ACCESS_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZMKDZqNCoDRVZ-T6.yCZjeMogvsj7jfTxXrrHgXQZ6yFqlme8jOdbrlmr_nar7fowSk1IPmuehj1fWZdtZ8sk1guyB0njfW-uVxdRHiplF1P4OSHr-TAwGVDd-_AxrGFBdTkuoPDMYsDv1qkaQoQwLO7M119P6uZDutX5X1a68HNiR-gVkj8zA6a3n3Z8JbbVYP8UwLWR6f3F7Fb2xHScgxqclu71a_SBLj8pGXBlBv39RSyswOd7iqG49UfoTPRcQlStp_SbeuOi82528w1SnkiE0gk83GmDv5bafIOVjRg5JkGWqhFFY6w4PsK0SkRJRvOMz7qOCxc-VZbuRWwc1BY.hv0Zisrpt1mwwtEuIBz3Yg';

// Refresh Token
const REFRESH_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..GB7Nf5vbCTdzHd-g._pAF7mJteZ4gK6nKeTXyS0VFeqlB4t_Ai3IglsfBAX5vfMI69QYFs84P1YdmdysszDUZRv7u7SnCsfCtCiJTrrLFC2MjkYBQ81DBikiDo8S2aC13iakIFav13h3TrFU_zgLBgCU8JMjo1IfP-3Uh3cAm0qQsYqY7CfVC.9rex9pKmTKlRNybsloOc1w';

export default function () {

    // Change Password Payload
    const changePasswordPayload = JSON.stringify({
        currentPassword: 'NewPassword@124',
        newPassword: 'NewPassword@111'
    });

    // Headers
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
    };

    // Change Password API Call
    const changeRes = http.post(
        CHANGE_PASSWORD_URL,
        changePasswordPayload,
        params
    );

    console.log(`\n=== CHANGE PASSWORD RESPONSE ===`);
    console.log(`[STATUS]: ${changeRes.status}`);
    console.log(`[BODY]: ${changeRes.body}`);

    check(changeRes, {
        'password changed successfully': (r) => r.status === 200,
    });

    sleep(1);

    // REFRESH TOKEN API
    const refreshPayload = JSON.stringify({
        refreshToken: REFRESH_TOKEN
    });

    const refreshParams = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const refreshRes = http.post(
        REFRESH_TOKEN_URL,
        refreshPayload,
        refreshParams
    );

    console.log(`\n=== REFRESH TOKEN RESPONSE ===`);
    console.log(`[STATUS]: ${refreshRes.status}`);
    console.log(`[BODY]: ${refreshRes.body}`);

    check(refreshRes, {
        'refresh token success': (r) => r.status === 200,
    });

    sleep(1);
}



