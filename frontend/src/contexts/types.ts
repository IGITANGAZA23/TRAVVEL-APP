export type PaymentMethodType = 'mtn_mobile_money' | 'airtel_money' | 'mastercard' | 'visa';

export interface PaymentMethodInput {
  type: PaymentMethodType;
  identifier: string;
  isDefault: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  paymentMethod: PaymentMethodInput;
}
