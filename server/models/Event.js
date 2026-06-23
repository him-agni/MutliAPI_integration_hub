const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    stripeEventId: { type: String, unique: true, sparse: true },
    type: { type: String, required: true },           // e.g. "payment_intent.succeeded"
    source: { type: String, default: 'stripe' },      // "stripe" | "shopify" | "delivery" | "simulate"
    amount: { type: Number },                          // cents
    currency: { type: String },
    customerEmail: { type: String },
    shopifyInventoryItemId: { type: String },
    productTitle: { type: String },
    sku: { type: String },
    inventoryQuantity: { type: Number },
    inventoryThreshold: { type: Number },
    trackingNumber: { type: String },
    carrier: { type: String },
    deliveryStatus: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    emailSent: { type: Boolean, default: false },
    slackAlerted: { type: Boolean, default: false },
    hubspotContactCreated: { type: Boolean, default: false },
    hubspotContactId: { type: String },
    rawPayload: { type: mongoose.Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
