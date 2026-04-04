import { expect } from "@playwright/test";

export const QA_ACCOUNTS = {
  student: { username: "qa.student", password: "QaDemo123!" },
  instructor: { username: "qa.instructor", password: "QaDemo123!" },
  admin: { username: "qa.admin", password: "QaDemo123!" },
};

export async function loginViaForm(page, path, credentials) {
  await page.goto(path);
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function expectHeading(page, heading) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

export async function chooseSelectOption(page, label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
