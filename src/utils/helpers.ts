import { QRCodeData } from '../types';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} à ${formatTime(date)}`;
};

export const parseQRCode = (qrData: string): QRCodeData | null => {
  try {
    const parsed = JSON.parse(qrData);
    
    // Vérifier que le QR code contient les champs requis
    if (parsed.locationId && parsed.locationName && parsed.companyId) {
      return parsed as QRCodeData;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du parsing du QR code:', error);
    return null;
  }
};

export const generateQRCodeData = (
  locationId: string,
  locationName: string,
  companyId: string
): string => {
  const qrData: QRCodeData = {
    locationId,
    locationName,
    timestamp: Date.now(),
    companyId
  };
  
  return JSON.stringify(qrData);
};

export const isValidQRCode = (qrData: string): boolean => {
  const parsed = parseQRCode(qrData);
  return parsed !== null;
};