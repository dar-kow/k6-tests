# k6 Performance Testing Framework for MAF Application

This repository contains a comprehensive k6-based performance testing framework for the MAF application API endpoints. The framework tests all GET endpoints defined in the OpenAPI specification with different load profiles and provides detailed response validation.

## 🚀 Quick Start

### Prerequisites
- [k6](https://k6.io/docs/get-started/installation/) installed on your system
- Valid authentication tokens for maf.sdet.pl
- Git for cloning the repository

### Installation

```bash
# Clone the repository
git clone https://github.com/dar-kow/k6-tests.git
cd k6-tests

# Make scripts executable
chmod +x *.sh

# Update authentication tokens in config/env.js
# Replace 'your-user-token-here' and 'your-admin-token-here' with valid tokens
```

### First Run

```bash
# Quick API connectivity check
k6 run quick-check.js

# Run diagnostics to verify all endpoints
k6 run diagnostics.js

# Run a single test with default (LIGHT) profile
./run.sh contractors

# Run all tests
./run.sh all LIGHT
```

## 📁 Project Structure

```
k6-tests/
├── .k6.yaml                    # k6 configuration file
├── config/
│   └── env.js                  # Environment settings, hosts, tokens
├── helpers/
│   └── common.js               # Shared utility functions and validators
├── tests/
│   ├── contractors.js          # GET /api/Contractors
│   ├── invoices.js             # GET /api/Invoices  
│   ├── invoice-items.js        # GET /api/InvoiceItems
│   ├── contractor-by-id.js     # GET /api/Contractors/{id}
│   ├── invoice-by-id.js        # GET /api/Invoices/{id}
│   └── last-invoice-number.js  # GET /api/Invoices/last-number
├── results/                    # Test results directory (auto-created)
├── diagnostics.js              # API connectivity diagnostics
├── quick-check.js              # Quick endpoint validation
├── run-all.js                  # Main test runner for all endpoints
├── run.sh                      # Individual test runner script
├── parallel-tests.sh           # Parallel test execution
├── sequential-tests.sh         # Sequential test execution
└── README.md                   # This file
```

## 🎯 Available Tests

Based on the MAF API OpenAPI specification, the following GET endpoints are tested:

| Endpoint | Description | Test File |
|----------|-------------|-----------|
| `GET /api/Contractors` | List all contractors | `tests/contractors.js` |
| `GET /api/Invoices` | List all invoices | `tests/invoices.js` |
| `GET /api/InvoiceItems` | Get invoice items by invoice ID | `tests/invoice-items.js` |
| `GET /api/Contractors/{id}` | Get contractor by ID | `tests/contractor-by-id.js` |
| `GET /api/Invoices/{id}` | Get invoice by ID | `tests/invoice-by-id.js` |
| `GET /api/Invoices/last-number` | Get last invoice number | `tests/last-invoice-number.js` |

## ⚡ Load Profiles

Three load profiles are available for performance testing:

| Profile | Virtual Users | Duration | Use Case |
|---------|---------------|-----------|----------|
| **LIGHT** | 5 | 30 seconds | Quick smoke tests |
| **MEDIUM** | 15 | 2 minutes | Standard load testing |
| **HEAVY** | 50 | 5 minutes | Stress testing |

## 🔧 Configuration

### Authentication

Update `config/env.js` with valid authentication tokens:

```javascript
export const TOKENS = {
  USER: "your-actual-user-token",
  ADMIN: "your-actual-admin-token"
};
```

### Environment

The framework is configured to test against `https://maf.sdet.pl/api` by default. To change the target:

```javascript
// In config/env.js
export const CURRENT_HOST = HOSTS.DEV; // or HOSTS.PROD
```

## 🚀 Running Tests

### Individual Tests

```bash
# Basic syntax
./run.sh [test_name] [profile]

# Examples
./run.sh contractors LIGHT
./run.sh invoices MEDIUM
./run.sh invoice-items HEAVY

# Available test names:
# - contractors
# - invoices  
# - invoice-items
# - contractor-by-id
# - invoice-by-id
# - last-invoice-number
# - all (runs all tests together)
```

### All Tests at Once

```bash
# Run all tests with specific profile
./run.sh all LIGHT
./run.sh all MEDIUM  
./run.sh all HEAVY

# Direct k6 command
k6 run run-all.js -e PROFILE=MEDIUM -e LOG_LEVEL=error --summary-export=results/run-all-$(date +%Y%m%d_%H%M%S).json
```

### Parallel Test Execution

Run all tests simultaneously for maximum load simulation:

```bash
./parallel-tests.sh LIGHT
./parallel-tests.sh MEDIUM
./parallel-tests.sh HEAVY
```

### Sequential Test Execution

Run tests one after another to avoid interference:

```bash
./sequential-tests.sh LIGHT
./sequential-tests.sh MEDIUM
./sequential-tests.sh HEAVY
```

## 🔍 Diagnostic Tools

### Quick Endpoint Check

Test a single endpoint quickly:

```bash
k6 run quick-check.js
```

### API Diagnostics

Comprehensive endpoint discovery and connectivity testing:

```bash
k6 run diagnostics.js
```

## 📊 Test Results

Results are automatically saved in the `results` directory with timestamp-based filenames:

- **Individual tests**: `results/YYYYMMDD_HHMMSS_test-name.json`
- **Parallel tests**: `results/parallel_YYYYMMDD_HHMMSS/*.json`
- **Sequential tests**: `results/sequential_YYYYMMDD_HHMMSS/*.json`
- **All tests**: `results/run-all-YYYYMMDD_HHMMSS.json`

### Understanding Results

Each test validates:
- ✅ HTTP status codes (200, 404 where appropriate)
- ✅ Response time thresholds (< 5 seconds)
- ✅ Content-Type headers
- ✅ JSON structure validation
- ✅ Data type validation based on OpenAPI schema
- ✅ Business logic validation (e.g., valid email formats, enum values)

## 📋 Complete Command Reference

### Individual Test Commands

```bash
# Contractors
./run.sh contractors LIGHT
./run.sh contractors MEDIUM
./run.sh contractors HEAVY

# Invoices  
./run.sh invoices LIGHT
./run.sh invoices MEDIUM
./run.sh invoices HEAVY

# Invoice Items
./run.sh invoice-items LIGHT
./run.sh invoice-items MEDIUM
./run.sh invoice-items HEAVY

# Contractor by ID
./run.sh contractor-by-id LIGHT
./run.sh contractor-by-id MEDIUM
./run.sh contractor-by-id HEAVY

# Invoice by ID
./run.sh invoice-by-id LIGHT
./run.sh invoice-by-id MEDIUM
./run.sh invoice-by-id HEAVY

# Last Invoice Number
./run.sh last-invoice-number LIGHT
./run.sh last-invoice-number MEDIUM
./run.sh last-invoice-number HEAVY
```

### Batch Test Commands

```bash
# All tests using run.sh
./run.sh all LIGHT
./run.sh all MEDIUM
./run.sh all HEAVY

# Parallel execution
./parallel-tests.sh LIGHT
./parallel-tests.sh MEDIUM
./parallel-tests.sh HEAVY

# Sequential execution
./sequential-tests.sh LIGHT
./sequential-tests.sh MEDIUM
./sequential-tests.sh HEAVY
```

## 🛠 Troubleshooting

### Common Issues

1. **Authentication Errors (401/403)**
   - Update tokens in `config/env.js`
   - Run `k6 run diagnostics.js` to test authentication

2. **Connection Errors**
   - Verify API endpoint URL in `config/env.js`
   - Check network connectivity to maf.sdet.pl

3. **404 Errors on ID-based endpoints**
   - Update sample IDs in test files (contractor-by-id.js, invoice-by-id.js, invoice-items.js)
   - These endpoints may return 404 if test data doesn't exist

4. **Script Permission Errors**
   ```bash
   chmod +x *.sh
   ```

### Debug Mode

Enable detailed logging:

```bash
k6 run tests/contractors.js -e LOG_LEVEL=debug
```

## 🎯 Best Practices

1. **Start with LIGHT profile** for initial validation
2. **Use diagnostics.js** when setting up new environments  
3. **Run sequential tests** when debugging specific issues
4. **Use parallel tests** for realistic load simulation
5. **Monitor results directory size** - clean up old results periodically

## 🔄 Continuous Integration

Example GitHub Actions workflow:

```yaml
name: API Load Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run tests
        run: ./run.sh all LIGHT
        env:
          USER_TOKEN: ${{ secrets.MAF_USER_TOKEN }}
```

## 📝 Notes

- All tests include comprehensive response validation based on the OpenAPI specification
- ID-based endpoints (contractor-by-id, invoice-by-id, invoice-items) use sample IDs and handle 404 responses gracefully
- Authentication tokens need to be updated in `config/env.js` before running tests
- The framework is designed for maf.sdet.pl but can be easily adapted for other environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your test improvements
4. Submit a pull request

---

**Happy Testing! 🚀**