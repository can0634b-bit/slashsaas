'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProject } from '@/lib/actions/projects';

interface ProjectDeleteButtonProps {
  projectId: string;
  projectName: string;
}

export const ProjectDeleteButton: React.FC<ProjectDeleteButtonProps> = ({ projectId, projectName }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProject(projectId);
      router.push('/app');
      router.refresh();
    } catch (err) {
      console.error('Delete project failed:', err);
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-rose-400 font-medium">Delete project?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2.5 py-1 text-xs font-semibold hover:bg-rose-500/30 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, Delete'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title="Delete Project"
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span>Delete</span>
    </button>
  );
};
