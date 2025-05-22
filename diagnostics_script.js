import http from "k6/http";

export default function() {
  const baseUrl = "https://maf.sdet.pl";
  
  const token = "your-valid-token-here";
  
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  
  // Test basic connectivity
  console.log("=== MAF API Diagnostics ===");
  console.log(`Base URL: ${baseUrl}`);
  console.log("");
  
  // Test different API endpoints
  const endpoints = [
    { path: "/api/Contractors", method: "GET" },
    { path: "/api/Invoices", method: "GET" },
    { path: "/api/InvoiceItems?invoiceId=1", method: "GET" },
    { path: "/api/Contractors/1", method: "GET" },
    { path: "/api/Invoices/1", method: "GET" },
    { path: "/api/Invoices/last-number", method: "GET" }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint.method} ${endpoint.path}`);
    const url = `${baseUrl}${endpoint.path}`;
    
    let res;
    if (endpoint.method === "GET") {
      res = http.get(url, { headers });
    }
    
    console.log(`Status: ${res.status}`);
    console.log(`Response time: ${res.timings.duration}ms`);
    console.log(`Content-Type: ${res.headers['Content-Type'] || 'not set'}`);
    
    if (res.body) {
      console.log(`Body size: ${res.body.length} bytes`);
      if (res.status === 200) {
        console.log(`First 100 chars: ${res.body.substring(0, 100)}...`);
      } else {
        console.log(`Error response: ${res.body.substring(0, 200)}...`);
      }
    }
    
    console.log("---");
  }
  
  // Test authentication
  console.log("Testing without authentication:");
  const unauthRes = http.get(`${baseUrl}/api/Contractors`);
  console.log(`Unauthenticated status: ${unauthRes.status}`);
  console.log("=== End Diagnostics ===");
}