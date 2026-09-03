import { useState } from 'react';
import {
  X,
  Globe,
  Server,
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';

interface SubdomainGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubdomainGuideModal({ isOpen, onClose }: SubdomainGuideModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dnsRecords = [
    {
      type: 'CNAME',
      name: 'academy',
      target: `${BRAND_CONFIG.cleanDomain} (or your cloud host)`,
      proxy: 'Proxied (DNS + SSL)',
      ttl: 'Auto'
    },
    {
      type: 'TXT',
      name: `_vixora-challenge.academy`,
      target: 'vixora-domain-verification-token',
      proxy: 'DNS Only',
      ttl: '3600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-purple-900/50 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950/90 via-neutral-900 to-indigo-950/90 p-6 sm:p-8 border-b border-purple-900/30 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Infrastructure & DNS Routing Architecture</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Subdomain Setup Guide: <span className="text-purple-400 font-mono">{BRAND_CONFIG.cleanAcademyDomain}</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            How to route traffic from your primary domain (<code className="text-purple-300">{BRAND_CONFIG.cleanDomain}</code>) to the standalone Academy sub-portal and individual course landing pages.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 text-sm text-neutral-300">
          {/* Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-purple-900/40 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" /> 1. Subdomain Multi-Tenant Routing
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When visitors hit <strong className="text-white font-mono">{BRAND_CONFIG.cleanAcademyDomain}</strong>, the frontend client automatically detects the hostname or query route and renders the full standalone Academy ecosystem with courses, live cohorts, and syllabus builders.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-purple-900/40 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" /> 2. Individual Course Landing Pages
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Each course has an isolated, high-converting landing page (<code className="text-purple-300 font-mono">/course/[slug]</code>) with dedicated syllabuses, video overviews, instructor bios, and enrollment forms.
              </p>
            </div>
          </div>

          {/* DNS Configuration Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" /> DNS Records Configuration (Cloudflare / Namecheap / GoDaddy)
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">SSL Auto-Provisioned</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Name / Host</th>
                    <th className="py-3 px-4">Target / Value</th>
                    <th className="py-3 px-4">Proxy Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {dnsRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-purple-400">{rec.type}</td>
                      <td className="py-3 px-4 text-white">{rec.name}</td>
                      <td className="py-3 px-4 text-neutral-400">{rec.target}</td>
                      <td className="py-3 px-4 text-emerald-400">{rec.proxy}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCopy(`${rec.type} ${rec.name} ${rec.target}`, `dns-${i}`)}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `dns-${i}` ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === `dns-${i}` ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nginx / Cloudflare Worker Rule Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Nginx / Cloudflare Routing Snippet
              </h3>
              <button
                onClick={() =>
                  handleCopy(
                    `# Nginx Academy Subdomain Block
server {
    listen 443 ssl http2;
    server_name ${BRAND_CONFIG.cleanAcademyDomain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Subdomain academy;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}`,
                    'nginx'
                  )
                }
                className="text-[11px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'nginx' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'nginx' ? 'Copied Snippet' : 'Copy Nginx Config'}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
{`# Nginx / Reverse Proxy Config for ${BRAND_CONFIG.cleanAcademyDomain}
server {
    listen 443 ssl http2;
    server_name ${BRAND_CONFIG.cleanAcademyDomain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Subdomain academy;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}
            </pre>
          </div>

          {/* Direct Test Links */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs">Live Subdomain URL Target</div>
              <div className="font-mono text-purple-300 text-xs mt-0.5">{BRAND_CONFIG.academyDomain}</div>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Continue to Academy Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

