export const HOSTS = {
  PROD: "https://maf.sdet.pl/api",
  DEV: "http://localhost:5000/api",
};

export const getCurrentHost = (environment) => {
  environment = environment || 'PROD';
  return HOSTS[environment] || HOSTS.PROD;
};

export const TOKENS = {
  PROD: {
    USER: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Production user token
    ADMIN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Production admin token
    MANAGER: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Production manager token
  },
  DEV: {
    USER: "dev-user-token-here",
    ADMIN: "dev-admin-token-here", 
    MANAGER: "dev-manager-token-here"
  },
};

export const getToken = (environment, role, customToken) => {
  environment = environment || 'PROD';
  role = role || 'USER';
  
  // If custom token is provided in the dashboard, use it
  if (customToken && customToken.trim()) {
    return customToken.trim();
  }
  
  // Otherwise use predefined tokens for this environment and role
  if (TOKENS[environment] && TOKENS[environment][role]) {
    return TOKENS[environment][role];
  }
  
  // Fallback to PROD USER token
  return TOKENS.PROD.USER;
};

export const LOAD_PROFILES = {
  LIGHT: {
    vus: 5,           // 5 virtual users
    duration: "30s",  // 30 seconds
    rampUpTime: "5s", // 5 seconds ramp up
    description: "Light load for smoke testing"
  },
  MEDIUM: {
    vus: 20,
    duration: "2m",
    rampUpTime: "15s",
    description: "Medium load for regression testing"
  },
  HEAVY: {
    vus: 50,
    duration: "5m", 
    rampUpTime: "30s",
    description: "Heavy load for stress testing"
  },
  SPIKE: {
    vus: 100,
    duration: "1m",
    rampUpTime: "5s",
    description: "Spike testing for peak load simulation"
  }
};

// Get load profile configuration
export const getLoadProfile = (profile) => {
  profile = profile || 'LIGHT';
  return LOAD_PROFILES[profile] || LOAD_PROFILES.LIGHT;
};

export const ENVIRONMENT_INFO = {
  PROD: {
    name: "Production",
    color: "red",
    description: "Live production API - use with caution",
    icon: "🚀"
  },
  DEV: {
    name: "Development", 
    color: "orange",
    description: "Development environment for testing",
    icon: "🔧"
  }
};

// System-specific configuration
export const SYSTEM_CONFIG = {
  name: "My API System",
  version: "v2.1.0",
  description: "User management and orders API",
  
  // Test-specific settings
  defaultTimeout: 30000,
  defaultThinkTime: 1000,
  
  // Common headers for this system
  defaultHeaders: {
    'Content-Type': 'application/json',
    'User-Agent': 'K6-Performance-Tests/2.0'
  },
  
  // Rate limiting awareness
  rateLimits: {
    requestsPerSecond: 100,
    burstLimit: 150
  }
};

// Common test data for this system
export const TEST_DATA = {
  // Sample user data for testing
  users: [
    { username: "testuser1", email: "test1@example.com" },
    { username: "testuser2", email: "test2@example.com" },
    { username: "testuser3", email: "test3@example.com" }
  ],
  
  // Sample product data
  products: [
    { id: 1, name: "Product A", price: 29.99 },
    { id: 2, name: "Product B", price: 49.99 },
    { id: 3, name: "Product C", price: 19.99 }
  ]
};

// Helper functions specific to this system
export const helpers = {
  // Generate random user data
  randomUser: () => {
    const users = TEST_DATA.users;
    return users[Math.floor(Math.random() * users.length)];
  },
  
  // Generate random product
  randomProduct: () => {
    const products = TEST_DATA.products;
    return products[Math.floor(Math.random() * products.length)];
  },
  
  // Build full URL
  buildUrl: (environment, endpoint) => {
    const host = getCurrentHost(environment);
    return `${host}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }
};

// Export everything for easy importing in tests
export default {
  HOSTS,
  TOKENS,
  LOAD_PROFILES,
  ENVIRONMENT_INFO,
  SYSTEM_CONFIG,
  TEST_DATA,
  getCurrentHost,
  getToken,
  getLoadProfile,
  helpers
};

export const DEFAULT_PROFILE = LOAD_PROFILES.LIGHT;