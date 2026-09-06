'use client';

import { Printer } from 'lucide-react';

/**
 * Triggers the browser's native print dialog (Save as PDF). Zero dependencies,
 * no server-side PDF generation — the report page carries print-friendly light
 * styling and `print:hidden` on all chrome.
 */
export function ReportPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-semibold hover:bg-zinc-800 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
