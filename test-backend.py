#!/usr/bin/env python3
"""
Backend API testing script for the math tutoring signup system.
Tests both development and production endpoints.

Usage:
    python3 test-backend.py              # Test localhost
    python3 test-backend.py prod         # Test production
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8787" if len(sys.argv) < 2 or sys.argv[1] != "prod" else "https://tutor-web-8lc.pages.dev"
ADMIN_KEY = "admin-password-change-me"

def test_signup():
    """Test submitting a new signup"""
    print("\n=== Testing Signup Submission ===")
    
    # Sample signup data
    signup_data = {
        "name": "John Doe",
        "emailOrPhone": "john@example.com",
        "goal": "I want to understand calculus better",
        "tutor": "Neha M.",
        "date": "2026-04-16",
        "time": "7:00pm - 8:00pm"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact-messages",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_phone_signup():
    """Test signup with phone number"""
    print("\n=== Testing Signup with Phone ===")
    
    signup_data = {
        "name": "Jane Smith",
        "emailOrPhone": "(555) 123-4567",
        "goal": "Help with algebra",
        "tutor": "Nandita S.",
        "date": "2026-04-14",
        "time": "7:00pm - 8:00pm"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact-messages",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_invalid_email():
    """Test with invalid email (should fail)"""
    print("\n=== Testing Invalid Email Validation ===")
    
    signup_data = {
        "name": "Bad Email",
        "emailOrPhone": "not-an-email",
        "goal": "Test goal",
        "tutor": "Abhiram M.",
        "date": "2026-04-16",
        "time": "7:00pm - 8:00pm"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact-messages",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_missing_field():
    """Test with missing required field (should fail)"""
    print("\n=== Testing Missing Required Field ===")
    
    signup_data = {
        "name": "No Goal",
        "emailOrPhone": "test@example.com",
        # Missing goal
        "tutor": "Samhithaa S.",
        "date": "2026-04-15",
        "time": "7:30pm - 8:30pm"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact-messages",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_signups():
    """Test retrieving all signups (admin)"""
    print("\n=== Testing Get All Signups (Admin) ===")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/contact-messages",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Signups: {data.get('count', 0)}")
        if data.get('signups'):
            print(f"Sample Signup: {json.dumps(data['signups'][0], indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_signups_unauthorized():
    """Test unauthorized access to admin endpoint"""
    print("\n=== Testing Unauthorized Access ===")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/contact-messages",
            headers={"X-Admin-Key": "wrong-key"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 403
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_signups_endpoint():
    """Test the signups analytics endpoint"""
    print("\n=== Testing Signups Analytics Endpoint ===")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/signups",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print(f"Testing backend at: {BASE_URL}")
    print("=" * 50)
    
    tests = [
        ("Signup Submission", test_signup),
        ("Phone Signup", test_phone_signup),
        ("Invalid Email Validation", test_invalid_email),
        ("Missing Field Validation", test_missing_field),
        ("Get Signups (Admin)", test_get_signups),
        ("Unauthorized Access", test_get_signups_unauthorized),
        ("Signups Analytics", test_signups_endpoint),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"Test error: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    passed = sum(1 for _, p in results if p)
    total = len(results)
    for name, passed_test in results:
        status = "✓ PASSED" if passed_test else "✗ FAILED"
        print(f"{status}: {name}")
    print(f"\nTotal: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()
