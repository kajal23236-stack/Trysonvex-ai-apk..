import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Sparkles, Link, Wifi, Mail } from 'lucide-react';

export const QRCodeTool: React.FC = () => {
  const [text, setText] = useState('https://sonvex.ai');
  const [fgColor, setFgColor] = useState('#06B6D4');
  const [bgColor, setBgColor] = useState('#05070B');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQR();
  }, [text, fgColor, bgColor, errorCorrection]);

  const generateQR = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `sonvex_qr_${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Ultra-HD QR Code Studio</h2>
          <p className="text-xs text-slate-400">Generate scannable, customized QR codes for URLs, Wi-Fi, and text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="md:col-span-7 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
            <button
              onClick={() => setText('https://sonvex.ai')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              <Link className="w-3.5 h-3.5 text-cyan-400" />
              <span>URL</span>
            </button>
            <button
              onClick={() => setText('WIFI:S:SONVEX_5G;T:WPA;P:hyperneural2026;;')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wi-Fi Network</span>
            </button>
            <button
              onClick={() => setText('mailto:contact@sonvex.ai?subject=Inquiry')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Email</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Content or Destination URL
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL, text, or data..."
              className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Color Palette</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
                />
                <span className="text-xs font-mono text-slate-300">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
                />
                <span className="text-xs font-mono text-slate-300">{bgColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Error Correction Level</label>
            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setErrorCorrection(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    errorCorrection === lvl
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview & Download */}
        <div className="md:col-span-5 bg-slate-900/30 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-2xl bg-[#05070B] border border-purple-500/30 shadow-2xl sonvex-glow-purple">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="SONVEX QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-500 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div className="w-full flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy Payload"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
