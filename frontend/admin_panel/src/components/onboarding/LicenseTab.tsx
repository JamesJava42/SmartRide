import type { DriverReviewData } from '../../types/onboarding';
import { getDocumentsMap } from '../../utils/onboarding';
import { DocumentsReviewTab } from './tabs/DocumentsReviewTab';

type Props = { data: DriverReviewData; onRefresh: () => void };

export function LicenseTab({ data, onRefresh }: Props) {
  const docMap = getDocumentsMap(data.documents);
  return (
    <DocumentsReviewTab
      docTypes={['DRIVER_LICENSE']}
      docMap={docMap}
      onRefresh={onRefresh}
    />
  );
}
