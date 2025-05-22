import http from 'k6/http';
import { check } from 'k6';
import { getUrl, getHeaders, logError, checkContractorStructure, checkInvoiceStructure, checkInvoiceItemStructure, isValidPaymentStatus, isValidPaymentMethod } from './helpers/common.js';
import { LOAD_PROFILES } from './config/env.js';

function getProfileSettings() {
  const profileName = __ENV.PROFILE || 'LIGHT';
  return LOAD_PROFILES[profileName] || LOAD_PROFILES.LIGHT;
}

// Test function for contractors list
export function contractorsTest() {
  const url = getUrl('/Contractors');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Contractors request failed with status: ${res.status}`);
  }
  
  check(res, {
    "contractors: status is 200": (r) => r.status === 200,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "contractors: response is array": (data) => Array.isArray(data),
        "contractors: has valid structure": (data) => 
          Array.isArray(data) && (data.length === 0 || checkContractorStructure(data[0]))
      });
    } catch (e) {
      logError(`Contractors JSON parsing failed: ${e.message}`);
    }
  }
}

// Test function for invoices list
export function invoicesTest() {
  const url = getUrl('/Invoices');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Invoices request failed with status: ${res.status}`);
  }
  
  check(res, {
    "invoices: status is 200": (r) => r.status === 200,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "invoices: response is array": (data) => Array.isArray(data),
        "invoices: has valid structure": (data) => 
          Array.isArray(data) && (data.length === 0 || checkInvoiceStructure(data[0]))
      });
    } catch (e) {
      logError(`Invoices JSON parsing failed: ${e.message}`);
    }
  }
}

// Test function for invoice items
export function invoiceItemsTest() {
  const invoiceId = 1; 
  const url = getUrl(`/InvoiceItems?invoiceId=${invoiceId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  // This might return 404 if invoice doesn't exist, which is acceptable
  if (res.status !== 200 && res.status !== 404) {
    logError(`InvoiceItems request failed with status: ${res.status}`);
  }
  
  check(res, {
    "invoice-items: status is 200 or 404": (r) => r.status === 200 || r.status === 404,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "invoice-items: response is array": (data) => Array.isArray(data),
        "invoice-items: has valid structure": (data) => 
          Array.isArray(data) && (data.length === 0 || checkInvoiceItemStructure(data[0]))
      });
    } catch (e) {
      logError(`InvoiceItems JSON parsing failed: ${e.message}`);
    }
  }
}

// Test function for contractor by ID
export function contractorByIdTest() {
  const contractorId = 1; 
  const url = getUrl(`/Contractors/${contractorId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  // This might return 404 if contractor doesn't exist, which is acceptable
  if (res.status !== 200 && res.status !== 404) {
    logError(`Contractor by ID request failed with status: ${res.status}`);
  }
  
  check(res, {
    "contractor-by-id: status is 200 or 404": (r) => r.status === 200 || r.status === 404,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "contractor-by-id: response is object": (data) => 
          typeof data === 'object' && !Array.isArray(data),
        "contractor-by-id: has valid structure": (data) => checkContractorStructure(data)
      });
    } catch (e) {
      logError(`Contractor by ID JSON parsing failed: ${e.message}`);
    }
  }
}

// Test function for invoice by ID
export function invoiceByIdTest() {
  const invoiceId = 1; 
  const url = getUrl(`/Invoices/${invoiceId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  // This might return 404 if invoice doesn't exist, which is acceptable
  if (res.status !== 200 && res.status !== 404) {
    logError(`Invoice by ID request failed with status: ${res.status}`);
  }
  
  check(res, {
    "invoice-by-id: status is 200 or 404": (r) => r.status === 200 || r.status === 404,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "invoice-by-id: response is object": (data) => 
          typeof data === 'object' && !Array.isArray(data),
        "invoice-by-id: has valid structure": (data) => checkInvoiceStructure(data)
      });
    } catch (e) {
      logError(`Invoice by ID JSON parsing failed: ${e.message}`);
    }
  }
}

// Test function for last invoice number
export function lastInvoiceNumberTest() {
  const url = getUrl('/Invoices/last-number');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Last invoice number request failed with status: ${res.status}`);
  }
  
  check(res, {
    "last-invoice-number: status is 200": (r) => r.status === 200,
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      check(data, {
        "last-invoice-number: response is string": (data) => typeof data === 'string'
      });
    } catch (e) {
      // Might be plain text response
      check(res.body, {
        "last-invoice-number: response body is string": (body) => typeof body === 'string'
      });
    }
  }
}

// Get profile settings
const profileSettings = getProfileSettings();
const { vus, duration } = profileSettings;

// Configure scenarios
export const options = {
  scenarios: {
    contractors_list: {
      exec: 'contractorsTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'contractors' },
    },
    invoices_list: {
      exec: 'invoicesTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'invoices' },
    },
    invoice_items: {
      exec: 'invoiceItemsTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'invoice-items' },
    },
    contractor_by_id: {
      exec: 'contractorByIdTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'contractor-by-id' },
    },
    invoice_by_id: {
      exec: 'invoiceByIdTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'invoice-by-id' },
    },
    last_invoice_number: {
      exec: 'lastInvoiceNumberTest',
      executor: 'constant-vus',
      vus: vus,
      duration: duration,
      startTime: '0s',
      tags: { test_type: 'last-invoice-number' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<5000'],
  }
};