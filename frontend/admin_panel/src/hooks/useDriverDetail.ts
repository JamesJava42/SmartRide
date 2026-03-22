import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDriverById, getDriverDocuments, getDriverVehicle, getDriverOnboarding,
  getDriverRideHistory, getDriverPayouts, getDriverAuditTrail, getDriverNotes, getDriverCompliance,
  approveDriver, rejectDriver, suspendDriver, reactivateDriver, approveDocument, rejectDocument, saveDriverNote,
  adminUploadDocument, createDriverVehicle, updateDriverVehicle, updateDriverRegion,
} from '../api/drivers';
import type { DriverVehicle } from '../types/driver';

export function useDriverDetail(driverId: string) {
  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => getDriverById(driverId),
    staleTime: 30_000,
    enabled: !!driverId,
  });
}

export function useDriverDocuments(driverId: string) {
  return useQuery({
    queryKey: ['driver-documents', driverId],
    queryFn: () => getDriverDocuments(driverId),
    enabled: !!driverId,
  });
}

export function useDriverVehicle(driverId: string) {
  return useQuery({
    queryKey: ['driver-vehicle', driverId],
    queryFn: () => getDriverVehicle(driverId),
    enabled: !!driverId,
  });
}

export function useDriverOnboarding(driverId: string) {
  return useQuery({
    queryKey: ['driver-onboarding', driverId],
    queryFn: () => getDriverOnboarding(driverId),
    enabled: !!driverId,
  });
}

export function useDriverRideHistory(driverId: string, page: number, enabled = true) {
  return useQuery({
    queryKey: ['driver-rides', driverId, page],
    queryFn: () => getDriverRideHistory(driverId, page),
    enabled: !!driverId && enabled,
  });
}

export function useDriverPayouts(driverId: string, page: number, enabled = true) {
  return useQuery({
    queryKey: ['driver-payouts', driverId, page],
    queryFn: () => getDriverPayouts(driverId, page),
    enabled: !!driverId && enabled,
  });
}

export function useDriverAuditTrail(driverId: string, enabled = true) {
  return useQuery({
    queryKey: ['driver-audit', driverId],
    queryFn: () => getDriverAuditTrail(driverId),
    enabled: !!driverId && enabled,
  });
}

export function useDriverNotes(driverId: string) {
  return useQuery({
    queryKey: ['driver-notes', driverId],
    queryFn: () => getDriverNotes(driverId),
    enabled: !!driverId,
  });
}

export function useDriverCompliance(driverId: string) {
  return useQuery({
    queryKey: ['driver-compliance', driverId],
    queryFn: () => getDriverCompliance(driverId),
    enabled: !!driverId,
  });
}

export function useApproveDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, review_notes }: { driverId: string; review_notes: string }) =>
      approveDriver(driverId, { review_notes }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
    },
  });
}

export function useRejectDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, rejection_reason }: { driverId: string; rejection_reason: string }) =>
      rejectDriver(driverId, { rejection_reason }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
    },
  });
}

export function useSuspendDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, reason }: { driverId: string; reason: string }) =>
      suspendDriver(driverId, { reason }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
    },
  });
}

export function useReactivateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId }: { driverId: string }) => reactivateDriver(driverId),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
    },
  });
}

export function useApproveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, documentId }: { driverId: string; documentId: string }) =>
      approveDocument(documentId),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-documents', driverId] });
    },
  });
}

export function useRejectDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, documentId, reason }: { driverId: string; documentId: string; reason: string }) =>
      rejectDocument(documentId, { reason }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-documents', driverId] });
    },
  });
}

export function useSaveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, note }: { driverId: string; note: string }) =>
      saveDriverNote(driverId, { note }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-notes', driverId] });
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      driverId,
      document_type,
      file,
      document_number,
      expires_at,
    }: {
      driverId: string;
      document_type: string;
      file: File;
      document_number?: string;
      expires_at?: string;
    }) => adminUploadDocument(driverId, { document_type, file, document_number, expires_at }),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-documents', driverId] });
    },
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, ...payload }: { driverId: string } & Omit<DriverVehicle, 'id' | 'driver_id'>) =>
      createDriverVehicle(driverId, payload),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-vehicle', driverId] });
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, ...payload }: { driverId: string } & Partial<DriverVehicle>) =>
      updateDriverVehicle(driverId, payload),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver-vehicle', driverId] });
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, regionId }: { driverId: string; regionId: string }) =>
      updateDriverRegion(driverId, regionId),
    onSuccess: (_data, { driverId }) => {
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
