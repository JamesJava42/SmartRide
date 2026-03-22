import type { KycDocumentType } from "@shared/types/kyc";

const docLabels: Record<KycDocumentType, string> = {
  government_id: "Government ID",
  driver_license: "Driver License",
  insurance: "Insurance",
  vehicle_registration: "Vehicle Registration",
};

export function KycMissingDocsAlert({ missingDocuments }: { missingDocuments: KycDocumentType[] }) {
  if (missingDocuments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-semibold">Missing required documents</p>
      <ul className="mt-2 list-disc pl-5">
        {missingDocuments.map((documentType) => (
          <li key={documentType}>{docLabels[documentType]}</li>
        ))}
      </ul>
    </div>
  );
}
