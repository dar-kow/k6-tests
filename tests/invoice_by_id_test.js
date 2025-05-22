import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError, checkInvoiceStructure, isValidPaymentStatus, isValidPaymentMethod } from '../helpers/common.js';
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
  // Test GET /api/Invoices/{id}
  const invoiceId = 1; 
  const url = getUrl(`/Invoices/${invoiceId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Invoice by ID GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  const statusCheck = check(res, {
    "invoice-by-id: status is 200 or 404": (r) => r.status === 200 || r.status === 404,
    "invoice-by-id: response time < 5000ms": (r) => r.timings.duration < 5000,
  });
  
  if (res.status === 200) {
    const contentTypeCheck = check(res, {
      "invoice-by-id: content-type is JSON": (r) => 
        r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
    });
    
    if (!contentTypeCheck) {
      logError(`Invoice by ID content-type check failed`);
    }
    
    try {
      const data = res.json();
      
      const structureCheck = check(data, {
        "invoice-by-id: response is object": (data) => 
          typeof data === 'object' && !Array.isArray(data) && data !== null,
        "invoice-by-id: has valid invoice structure": (data) => 
          checkInvoiceStructure(data)
      });
      
      if (!structureCheck) {
        logError(`Invoice by ID response structure check failed`);
      }
      
      const validationCheck = check(data, {
        "invoice-by-id: has correct ID": (data) => 
          data.id === invoiceId,
        "invoice-by-id: has valid payment status": (data) => 
          isValidPaymentStatus(data.paymentStatus),
        "invoice-by-id: has valid payment method": (data) => 
          isValidPaymentMethod(data.paymentMethod),
        "invoice-by-id: has valid date formats": (data) => {
          try {
            new Date(data.createdAt);
            new Date(data.issueDate);
            new Date(data.dueDate);
            return true;
          } catch (e) {
            return false;
          }
        },
        "invoice-by-id: has valid amounts": (data) => {
          return data.totalAmount >= 0 && 
                 data.paidAmount >= 0 && 
                 data.paidAmount <= data.totalAmount;
        },
        "invoice-by-id: has valid contractor ID": (data) => {
          return typeof data.contractorId === 'number' && data.contractorId > 0;
        }
      });
      
      if (!validationCheck) {
        logError(`Invoice by ID validation check failed`);
      }
      
      if (data.invoiceItems && Array.isArray(data.invoiceItems)) {
        const itemsCheck = check(data.invoiceItems, {
          "invoice-by-id: has valid invoice items": (items) => {
            if (items.length === 0) return true; // Empty array is valid
            return items.every(item => {
              return item.id !== undefined && 
                     typeof item.lineNumber === "number" &&
                     typeof item.description === "string" &&
                     typeof item.quantity === "number" &&
                     typeof item.netPrice === "number" &&
                     item.invoiceId === invoiceId; // Should match parent invoice ID
            });
          }
        });
        
        if (!itemsCheck) {
          logError(`Invoice items structure check failed`);
        }
      }
      
    } catch (e) {
      logError(`Failed to parse JSON response: ${e.message}`);
      fail("JSON parsing error");
    }
  } else if (res.status === 404) {
    // 404 is acceptable - invoice with this ID might not exist
    check(res, {
      "invoice-by-id: 404 response is acceptable": (r) => true
    });
  }
}