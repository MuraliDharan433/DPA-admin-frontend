'use client';

import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { resumesApi } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeTab({ studentId }: { studentId: string }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: versions, isLoading } = useQuery({
    queryKey: ['resumes', studentId],
    queryFn: () => resumesApi.listVersions(studentId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => resumesApi.upload(studentId, file),
    onSuccess: () => {
      toast.success('Resume uploaded');
      queryClient.invalidateQueries({ queryKey: ['resumes', studentId] });
    },
    onError: (err) => toast.error('Could not upload resume', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumesApi.remove(id),
    onSuccess: () => {
      toast.success('Resume deleted');
      queryClient.invalidateQueries({ queryKey: ['resumes', studentId] });
    },
    onError: (err) => toast.error('Could not delete resume', getErrorMessage(err)),
  });

  const openFile = async (id: string, download: boolean) => {
    try {
      const url = await resumesApi.fetchBlobUrl(id, download);
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.click();
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      toast.error('Could not open file', getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {can(PERMISSIONS.RESUMES_UPLOAD) && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate(file);
              e.target.value = '';
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()} isLoading={uploadMutation.isPending}>
            <Upload className="h-4 w-4" /> Upload Resume
          </Button>
          <p className="mt-1.5 text-xs text-ink/40">PDF or Word document, up to 5MB.</p>
        </div>
      )}

      {!versions || versions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resume uploaded"
          description="Upload a resume to keep it on file for this student."
        />
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <div key={v._id} className="flex items-center justify-between rounded-xl border border-black/[0.06] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <FileText className="h-4 w-4 text-brand-500" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {v.fileName}
                    {v.isActive && <Badge tone="success">Current</Badge>}
                  </p>
                  <p className="text-xs text-ink/40">
                    v{v.version} &middot; {formatBytes(v.fileSize)} &middot; {format(new Date(v.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openFile(v._id, false)}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openFile(v._id, true)}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                {can(PERMISSIONS.RESUMES_DELETE) && (
                  <button
                    onClick={() => deleteMutation.mutate(v._id)}
                    className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
