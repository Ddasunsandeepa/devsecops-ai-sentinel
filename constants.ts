import { MockCommit, Repository, User, JobRole } from "./types";

export const APP_NAME = "Sentinel AI";
export const APP_VERSION = "v1.4.0-beta";

// export const MOCK_USER: User = {
//   id: "u1",
//   name: "Jane Doe",
//   email: "jane.doe@sentinel.ai",
//   avatarUrl: "https://ui-avatars.com/api/?name=Jane+Doe&background=10b981&color=fff",
//   role: JobRole.SECURITY
// };

// export const MOCK_REPOS: Repository[] = [
//   { id: 'payment-service', name: 'payment-service', language: 'TypeScript', status: 'ACTIVE', lastScan: '2 mins ago', riskScore: 85, commitCount: 142 },
//   { id: 'inventory-api', name: 'inventory-api', language: 'Python', status: 'ACTIVE', lastScan: '1 hour ago', riskScore: 45, commitCount: 89 },
//   { id: 'frontend-dashboard', name: 'frontend-dashboard', language: 'React', status: 'ACTIVE', lastScan: '3 hours ago', riskScore: 12, commitCount: 320 },
//   { id: 'user-auth', name: 'user-auth', language: 'Go', status: 'INACTIVE', lastScan: '2 days ago', riskScore: 0, commitCount: 56 },
// ];

// export const MOCK_COMMITS: MockCommit[] = [
//   {
//     id: "c8f1a2b",
//     repo: "payment-service",
//     message: "feat: add user login endpoint",
//     author: "jdoe@company.com",
//     timestamp: "2 mins ago",
//     riskScore: 85,
//     codeSnippet: `app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   // TODO: Fix this before prod
//   const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
//   const user = await db.execute(query);
//   if (user) {
//     res.json({ token: "static-secret-key-12345", user });
//   } else {
//     res.status(401).send("Invalid credentials");
//   }
// });`
//   },
//   {
//     id: "a1b2c3d",
//     repo: "inventory-api",
//     message: "fix: update stock levels",
//     author: "alice@company.com",
//     timestamp: "1 hour ago",
//     riskScore: 45,
//     codeSnippet: `def update_stock(item_id, quantity):
//     try:
//         current = get_stock(item_id)
//         new_total = current + quantity
//         # Direct file write for logging
//         with open("/var/log/inventory.log", "a") as f:
//             f.write(f"Updated {item_id} to {new_total}")
//         return new_total
//     except Exception as e:
//         print(f"Error: {e}")
//         return -1`
//   },
//   {
//     id: "998877x",
//     repo: "frontend-dashboard",
//     message: "chore: add analytics script",
//     author: "bob@company.com",
//     timestamp: "3 hours ago",
//     riskScore: 12,
//     codeSnippet: `function renderAnalytics(input) {
//   // Directly injecting user input into DOM
//   const container = document.getElementById('analytics');
//   container.innerHTML = "<div>User Search: " + input + "</div>";
// }`
//   }
// ];

export const ROLE_DESCRIPTIONS = {
  BACKEND:
    "Focus on API design, database integrity, and efficient processing of scan results.",
  DEVOPS:
    "Focus on CI/CD pipeline integration, Docker containerization, and automated workflows.",
  SECURITY:
    "Focus on vulnerability identification, OWASP standards, and remediation strategies.",
  FULLSTACK:
    "Integrating the React frontend with the analysis engine and database.",
};
