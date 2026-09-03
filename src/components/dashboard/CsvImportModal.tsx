'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Download, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { DetectedApp } from '@/lib/types/dashboard';
import { bulkImportSeats } from '@/lib/actions/dashboard';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: DetectedApp[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  apps,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'email,name,department,last_active_at\n' +
      'alex.rivera@company.com,Alex Rivera,Engineering,2026-06-15\n' +
      'sarah.j@company.com,Sarah Jenkins,Design,2026-04-10\n' +
      'michael.k@company.com,Michael King,Marketing,2026-08-01\n' +
      'elena.v@company.com,Elena Vance,Product,2026-05-20\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'slashsaas_seats_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseErrors([]);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setParseErrors(['CSV file must have a header row and at least 1 data row.']);
      setParsedRows([]);
      return;
    }

    const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const emailIdx = header.findIndex((h) => h.includes('email'));
    const nameIdx = header.findIndex((h) => h.includes('name'));
    const deptIdx = header.findIndex((h) => h.includes('department') || h.includes('dept'));
    const activeIdx = header.findIndex((h) => h.includes('active') || h.includes('date'));

    if (emailIdx === -1) {
      setParseErrors(['Missing required "email" column in CSV header.']);
      setParsedRows([]);
      return;
    }

    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const email = parts[emailIdx];

      if (!email || !email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email "${email}"`);
        continue;
      }

      rows.push({
        email,
        name: nameIdx !== -1 ? parts[nameIdx] : null,
        department: deptIdx !== -1 ? parts[deptIdx] : 'General',
        last_active_at: activeIdx !== -1 && parts[activeIdx] ? parts[activeIdx] : null,
      });
    }

    setParsedRows(rows);
    setParseErrors(errors);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);

    try {
      const payload = parsedRows.map((r) => ({
        ...r,
        app_id: selectedAppId || undefined,
      }));

      const res = await bulkImportSeats(payload);
      setSuccessCount(res.count);
      setParsedRows([]);
      setFile(null);
    } catch (err: any) {
      setParseErrors([err.message || 'Failed to bulk import seats.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ce04a]/10 text-[#8ce04a] border border-[#8ce04a]/30">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Bulk Import Employee Seats (CSV)
            </h2>
            <p className="text-xs text-zinc-400">
              Upload active user exports from Figma, Google, Notion, or Slack.
            </p>
          </div>
        </div>

        {successCount !== null ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8ce04a]/20 text-[#8ce04a] border border-[#8ce04a]/40">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Import Successful!</h3>
            <p className="text-xs text-zinc-300">
              Successfully imported <strong>{successCount} employee seats</strong> into your organization radar.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white text-zinc-950 font-bold px-6 py-2.5 text-xs hover:bg-zinc-200 transition-colors"
            >
              Done & View Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Target App selection */}
            <div>
              <label className="block font-medium text-zinc-300 mb-1" htmlFor="csv-target-app">
                Assign Imported Seats To Tool
              </label>
              <select
                id="csv-target-app"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-white focus:border-white/30 focus:outline-none"
              >
                <option value="">-- None / Generic Seat --</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.app_name} (${app.monthly_seat_cost}/mo)
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-[#8ce04a]/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileText className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <p className="font-semibold text-zinc-200">
                {file ? file.name : 'Click or drag CSV file here'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Format: email, name, department, last_active_at
              </p>
            </div>

            {/* Template Download Button */}
            <div className="flex justify-between items-center text-[11px] text-zinc-400">
              <span>Need the standard template?</span>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="inline-flex items-center gap-1 text-[#8ce04a] hover:underline font-semibold"
              >
                <Download className="h-3 w-3" />
                <span>Download sample CSV</span>
              </button>
            </div>

            {/* Errors display */}
            {parseErrors.length > 0 && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 space-y-1 max-h-24 overflow-y-auto">
                {parseErrors.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}

            {/* Parsed Preview */}
            {parsedRows.length > 0 && (
              <div className="rounded-xl border border-[#8ce04a]/30 bg-[#8ce04a]/[0.06] p-3 text-[#a3e635] flex items-center justify-between">
                <span>Ready to import: <strong>{parsedRows.length} valid seats</strong></span>
                <span className="text-[10px] text-zinc-400">Zero duplicate errors</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleImport}
                disabled={loading || parsedRows.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? <span>Importing seats...</span> : <span>Import {parsedRows.length} Seats</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
