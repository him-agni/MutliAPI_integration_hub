export default function IntegrationCard({ name, description, status, detail, icon }) {
  const statusColor = {
    connected: 'text-emerald-400',
    disconnected: 'text-red-400',
    unknown: 'text-yellow-400',
  }[status] ?? 'text-gray-400';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-100">{name}</span>
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      {detail && <p className="text-xs text-gray-600 font-mono">{detail}</p>}
    </div>
  );
}
