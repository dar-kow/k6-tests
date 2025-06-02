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

# ✅ KONFIGURACJA ZABEZPIECZEŃ
MAX_TEST_DURATION=120  # 2 minuty timeout per test
MAX_ERROR_LINES=10     # Maksymalna liczba linii błędów per test
CONTINUE_ON_FAILURE=true  # Kontynuuj pomimo błędów

# Validate profile
if [ "$PROFILE" != "LIGHT" ] && [ "$PROFILE" != "MEDIUM" ] && [ "$PROFILE" != "HEAVY" ]; then
  echo "Invalid profile: $PROFILE"
  echo "Available profiles: LIGHT, MEDIUM, HEAVY"
  exit 1
fi

# Create directory for test results
mkdir -p "$RESULTS_DIR"

# ✅ STATYSTYKI TESTÓW
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# ✅ FUNKCJA DO LIMITOWANIA OUTPUTU
limit_output() {
  local max_lines=$1
  local error_count=0
  local line
  
  while IFS= read -r line; do
    # Zlicz błędy
    if echo "$line" | grep -q "level=error"; then
      error_count=$((error_count + 1))
      if [ $error_count -le $max_lines ]; then
        echo "$line"
      elif [ $error_count -eq $((max_lines + 1)) ]; then
        echo "⚠️  Suppressing additional error messages (limit: $max_lines errors per test)..."
      fi
    else
      echo "$line"
    fi
  done
}

# ✅ FUNKCJA Z TIMEOUT I ERROR HANDLING
run_test() {
  local test_name=$1
  local test_file="$TESTS_DIR/${test_name}.js"
  local result_file="${RESULTS_DIR}/${test_name}.json"
  local log_file="${RESULTS_DIR}/${test_name}.log"
  
  echo "======================================="
  echo "🧪 Starting test: $test_name ($((TOTAL_TESTS + 1))/$(echo "${TESTS[@]}" | wc -w))"
  echo "⏰ Timeout: ${MAX_TEST_DURATION}s"
  echo "======================================="
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  # Sprawdź czy plik istnieje
  if [ ! -f "$test_file" ]; then
    echo "❌ ERROR: Test file not found: $test_file"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
  
  # ✅ URUCHOM TEST Z TIMEOUT
  echo "🚀 Executing: k6 run $test_file"
  
  # Uruchom k6 z timeout i przekieruj output
  if timeout $MAX_TEST_DURATION k6 run "$test_file" \
    -e PROFILE="$PROFILE" \
    -e LOG_LEVEL=warn \
    --summary-export="$result_file" \
    --quiet \
    2>&1 | limit_output $MAX_ERROR_LINES | tee "$log_file"; then
    
    # Test się udał
    echo "✅ Test $test_name completed successfully"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # Pokaż krótkie podsumowanie jeśli jest plik wyników
    if [ -f "$result_file" ]; then
      local requests=$(jq -r '.metrics.http_reqs.count // 0' "$result_file" 2>/dev/null || echo "0")
      local avg_time=$(jq -r '.metrics.http_req_duration.avg // 0' "$result_file" 2>/dev/null || echo "0")
      local error_rate=$(jq -r '.metrics.http_req_failed.value // 0' "$result_file" 2>/dev/null || echo "0")
      
      echo "📊 Summary: $requests requests, ${avg_time}ms avg, $(echo "$error_rate * 100" | bc -l 2>/dev/null | cut -d. -f1)% errors"
    fi
    
  else
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
      echo "⏰ Test $test_name timed out after ${MAX_TEST_DURATION}s"
    else
      echo "❌ Test $test_name failed with exit code: $exit_code"
    fi
    
    FAILED_TESTS=$((FAILED_TESTS + 1))
    
    # ✅ DECYZJA CZY KONTYNUOWAĆ
    if [ "$CONTINUE_ON_FAILURE" = true ]; then
      echo "⏭️  Continuing with next test..."
    else
      echo "🛑 Stopping execution due to test failure"
      return $exit_code
    fi
  fi
  
  echo "---------------------------------------"
  echo ""
}

# Lista testów
TESTS=(
  "contractors"
  "invoices"
  "invoice-items"
  "contractor-by-id"
  "invoice-by-id"
  "last-invoice-number"
)

echo "🚀 Starting sequential test execution"
echo "📊 Profile: $PROFILE"
echo "📁 Results: $RESULTS_DIR"
echo "⚙️  Config: timeout=${MAX_TEST_DURATION}s, max_errors=${MAX_ERROR_LINES}, continue_on_failure=${CONTINUE_ON_FAILURE}"
echo ""

# ✅ URUCHOM WSZYSTKIE TESTY
for test_name in "${TESTS[@]}"; do
  run_test "$test_name"
done

# ✅ PODSUMOWANIE KOŃCOWE
echo "========================================="
echo "🏁 Sequential test execution completed!"
echo "========================================="
echo "📊 Test Results:"
echo "   ✅ Passed: $PASSED_TESTS"
echo "   ❌ Failed: $FAILED_TESTS"
echo "   📊 Total:  $TOTAL_TESTS"
echo "   📈 Success Rate: $(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%"
echo ""
echo "📁 Detailed results:"
ls -la "$RESULTS_DIR" | grep -E '\.(json|log)$'
echo ""

# ✅ EXIT CODE na podstawie wyników
if [ $FAILED_TESTS -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
elif [ $PASSED_TESTS -gt 0 ]; then
  echo "⚠️  Some tests failed, but execution completed"
  exit 1
else
  echo "💥 All tests failed!"
  exit 2
fi