const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    stripeEventId: { type: String, unique: true, sparse: true },
    type: { type: String, required: true },           // e.g. "payment_intent.succeeded"
    source: { type: String, default: 'stripe' },      // "stripe" | "simulate"
    amount: { type: Number },                          // cents
    currency: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    smsSent: { type: Boolean, default: false },
    slackAlerted: { type: Boolean, default: false },
    rawPayload: { type: mongoose.Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
