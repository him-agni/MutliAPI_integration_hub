const axios = require('axios');

function createMockContactId(email) {
  const normalized = email.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `mock-contact-${normalized}`.slice(0, 80);
}

async function createOrUpdateContact(event) {
  if (!event.customerEmail) return null;

  if (process.env.HUBSPOT_MODE === 'mock') {
    console.log(`[HUBSPOT MOCK] Contact upserted for ${event.customerEmail}`);
    return createMockContactId(event.customerEmail);
  }

  if (!process.env.HUBSPOT_ACCESS_TOKEN) return null;

  const properties = {
    email: event.customerEmail,
    integration_source: event.source || 'integration-hub',
  };

  if (event.amount) properties.last_order_amount = String(event.amount / 100);
  if (event.currency) properties.last_order_currency = event.currency.toUpperCase();
  if (event.type) properties.last_integration_event = event.type;

  const headers = {
    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let data;
  try {
    ({ data } = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', { properties }, { headers }));
  } catch (err) {
    if (err.response?.status !== 409) throw err;

    ({ data } = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(event.customerEmail)}?idProperty=email`,
      { properties },
      { headers }
    ));
  }

  return data.id;
}

module.exports = { createOrUpdateContact };
