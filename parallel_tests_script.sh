#!/bin/bash

if [ $# -lt 1 ]; then
  echo "Usage: ./parallel-tests.sh [PROFILE]"
  echo "  PROFILE: LIGHT, MEDIUM, HEAVY (optional, defaults to LIGHT)"
  exit 1
fi

PROFILE="${1:-LIGHT}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="results/parallel_${TIMESTAMP}"

# Validate profile
if [ "$PROFILE" != "LIGHT" ] && [ "$PROFILE" != "MEDIUM" ] && [ "$PROFILE" != "HEAVY" ]; then
  echo "Invalid profile: $PROFILE"
  echo "Available profiles: LIGHT, MEDIUM, HEAVY"
  exit 1
fi

# Create directory for test results
mkdir -p $RESULTS_DIR

# Function to run tests in the background
run_test() {
  local test_file=$1
  local test_name=$(basename $test_file .js)
  local result_file="${RESULTS_DIR}/${test_name}.json"
  
  echo "Starting test: $test_name"
  k6 run $test_file -e PROFILE=$PROFILE -e LOG_LEVEL=error --summary-export=$result_file &
  echo "$test_name test started with PID $!"
}

echo "Starting parallel tests with profile: $PROFILE"
echo "Results will be saved in: $RESULTS_DIR"
echo ""

# Run all tests in parallel
run_test "tests/contractors.js"
run_test "tests/invoices.js"
run_test "tests/invoice-items.js"
run_test "tests/contractor-by-id.js"
run_test "tests/invoice-by-id.js"
run_test "tests/last-invoice-number.js"

# Wait for all background processes to complete
echo "All tests started, waiting for completion..."
wait

echo ""
echo "All tests completed. Results saved in: $RESULTS_DIR"
echo "Summary files:"
ls -la $RESULTS_DIR