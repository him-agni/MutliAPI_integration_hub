import EventCard from './EventCard';

export default function EventLog({ events, isLoading, isError }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-400">
        Failed to load events. Is the server running?
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        No events yet.{' '}
        <a href="/simulate" className="text-brand-500 hover:underline">
          Simulate one →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
