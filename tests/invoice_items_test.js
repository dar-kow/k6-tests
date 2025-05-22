import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError, checkInvoiceItemStructure, isValidUnit, isValidVatRate } from '../helpers/common.js';
import { DEFAULT_PROFILE, LOAD_PROFILES } from '../config/env.js';

export function getOptions() {
  let profileName = __ENV.PROFILE || 'LIGHT';
  let profile = LOAD_PROFILES[profileName] || DEFAULT_PROFILE;
  
  return {
    ...profile,
    thresholds: {
      'http_req_duration': ['p(95)<5000'],
      'http_req_failed': ['rate<0.1'],
    }
  };
}

export let options = getOptions();

export default function() {
  // Test GET /api/InvoiceItems with query parameter
  const invoiceId = 1; 
  const url = getUrl(`/InvoiceItems?invoiceId=${invoiceId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`InvoiceItems GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  // Basic status check
  const statusCheck = check(res, {
    "invoice-items: status is 200": (r) => r.status === 200,
    "invoice-items: response time < 5000ms": (r) => r.timings.duration < 5000,
    "invoice-items: content-type is JSON": (r) => 
      r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      
      const structureCheck = check(data, {
        "invoice-items: response is array": (data) => Array.isArray(data)
      });
      
      if (!structureCheck) {
        logError(`InvoiceItems response structure check failed`);
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        
        const itemCheck = check(firstItem, {
          "invoice-items: first item has valid structure": (item) => checkInvoiceItemStructure(item),
          "invoice-items: first item has valid unit": (item) => 
            isValidUnit(item.unit),
          "invoice-items: first item has valid VAT rate": (item) => 
            isValidVatRate(item.vatRate),
          "invoice-items: first item has non-empty description": (item) => 
            item.description && item.description.length > 0,
          "invoice-items: first item has positive quantity": (item) => 
            item.quantity > 0,
          "invoice-items: first item has non-negative net price": (item) => 
            item.netPrice >= 0,
          "invoice-items: first item has correct invoiceId": (item) => 
            item.invoiceId === invoiceId
        });
        
        if (!itemCheck) {
          logError(`InvoiceItems item structure check failed`);
        }
      } else if (Array.isArray(data) && data.length === 0) {
        check(data, {
          "invoice-items: empty array is valid response": (data) => true
        });
      }
    } catch (e) {
      logError(`Failed to parse JSON response: ${e.message}`);
      fail("JSON parsing error");
    }
  }
}