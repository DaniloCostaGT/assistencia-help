export type WorkOrderStatus = 'pending' | 'evaluating' | 'approved' | 'ready' | 'delivered';

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  cpf: string;
  address: string;
  created_at: string;
}

export type PowerStatus = 'powers_on' | 'does_not_power_on' | 'intermittent';

export interface WorkOrderChecklist {
  touchscreen: boolean;
  wifi: boolean;
  cameras: boolean;
  biometrics: boolean;
  body_scratches: string;
  power_status: PowerStatus;
}

export interface WorkOrder {
  id: string;
  client_id: string | null;
  device_model: string;
  imei_serial: string;
  reported_fault: string;
  estimated_price: number;
  status: WorkOrderStatus;
  checklist: WorkOrderChecklist;
  pattern_lock: number[] | null;
  created_at: string;
  updated_at: string;
  client?: Client | null;
}

export type QualityType = 'Original' | 'Incell' | 'OLED' | 'Compatible';

export interface SupplierQuote {
  id: string;
  supplier_name: string;
  part_name: string;
  device_model: string;
  quality_type: QualityType;
  cost_price: number;
  in_stock: boolean;
  whatsapp: string;
  created_at: string;
}

export const DEFAULT_CHECKLIST: WorkOrderChecklist = {
  touchscreen: true,
  wifi: true,
  cameras: true,
  biometrics: true,
  body_scratches: '',
  power_status: 'powers_on',
};
