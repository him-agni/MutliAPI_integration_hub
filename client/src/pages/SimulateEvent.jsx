import { useState } from 'react';
import { useSimulateDeliveryUpdate, useSimulateEvent, useSimulateInventoryAlert } from '../hooks/useEvents';
import StatusBadge from '../components/StatusBadge';

const EVENT_TYPES = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
];

const defaults = {
  type: 'payment_intent.succeeded',
  amount: '4999',
  currency: 'usd',
  customerEmail: 'demo@example.com',
};

const inventoryDefaults = {
  productTitle: 'Demo Hoodie',
  sku: 'DEMO-HOODIE',
  inventoryQuantity: '3',
};

const deliveryDefaults = {
  trackingNumber: 'MOCK123456789',
  carrier: 'Mock Carrier',
  deliveryStatus: 'transit',
  customerEmail: 'demo@example.com',
};

export default function SimulateEvent() {
  const [scenario, setScenario] = useState('payment');
  const [form, setForm] = useState(defaults);
  const [inventoryForm, setInventoryForm] = useState(inventoryDefaults);
  const [deliveryForm, setDeliveryForm] = useState(deliveryDefaults);
  const [lastResult, setLastResult] = useState(null);
  const { mutate, isPending, isError, error } = useSimulateEvent();
  const inventoryMutation = useSimulateInventoryAlert();
  const deliveryMutation = useSimulateDeliveryUpdate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleInventoryChange(e) {
    setInventoryForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleDeliveryChange(e) {
    setDeliveryForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate(
      {
        ...form,
        amount: parseInt(form.amount, 10),
      },
      {
        onSuccess: (data) => setLastResult(data),
      }
    );
  }

  function handleInventorySubmit(e) {
    e.preventDefault();
    inventoryMutation.mutate(
      {
        ...inventoryForm,
        inventoryQuantity: parseInt(inventoryForm.inventoryQuantity, 10),
      },
      { onSuccess: (data) => setLastResult(data) }
    );
  }

  function handleDeliverySubmit(e) {
    e.preventDefault();
    deliveryMutation.mutate(deliveryForm, { onSuccess: (data) => setLastResult(data) });
  }

  const pending = isPending || inventoryMutation.isPending || deliveryMutation.isPending;
  const activeError = error || inventoryMutation.error || deliveryMutation.error;
  const hasError = isError || inventoryMutation.isError || deliveryMutation.isError;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Simulate Event</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fire test commerce events and watch them appear in the dashboard live.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
        {[
          ['payment', 'Payment'],
          ['inventory', 'Inventory'],
          ['delivery', 'Delivery'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setScenario(value)}
            className={scenario === value
              ? 'bg-brand-600 text-white text-sm font-semibold rounded-md px-3 py-2'
              : 'text-gray-400 hover:text-gray-100 text-sm rounded-md px-3 py-2'}
          >
            {label}
          </button>
        ))}
      </div>

      {scenario === 'payment' && (
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Event Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Amount (cents)</label>
            <input
              name="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              {['usd', 'eur', 'gbp', 'cad', 'aud'].map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Customer Email</label>
          <input
            name="customerEmail"
            type="email"
            value={form.customerEmail}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors mt-1"
        >
          {pending ? 'Firing...' : 'Fire Payment Event'}
        </button>

        {hasError && (
          <p className="text-sm text-red-400">{activeError?.message ?? 'Something went wrong'}</p>
        )}
      </form>
      )}

      {scenario === 'inventory' && (
      <form onSubmit={handleInventorySubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Product</label>
          <input name="productTitle" value={inventoryForm.productTitle} onChange={handleInventoryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">SKU</label>
            <input name="sku" value={inventoryForm.sku} onChange={handleInventoryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Available</label>
            <input name="inventoryQuantity" type="number" min="0" value={inventoryForm.inventoryQuantity} onChange={handleInventoryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
        </div>
        <button type="submit" disabled={pending} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors mt-1">
          {pending ? 'Firing...' : 'Fire Inventory Alert'}
        </button>
        {hasError && <p className="text-sm text-red-400">{activeError?.message ?? 'Something went wrong'}</p>}
      </form>
      )}

      {scenario === 'delivery' && (
      <form onSubmit={handleDeliverySubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Tracking Number</label>
            <input name="trackingNumber" value={deliveryForm.trackingNumber} onChange={handleDeliveryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Carrier</label>
            <input name="carrier" value={deliveryForm.carrier} onChange={handleDeliveryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Delivery Status</label>
            <select name="deliveryStatus" value={deliveryForm.deliveryStatus} onChange={handleDeliveryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500">
              {['pre_transit', 'transit', 'out_for_delivery', 'delivered', 'failure'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Customer Email</label>
            <input name="customerEmail" type="email" value={deliveryForm.customerEmail} onChange={handleDeliveryChange} className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
        </div>
        <button type="submit" disabled={pending} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors mt-1">
          {pending ? 'Firing...' : 'Fire Delivery Update'}
        </button>
        {hasError && <p className="text-sm text-red-400">{activeError?.message ?? 'Something went wrong'}</p>}
      </form>
      )}

      {lastResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-200">Last Result</span>
            <StatusBadge status={lastResult.status} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
            <span className="text-gray-500">ID</span>
            <span className="font-mono text-gray-300 truncate">{lastResult._id}</span>
            <span className="text-gray-500">Email Sent</span>
            <span className={lastResult.emailSent ? 'text-emerald-400' : 'text-gray-600'}>
              {lastResult.emailSent ? 'Yes' : 'No'}
            </span>
            <span className="text-gray-500">Slack Alerted</span>
            <span className={lastResult.slackAlerted ? 'text-emerald-400' : 'text-gray-600'}>
              {lastResult.slackAlerted ? 'Yes' : 'No'}
            </span>
            <span className="text-gray-500">HubSpot Contact</span>
            <span className={lastResult.hubspotContactCreated ? 'text-emerald-400' : 'text-gray-600'}>
              {lastResult.hubspotContactCreated ? 'Yes' : 'No'}
            </span>
          </div>
          <a href="/dashboard" className="text-brand-500 text-sm hover:underline mt-1">
            View in dashboard →
          </a>
        </div>
      )}
    </div>
  );
}
