import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Event Log' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/simulate', label: 'Simulate' },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <span className="font-bold text-lg text-brand-500 tracking-tight">
          SaaS Integration Hub
        </span>
        <div className="flex gap-6">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-brand-500 font-medium text-sm'
                  : 'text-gray-400 hover:text-gray-100 text-sm transition-colors'
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
