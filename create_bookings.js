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
    accessToken:
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..72avLH_IPk8IHyfE.q1AhswulqKphEZ9u0HmSUT5ka_ZQsE8TC3R-6GoKdqKcuS4aL5QnwSEYmvOTjOGqB-gXZNpvpzikQ0bk_IqgVE5W4eEK-q5MDPI_LasiIIE-uTCSssbhgNlRLOPmqty3grIv8_gpDjpRZDwRN-5n04hj2KCAwmasXfJCCrPCafG6nV6Qi4bKkoMjK05rKuoGpSqIl-jNv6U-43gzBcr43RdZf_9Tg6f7wpAAbj5bAi4Xs6_5LFTsEtbhAZEJcsGICCPlCvKC02VZOROHFQydGni4EirA6bqh5uaT7daWaA4w269QP065GPnW4kLXrC3DcmIzhfY.Qz3QBB8M0dqyTqpU2Fmq1w',
  };
}

export default function (data) {

  const payload = JSON.stringify({
    airlineId: "911002e4-df84-4c09-b0de-2ab417ce36c8",
    airportId: "60f98ff4-a725-4aec-ba12-7e31a7d12a31",
    carryonBagsCount: 3,
    checkBagsCount: 0,
    confirmGuest: false,
    countryCode: "+91",
    dropLatitude: "17.240283",
    dropLongitude: "78.429358",
    email: "satish.techvedika@gmail.com",
    flightNumber: "AD8879",
    fullName: "Satish Ch",
    phoneNumber: "8675857856",
    pickupHotelId: "11c1407b-9eb7-46d3-9418-cce58375b072",
    pickupLatitude: "17.26193",
    pickupLocation: "Hotel Lake View Airport Zone, Hyderabad",
    pickupLongitude: "78.387971",
    pickupType: "HOTEL",
    specialLuggage: false,
    timezone: "Asia/Calcutta",
    travelDate: "2026-06-11T03:00"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  };

  const response = http.post(
    `${BASE_URL}/booking/create-booking`,
    payload,
    params
  );

  console.log(`\n========================================`);
  console.log(`[SCENARIO]: Create Booking API`);
  console.log(`[RESPONSE STATUS]: ${response.status}`);
  console.log(`[RESPONSE BODY]: ${response.body}`);
  console.log(`========================================\n`);

  check(response, {
    'Create Booking Status Check': (res) =>
      res.status >= 200 && res.status < 300,
  });

  sleep(1);
}