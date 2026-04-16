export type CardPaymentMethod = 'visa' | 'mastercard' | 'mada';

export type PaymentProcessStage =
  | 'idle'
  | 'authorizing'
  | 'three_ds'
  | 'approved'
  | 'declined';

export interface PaymentFormState {
  method: CardPaymentMethod;
  cardholder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
}

export interface PaymentValidationResult {
  isValid: boolean;
  detectedMethod: CardPaymentMethod | null;
  errors: Partial<Record<'cardholder' | 'cardNumber' | 'expiry' | 'cvv', string>>;
}

export interface CardMethodUiConfig {
  id: CardPaymentMethod;
  label: string;
  helper: string;
  numberPlaceholder: string;
  cvvLabel: string;
  cvvPlaceholder: string;
  cardholderPlaceholder: string;
  cardNumberMaxLength: number;
}

export const CARD_PAYMENT_METHODS: CardMethodUiConfig[] = [
  {
    id: 'visa',
    label: 'Visa',
    helper: 'Global credit/debit network',
    numberPlaceholder: '4111 1111 1111 1111',
    cvvLabel: 'CVV',
    cvvPlaceholder: '123',
    cardholderPlaceholder: 'e.g. MOHAM ALQAHTANI',
    cardNumberMaxLength: 16,
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    helper: 'Worldwide card acceptance',
    numberPlaceholder: '5555 5555 5555 4444',
    cvvLabel: 'CVC',
    cvvPlaceholder: '123',
    cardholderPlaceholder: 'e.g. MOHAM ALQAHTANI',
    cardNumberMaxLength: 16,
  },
  {
    id: 'mada',
    label: 'Mada',
    helper: 'Saudi domestic card scheme',
    numberPlaceholder: '5888 4500 0000 0000',
    cvvLabel: 'CVV',
    cvvPlaceholder: '123',
    cardholderPlaceholder: 'Name as printed on card',
    cardNumberMaxLength: 19,
  },
];

const MADA_PREFIXES = [
  '440647', '440795', '445564', '446404', '457865', '457997', '474491', '588845',
  '968208', '968210', '968211', '968212',
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string, method: CardPaymentMethod) {
  const config = CARD_PAYMENT_METHODS.find((m) => m.id === method);
  const maxDigits = config?.cardNumberMaxLength ?? 19;
  return onlyDigits(value)
    .slice(0, maxDigits)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value: string) {
  return onlyDigits(value).slice(0, 3);
}

export function detectCardMethod(cardNumber: string): CardPaymentMethod | null {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 1) return null;

  if (MADA_PREFIXES.some((prefix) => digits.startsWith(prefix))) {
    return 'mada';
  }
  if (digits.startsWith('4')) return 'visa';

  const two = Number(digits.slice(0, 2));
  const four = Number(digits.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720)) {
    return 'mastercard';
  }
  return null;
}

function isValidExpiry(expiry: string) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const month = Number(expiry.slice(0, 2));
  const year = Number(expiry.slice(3, 5));
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const fullYear = 2000 + year;
  const expiryDate = new Date(fullYear, month, 0, 23, 59, 59);
  return expiryDate.getTime() >= now.getTime();
}

function luhnCheck(cardNumber: string) {
  const digits = onlyDigits(cardNumber);
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validatePaymentForm(form: PaymentFormState): PaymentValidationResult {
  const errors: PaymentValidationResult['errors'] = {};
  const digits = onlyDigits(form.cardNumber);
  const detectedMethod = detectCardMethod(digits);

  if (form.cardholder.trim().length < 3) {
    errors.cardholder = 'Enter cardholder full name.';
  }
  if (digits.length < 16 || digits.length > 19 || !luhnCheck(digits)) {
    errors.cardNumber = 'Enter a valid card number.';
  } else if (detectedMethod && detectedMethod !== form.method) {
    errors.cardNumber = `This card looks like ${detectedMethod.toUpperCase()}. Switch method or use matching card.`;
  }
  if (!isValidExpiry(form.expiry)) {
    errors.expiry = 'Enter a valid expiry date (MM/YY).';
  }
  if (!/^\d{3}$/.test(form.cvv)) {
    errors.cvv = 'CVV must be 3 digits.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    detectedMethod,
    errors,
  };
}

export function simulatePaymentOutcome(form: PaymentFormState) {
  const digits = onlyDigits(form.cardNumber);
  const tail = Number(digits.slice(-2) || '0');
  const requires3ds = tail % 3 === 0;
  const shouldDecline = digits.endsWith('0000') || tail % 11 === 0;
  const declineReason = shouldDecline ? 'Card issuer declined this transaction (mock).' : null;
  return { requires3ds, shouldDecline, declineReason };
}
