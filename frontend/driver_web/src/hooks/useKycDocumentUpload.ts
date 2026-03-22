import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateDriverKycDocument, uploadDriverKycDocument } from "../api/kyc";
import type { KycDocumentType, UploadKycDocumentPayload } from "@shared/types/kyc";

export function useKycDocumentUpload() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ documentType, payload }: { documentType: KycDocumentType; payload: UploadKycDocumentPayload }) =>
      uploadDriverKycDocument(documentType, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["driver-kyc-status"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ documentType, payload }: { documentType: KycDocumentType; payload: UploadKycDocumentPayload }) =>
      updateDriverKycDocument(documentType, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["driver-kyc-status"] });
    },
  });

  return {
    uploadDocument: uploadMutation.mutateAsync,
    updateDocument: updateMutation.mutateAsync,
    isUploading: uploadMutation.isPending || updateMutation.isPending,
  };
}
