export const HOSTS = {
  PROD: "https://maf.sdet.pl/api",
  DEV: "http://localhost:5000/api",
};

export const TOKENS = {
  PROD: {
    USER: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
    ADMIN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
  },
  DEV: {
    USER: "dev-user-token-here",
    ADMIN: "dev-admin-token-here", 
  },
};

export const LOAD_PROFILES = {
  LIGHT: {
    vus: 5,          
    duration: "30s",  
    },
  MEDIUM: {
    vus: 20,
    duration: "2m",
   
  },
  HEAVY: {
    vus: 50,
    duration: "5m", 
 
  },
  SPIKE: {
    vus: 100,
    duration: "1m",
   
  }
};

export const DEFAULT_PROFILE = LOAD_PROFILES.LIGHT;