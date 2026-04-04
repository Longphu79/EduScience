import { expect, test } from "@playwright/test";

import { expectHeading, loginViaForm, QA_ACCOUNTS } from "./helpers";

test("student can create a new account and land in the learning dashboard", async ({ page }) => {
  const uniqueKey = Date.now().toString();

  await page.goto("/register");
  await page.getByLabel("Username").fill(`qa.student.${uniqueKey}`);
  await page.getByLabel("Email").fill(`qa.student.${uniqueKey}@example.com`);
  await page.locator('input[aria-label="Password"]').fill("QaDemo123!");
  await page.locator('input[aria-label="Confirm password"]').fill("QaDemo123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/my-learning$/);
  await expectHeading(page, "My learning");
  await expect(page.getByText("Student dashboard")).toBeVisible();
});

test("student can login, persist session, and open learning route", async ({ page }) => {
  await loginViaForm(page, "/login", QA_ACCOUNTS.student);

  await expect(page).toHaveURL(/\/my-learning$/);
  await expectHeading(page, "My learning");
  await expect(page.getByRole("heading", { name: "QA Physics Foundations" })).toBeVisible();

  await page.reload();
  await expectHeading(page, "My learning");

  await page.getByRole("button", { name: "Continue learning" }).first().click();

  await expect(page).toHaveURL(/\/learn\/qa-physics-foundations$/);
  await expectHeading(page, "Lesson comments");
  await expect(page.getByRole("heading", { name: "Newtonian Motion" })).toBeVisible();
});

test("student can save wishlist items, add to cart, and open checkout", async ({ page }) => {
  await loginViaForm(page, "/login", QA_ACCOUNTS.student);

  await page.goto("/courses/qa-biology-basics");
  await expectHeading(page, "QA Biology Basics");

  await page.getByRole("button", { name: "Save to wishlist" }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();

  await page.goto("/wishlist");
  await expectHeading(page, "Save promising courses first, then move the right ones into checkout.");
  await expect(page.getByText("QA Biology Basics")).toBeVisible();

  await page.goto("/cart");
  await expectHeading(page, "Review the courses you are about to pay for, then start checkout in one step.");
  await expect(page.getByText("QA Biology Basics")).toBeVisible();
  await expect(page.getByText("QA Chemistry Lab Toolkit")).toBeVisible();

  await page.getByRole("button", { name: "Proceed to checkout" }).click();

  await expect(page).toHaveURL(/\/checkout\/.+$/);
  await expectHeading(page, "Complete payment, then move directly into the learning workspace.");
  await expect(page.getByText("Pay with SePay QR")).toBeVisible();
});

test("logout clears the student session and protected routes redirect back to login", async ({ page }) => {
  await loginViaForm(page, "/login", QA_ACCOUNTS.student);

  await expect(page).toHaveURL(/\/my-learning$/);
  await page.getByRole("button", { name: "Open account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.goto("/my-learning");
  await expect(page).toHaveURL(/\/login$/);
});
