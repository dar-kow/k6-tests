import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError } from '../helpers/common.js';
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
  // Test GET /api/Invoices/last-number
  const url = getUrl('/Invoices/last-number');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Last invoice number GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  const statusCheck = check(res, {
    "last-invoice-number: status is 200": (r) => r.status === 200,
    "last-invoice-number: response time < 5000ms": (r) => r.timings.duration < 5000,
    "last-invoice-number: content-type is JSON": (r) => 
      r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      
      const structureCheck = check(data, {
        "last-invoice-number: response is string": (data) => typeof data === 'string',
        "last-invoice-number: response is not empty": (data) => 
          typeof data === 'string' && data.length > 0
      });
      
      if (!structureCheck) {
        logError(`Last invoice number response structure check failed`);
      }
      
      // Additional validation - check if it looks like an invoice number
      if (typeof data === 'string') {
        const formatCheck = check(data, {
          "last-invoice-number: has reasonable format": (data) => {
            // Invoice numbers usually contain digits, letters, and some special characters
            // This is a basic check - adjust pattern based numbering system
            return /^[A-Za-z0-9\/\-_]+/.test(data);
          },
          "last-invoice-number: length is reasonable": (data) => {
            return data.length >= 1 && data.length <= 50;
          }
        });
        
        if (!formatCheck) {
          logError(`Last invoice number format check failed`);
        }
      }
      
    } catch (e) {
      // Handle the case where response might be plain text instead of JSON
      if (res.headers['Content-Type'] && res.headers['Content-Type'].includes('text/plain')) {
        const textCheck = check(res.body, {
          "last-invoice-number: plain text response is string": (body) => typeof body === 'string',
          "last-invoice-number: plain text response is not empty": (body) => 
            typeof body === 'string' && body.length > 0
        });
        
        if (!textCheck) {
          logError(`Last invoice number plain text check failed`);
        }
      } else {
        logError(`Failed to parse response: ${e.message}`);
        fail("Response parsing error");
      }
    }
  }
}