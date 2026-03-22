import { useMemo, useState } from 'react';

import {
  approveOnboardingDocument,
  rejectOnboardingDocument,
  requestOnboardingDocumentReupload,
} from '../../../api/onboarding';
import type { DriverReviewData, OnboardingDocument } from '../../../types/onboarding';
import { formatDate } from '../../../utils/onboarding';
import { VehicleCard } from '@shared/components/vehicle';
import type { Vehicle } from '@shared/types/vehicle';
import { EmptyState } from '../../common/EmptyState';
import { StatusBadge } from '../../common/StatusBadge';

type Props = {
  data: DriverReviewData;
  category?: 'identity' | 'license' | 'vehicle' | 'insurance';
  onRefresh: () => Promise<void>;
};

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

function previewTone(document: OnboardingDocument | undefined) {
  if (!document || document.is_missing) {
    return 'Missing';
  }
  if (!document.file_url) {
    return 'No file';
  }
  return IMAGE_EXTENSIONS.test(document.file_url) ? 'Preview' : 'Document';
}

function PreviewPanel({
  driverId,
  document,
  onRefresh,
}: {
  driverId: string;
  document?: OnboardingDocument;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!document) {
    return (
      <div className="rounded-3xl border border-line bg-white p-6">
        <EmptyState
          icon="○"
          title="Select a document"
          description="Choose a record from the left to inspect metadata and review actions."
        />
      </div>
    );
  }

  async function handleApprove() {
    setLoading(true);
    try {
      await approveOnboardingDocument(driverId, document.id);
      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      return;
    }
    setLoading(true);
    try {
      await rejectOnboardingDocument(driverId, document.id, {
        rejection_reason: rejectReason.trim(),
      });
      setRejectReason('');
      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReuploadRequest() {
    setLoading(true);
    try {
      await requestOnboardingDocumentReupload(driverId, document.id, {
        notes: rejectReason.trim() || 'Please upload a clearer or updated version.',
      });
      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
            <h3 className="mt-1 text-base font-semibold text-ink">{document.label}</h3>
          </div>
          <StatusBadge status={document.status} />
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-line bg-[#faf8f3]">
          {document.file_url && IMAGE_EXTENSIONS.test(document.file_url) ? (
            <img
              src={document.file_url}
              alt={document.label}
              className="max-h-[220px] rounded-2xl object-contain"
            />
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-ink">{previewTone(document)}</p>
              <p className="mt-1 text-xs text-muted">
                {document.file_url ? 'Open the file using the download action below.' : 'No upload attached.'}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Uploaded</p>
            <p className="mt-1 text-sm text-ink">{formatDate(document.uploaded_at)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Expiry</p>
            <p className="mt-1 text-sm text-ink">{formatDate(document.expiry_date)}</p>
          </div>
          {document.document_number ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Document Number</p>
              <p className="mt-1 text-sm text-ink">{document.document_number}</p>
            </div>
          ) : null}
          {document.issuing_state || document.issuing_country ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Issued By</p>
              <p className="mt-1 text-sm text-ink">{[document.issuing_state, document.issuing_country].filter(Boolean).join(', ')}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-[#faf8f3] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Action Summary</p>
          <p className="mt-1 text-sm text-ink">{document.action_summary}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Admin Comment</p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Add a note for rejection or reupload request..."
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || document.is_missing}
            onClick={handleApprove}
            className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleReject}
            className="rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleReuploadRequest}
            className="rounded-2xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef] disabled:opacity-60"
          >
            Request Reupload
          </button>
          {document.file_url ? (
            <a
              href={document.file_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
            >
              Download
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DocumentsReviewTab({ data, category, onRefresh }: Props) {
  const documents = useMemo(
    () =>
      category
        ? data.normalized_documents.filter((document) => document.category === category)
        : data.normalized_documents,
    [category, data.normalized_documents]
  );

  const [selectedId, setSelectedId] = useState<string>(documents[0]?.id ?? '');
  const selectedDocument = documents.find((document) => document.id === selectedId) ?? documents[0];

  return (
    <div className="space-y-5">
      {category === 'vehicle' && data.vehicle ? (
        <VehicleCard
          vehicle={{
            ...(data.vehicle as unknown as Vehicle),
            vehicle_type: data.vehicle.vehicle_type as Vehicle["vehicle_type"],
            fuel_type: null,
            mileage_city: null,
            mileage_highway: null,
          }}
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1.4fr]">
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Documents</p>
        </div>
        <div className="divide-y divide-line">
          {documents.map((document) => {
            const isSelected = selectedDocument?.id === document.id;
            return (
              <button
                key={document.id}
                type="button"
                onClick={() => setSelectedId(document.id)}
                className={`flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition ${
                  isSelected ? 'bg-[#f7f5ef]' : 'hover:bg-[#fcfbf8]'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{document.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    Uploaded {formatDate(document.uploaded_at)} · Expiry {formatDate(document.expiry_date)}
                  </p>
                  <p className="mt-2 text-xs text-muted">{document.action_summary}</p>
                </div>
                <StatusBadge status={document.status} />
              </button>
            );
          })}
        </div>
      </div>

      <PreviewPanel driverId={data.driver_id} document={selectedDocument} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
