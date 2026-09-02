import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { Hotspot } from '../types/hotspot';
import { parseFirmsCsv } from '../services/firmsData';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHotspots: (newHotspots: Hotspot[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportHotspots,
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      processCsv(text);
    };
    reader.readAsText(file);
  };

  const processCsv = (text: string) => {
    setError(null);
    try {
      const parsed = parseFirmsCsv(text, 'VIIRS_NOAA20');
      if (parsed.length === 0) {
        setError('No valid thermal anomaly records found in CSV. Please verify columns (latitude, longitude, brightness, frp).');
        return;
      }
      setImportedCount(parsed.length);
      onImportHotspots(parsed);
      setTimeout(() => {
        onClose();
        setImportedCount(null);
        setCsvText('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleManualImport = () => {
    if (!csvText.trim()) {
      setError('Please paste CSV text or select a file to import.');
      return;
    }
    processCsv(csvText);
  };

  const sampleCsvSnippet = `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,confidence,version,bright_ti5,frp,daynight
23.5488,87.2916,368.4,0.4,0.4,2026-08-31,0430,N,94,2.0NRT,298.2,64.2,D
29.7289,-95.1245,382.1,0.5,0.4,2026-08-31,0715,N,96,2.0NRT,305.1,88.6,N
39.8214,-121.4398,392.5,0.4,0.4,2026-08-31,1945,N,98,2.0NRT,312.4,245.8,D`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel relative w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070c20] shadow-[0_0_50px_rgba(19,200,255,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Import NASA FIRMS CSV Data
              </h2>
              <p className="text-xs text-slate-400">
                Load custom MODIS / VIIRS active fire and thermal anomaly CSV data.
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Drag & Drop File Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-space-850/40 p-6 text-center hover:border-cyan-400/50 hover:bg-space-800/60 transition-all cursor-pointer"
          >
            <FileText size={32} className="text-cyan-400 mb-2" />
            <p className="font-semibold text-white">Click to browse or drop CSV file</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Compatible with standard NASA FIRMS VIIRS & MODIS NRT format (.csv)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />
          </div>

          {/* Paste CSV Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Or Paste Raw CSV Content</label>
              <button
                onClick={() => setCsvText(sampleCsvSnippet)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Load Sample FIRMS Data
              </button>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="latitude,longitude,bright_ti4,frp,confidence..."
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-space-900 p-3 text-xs text-white font-mono placeholder:text-slate-600 outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-rose-300">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {importedCount !== null && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-emerald-300">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Successfully ingested and classified {importedCount} satellite detections!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-space-900 p-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-space-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleManualImport}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 px-5 py-2 text-xs font-bold transition-colors"
          >
            Ingest & Run AI Scorer
          </button>
        </div>
      </div>
    </div>
  );
};
