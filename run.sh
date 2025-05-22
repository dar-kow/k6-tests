#!/bin/bash

if [ $# -lt 1 ]; then
  echo "Usage: ./run.sh [test_name] [profile]"
  echo "  test_name: all, contractors, invoices, invoice-items, contractor-by-id, invoice-by-id, last-invoice-number"
  echo "  profile: LIGHT, MEDIUM, HEAVY (optional, defaults to LIGHT)"
  exit 1
fi

TEST_FILE=""
PROFILE="LIGHT"  
RESULT_FILE="results/$(date +%Y%m%d_%H%M%S)_${1}.json"

if [ "$1" == "all" ]; then
  TEST_FILE="run-all.js"
elif [ "$1" == "contractors" ]; then
  TEST_FILE="tests/contractors.js"
elif [ "$1" == "invoices" ]; then
  TEST_FILE="tests/invoices.js"
elif [ "$1" == "invoice-items" ]; then
  TEST_FILE="tests/invoice-items.js"
elif [ "$1" == "contractor-by-id" ]; then
  TEST_FILE="tests/contractor-by-id.js"
elif [ "$1" == "invoice-by-id" ]; then
  TEST_FILE="tests/invoice-by-id.js"
elif [ "$1" == "last-invoice-number" ]; then
  TEST_FILE="tests/last-invoice-number.js"
else
  echo "Invalid test name: $1"
  echo "Available tests: all, contractors, invoices, invoice-items, contractor-by-id, invoice-by-id, last-invoice-number"
  exit 1
fi

if [ -n "$2" ]; then
  PROFILE="$2"
fi

# Validate profile
if [ "$PROFILE" != "LIGHT" ] && [ "$PROFILE" != "MEDIUM" ] && [ "$PROFILE" != "HEAVY" ]; then
  echo "Invalid profile: $PROFILE"
  echo "Available profiles: LIGHT, MEDIUM, HEAVY"
  exit 1
fi

# Create results directory if it doesn't exist
mkdir -p results

echo "Running test: $TEST_FILE with profile: $PROFILE"
echo "Results will be saved to: $RESULT_FILE"

# Run k6 with progress bar and save results
k6 run $TEST_FILE -e PROFILE=$PROFILE -e LOG_LEVEL=error --summary-export=$RESULT_FILE

echo "Test completed. Results saved in: $RESULT_FILE"