export const authGuide= `# Authentication, Sessions & CSRF Protection Guide (For Beginners)

This application implements a **session- and cookie-based authentication system** (\`express-session\` in Express or \`@fastify/session\` in Fastify) combined with **CSRF protection** (*Cross-Site Request Forgery*).

This guide is designed for developers studying the server who want to understand **how it works under the hood** and **how to test it step-by-step** using HTTP clients such as **Postman**, **Insomnia**, or **Thunder Client**.

---

## 1. How does security work in this server?

Unlike JWT tokens that are manually attached to every request, cookie-based sessions work through an automatic exchange between the server and the client. This server uses **three cookies** and **one security header**:

1. **\`app.sid\` (Session Cookie - \`httpOnly: true\`)**:
   - Stores your unique session identifier on the server (the actual session data is persisted in PostgreSQL).
   - Because it is \`httpOnly\`, client-side JavaScript in the browser **cannot read it** (protecting against XSS attacks), while the browser or HTTP client automatically sends it with every request.
2. **\`XSRF-TOKEN\` (CSRF Token Cookie - \`httpOnly: false\`)**:
   - On your very first request to the server, the \`csrfProtection\` middleware generates an internal secret in your session (\`csrfSecret\`), and the \`setCsrfToken\` middleware sends you a public cookie named \`XSRF-TOKEN\`.
3. **\`x-csrf-token\` (Required Header for state-changing requests)**:
   - To prevent a malicious website from making requests on your behalf (CSRF attack), the \`verifyCsrfToken\` middleware **blocks any \`POST\`, \`PUT\`, \`PATCH\`, or \`DELETE\` request** that does not include the value of the \`XSRF-TOKEN\` cookie inside the \`x-csrf-token\` header (or \`csrf-token\` header, or \`_csrf\` field in the request body).
4. **\`logged_in\` (Indicator Cookie - \`httpOnly: false\`)**:
   - Set to \`true\` upon a successful login (valid for 30 minutes, synchronized with the session) so that a frontend application can easily check if an active session exists without needing to read \`app.sid\`.

---

## 2. Why does sending a direct \`POST\` request fail in Postman / Insomnia / Thunder Client?

When you interact with the API from a browser-based frontend application (e.g., using \`axios\` or \`fetch\`), the client is typically configured to automatically read the \`XSRF-TOKEN\` cookie and attach it to the \`x-csrf-token\` header.

However, if you open **Postman, Insomnia, or Thunder Client** and immediately try to send a \`POST /api/v1/auth/login\` or create a user (\`POST /api/v1/user\`) as your very first request, you will receive a **\`403 Forbidden\` (\`CSRF_DETECTED\`)** error:


\`\`\`json
{
  "error": {
    "ok": false,
    "code": "CSRF_DETECTED",
    "message": "CSRF: session without secret"
  }
}
\`\`\`


**Why does this happen?**
Because you do not yet have an initialized session with a CSRF secret (\`app.sid\`), nor are you sending the required \`x-csrf-token\` header.

---

## 3. Step-by-Step: How to test the API in Postman, Insomnia, or Thunder Client

> **Prerequisite:** HTTP clients like Postman, Insomnia, and Thunder Client automatically store and resend cookies (*Cookie Jar*). Make sure cookies are not disabled in your client settings.

### Step 1: Collect the initial cookies (\`app.sid\` and \`XSRF-TOKEN\`)

**\`GET\`** requests are not blocked by CSRF verification, and they **initialize your session and issue your CSRF token**.

1. Send a **\`GET\`** request to any endpoint on the server, for example:
   - \`GET http://localhost:4000/api/v1/auth/me\` *(even though it returns a \`403 ACCESS_DENIED\` error because you are not logged in yet, it still initializes your session and returns the cookies)*, or
   - \`GET http://localhost:4000/api/v1/user\`

2. Go to the **Cookies** tab (or **Headers** -> \`Set-Cookie\`) in your HTTP client's response panel.

3. You will see that the server returned two cookies:
   - \`app.sid\`: Your session cookie (your HTTP client will store it and send it automatically on subsequent requests).
   - \`XSRF-TOKEN\`: Copy the **value** of this cookie (for example: \`aB3dE5fG-9xYz1234567890abcdef...\`).
     > **Note:** If you copy the value directly from the raw \`Set-Cookie\` header and notice \`%\`-encoded characters (URL-encoded), make sure to copy the decoded value from the **Cookies** tab in Postman/Insomnia/Thunder Client.

---

### Step 2: Set the \`x-csrf-token\` Header and create a user (if you don't have one)
Since every \`POST\` request requires CSRF protection:

1. To register a test user, prepare the following request:
   - **Method & URL:** \`POST http://localhost:4000/api/v1/user\`
   - **Headers Tab:** Add the header:
     - \`x-csrf-token\`: \`<paste_your_XSRF-TOKEN_value_here>\`
   - **Body Tab (JSON):**

     \`\`\`json
     {
       "email": "student@test.com",
       "password": "Password123"
     }
     \`\`\`


2. Send the request. The \`verifyCsrfToken\` middleware will verify that your header matches the secret stored in your session (\`app.sid\`) and will create the user.

---

### Step 3: Log In (\`POST /api/v1/auth/login\`)
1. Prepare the login request:
   - **Method & URL:** \`POST http://localhost:4000/api/v1/auth/login\`
   - **Headers Tab:** Keep the header:
     - \`x-csrf-token\`: \`<your_XSRF-TOKEN_value>\`
   - **Body Tab (JSON):**

     \`\`\`json
     {
       "email": "student@test.com",
       "password": "Password123"
     }
     \`\`\`

2. When you send the request:
   - The server verifies your credentials.
   - It regenerates the session ID (\`app.sid\`) for security (to prevent *Session Fixation* attacks) while preserving your \`csrfSecret\`.
   - It saves the authenticated user data (\`id\`, \`email\`, \`role\`) inside the database session store.
   - It returns the \`logged_in=true\` cookie and a \`200 OK\` response with your session user data:

     \`\`\`json
     {
       "id": "...",
       "email": "student@test.com",
       "role": "USER"
     }
     \`\`\`

   > **Important:** On every response, the server issues a new token in the \`XSRF-TOKEN\` cookie, but any token generated under the same session remains valid as long as your session (\`csrfSecret\`) has not been destroyed.

---

### Step 4: Verify your active session (\`GET /api/v1/auth/me\`)

1. Send a **\`GET http://localhost:4000/api/v1/auth/me\`** request.

2. Since it is a \`GET\` request, you do not need to send the \`x-csrf-token\` header (only the \`app.sid\` cookie, which your HTTP client sends automatically).

3. You will now receive a **\`200 OK\`** response with your authenticated user data instead of a \`403\` error.

---

### Step 5: Log Out (\`POST /api/v1/auth/logout\`)
1. Because \`/logout\` is a **\`POST\`** request, it is also protected against CSRF (preventing external websites from forcibly logging you out without your consent).
2. Send the request:
   - **Method & URL:** \`POST http://localhost:4000/api/v1/auth/logout\`
   - **Headers Tab:**
     - \`x-csrf-token\`: \`<your_XSRF-TOKEN_value>\`
3. The server destroys the session in the database and clears the \`app.sid\` and \`logged_in\` cookies.
4. *(Note for further testing)*: Because the session has been completely destroyed, if you want to log in again after logging out, you must repeat **Step 1** to initialize a fresh session and obtain a new \`XSRF-TOKEN\`.

---

## 4. How to protect your own routes in the server (Studying the codebase)

If you inspect the \`src/shared/auth/\` directory (\`authMiddlewares.ts\` in Express or \`authPreHandlers.ts\` in Fastify), you will find built-in guards ready to protect any endpoint in the project:

1. **\`isAuthenticated\`**: Allows access only to logged-in users (regardless of role). If no active session exists, it returns \`401 UNAUTHORIZED\`.
2. **\`authorize(UserRole.ADMIN)\`**: Exact Role-Based Access Control (RBAC). You can pass one or multiple allowed roles (e.g., \`authorize(UserRole.ADMIN, UserRole.OWNER)\`). If the user has a different role, it returns \`403 FORBIDDEN\`.
3. **\`authorizeMinRole(UserRole.ADMIN)\`**: Hierarchical role check (\`USER: 1\` < \`ADMIN: 2\` < \`OWNER: 3\`). Grants access to any user whose role level is greater than or equal to the specified minimum role. Otherwise, it returns \`403 ROLE_NOT_ALLOWED\`.

### Automatic Session Invalidation for Security
The server also enforces automatic session cleanup in \`UserService\`: whenever a user changes their password, an administrator updates their role or account status (\`enabled: false\`), or a user account is deleted, **all active sessions belonging to that user in the database are automatically destroyed** (\`destroyByUserId\`), requiring them to authenticate again.`
