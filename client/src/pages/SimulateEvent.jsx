import { useState } from 'react';
import { useSimulateEvent } from '../hooks/useEvents';
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
  customerPhone: '',
};

export default function SimulateEvent() {
  const [form, setForm] = useState(defaults);
  const [lastResult, setLastResult] = useState(null);
  const { mutate, isPending, isError, error } = useSimulateEvent();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Simulate Event</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fire a test payment event and watch it appear in the dashboard live.
        </p>
      </div>

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

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">
            Customer Phone{' '}
            <span className="text-gray-600">(optional — uses TEST_RECIPIENT_PHONE if blank)</span>
          </label>
          <input
            name="customerPhone"
            type="tel"
            placeholder="+1234567890"
            value={form.customerPhone}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors mt-1"
        >
          {isPending ? 'Firing...' : 'Fire Event'}
        </button>

        {isError && (
          <p className="text-sm text-red-400">{error?.message ?? 'Something went wrong'}</p>
        )}
      </form>

      {lastResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-200">Last Result</span>
            <StatusBadge status={lastResult.status} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
            <span className="text-gray-500">ID</span>
            <span className="font-mono text-gray-300 truncate">{lastResult._id}</span>
            <span className="text-gray-500">SMS Sent</span>
            <span className={lastResult.smsSent ? 'text-emerald-400' : 'text-gray-600'}>
              {lastResult.smsSent ? 'Yes' : 'No'}
            </span>
            <span className="text-gray-500">Slack Alerted</span>
            <span className={lastResult.slackAlerted ? 'text-emerald-400' : 'text-gray-600'}>
              {lastResult.slackAlerted ? 'Yes' : 'No'}
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
