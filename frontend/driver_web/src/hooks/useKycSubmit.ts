import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitDriverKyc } from "../api/kyc";

export function useKycSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDriverKyc,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["driver-kyc-status"] });
    },
  });
}
