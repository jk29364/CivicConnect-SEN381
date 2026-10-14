# Test 1
| Test ID | Test Case Description / Input Context | Core File Targeted | Expected Result (Derived Before Run) | Actual Result (Observed) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-001** | Call `GET /api/requests` without injecting an HTTP Authorization header. | `auth.middleware.js` | **HTTP 401 Unauthorized**<br>Body: "Access denied. No authentication token provided." | HTTP 401 Unauthorized (Matches expected) | **PASS** |
| **TC-AUTH-002** | Call `GET /api/requests` providing a malformed or broken token string formatting structure. | `auth.middleware.js` | **HTTP 403 Forbidden**<br>Body: "Invalid token format. Expected 'Bearer <token>'." | HTTP 401 Unauthorized | **FAIL** |
| **TC-AUTH-003** | Execute `GET /api/requests` utilizing a token signed with an invalid key omitted from `.env`. | `auth.middleware.js`<br>`.env` | **HTTP 403 Forbidden**<br>Signature check fails mathematically against the system environment. | HTTP 403 Forbidden (Matches expected) | **PASS** |
| **TC-AUTH-004** | Call `POST /api/auth/login` using standard credentials to return a clean signed JSON Web Token. | `app.js` | **HTTP 200 OK**<br>Returns an object container with an encrypted payload string token. | HTTP 200 OK (Matches expected) | **PASS** |
| **TC-AUTH-005** | Call `GET /api/requests` utilizing a valid token containing a verified resident identity. | `RequestService.js` | **HTTP 200 OK**<br>Permits downstream operation to extract and build historical profile items. | HTTP 200 OK (Matches expected) | **PASS** |
| **TC-AUTH-006** | Call admin endpoint `/api/admin/system-settings` using an authenticated token carrying a `"resident"` role. | `auth.middleware.js` | **HTTP 403 Forbidden**<br>Body: "Access denied. You do not have the required permissions..." | HTTP 403 Forbidden (Matches expected) | **PASS** |
| **TC-AUTH-007** | Call admin endpoint `/api/admin/system-settings` using an authenticated token carrying an `"admin"` role. | `auth.middleware.js` | **HTTP 200 OK**<br>Allows process pipeline execution to successfully execute system modifications. | HTTP 200 OK (Matches expected) | **PASS** |

## Failure Analysis
Test 2 failed, exposing an error in how malformed requests are handled. After conducting a root cause analysis, I have found the affected (old) code block:
```js
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    // Acceptance: No token = 401 Unauthorized
    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Access denied. No authentication token provided.'
        });
    }
```
The line `const token = authHeader && authHeader.split(' ')[1];` expected the request string to contain spaces for the split. When TC-AUTH-002 sent a string with no spaces, the token resulted in an array with only one item. Index `[1]` becomes `undefined`, which triggers the `!token` condition in the if statement responsible for handling no token, sending back 401 instead of the expected 403.

## Fix applied
```js
    // 2. Acceptance Criteria: Malformed structure (e.g., missing "Bearer" prefix or missing token part) = 403 Forbidden
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid token format. Expected "Bearer <token>".'
        });
    }

    const token = parts[1];
```
This code was implemented which explicitly checks for the length of the resulting array after the split. If it only contains one item, this block triggers. It is not the same as having no token at all, merely a malformed one which doesn't have the expected values the code needs to continue without error.

# Test 2
| Test ID | Test Case Description / Input Context | Core File Targeted | Expected Result (Derived Before Run) | Actual Result (Observed) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-001** | Call `GET /api/requests` without injecting an HTTP Authorization header. | `auth.middleware.js` | **HTTP 401 Unauthorized**<br>Body: "Access denied. No authentication token provided." | HTTP 401 Unauthorized (Matches expected) | **PASS** |
| **TC-AUTH-002** | Call `GET /api/requests` providing a malformed or broken token string formatting structure. | `auth.middleware.js` | **HTTP 403 Forbidden**<br>Body: "Invalid token format. Expected 'Bearer <token>'." | HTTP 403 Forbidden (Matches expected) | **PASS** |
| **TC-AUTH-003** | Execute `GET /api/requests` utilizing a token signed with an invalid key omitted from `.env`. | `auth.middleware.js`<br>`.env` | **HTTP 403 Forbidden**<br>Signature check fails mathematically against the system environment. | HTTP 403 Forbidden (Matches expected) | **PASS** |
| **TC-AUTH-004** | Call `POST /api/auth/login` using standard credentials to return a clean signed JSON Web Token. | `app.js` | **HTTP 200 OK**<br>Returns an object container with an encrypted payload string token. | HTTP 200 OK (Matches expected) | **PASS** |
| **TC-AUTH-005** | Call `GET /api/requests` utilizing a valid token containing a verified resident identity. | `RequestService.js` | **HTTP 200 OK**<br>Permits downstream operation to extract and build historical profile items. | HTTP 200 OK (Matches expected) | **PASS** |
| **TC-AUTH-006** | Call admin endpoint `/api/admin/system-settings` using an authenticated token carrying a `"resident"` role. | `auth.middleware.js` | **HTTP 403 Forbidden**<br>Body: "Access denied. You do not have the required permissions..." | HTTP 403 Forbidden (Matches expected) | **PASS** |
| **TC-AUTH-007** | Call admin endpoint `/api/admin/system-settings` using an authenticated token carrying an `"admin"` role. | `auth.middleware.js` | **HTTP 200 OK**<br>Allows process pipeline execution to successfully execute system modifications. | HTTP 200 OK (Matches expected) | **PASS** |

## Verification summary
All acceptice criterea are now met. This branch is ready for review.