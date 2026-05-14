import { Smile, Search, Bell } from 'lucide-react';

export function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <Smile className="text-white w-5 h-5" />
          </div>
          Emotion Monitoring
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari ID kartu..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
          />
        </div>
        <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 relative">
          <Bell className="w-5 h-5 text-green-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}
