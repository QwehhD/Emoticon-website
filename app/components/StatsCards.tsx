import { CreditCard, User, Smile } from 'lucide-react';

const STATS = [
  {
    icon: CreditCard,
    label: 'Total Scans',
    value: '1,284',
  },
  {
    icon: User,
    label: 'Active Users',
    value: '42',
  },
  {
    icon: Smile,
    label: 'Mood Average',
    value: 'Positif',
    valueColor: 'text-green-600',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {STATS.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Icon />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-xl font-bold ${stat.valueColor || ''}`}>{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
