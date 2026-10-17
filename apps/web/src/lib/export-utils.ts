/**
 * Reusable CSV / JSON export helpers for payment data.
 *
 * Extracted from PaymentTable.tsx so the command palette (and any other
 * surface) can trigger downloads without duplicating the serialization logic.
 */

import { PaymentDTO } from '@stellar-alerts/shared';

const CSV_HEADERS = [
  'ID',
  'Wallet ID',
  'Tx Hash',
  'From Address',
  'Amount',
  'Asset',
  'Memo',
  'Received At',
];

/**
 * Escapes a single CSV field per RFC 4180: wraps in double quotes when the
 * value contains a comma, double-quote, or newline; doubles embedded quotes.
 */
function escapeCsvField(value: unknown): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsvRows(payments: PaymentDTO[]): string[] {
  return payments.map((p) =>
    [
      p.id,
      p.walletId,
      p.txHash,
      p.fromAddress || '',
      p.amount,
      p.asset,
      p.memo || '',
      new Date(p.receivedAt).toISOString(),
    ]
      .map(escapeCsvField)
      .join(','),
  );
}

/**
 * Build a CSV string from a list of payments.
 */
export function paymentsToCsv(payments: PaymentDTO[]): string {
  const rows = buildCsvRows(payments);
  return [CSV_HEADERS.join(','), ...rows].join('\n');
}

/**
 * Build a pretty-printed JSON string from a list of payments.
 */
export function paymentsToJson(payments: PaymentDTO[]): string {
  return JSON.stringify(payments, null, 2);
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a list of payments as a CSV file (`stellar-payments.csv`).
 * No-op when the list is empty.
 */
export function exportPaymentsToCSV(payments: PaymentDTO[]): void {
  if (!payments || payments.length === 0) return;
  triggerDownload(paymentsToCsv(payments), 'stellar-payments.csv', 'text/csv;charset=utf-8;');
}

/**
 * Download a list of payments as a JSON file (`stellar-payments.json`).
 * No-op when the list is empty.
 */
export function exportPaymentsToJSON(payments: PaymentDTO[]): void {
  if (!payments || payments.length === 0) return;
  triggerDownload(paymentsToJson(payments), 'stellar-payments.json', 'application/json;charset=utf-8;');
}
