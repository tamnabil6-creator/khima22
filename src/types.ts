/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TentSize = '12/12' | '9/12' | '9/9' | '12/15';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastBookingDate?: string;
}

export interface Booking {
  id: string;
  tentId: string;
  tentSize: TentSize;
  location: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  deposit: number;
  remaining: number;
  startDate: string;
  endDate: string;
  pickupTime: string;
  status: 'active' | 'completed' | 'cancelled';
  reminder24hSent?: boolean;
  reminder1hSent?: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalReserved: number;
  availableTents: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface Appliance {
  id: string;
  name: string;
  bought: boolean;
}

export interface ChallengeData {
  id: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  updatedAt: string;
  appliances?: Appliance[];
}
