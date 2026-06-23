const { processEvent } = require('../services/eventProcessor');
const { extractInventoryData, verifyShopifyWebhook } = require('../services/shopifyService');

async function handleShopifyInventoryWebhook(req, res) {
  const signature = req.headers['x-shopify-hmac-sha256'];

  try {
    verifyShopifyWebhook(req.body, signature);
  } catch (err) {
    console.error('Shopify signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  const payload = JSON.parse(req.body.toString('utf8'));
  const data = extractInventoryData(payload);

  if (data.inventoryQuantity > data.inventoryThreshold) {
    return res.json({ received: true, alerted: false });
  }

  const event = await processEvent(data);
  res.status(201).json({ received: true, alerted: true, event });
}

async function simulateInventoryAlert(req, res) {
  const data = extractInventoryData({
    inventory_item_id: req.body.inventoryItemId || 'mock-inventory-item',
    product_title: req.body.productTitle || 'Demo Hoodie',
    sku: req.body.sku || 'DEMO-HOODIE',
    available: req.body.inventoryQuantity ?? 3,
  });

  if (!Number.isFinite(data.inventoryQuantity) || data.inventoryQuantity < 0) {
    return res.status(400).json({ error: 'inventoryQuantity must be a non-negative number' });
  }

  const event = await processEvent(data);
  res.status(201).json(event);
}

module.exports = { handleShopifyInventoryWebhook, simulateInventoryAlert };
