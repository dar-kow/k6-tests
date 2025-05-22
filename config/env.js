export const HOSTS = {
  PROD: "https://maf.sdet.pl/api",
  DEV: "http://localhost:5000/api"
};

export const CURRENT_HOST = HOSTS.PROD;

export const TOKENS = {
  USER: "your-user-token-here",
  ADMIN: "your-admin-token-here"
};

export const LOAD_PROFILES = {
  LIGHT: {
    vus: 5,
    duration: "30s"
  },
  MEDIUM: {
    vus: 15,
    duration: "2m"
  },
  HEAVY: {
    vus: 50,
    duration: "5m"
  }
};

export const DEFAULT_PROFILE = LOAD_PROFILES.LIGHT;