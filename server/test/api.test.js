const assert = require('node:assert/strict');
const test = require('node:test');

process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_placeholder';
process.env.SLACK_WEBHOOK_URL = 'https://example.com/slack';

const app = require('../app');

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function request(path, options = {}) {
  const { server, baseUrl } = await startTestServer();
  try {
    return await fetch(`${baseUrl}${path}`, options);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /health returns ok', async () => {
  const response = await request('/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('POST /events/simulate requires an API key', async () => {
  const response = await request('/events/simulate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error, 'Invalid or missing API key');
});

test('POST /events/simulate rejects invalid payloads before persistence', async () => {
  const response = await request('/events/simulate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': 'test-admin-key',
    },
    body: JSON.stringify({
      type: 'invoice.created',
      amount: -1,
      currency: 'usd',
      customerEmail: 'demo@example.com',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Unsupported event type');
});

test('GET /events/:id rejects invalid Mongo IDs', async () => {
  const response = await request('/events/not-a-valid-id');
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Invalid event ID');
});

test('GET /events rejects unsupported filters', async () => {
  const response = await request('/events?status=archived');
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Unsupported status');
});
