import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 30 },    // Gentle warm-up
    { duration: '1m', target: 60 },     // Moderate load
    { duration: '45s', target: 100 },   // Safe peak stress (100 VUs max)
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration{server:gcp}': ['p(95)<1000'],    // GCP should stay under 1s
    'http_req_duration{server:render}': ['p(95)<2500'], // Render may be slower
    'errors': ['rate<0.1'],  // Less than 10% errors overall
  },
};

const GCP_URL = 'http://34.182.29.215:3000/api/home/data';
const RENDER_URL = 'https://publishelf-server.onrender.com/api/home/data';

export default function () {
  // Request to GCP
  const gcpRes = http.get(GCP_URL, { tags: { server: 'gcp' } });

  // Request to Render
  const renderRes = http.get(RENDER_URL, { tags: { server: 'render' } });

  // Print sample info every 50 iterations
  if (__ITER % 50 === 0) {
    const gcpSize = gcpRes.body ? (gcpRes.body.length / 1024).toFixed(2) + ' KB' : 'empty';
    const renderSize = renderRes.body ? (renderRes.body.length / 1024).toFixed(2) + ' KB' : 'empty' ;
    console.log(`GCP    - Status: ${gcpRes.status} | Size: ${gcpSize}`);
    console.log(`Render - Status: ${renderRes.status} | Size: ${renderSize}`);
  }

  // Check responses
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
        'message is correct': () => body.message === 'Home data fetched successfully',
        'has newlyBooks array': () => Array.isArray(body.data?.newlyBooks),
        'has mostSoldBooks array': () => Array.isArray(body.data?.mostSoldBooks),
        'has trendingBooks array': () => Array.isArray(body.data?.trendingBooks),
        'has metrics object': () => typeof body.data?.metrics === 'object',
      }, { server: server });
    } catch (e) {
      // Fallback if JSON parse fails
      success = check(res, { 'status is 200': (r) => r.status === 200 }, { server: server });
    }

    errorRate.add(!success);
  });

  sleep(0.3); // Longer think time for realism and lower load
}