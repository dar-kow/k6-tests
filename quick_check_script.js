import http from "k6/http";
import { check } from "k6";

export default function() {
  const baseUrl = "https://maf.sdet.pl";
  
  const endpoint = "/api/Contractors"; 
  
  const token = "your-valid-token-here";
  
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  
  console.log(`Quick check for: ${baseUrl}${endpoint}`);
  console.log("================================");
  
  const res = http.get(`${baseUrl}${endpoint}`, { headers });
  
  console.log(`Status: ${res.status}`);
  console.log(`Response time: ${res.timings.duration}ms`);
  console.log(`Content-Type: ${res.headers['Content-Type'] || 'not set'}`);
  console.log(`Response size: ${res.body ? res.body.length : 0} bytes`);
  
  if (res.status === 200) {
    console.log(`First 200 chars: ${res.body.substring(0, 200)}...`);
    
    try {
      const data = JSON.parse(res.body);
      console.log("✓ JSON parsing successful");
      
      if (Array.isArray(data)) {
        console.log(`✓ Response is array with ${data.length} items`);
      } else if (typeof data === 'object') {
        console.log("✓ Response is object");
        console.log(`Keys: ${Object.keys(data).join(', ')}`);
      } else {
        console.log(`✓ Response is ${typeof data}: ${data}`);
      }
    } catch (e) {
      console.error(`✗ JSON parsing failed: ${e.message}`);
    }
  } else {
    console.error(`✗ Request failed with status ${res.status}`);
    if (res.body) {
      console.error(`Error details: ${res.body.substring(0, 300)}`);
    }
  }
  
  check(res, {
    "status is successful": (r) => r.status >= 200 && r.status < 300,
    "response time is acceptable": (r) => r.timings.duration < 5000,
    "has content-type header": (r) => r.headers['Content-Type'] !== undefined
  });
}