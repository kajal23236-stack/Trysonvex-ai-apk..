import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenModal?: () => void;
  className?: string;
  variant?: 'navbar' | 'banner' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenModal,
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  // If already installed, hide the prominent banner, or allow clicking to view details
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (onOpenModal) {
      onOpenModal();
      return;
    }
    if (isInstallable) {
      await install();
    }
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-sm transition-all active:scale-95 ${className}`}
        title="Install SONVEX on your Phone"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95 ${className}`}
      title="Install SONVEX on your Phone / APK"
    >
      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
      <span className="hidden sm:inline">Install on Phone</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
};
