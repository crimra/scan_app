// Types pour l'application de pointage QR

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'employee' | 'admin';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'check-in' | 'check-out';
  location?: {
    latitude: number;
    longitude: number;
  };
  qrCodeData?: string;
}

export interface QRCodeData {
  locationId: string;
  locationName: string;
  timestamp: number;
  companyId: string;
}

export type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
  History: undefined;
  Profile: undefined;
  Login: undefined;
};