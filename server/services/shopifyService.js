const crypto = require('crypto');

function verifyShopifyWebhook(rawBody, signature) {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    throw new Error('SHOPIFY_WEBHOOK_SECRET is not configured');
  }

  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64');

  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(signature || '', 'utf8');

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new Error('Shopify webhook signature verification failed');
  }
}

function extractInventoryData(payload) {
  const quantity =
    payload.available ??
    payload.inventory_quantity ??
    payload.quantity ??
    payload.inventory_level?.available ??
    0;

  return {
    type: 'shopify.inventory.low_stock',
    source: 'shopify',
    shopifyInventoryItemId: String(payload.inventory_item_id || payload.id || ''),
    productTitle: payload.product_title || payload.title || payload.name || 'Unknown product',
    sku: payload.sku || payload.variant_sku || null,
    inventoryQuantity: Number(quantity),
    inventoryThreshold: Number(process.env.INVENTORY_ALERT_THRESHOLD || 5),
    rawPayload: payload,
  };
}

module.exports = { verifyShopifyWebhook, extractInventoryData };
