import { Briefcase, Users, Globe2, Award } from 'lucide-react';

export function TrustedBy() {
  const clients = [
    {
      name: 'Honeywell',
      sub: 'FLOUR MILLS',
      color: '#16A34A',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600 fill-current">
          <path d="M12 2L15 8H9L12 2ZM12 8L16 14H8L12 8ZM12 14L17 22H7L12 14Z" />
        </svg>
      ),
    },
    {
      name: 'GreenField',
      sub: 'SCHOOLS',
      color: '#15803D',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-700 fill-current">
          <path d="M12 3C7.5 3 4 6.5 4 11C4 14.5 6.5 17.5 10 18.5V21H14V18.5C17.5 17.5 20 14.5 20 11C20 6.5 16.5 3 12 3ZM12 6C14.8 6 17 8.2 17 11C17 13.8 14.8 16 12 16C9.2 16 7 13.8 7 11C7 8.2 9.2 6 12 6Z" />
        </svg>
      ),
    },
    {
      name: 'AVENIR',
      sub: 'HEALTHCARE',
      color: '#0284C7',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-600 fill-current">
          <path d="M10 3H14V9H20V13H14V19H10V13H4V9H10V3Z" />
        </svg>
      ),
    },
    {
      name: 'BrightPath',
      sub: 'ACADEMY',
      color: '#D97706',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600 fill-current">
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
        </svg>
      ),
    },
    {
      name: 'FarmCrest',
      sub: 'AGRICULTURE',
      color: '#16A34A',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600 fill-current">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 11 11 9 17 8Z" />
        </svg>
      ),
    },
    {
      name: 'UrbanTrend',
      sub: 'PROPERTIES',
      color: '#2563EB',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600 fill-current">
          <path d="M19 2H9C7.9 2 7 2.9 7 4V8H5C3.9 8 3 8.9 3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM9 4H19V20H15V6H9V4ZM5 10H7V20H5V10Z" />
        </svg>
      ),
    },
  ];

  const stats = [
    {
      value: '150+',
      label: 'Projects Delivered',
      sub: 'Successful projects across industries',
      icon: Briefcase,
    },
    {
      value: '200+',
      label: 'Happy Clients',
      sub: 'Businesses trust us for real results',
      icon: Users,
    },
    {
      value: '15+',
      label: 'Industries Served',
      sub: 'Diverse industries empowered',
      icon: Globe2,
    },
    {
      value: '5+',
      label: 'Years of Excellence',
      sub: 'Years of delivering innovation',
      icon: Award,
    },
  ];

  return (
    <div className="relative z-20 -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Seamless White Client Logos Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-100 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="shrink-0 text-center lg:text-left">
          <span className="text-xs sm:text-sm font-semibold text-purple-900 flex items-center gap-1.5 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Some of our amazing clients
          </span>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center justify-items-center">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 group hover:scale-105 transition-transform"
            >
              <div className="shrink-0">{client.icon}</div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                  {client.name}
                </span>
                <span className="text-[9px] font-semibold text-neutral-500 tracking-wider">
                  {client.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics & Stats Counter (4 Light Cards with Purple Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white/95 hover:bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-neutral-100 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-neutral-800">
                  {stat.label}
                </div>
                <div className="text-[11px] text-neutral-500 leading-snug">
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
