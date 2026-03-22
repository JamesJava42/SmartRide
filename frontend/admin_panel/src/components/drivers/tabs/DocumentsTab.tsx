import { useState } from 'react';
import { SectionCard } from '../../common/SectionCard';
import { StatusBadge } from '../../StatusBadge';
import { useDriverDocuments, useApproveDocument, useRejectDocument, useUploadDocument } from '../../../hooks/useDriverDetail';
import { useToast } from '../../../hooks/useToast';
import { format, parseISO } from 'date-fns';
import type { DriverDocument, DocumentType } from '../../../types/driver';
import styles from './DocumentsTab.module.css';

const DOC_TYPES: { type: DocumentType; label: string }[] = [
  { type: 'PROFILE_PHOTO', label: 'Profile Photo' },
  { type: 'GOVT_ID_FRONT', label: 'Government ID Front' },
  { type: 'GOVT_ID_BACK', label: 'Government ID Back' },
  { type: 'DRIVER_LICENSE', label: 'Driver License' },
  { type: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration' },
  { type: 'INSURANCE', label: 'Insurance' },
];
const REQUIREMENTS: Record<string, { needsDocumentNumber: boolean; needsExpiry: boolean }> = {
  DRIVER_LICENSE: { needsDocumentNumber: true, needsExpiry: true },
  INSURANCE: { needsDocumentNumber: true, needsExpiry: true },
  VEHICLE_REGISTRATION: { needsDocumentNumber: true, needsExpiry: true },
};

interface Props { driverId: string; }

export function DocumentsTab({ driverId }: Props) {
  const { data: docs = [], isLoading } = useDriverDocuments(driverId);
  const [selected, setSelected] = useState<DocumentType | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  // Upload state
  const [uploadType, setUploadType] = useState<DocumentType | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentNumber, setUploadDocumentNumber] = useState('');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');

  const { showSuccess, showError } = useToast();
  const approveM = useApproveDocument();
  const rejectM = useRejectDocument();
  const uploadM = useUploadDocument();

  const docMap = Object.fromEntries(docs.map((d) => [d.document_type, d])) as Record<DocumentType, DriverDocument | undefined>;
  const selectedDoc = selected ? docMap[selected] : null;

  async function handleApprove() {
    if (!selectedDoc) return;
    try {
      await approveM.mutateAsync({ driverId, documentId: selectedDoc.id });
      showSuccess('Document approved');
    } catch (e) { showError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function handleReject() {
    if (!selectedDoc || !rejectReason.trim()) return;
    try {
      await rejectM.mutateAsync({ driverId, documentId: selectedDoc.id, reason: rejectReason });
      showSuccess('Document rejected');
      setShowReject(false);
      setRejectReason('');
    } catch (e) { showError(e instanceof Error ? e.message : 'Failed'); }
  }

  async function handleUpload() {
    if (!uploadType || !uploadFile) return;
    try {
      const requirement = REQUIREMENTS[uploadType] ?? { needsDocumentNumber: false, needsExpiry: false };
      if (requirement.needsDocumentNumber && !uploadDocumentNumber.trim()) {
        throw new Error('Document number is required for this document.');
      }
      if (requirement.needsExpiry && !uploadExpiryDate.trim()) {
        throw new Error('Expiry date is required for this document.');
      }
      await uploadM.mutateAsync({
        driverId,
        document_type: uploadType,
        file: uploadFile,
        document_number: uploadDocumentNumber.trim() || undefined,
        expires_at: uploadExpiryDate.trim() || undefined,
      });
      showSuccess('Document uploaded successfully');
      setUploadType(null);
      setUploadFile(null);
      setUploadDocumentNumber('');
      setUploadExpiryDate('');
      // auto-select the uploaded doc
      setSelected(uploadType);
    } catch (e) { showError(e instanceof Error ? e.message : 'Upload failed'); }
  }

  if (isLoading) return <div className={styles.loading}><div className={styles.sk} /></div>;

  return (
    <div className={styles.split}>
      {/* Left — document list */}
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>Documents</span>
          <span className={styles.listCount}>
            {docs.filter((d) => d.verification_status === 'APPROVED').length}/{DOC_TYPES.length} approved
          </span>
        </div>

        {DOC_TYPES.map(({ type, label }) => {
          const doc = docMap[type];
          const isSelected = selected === type;
          const isUploadOpen = uploadType === type;

          return (
            <div key={type}>
              <div
                className={`${styles.docRow} ${isSelected && !isUploadOpen ? styles.docRowActive : ''}`}
                onClick={() => { if (!isUploadOpen) { setSelected(type); setShowReject(false); } }}
              >
                <div className={styles.docInfo}>
                  <span className={styles.docLabel}>{label}</span>
                  {doc ? (
                    <span className={styles.docDate}>{format(parseISO(doc.submitted_at), 'MMM d, yyyy')}</span>
                  ) : (
                    <span className={styles.docMissing}>Not uploaded</span>
                  )}
                </div>
                <div className={styles.docRowRight}>
                  {doc ? (
                    <StatusBadge status={doc.verification_status} size="sm" />
                  ) : (
                    <span className={styles.notUploadedBadge}>—</span>
                  )}
                  <button
                    className={styles.uploadRowBtn}
                    title={doc ? 'Replace document' : 'Upload document'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isUploadOpen) {
                        setUploadType(null);
                        setUploadFile(null);
                        setUploadDocumentNumber('');
                        setUploadExpiryDate('');
                      } else {
                        setUploadType(type);
                        setUploadFile(null);
                        setUploadDocumentNumber(doc?.document_number ?? '');
                        setUploadExpiryDate(doc?.expires_at ? doc.expires_at.slice(0, 10) : '');
                        setSelected(type);
                      }
                    }}
                  >
                    {isUploadOpen ? '✕' : doc ? '↑ Replace' : '+ Upload'}
                  </button>
                </div>
              </div>

              {/* Inline upload form */}
              {isUploadOpen && (
                <div className={styles.uploadForm}>
                  <p className={styles.uploadHint}>Choose a local file to upload for this document</p>
                  <input
                    className={styles.urlInput}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    autoFocus
                  />
                  {REQUIREMENTS[type]?.needsDocumentNumber ? (
                    <input
                      className={styles.urlInput}
                      type="text"
                      placeholder="Document number"
                      value={uploadDocumentNumber}
                      onChange={(e) => setUploadDocumentNumber(e.target.value)}
                    />
                  ) : null}
                  {REQUIREMENTS[type]?.needsExpiry ? (
                    <input
                      className={styles.urlInput}
                      type="date"
                      value={uploadExpiryDate}
                      onChange={(e) => setUploadExpiryDate(e.target.value)}
                    />
                  ) : null}
                  <div className={styles.uploadFormActions}>
                    <button
                      className={styles.cancelSmallBtn}
                      onClick={() => { setUploadType(null); setUploadFile(null); setUploadDocumentNumber(''); setUploadExpiryDate(''); }}
                      disabled={uploadM.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.uploadSubmitBtn}
                      onClick={handleUpload}
                      disabled={!uploadFile || uploadM.isPending}
                    >
                      {uploadM.isPending ? 'Uploading…' : doc ? 'Replace Document' : 'Upload Document'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right — preview */}
      <div className={styles.preview}>
        {!selected ? (
          <SectionCard>
            <div className={styles.emptyPreview}>
              <span className={styles.emptyIcon}>📄</span>
              <p>Select a document to preview</p>
            </div>
          </SectionCard>
        ) : (
          <SectionCard>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>{DOC_TYPES.find((d) => d.type === selected)?.label}</h3>
              {selectedDoc && <StatusBadge status={selectedDoc.verification_status} />}
            </div>

            {selectedDoc ? (
              <>
                <div className={styles.previewMeta}>
                  <span className={styles.metaLabel}>Submitted</span>
                  <span className={styles.metaVal}>{format(parseISO(selectedDoc.submitted_at), 'MMM d, yyyy · h:mm a')}</span>
                </div>
                {selectedDoc.reviewed_at && (
                  <div className={styles.previewMeta}>
                    <span className={styles.metaLabel}>Reviewed</span>
                    <span className={styles.metaVal}>{format(parseISO(selectedDoc.reviewed_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {selectedDoc.document_number && (
                  <div className={styles.previewMeta}>
                    <span className={styles.metaLabel}>Document Number</span>
                    <span className={styles.metaVal}>{selectedDoc.document_number}</span>
                  </div>
                )}
                {selectedDoc.expires_at && (
                  <div className={styles.previewMeta}>
                    <span className={styles.metaLabel}>Expiry</span>
                    <span className={styles.metaVal}>{format(parseISO(selectedDoc.expires_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {selectedDoc.rejection_reason && (
                  <p className={styles.rejectReason}>❌ {selectedDoc.rejection_reason}</p>
                )}

                <div className={styles.filePreview}>
                  {selectedDoc.file_url ? (
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedDoc.file_url) ? (
                      <img src={selectedDoc.file_url} alt="document" className={styles.docImage} />
                    ) : (
                      <a href={selectedDoc.file_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        📎 View File
                      </a>
                    )
                  ) : (
                    <span className={styles.noFile}>No file available</span>
                  )}
                </div>

                {['SUBMITTED', 'UNDER_REVIEW'].includes(selectedDoc.verification_status) && (
                  <div className={styles.docActions}>
                    <button className={styles.approveBtn} onClick={handleApprove} disabled={approveM.isPending}>
                      {approveM.isPending ? '…' : '✓ Approve'}
                    </button>
                    <button className={styles.rejectBtn} onClick={() => setShowReject((s) => !s)}>
                      ✕ Reject
                    </button>
                    {showReject && (
                      <div className={styles.rejectForm}>
                        <textarea
                          className={styles.rejectTextarea}
                          placeholder="Rejection reason (required)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <button
                          className={styles.confirmRejectBtn}
                          onClick={handleReject}
                          disabled={!rejectReason.trim() || rejectM.isPending}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedDoc.verification_status === 'APPROVED' && (
                  <p className={styles.approvedNote}>
                    ✓ Approved{selectedDoc.reviewed_at ? ` on ${format(parseISO(selectedDoc.reviewed_at), 'MMM d, yyyy')}` : ''}
                  </p>
                )}
              </>
            ) : (
              <div className={styles.emptyPreview} style={{ marginTop: 12 }}>
                <p className={styles.notUploadedText}>This document has not been uploaded yet.</p>
                <button
                  className={styles.uploadPromptBtn}
                  onClick={() => { setUploadType(selected); setUploadFile(null); }}
                >
                  + Upload Document
                </button>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}
