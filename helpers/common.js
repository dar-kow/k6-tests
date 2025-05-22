import { CURRENT_HOST, TOKENS } from '../config/env.js';

export function getUrl(path) {
  return `${CURRENT_HOST}${path}`;
}

export function getHeaders(role = 'USER') {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKENS[role]}`
  };
}

export function logError(message) {
  if (__ENV.LOG_LEVEL !== 'error') return;
  console.error(`ERROR: ${message}`);
}

export function checkContractorStructure(contractor) {
  if (!contractor) return false;
  return (
    contractor.id !== undefined && typeof contractor.id === "number" &&
    contractor.createdAt !== undefined && typeof contractor.createdAt === "string" &&
    contractor.name !== undefined && typeof contractor.name === "string" &&
    contractor.firstName !== undefined && typeof contractor.firstName === "string" &&
    contractor.lastName !== undefined && typeof contractor.lastName === "string" &&
    contractor.email !== undefined && typeof contractor.email === "string" &&
    contractor.taxId !== undefined && typeof contractor.taxId === "string" &&
    contractor.street !== undefined && typeof contractor.street === "string" &&
    contractor.buildingNumber !== undefined && typeof contractor.buildingNumber === "string" &&
    contractor.apartmentNumber !== undefined && typeof contractor.apartmentNumber === "string" &&
    contractor.city !== undefined && typeof contractor.city === "string" &&
    contractor.postalCode !== undefined && typeof contractor.postalCode === "string"
  );
}

export function checkInvoiceStructure(invoice) {
  if (!invoice) return false;
  return (
    invoice.id !== undefined && typeof invoice.id === "number" &&
    invoice.createdAt !== undefined && typeof invoice.createdAt === "string" &&
    (invoice.number === null || typeof invoice.number === "string") &&
    invoice.issueDate !== undefined && typeof invoice.issueDate === "string" &&
    invoice.totalAmount !== undefined && typeof invoice.totalAmount === "number" &&
    invoice.paymentStatus !== undefined && typeof invoice.paymentStatus === "string" &&
    invoice.dueDate !== undefined && typeof invoice.dueDate === "string" &&
    invoice.paidAmount !== undefined && typeof invoice.paidAmount === "number" &&
    (invoice.description === null || typeof invoice.description === "string") &&
    invoice.contractorId !== undefined && typeof invoice.contractorId === "number" &&
    invoice.paymentMethod !== undefined && typeof invoice.paymentMethod === "string"
  );
}

export function checkInvoiceItemStructure(item) {
  if (!item) return false;
  return (
    item.id !== undefined && typeof item.id === "number" &&
    item.lineNumber !== undefined && typeof item.lineNumber === "number" &&
    item.description !== undefined && typeof item.description === "string" &&
    item.quantity !== undefined && typeof item.quantity === "number" &&
    item.unit !== undefined && typeof item.unit === "string" &&
    item.vatRate !== undefined && typeof item.vatRate === "string" &&
    item.netPrice !== undefined && typeof item.netPrice === "number" &&
    item.invoiceId !== undefined && typeof item.invoiceId === "number"
  );
}

export function isValidPaymentStatus(status) {
  const validStatuses = ["Paid", "PartiallyPaid", "Unpaid", "Overdue"];
  return validStatuses.includes(status);
}

export function isValidPaymentMethod(method) {
  const validMethods = ["Cash", "Transfer", "Card", "Other"];
  return validMethods.includes(method);
}

export function isValidUnit(unit) {
  const validUnits = ["l", "szt", "m", "kg"];
  return validUnits.includes(unit);
}

export function isValidVatRate(vatRate) {
  const validRates = ["Zero", "Three", "Five", "Eight", "TwentyThree"];
  return validRates.includes(vatRate);
}