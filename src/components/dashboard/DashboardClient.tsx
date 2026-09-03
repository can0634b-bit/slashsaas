'use client';

import React, { useState } from 'react';
import { DetectedApp, Seat, DashboardComputedMetrics } from '@/lib/types/dashboard';
import { OverviewMetrics } from './OverviewMetrics';
import { DormantSeatsTable } from './DormantSeatsTable';
import { DepartmentMatrix } from './DepartmentMatrix';
import { RenewalRadar } from './RenewalRadar';
import { AppsManager } from './AppsManager';
import { AddAppModal } from './AddAppModal';
import { AddSeatModal } from './AddSeatModal';
import { CsvImportModal } from './CsvImportModal';
import { Plus, UploadCloud, UserPlus } from 'lucide-react';

interface DashboardClientProps {
  apps: DetectedApp[];
  seats: Seat[];
  metrics: DashboardComputedMetrics;
  orgName: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  apps,
  seats,
  metrics,
  orgName,
}) => {
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [isAddSeatOpen, setIsAddSeatOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<DetectedApp | null>(null);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);

  const handleEditApp = (app: DetectedApp) => {
    setEditingApp(app);
    setIsAddAppOpen(true);
  };

  const handleCloseAppModal = () => {
    setEditingApp(null);
    setIsAddAppOpen(false);
  };

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat);
    setIsAddSeatOpen(true);
  };

  const handleCloseSeatModal = () => {
    setEditingSeat(null);
    setIsAddSeatOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive License Radar
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Realtime waste telemetry & deterministic seat tracking for <strong className="text-white">{orgName}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCsvImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors shadow-sm"
          >
            <UploadCloud className="h-4 w-4 text-[#8ce04a]" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingSeat(null); setIsAddSeatOpen(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4 text-cyan-400" />
            <span>Add Seat</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingApp(null); setIsAddAppOpen(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Tool / SaaS</span>
          </button>
        </div>
      </div>

      {/* Top 3 Computed Stat Cards */}
      <OverviewMetrics
        metrics={metrics}
        onOpenAddApp={() => { setEditingApp(null); setIsAddAppOpen(true); }}
        onOpenAddSeat={() => { setEditingSeat(null); setIsAddSeatOpen(true); }}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
      />

      {/* Dormant Seats Audit & Evidence Table */}
      <DormantSeatsTable
        dormantSeats={metrics.dormantSeats}
        onEditSeat={handleEditSeat}
      />

      {/* 2-Column Grid: Department Matrix & Renewal Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DepartmentMatrix
          breakdown={metrics.departmentBreakdown}
          totalAnnualWaste={metrics.totalAnnualWaste}
        />
        <RenewalRadar
          renewals={metrics.upcomingRenewals}
          onOpenAddApp={() => { setEditingApp(null); setIsAddAppOpen(true); }}
        />
      </div>

      {/* Subscriptions Catalog Manager */}
      <AppsManager
        apps={apps}
        onOpenAddApp={() => { setEditingApp(null); setIsAddAppOpen(true); }}
        onEditApp={handleEditApp}
      />

      {/* Modals */}
      <AddAppModal
        isOpen={isAddAppOpen}
        onClose={handleCloseAppModal}
        editingApp={editingApp}
      />

      <AddSeatModal
        isOpen={isAddSeatOpen}
        onClose={handleCloseSeatModal}
        apps={apps}
        editingSeat={editingSeat}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        apps={apps}
      />
    </div>
  );
};
