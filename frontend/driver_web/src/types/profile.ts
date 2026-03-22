export type DriverDocumentStatus = "VERIFIED" | "PENDING" | "REJECTED" | "EXPIRED" | "MISSING";

export type DriverDocument = {
  id: string;
  documentType: string;
  name: string;
  status: DriverDocumentStatus;
  updatedAt: string | null;
  note: string;
  fileUrl: string | null;
  fileName: string | null;
  documentNumber: string | null;
  issuingState: string | null;
  issuingCountry: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
};

export type DriverVehicle = {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plateNumber: string;
  vehicleType: string;
  seatCount: number | null;
  fuelType: string | null;
  mileageCity: number | null;
  mileageHighway: number | null;
  isActive: boolean;
};

export type DriverProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  region: string | null;
  languages: string[];
  joinedDate: string | null;
  totalRidesCompleted: number;
  rating: number | null;
  status: string;
  isOnline: boolean;
  isAvailable: boolean;
  isApproved: boolean;
};
