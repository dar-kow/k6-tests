#!/bin/bash

if [ $# -lt 1 ]; then
  echo "Usage: ./sequential-tests.sh [PROFILE]"
  echo "  PROFILE: LIGHT, MEDIUM, HEAVY (optional, defaults to LIGHT)"
  exit 1
fi

PROFILE="${1:-LIGHT}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="results/sequential_${TIMESTAMP}"

# Validate profile
if [ "$PROFILE" != "LIGHT" ] && [ "$PROFILE" != "MEDIUM" ] && [ "$PROFILE" != "HEAVY" ]; then
  echo "Invalid profile: $PROFILE"
  echo "Available profiles: LIGHT, MEDIUM, HEAVY"
  exit 1
fi

# Create directory for test results
mkdir -p $RESULTS_DIR

# Function to run test and wait for completion
run_test() {
  local test_file=$1
  local test_name=$(basename $test_file .js)
  local result_file="${RESULTS_DIR}/${test_name}.json"
  
  echo "======================================="
  echo "Starting test: $test_name"
  echo "======================================="
  k6 run $test_file -e PROFILE=$PROFILE -e LOG_LEVEL=error --summary-export=$result_file
  echo "Test $test_name completed"
  echo "---------------------------------------"
  echo ""
}

# List of all test files to run sequentially
TEST_FILES=(
  "tests/contractors.js"
  "tests/invoices.js"
  "tests/invoice-items.js"
  "tests/contractor-by-id.js"
  "tests/invoice-by-id.js"
  "tests/last-invoice-number.js"
)

echo "Starting sequential test execution with profile: $PROFILE"
echo "Results will be saved in: $RESULTS_DIR"
echo ""

# Run each test sequentially
for test_file in "${TEST_FILES[@]}"; do
  run_test "$test_file"
done

echo "All tests completed sequentially."
echo "Summary files:"
ls -la $RESULTS_DIR