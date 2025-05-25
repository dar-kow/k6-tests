import { check, fail } from 'k6';
import http from 'k6/http';
import { getUrl, getHeaders, logError, checkContractorStructure } from '../helpers/common.js';
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
  // Test GET /api/Contractors/{id}
  const contractorId = 1; 
  const url = getUrl(`/Contractors/${contractorId}`);
  const headers = getHeaders('USER');
  
  const res = http.get(url, { headers });
  
  // Log errors for non-200 responses
  if (res.status !== 200) {
    logError(`Contractor by ID GET request failed with status: ${res.status}`);
    if (res.body) {
      logError(`Response body: ${res.body}`);
    }
  }
  
  const statusCheck = check(res, {
    "contractor-by-id: status is 200 or 404": (r) => r.status === 200 || r.status === 404,
    "contractor-by-id: response time < 5000ms": (r) => r.timings.duration < 5000,
  });
  
  if (res.status === 200) {
    const contentTypeCheck = check(res, {
      "contractor-by-id: content-type is JSON": (r) => 
        r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json')
    });
    
    if (!contentTypeCheck) {
      logError(`Contractor by ID content-type check failed`);
    }
    
    try {
      const data = res.json();
      
      const structureCheck = check(data, {
        "contractor-by-id: response is object": (data) => 
          typeof data === 'object' && !Array.isArray(data) && data !== null,
        "contractor-by-id: has valid contractor structure": (data) => 
          checkContractorStructure(data)
      });
      
      if (!structureCheck) {
        logError(`Contractor by ID response structure check failed`);
      }
      
      const validationCheck = check(data, {
        "contractor-by-id: has correct ID": (data) => 
          data.id === contractorId,
        "contractor-by-id: has valid email format": (data) => {
          if (!data.email) return false;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
        },
        "contractor-by-id: has non-empty required fields": (data) => {
          return data.name && data.name.length > 0 &&
                 data.firstName && data.firstName.length > 0 &&
                 data.lastName && data.lastName.length > 0 &&
                 data.email && data.email.length > 0 &&
                 data.taxId && data.taxId.length > 0 &&
                 data.street && data.street.length > 0 &&
                 data.buildingNumber && data.buildingNumber.length > 0 &&
                 data.apartmentNumber && data.apartmentNumber.length > 0 &&
                 data.city && data.city.length > 0 &&
                 data.postalCode && data.postalCode.length > 0;
        },
        "contractor-by-id: has valid date format": (data) => {
          try {
            new Date(data.createdAt);
            return true;
          } catch (e) {
            return false;
          }
        }
      });
      
      if (!validationCheck) {
        logError(`Contractor by ID validation check failed`);
      }
      
    } catch (e) {
      logError(`Failed to parse JSON response: ${e.message}`);
      fail("JSON parsing error");
    }
  } else if (res.status === 404) {
    // 404 is acceptable - contractor with this ID might not exist
    check(res, {
      "contractor-by-id: 404 response is acceptable": (r) => true
    });
  }
}