import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '../services/api';
import IntegrationCard from '../components/IntegrationCard';

export default function Integrations() {
  const { data: health, isError } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
  });

  const serverStatus = isError ? 'disconnected' : health ? 'connected' : 'unknown';

  const integrations = [
    {
      name: 'Stripe',
      icon: '💳',
      description: 'Receives payment webhooks. Signature validated on every request to prevent spoofed events.',
      status: serverStatus,
      detail: 'POST /webhooks/stripe',
    },
    {
      name: 'Twilio',
      icon: '📱',
      description: 'Sends SMS notifications to customers when payment events fire.',
      status: serverStatus,
      detail: 'POST /notify/sms',
    },
    {
      name: 'Slack',
      icon: '💬',
      description: 'Posts rich block-kit alerts to a team channel on every processed event.',
      status: serverStatus,
      detail: 'POST /notify/slack',
    },
    {
      name: 'MongoDB',
      icon: '🍃',
      description: 'Persists all events for the live dashboard. Duplicate events are deduplicated by Stripe event ID.',
      status: serverStatus,
      detail: 'Mongoose ODM',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Integrations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Connected services and health status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((i) => (
          <IntegrationCard key={i.name} {...i} />
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-gray-200 mb-3">Data Flow</h2>
        <pre className="text-xs text-gray-400 leading-relaxed font-mono whitespace-pre-wrap">
{`Stripe Payment Event
       ↓
POST /webhooks/stripe  (signature validated)
       ↓
Event saved to MongoDB
       ↓
    ┌──────────────────┐
    ↓                  ↓
Twilio SMS          Slack Alert
(to customer)       (to team channel)
    ↓                  ↓
    └──── Status updated in Event Log`}
        </pre>
      </div>
    </div>
  );
}
