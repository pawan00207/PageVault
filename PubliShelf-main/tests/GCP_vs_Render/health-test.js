import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Warm-up
    { duration: '1m', target: 100 },    // Moderate load
    { duration: '1m', target: 200 },    // Stress peak (safe for GCP)
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration{server:gcp}': ['p(95)<500'],     // Expect GCP fast
    'http_req_duration{server:render}': ['p(95)<1500'], // Render can be slower
    'errors': ['rate<0.1'],
  },
};

const GCP_URL = 'http://34.182.29.215:3000/health';
const RENDER_URL = 'https://publishelf-server.onrender.com/health';

export default function () {
  // Request to GCP with tag
  const gcpRes = http.get(GCP_URL, { tags: { server: 'gcp' } });

  // Request to Render with tag
  const renderRes = http.get(RENDER_URL, { tags: { server: 'render' } });

  // Print sample responses every 50 iterations
  if (__ITER % 50 === 0) {
    console.log(`GCP    - Status: ${gcpRes.status} | Body: ${gcpRes.body?.trim() || 'empty'}`);
    console.log(`Render - Status: ${renderRes.status} | Body: ${renderRes.body?.trim() || 'empty'}`);
  }

  // Process checks for each response
  const responses = [
    { res: gcpRes, server: 'gcp' },
    { res: renderRes, server: 'render' }
  ];

  responses.forEach(({ res, server }) => {
    let success = false;
    try {
      const body = JSON.parse(res.body || '{}');

      success = check(res, {
        'status is 200': (r) => r.status === 200,
        'success is true': () => body.success === true,
        'message is READY': () => body.message === 'READY',
      }, { server: server });
    } catch (e) {
      // If JSON parse fails or body missing
      success = check(res, {
        'status is 200': (r) => r.status === 200,
      }, { server: server });
    }

    errorRate.add(!success);
  });

  sleep(0.1); // Small think time between iterations
}