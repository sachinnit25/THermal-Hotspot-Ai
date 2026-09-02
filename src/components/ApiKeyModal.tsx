import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Sparkles, Database } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  firmsMapKey: string;
  onSaveFirmsMapKey: (key: string) => void;
  geminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  firmsMapKey,
  onSaveFirmsMapKey,
  geminiApiKey,
  onSaveGeminiApiKey,
}) => {
  const [firmsInput, setFirmsInput] = useState(firmsMapKey);
  const [geminiInput, setGeminiInput] = useState(geminiApiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveFirmsMapKey(firmsInput.trim());
    onSaveGeminiApiKey(geminiInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070c20] shadow-[0_0_50px_rgba(19,200,255,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                API Configuration & Credentials
              </h2>
              <p className="text-xs text-slate-400">
                Configure direct NASA satellite telemetry and optional Gemini AI endpoints.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* NASA FIRMS MAP_KEY */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Database size={13} className="text-cyan-400" />
                <span>NASA FIRMS MAP_KEY (Optional)</span>
              </label>
              <a
                href="https://firms.modaps.eosdis.nasa.gov/api/map_key"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>Get Free Key</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={firmsInput}
              onChange={(e) => setFirmsInput(e.target.value)}
              placeholder="e.g. 32-character hex key (e.g. a1b2c3d4...)"
              className="w-full rounded-xl border border-slate-700 bg-space-900 px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none focus:border-cyan-400/50"
            />
            <p className="text-[11px] text-slate-500">
              When left blank, the application uses high-precision built-in global satellite feeds and offline high-fidelity telemetry.
            </p>
          </div>

          {/* Gemini AI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={13} className="text-purple-400" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
              >
                <span>Get Gemini Key</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={geminiInput}
              onChange={(e) => setGeminiInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-slate-700 bg-space-900 px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none focus:border-purple-400/50"
            />
            <p className="text-[11px] text-slate-500">
              Enables live multimodal LLM explanations in addition to the deterministic orbital evidence scorer.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="rounded-xl border border-white/5 bg-space-850/60 p-3 flex items-start gap-2.5 text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              API credentials are saved locally in your browser session only and never sent to external 3rd-party servers.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 bg-space-900 p-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-space-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 px-5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(19,200,255,0.4)]"
          >
            {saved ? (
              <>
                <Check size={14} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
