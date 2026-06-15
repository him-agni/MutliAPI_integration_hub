const styles = {
  processed: 'bg-emerald-900 text-emerald-300 border border-emerald-700',
  failed:    'bg-red-900 text-red-300 border border-red-700',
  pending:   'bg-yellow-900 text-yellow-300 border border-yellow-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}
