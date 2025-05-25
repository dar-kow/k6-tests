import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError, checkInvoiceStructure, isValidPaymentStatus, isValidPaymentMethod } from '../helpers/common.js';
import { DEFAULT_PROFILE, LOAD_PROFILES } from '../config/env.js';

export function getOptions() {
  let profileName = __ENV.PROFILE || 'LIGHT';
  let profile = LOAD_PROFILES[profileName] || DEFAULT_PROFILE;
  var options = Object.assign({}, profile, {
    thresholds: {
      'http_req_duration': ['p(95)<5000'],
      'http_req_failed': ['rate<0.1'],
    }
  });
  return options;
}

export let options = getOptions();

export default function() {
  // Test GET /api/Invoices
  const url = getUrl('/Invoices');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Invoices GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  const statusCheck = check(res, {
    "invoices: status is 200": (r) => r.status === 200,
    "invoices: response time < 5000ms": (r) => r.timings.duration < 5000,
    "invoices: content-type is JSON": (r) => 
      r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      
      const structureCheck = check(data, {
        "invoices: response is array": (data) => Array.isArray(data),
        "invoices: array is not empty": (data) => Array.isArray(data) && data.length > 0
      });
      
      if (!structureCheck) {
        logError(`Invoices response structure check failed`);
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const firstInvoice = data[0];
        
        const itemCheck = check(firstInvoice, {
          "invoices: first item has valid structure": (item) => checkInvoiceStructure(item),
          "invoices: first item has valid payment status": (item) => 
            isValidPaymentStatus(item.paymentStatus),
          "invoices: first item has valid payment method": (item) => 
            isValidPaymentMethod(item.paymentMethod),
          "invoices: first item has valid date formats": (item) => {
            // Check if dates are in valid ISO format
            try {
              new Date(item.createdAt);
              new Date(item.issueDate);
              new Date(item.dueDate);
              return true;
            } catch (e) {
              return false;
            }
          },
          "invoices: first item has valid amounts": (item) => {
            return item.totalAmount >= 0 && 
                   item.paidAmount >= 0 && 
                   item.paidAmount <= item.totalAmount;
          }
        });
        
        if (!itemCheck) {
          logError(`Invoices item structure check failed`);
        }
        
        if (firstInvoice.invoiceItems && Array.isArray(firstInvoice.invoiceItems)) {
          const itemsCheck = check(firstInvoice.invoiceItems, {
            "invoices: first item has valid invoice items": (items) => {
              if (items.length === 0) return true; // Empty array is valid
              return items.every(item => {
                return item.id !== undefined && 
                       typeof item.lineNumber === "number" &&
                       typeof item.description === "string" &&
                       typeof item.quantity === "number" &&
                       typeof item.netPrice === "number";
              });
            }
          });
          
          if (!itemsCheck) {
            logError(`Invoice items structure check failed`);
          }
        }
      }
    } catch (e) {
      logError(`Failed to parse JSON response: ${e.message}`);
      fail("JSON parsing error");
    }
  }
}