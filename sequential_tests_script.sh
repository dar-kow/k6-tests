#!/bin/bash

if [ $# -lt 1 ]; then
  echo "Usage: ./sequential-tests.sh [PROFILE]"
  echo "  PROFILE: LIGHT, MEDIUM, HEAVY (optional, defaults to LIGHT)"
  exit 1
fi

PROFILE="${1:-LIGHT}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Określ katalog skryptu i ustaw ścieżki
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$SCRIPT_DIR/tests"
RESULTS_DIR="$SCRIPT_DIR/results/sequential_${TIMESTAMP}"

echo "=== DEBUG INFO ==="
echo "Script directory: $SCRIPT_DIR"
echo "Tests directory: $TESTS_DIR"
echo "Results directory: $RESULTS_DIR"
echo "Current working directory: $(pwd)"
echo "=================="

# Validate profile
if [ "$PROFILE" != "LIGHT" ] && [ "$PROFILE" != "MEDIUM" ] && [ "$PROFILE" != "HEAVY" ]; then
  echo "Invalid profile: $PROFILE"
  echo "Available profiles: LIGHT, MEDIUM, HEAVY"
  exit 1
fi

# Create directory for test results
mkdir -p "$RESULTS_DIR"

# Function to run test and wait for completion
run_test() {
  local test_name=$1
  local test_file="$TESTS_DIR/${test_name}.js"
  local result_file="${RESULTS_DIR}/${test_name}.json"
  
  echo "======================================="
  echo "Starting test: $test_name"
  echo "Test file: $test_file"
  echo "======================================="
  
  # Sprawdź czy plik istnieje
  if [ ! -f "$test_file" ]; then
    echo "ERROR: Test file not found: $test_file"
    return 1
  fi
  
  k6 run "$test_file" -e PROFILE="$PROFILE" -e LOG_LEVEL=error --summary-export="$result_file"
  echo "Test $test_name completed"
  echo "---------------------------------------"
  echo ""
}

TESTS=(
  "contractors_test"
  "contractor_by_id_test"
  "invoices_test"
  "invoice_by_id_test"
  "invoice_items_test"
  "last_invoice_number_test"
)

echo "Starting sequential test execution with profile: $PROFILE"
echo "Results will be saved in: $RESULTS_DIR"
echo ""

# Run each test sequentially
for test_name in "${TESTS[@]}"; do
  run_test "$test_name"
done

echo "All tests completed sequentially."
echo "Summary files:"
ls -la "$RESULTS_DIR"