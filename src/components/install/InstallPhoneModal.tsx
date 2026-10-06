import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, Download, Github, ExternalLink, QrCode, 
  Check, Copy, Sparkles, X, ShieldCheck, ArrowRight, AlertTriangle, Info
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { BRAND_NAME } from '../../assets/founder';

interface InstallPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'github' | 'qr'>('direct');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const phoneAppUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ais-pre-vhpulkum3yeukkmr2caeiu-915806630090.asia-southeast1.run.app';

  const sharedAppUrl = 'https://ais-pre-vhpulkum3yeukkmr2caeiu-915806630090.asia-southeast1.run.app';
  const githubRepoUrl = 'https://github.com/kajal23236-stack/Trysonvex-ai-apk';
  const githubNewRepoUrl = 'https://github.com/new?name=Trysonvex-ai-apk';

  useEffect(() => {
    QRCode.toDataURL(sharedAppUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#06B6D4',
        light: '#05070B',
      },
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [sharedAppUrl]);

  if (!isOpen) return null;

  const handleCopyLink = (urlToCopy: string = sharedAppUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Guide the user with clear instructions
      alert('Android Phone mein Install karne ka aasan tarika:\n\n1. Apne phone ke Google Chrome mein ye link kholein:\n' + sharedAppUrl + '\n\n2. Chrome ke top-right mein 3 dots (⋮) par tap karein.\n3. "Install app" ya "Add to Home screen" par tap karein.\n\nSONVEX aapke phone par bina kisi error ke native APK ki tarah install ho jayega!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#090D18] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Phone Install & APK Solution</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Zero Error
                </span>
              </h2>
              <p className="text-xs text-slate-400">Bina error direct phone par app install karein</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex px-6 pt-3 border-b border-white/5 gap-2 text-xs font-semibold bg-slate-950/40">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'direct'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Direct Phone Install (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub 404 Fix & APK</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: DIRECT PHONE INSTALL */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900/60 to-blue-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-white text-sm">Direct Phone WebAPK (Fastest)</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/30">
                    100% Working
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  Bhai GitHub 404 ya APK download ki tension mat lo! Android phones mein modern PWA direct APK ki tarah install hota hai without "Unknown Sources" warning.
                </p>

                <div className="pt-1">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install SONVEX on Phone</span>
                  </button>
                </div>
              </div>

              {/* 3 Step Android Guide */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Android Phone me Kaise Chalayein:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    <div className="font-semibold text-white">Chrome me kholein</div>
                    <p className="text-[11px] text-slate-400">Apne mobile ke Chrome browser me ye link paste karein.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <div className="font-semibold text-white">3 Dots (⋮) dabayein</div>
                    <p className="text-[11px] text-slate-400">Top-right corner me 3 dots par click karein.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <div className="font-semibold text-white">"Install App"</div>
                    <p className="text-[11px] text-slate-400">"Install app" ya "Add to Home screen" select karein.</p>
                  </div>
                </div>
              </div>

              {/* Live Link with Copy */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mobile Link (Copy karke phone pe bhej lo):
                </label>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3">
                  <div className="truncate font-mono text-[11px] text-cyan-300 select-all">
                    {sharedAppUrl}
                  </div>
                  <button
                    onClick={() => handleCopyLink(sharedAppUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex-shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB 404 FIX & APK REPO */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>GitHub par Error / 404 kyun aaya?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Bhai aapne jo repository link di <code className="text-cyan-300 font-mono">kajal23236-stack/Trysonvex-ai-apk</code>, wo abhi tak GitHub par banayi nahi gayi hai (create nahi hui hai), isliye GitHub par <strong>404 Not Found</strong> error aa raha tha!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="font-semibold text-white text-xs flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <span>2 Minute me GitHub par Repo Banayein:</span>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    GitHub par new repository banayein:
                    <a
                      href={githubNewRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold ml-1.5"
                    >
                      Create Trysonvex-ai-apk on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Repository name likhein: <code className="text-cyan-300 font-mono bg-black/40 px-1.5 py-0.5 rounded">Trysonvex-ai-apk</code>
                  </li>
                  <li>
                    Repo create hote hi <code className="text-cyan-300 font-mono">.github/workflows/build-apk.yml</code> jo humne generate kiya hai automatically Android APK build kar dega!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: SCAN QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-[#05070B] border border-cyan-500/40 shadow-2xl sonvex-glow-cyan">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan to open SONVEX on phone"
                    className="w-52 h-52 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-500 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Apne Phone ke Camera se Scan Karein</div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Camera open karke QR code ko scan karein, link direct open ho jayega!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(sharedAppUrl)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Mobile Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Target: kajal23236-stack/Trysonvex-ai-apk</span>
          <span className="text-cyan-400 font-bold">SONVEX Mobile Engine</span>
        </div>
      </div>
    </div>
  );
};
