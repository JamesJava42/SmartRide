import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getRegions } from '../api/admin';
import {
  approveDriverOnboarding,
  getOnboardingById,
  requestDriverMoreInfo,
  rejectDriverOnboarding,
  saveOnboardingNote,
} from '../api/onboarding';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { OnboardingActionsCard } from '../components/onboarding/OnboardingActionsCard';
import { OnboardingSummaryCard } from '../components/onboarding/OnboardingSummaryCard';
import { OnboardingTabs } from '../components/onboarding/OnboardingTabs';
import { ActivityTab } from '../components/onboarding/tabs/ActivityTab';
import { DocumentsReviewTab } from '../components/onboarding/tabs/DocumentsReviewTab';
import { SummaryTab } from '../components/onboarding/tabs/SummaryTab';
import type { DriverReviewData } from '../types/onboarding';

type TabId =
  | 'summary'
  | 'identity'
  | 'license'
  | 'vehicle'
  | 'insurance'
  | 'documents'
  | 'activity';

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'identity', label: 'Identity' },
  { id: 'license', label: 'License' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'documents', label: 'All Documents' },
  { id: 'activity', label: 'Activity' },
];

type ActionResult = { type: 'success' | 'error'; message: string };

export function DriverReviewPage() {
  const { driverId = '' } = useParams();

  const [data, setData] = useState<DriverReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const regions = await getRegions().catch(() => []);
      const detail = await getOnboardingById(driverId, regions);
      setData(detail);
      setNotes(detail.review_notes ?? '');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function handleApprove() {
    setActing(true);
    setResult(null);
    try {
      await approveDriverOnboarding(driverId, { review_notes: notes || null });
      setResult({ type: 'success', message: 'Driver approved successfully.' });
      await loadDetail();
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve driver.',
      });
    } finally {
      setActing(false);
    }
  }

  async function handleReject(reason: string) {
    setActing(true);
    setResult(null);
    try {
      await rejectDriverOnboarding(driverId, { rejection_reason: reason });
      setResult({ type: 'success', message: 'Application rejected.' });
      await loadDetail();
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to reject application.',
      });
    } finally {
      setActing(false);
    }
  }

  async function handleRequestInfo(nextNotes: string) {
    setActing(true);
    setResult(null);
    try {
      await requestDriverMoreInfo(driverId, { notes: nextNotes || 'More information requested by admin.' });
      setResult({ type: 'success', message: 'Additional information requested from driver.' });
      await loadDetail();
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to request more info.',
      });
    } finally {
      setActing(false);
    }
  }

  async function handleSaveNotes(nextNotes: string) {
    await saveOnboardingNote(driverId, { review_notes: nextNotes });
    setNotes(nextNotes);
    await loadDetail();
  }

  function renderTabContent(detail: DriverReviewData) {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab data={detail} />;
      case 'identity':
        return <DocumentsReviewTab data={detail} category="identity" onRefresh={loadDetail} />;
      case 'license':
        return <DocumentsReviewTab data={detail} category="license" onRefresh={loadDetail} />;
      case 'vehicle':
        return <DocumentsReviewTab data={detail} category="vehicle" onRefresh={loadDetail} />;
      case 'insurance':
        return <DocumentsReviewTab data={detail} category="insurance" onRefresh={loadDetail} />;
      case 'documents':
        return <DocumentsReviewTab data={detail} onRefresh={loadDetail} />;
      case 'activity':
        return <ActivityTab data={detail} />;
      default:
        return null;
    }
  }

  if (loading) {
    return <LoadingState label="Loading onboarding review..." />;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link to="/onboarding" className="text-sm font-medium text-muted transition hover:text-ink">
          ← Back to onboarding
        </Link>
        <EmptyState
          icon="!"
          title="Driver record not found"
          description="The onboarding application could not be loaded."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm text-muted">
        <Link to="/onboarding" className="font-medium transition hover:text-ink">
          ← Driver
        </Link>
        <h1 className="text-[20px] font-medium text-ink">Onboarding Review</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <OnboardingSummaryCard data={data} />
        <OnboardingActionsCard
          data={data}
          notes={notes}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
          onSaveNote={() => handleSaveNotes(notes)}
          acting={acting}
          result={result}
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-line bg-white">
        <OnboardingTabs tabs={TABS} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as TabId)} />
        <div className="px-5 py-5">
          {renderTabContent(data)}
        </div>
      </div>
    </div>
  );
}
