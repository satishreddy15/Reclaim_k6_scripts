import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '1s',
    // iterations: 6
};

export default function () {

    const uniqueId = Math.floor(Math.random() * 100000);

    const email = `satish.techvedika+${uniqueId}@gmail.com`;
    const phone = `93939${uniqueId}`;

    // Payload
    const payload = JSON.stringify({
        email: email,
        password: 'Password@133',
        name: `Satish ${uniqueId}`,
        phone: phone,
        countryCode: '+91',
        country: 'India',
        role: 'CONSUMER',
        isActive: true
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // API Request
    const response = http.post(
        'https://dev.helloreclaim.com/auth/register',
        payload,
        params
    );

    check(response, {
        'Register(signup) success status is 200 or 201': (r) =>
            r.status === 200 || r.status === 201,
    });

    console.log(`User Created: ${email}`);
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body: ${response.body}`);

    sleep(1);
}

























