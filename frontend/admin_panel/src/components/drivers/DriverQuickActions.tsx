import { useState } from 'react';
import { SectionCard } from '../common/SectionCard';
import { useApproveDriver, useRejectDriver, useSuspendDriver, useReactivateDriver } from '../../hooks/useDriverDetail';
import { requestDriverInfo } from '../../api/drivers';
import type { DriverDetail } from '../../types/driver';
import { useToast } from '../../hooks/useToast';
import styles from './DriverQuickActions.module.css';

interface Props {
  driver: DriverDetail | null;
  driverId: string;
  onActionSuccess: () => void;
}

type ActionKey = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'requestInfo' | null;

export function DriverQuickActions({ driver, driverId, onActionSuccess }: Props) {
  const [activeAction, setActiveAction] = useState<ActionKey>(null);
  const [inputValue, setInputValue] = useState('');
  const { showSuccess, showError } = useToast();

  const approveM = useApproveDriver();
  const rejectM = useRejectDriver();
  const suspendM = useSuspendDriver();
  const reactivateM = useReactivateDriver();

  const anyPending = approveM.isPending || rejectM.isPending || suspendM.isPending || reactivateM.isPending;

  function openAction(action: ActionKey) {
    setActiveAction(action);
    setInputValue('');
  }

  async function handleConfirm() {
    try {
      if (activeAction === 'approve') {
        await approveM.mutateAsync({ driverId, review_notes: inputValue });
        showSuccess('Driver approved successfully');
      } else if (activeAction === 'reject') {
        await rejectM.mutateAsync({ driverId, rejection_reason: inputValue });
        showSuccess('Driver rejected');
      } else if (activeAction === 'suspend') {
        await suspendM.mutateAsync({ driverId, reason: inputValue });
        showSuccess('Driver suspended');
      } else if (activeAction === 'reactivate') {
        await reactivateM.mutateAsync({ driverId });
        showSuccess('Driver reactivated');
      } else if (activeAction === 'requestInfo') {
        await requestDriverInfo(driverId, { message: inputValue });
        showSuccess('Info request sent');
      }
      setActiveAction(null);
      setInputValue('');
      onActionSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  const status = driver?.status;

  const confirmDisabled =
    anyPending ||
    (['reject', 'suspend', 'requestInfo'].includes(activeAction ?? '') && !inputValue.trim());

  return (
    <SectionCard title="Actions">
      <div className={styles.actions}>
        {/* PENDING_APPROVAL */}
        {status === 'PENDING_APPROVAL' && (
          <>
            <ActionBtn label="Approve" variant="approve" disabled={anyPending} onClick={() => openAction('approve')} />
            <ActionBtn label="Reject" variant="reject" disabled={anyPending} onClick={() => openAction('reject')} />
            <ActionBtn label="Request Info" variant="neutral" disabled={anyPending} onClick={() => openAction('requestInfo')} />
          </>
        )}

        {/* ACTIVE */}
        {status === 'ACTIVE' && (
          <>
            <ActionBtn label="Suspend" variant="suspend" disabled={anyPending} onClick={() => openAction('suspend')} />
            <ActionBtn label="Request Info" variant="neutral" disabled={anyPending} onClick={() => openAction('requestInfo')} />
          </>
        )}

        {/* SUSPENDED */}
        {status === 'SUSPENDED' && (
          <>
            <ActionBtn label="Reactivate" variant="reactivate" disabled={anyPending} onClick={() => openAction('reactivate')} />
            <ActionBtn label="Request Info" variant="neutral" disabled={anyPending} onClick={() => openAction('requestInfo')} />
          </>
        )}

        {/* INACTIVE */}
        {status === 'INACTIVE' && (
          <ActionBtn label="Reactivate" variant="reactivate" disabled={anyPending} onClick={() => openAction('reactivate')} />
        )}

        {!status && !driver && (
          <p className={styles.noActions}>Loading driver…</p>
        )}
      </div>

      {/* Inline confirmation */}
      {activeAction && (
        <div className={styles.confirm}>
          {activeAction === 'approve' && (
            <textarea
              className={styles.textarea}
              placeholder="Review notes (optional)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={3}
              autoFocus
            />
          )}
          {(activeAction === 'reject' || activeAction === 'suspend') && (
            <textarea
              className={styles.textarea}
              placeholder={activeAction === 'reject' ? 'Rejection reason (required)' : 'Suspension reason (required)'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={3}
              autoFocus
            />
          )}
          {activeAction === 'requestInfo' && (
            <textarea
              className={styles.textarea}
              placeholder="Message to driver (required)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={3}
              autoFocus
            />
          )}
          {activeAction === 'reactivate' && (
            <p className={styles.confirmText}>Confirm reactivation of this driver?</p>
          )}
          <div className={styles.confirmRow}>
            <button className={styles.cancelLink} onClick={() => setActiveAction(null)} disabled={anyPending}>Cancel</button>
            <button className={styles.confirmBtn} onClick={handleConfirm} disabled={confirmDisabled}>
              {anyPending ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function ActionBtn({ label, variant, disabled, onClick }: { label: string; variant: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant as keyof typeof styles]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
