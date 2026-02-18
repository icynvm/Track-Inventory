
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST'
}

export interface Equipment {
  id: string; // Barcode or QR code value
  name: string;
  category: string;
  status: EquipmentStatus;
  currentHolder?: string;
  projectName?: string; // Track which project is using it
  lastActionDate: string;
  location?: string;
  imageUrl?: string;
}

export interface AuditLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  action: 'CHECK_OUT' | 'CHECK_IN' | 'STATUS_UPDATE';
  userName: string;
  projectName?: string; // Which project it was taken for
  timestamp: string;
  notes?: string;
}

export interface Stats {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
}
