import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventLog from '../components/EventLog';

const EVENT_TYPES = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
  'shopify.inventory.low_stock',
  'delivery.pre_transit',
  'delivery.transit',
  'delivery.out_for_delivery',
  'delivery.delivered',
  'delivery.failure',
];

export default function Dashboard() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const { data, isLoading, isError, dataUpdatedAt } = useEvents({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Event Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live feed · auto-refreshes every 5s
            {dataUpdatedAt > 0 && (
              <span className="ml-2">· last update {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <span className="text-sm text-gray-500">{data?.total ?? 0} total</span>
      </div>

      <div className="flex gap-3">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
        >
          <option value="">All sources</option>
          <option value="stripe">Stripe</option>
          <option value="shopify">Shopify</option>
          <option value="delivery">Delivery</option>
          <option value="simulate">Simulate</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
        >
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <EventLog events={data?.events} isLoading={isLoading} isError={isError} />
    </div>
  );
}
