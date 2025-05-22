import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError, checkContractorStructure } from '../helpers/common.js';
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
  // Test GET /api/Contractors
  const url = getUrl('/Contractors');
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  if (res.status !== 200) {
    logError(`Contractors GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  const statusCheck = check(res, {
    "contractors: status is 200": (r) => r.status === 200,
    "contractors: response time < 5000ms": (r) => r.timings.duration < 5000,
    "contractors: content-type is JSON": (r) => 
      r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
  });
  
  if (res.status === 200) {
    try {
      const data = res.json();
      
      // Check if response is an array (based on Swagger spec)
      const structureCheck = check(data, {
        "contractors: response is array": (data) => Array.isArray(data),
        "contractors: array is not empty": (data) => Array.isArray(data) && data.length > 0
      });
      
      if (!structureCheck) {
        logError(`Contractors response structure check failed`);
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const firstContractor = data[0];
        
        const itemCheck = check(firstContractor, {
          "contractors: first item has valid structure": (item) => checkContractorStructure(item),
          "contractors: first item has valid email format": (item) => {
            if (!item.email) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email);
          },
          "contractors: first item has non-empty required fields": (item) => {
            return item.name && item.name.length > 0 &&
                   item.firstName && item.firstName.length > 0 &&
                   item.lastName && item.lastName.length > 0 &&
                   item.email && item.email.length > 0 &&
                   item.taxId && item.taxId.length > 0 &&
                   item.street && item.street.length > 0 &&
                   item.buildingNumber && item.buildingNumber.length > 0 &&
                   item.apartmentNumber && item.apartmentNumber.length > 0 &&
                   item.city && item.city.length > 0 &&
                   item.postalCode && item.postalCode.length > 0;
          }
        });
        
        if (!itemCheck) {
          logError(`Contractors item structure check failed`);
        }
      }
    } catch (e) {
      logError(`Failed to parse JSON response: ${e.message}`);
      fail("JSON parsing error");
    }
  }
}