import StatusBadge from './StatusBadge';
import { useDeleteEvent } from '../hooks/useEvents';

function formatAmount(amount, currency) {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'usd',
  }).format(amount / 100);
}

export default function EventCard({ event }) {
  const { mutate: del, isPending } = useDeleteEvent();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-2 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm text-gray-200">{event.type}</span>
          <span className="text-xs text-gray-500">
            {new Date(event.createdAt).toLocaleString()}
          </span>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
        {event.amount && (
          <>
            <span className="text-gray-500">Amount</span>
            <span className="text-gray-200">{formatAmount(event.amount, event.currency)}</span>
          </>
        )}
        {event.customerEmail && (
          <>
            <span className="text-gray-500">Customer</span>
            <span className="text-gray-200 truncate">{event.customerEmail}</span>
          </>
        )}
        {event.productTitle && (
          <>
            <span className="text-gray-500">Product</span>
            <span className="text-gray-200 truncate">{event.productTitle}</span>
          </>
        )}
        {event.inventoryQuantity !== undefined && event.inventoryQuantity !== null && (
          <>
            <span className="text-gray-500">Inventory</span>
            <span className="text-gray-200">
              {event.inventoryQuantity} left
              {event.inventoryThreshold !== undefined && event.inventoryThreshold !== null
                ? ` / threshold ${event.inventoryThreshold}`
                : ''}
            </span>
          </>
        )}
        {event.trackingNumber && (
          <>
            <span className="text-gray-500">Tracking</span>
            <span className="text-gray-200 truncate">{event.trackingNumber}</span>
          </>
        )}
        {event.deliveryStatus && (
          <>
            <span className="text-gray-500">Delivery</span>
            <span className="text-gray-200">{event.deliveryStatus}</span>
          </>
        )}
        <span className="text-gray-500">Source</span>
        <span className={event.source === 'simulate' ? 'text-purple-400' : 'text-brand-500'}>
          {event.source}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1 text-xs">
        <span className={event.emailSent ? 'text-emerald-400' : 'text-gray-600'}>
          {event.emailSent ? '✓ Email' : '– Email'}
        </span>
        <span className={event.slackAlerted ? 'text-emerald-400' : 'text-gray-600'}>
          {event.slackAlerted ? '✓ Slack' : '– Slack'}
        </span>
        <span className={event.hubspotContactCreated ? 'text-emerald-400' : 'text-gray-600'}>
          {event.hubspotContactCreated ? '✓ HubSpot' : '– HubSpot'}
        </span>
        <button
          onClick={() => del(event._id)}
          disabled={isPending}
          className="ml-auto text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
