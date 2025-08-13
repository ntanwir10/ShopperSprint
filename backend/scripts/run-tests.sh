#!/bin/bash

# Comprehensive Test Runner for PricePulse Backend
# This script runs different types of tests with various options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
WATCH_MODE=false
COVERAGE=false
VERBOSE=false
PATTERN=""

# Function to print usage
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE       Test type: all, unit, integration, api, e2e (default: all)"
    echo "  -w, --watch           Run tests in watch mode"
    echo "  -c, --coverage        Generate coverage report"
    echo "  -v, --verbose         Verbose output"
    echo "  -p, --pattern PATTERN Run tests matching pattern"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 -t unit            # Run only unit tests"
    echo "  $0 -w -c              # Run tests in watch mode with coverage"
    echo "  $0 -p notification    # Run tests matching 'notification'"
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the backend directory."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to install dependencies if needed
install_dependencies() {
    print_status "Checking if dependencies need to be installed..."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Function to run tests
run_tests() {
    local jest_args=""
    
    # Build Jest arguments based on options
    if [ "$WATCH_MODE" = true ]; then
        jest_args="$jest_args --watch"
    fi
    
    if [ "$COVERAGE" = true ]; then
        jest_args="$jest_args --coverage"
    fi
    
    if [ "$VERBOSE" = true ]; then
        jest_args="$jest_args --verbose"
    fi
    
    if [ -n "$PATTERN" ]; then
        jest_args="$jest_args --testPathPattern=$PATTERN"
    fi
    
    # Add test type filtering
    case $TEST_TYPE in
        "unit")
            jest_args="$jest_args --testPathPattern=__tests__"
            ;;
        "integration")
            jest_args="$jest_args --testPathPattern=integration"
            ;;
        "api")
            jest_args="$jest_args --testPathPattern=routes/__tests__"
            ;;
        "e2e")
            jest_args="$jest_args --testPathPattern=e2e"
            ;;
        "all")
            # No additional filtering for all tests
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            exit 1
            ;;
    esac
    
    print_status "Running tests with type: $TEST_TYPE"
    print_status "Jest arguments: $jest_args"
    
    # Run the tests
    if npm test -- $jest_args; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Function to show test summary
show_summary() {
    print_status "Test run completed!"
    
    if [ "$COVERAGE" = true ]; then
        print_status "Coverage report generated in coverage/ directory"
        if [ -f "coverage/lcov-report/index.html" ]; then
            print_status "Open coverage/lcov-report/index.html in your browser to view the report"
        fi
    fi
    
    if [ "$WATCH_MODE" = true ]; then
        print_status "Tests are running in watch mode. Press Ctrl+C to stop."
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--pattern)
            PATTERN="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting PricePulse Backend Test Suite"
    print_status "Test Type: $TEST_TYPE"
    print_status "Watch Mode: $WATCH_MODE"
    print_status "Coverage: $COVERAGE"
    print_status "Verbose: $VERBOSE"
    if [ -n "$PATTERN" ]; then
        print_status "Pattern: $PATTERN"
    fi
    echo ""
    
    check_dependencies
    install_dependencies
    run_tests
    show_summary
}

# Run main function
main
