import { expect, test } from "@playwright/test";

import { expectHeading, loginViaForm, QA_ACCOUNTS } from "./helpers";

test("admin can login and inspect payout queue", async ({ page }) => {
  await loginViaForm(page, "/admin/login", QA_ACCOUNTS.admin);

  await expect(page).toHaveURL(/\/admin$/);
  await expectHeading(page, "Admin overview");
  await expect(page.getByText("Recent payout requests")).toBeVisible();

  await page.getByRole("link", { name: "Authoring", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/authoring$/);
  await expectHeading(page, "Course authoring");
  await expect(page.getByRole("button", { name: "Create course" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Course inventory" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Create course" }).click();
  await expect(page.getByRole("combobox", { name: "Instructor owner" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("link", { name: "Payout queue", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/payouts$/);
  await expectHeading(page, "Payout queue");
  await expect(page.getByText("PAYOUT-QA-PENDING")).toBeVisible();
  await expect(page.getByText("Holder: QA INSTRUCTOR").first()).toBeVisible();
});
