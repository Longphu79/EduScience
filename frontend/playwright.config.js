const BACKEND_PORT = 4101;
const FRONTEND_PORT = 3101;
const PLAYWRIGHT_DB = "edu_science_playwright_e2e";
const TEST_MONGO_URI = `mongodb://127.0.0.1:27017/${PLAYWRIGHT_DB}`;

const config = {
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 60_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: [
    {
      command: `MONGO_URI=${TEST_MONGO_URI} npm run seed:qa && PORT=${BACKEND_PORT} MONGO_URI=${TEST_MONGO_URI} npm start`,
      cwd: "../backend",
      url: `http://127.0.0.1:${BACKEND_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:${BACKEND_PORT} npm run build && PORT=${FRONTEND_PORT} NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:${BACKEND_PORT} npm start`,
      cwd: ".",
      url: `http://127.0.0.1:${FRONTEND_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
};

export default config;
