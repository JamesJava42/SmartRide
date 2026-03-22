import type { DriverReviewData } from '../../types/onboarding';
import { getDocumentsMap } from '../../utils/onboarding';
import { DocumentsReviewTab } from './tabs/DocumentsReviewTab';

type Props = { data: DriverReviewData; onRefresh: () => void };

export function IdentityTab({ data, onRefresh }: Props) {
  const docMap = getDocumentsMap(data.documents);
  return (
    <DocumentsReviewTab
      docTypes={['GOVT_ID_FRONT', 'GOVT_ID_BACK', 'PROFILE_PHOTO']}
      docMap={docMap}
      onRefresh={onRefresh}
    />
  );
}
