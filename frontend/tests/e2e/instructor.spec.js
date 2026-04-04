import { expect, test } from "@playwright/test";

import { chooseSelectOption, expectHeading, loginViaForm, QA_ACCOUNTS } from "./helpers";

test("instructor can login and review courses and payouts", async ({ page }) => {
  await loginViaForm(page, "/instructor/login", QA_ACCOUNTS.instructor);

  await expect(page).toHaveURL(/\/instructor$/);
  await expectHeading(page, "Instructor overview");
  await expect(page.getByText("Recent student comments")).toBeVisible();

  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page).toHaveURL(/\/instructor\/courses$/);
  await expectHeading(page, "Course management");
  await expect(page.getByRole("button", { name: "Create course" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit details" }).first()).toBeVisible();

  await page.getByRole("link", { name: "Authoring", exact: true }).click();
  await expect(page).toHaveURL(/\/instructor\/authoring$/);
  await expectHeading(page, "Course authoring");
  await expect(page.getByText("QA Physics Foundations").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" }).first()).toBeVisible();

  await page.getByRole("link", { name: "Payouts", exact: true }).click();
  await expect(page).toHaveURL(/\/instructor\/payouts$/);
  await expectHeading(page, "Payout management");
  await expect(page.getByText("Linked bank account")).toBeVisible();
});

test("instructor can create, update, and preview a published course from authoring", async ({ page }) => {
  const uniqueKey = Date.now().toString();
  const createdTitle = `QA Instructor Desktop Course ${uniqueKey}`;
  const updatedTitle = `${createdTitle} Updated`;
  const updatedSlug = `qa-instructor-desktop-course-${uniqueKey}-updated`;
  const lessonTitle = `Preview Lesson ${uniqueKey}`;
  const updatedLessonTitle = `${lessonTitle} Updated`;
  const updatedLessonVideoUrl = "https://www.w3schools.com/html/movie.mp4";

  await loginViaForm(page, "/instructor/login", QA_ACCOUNTS.instructor);
  await expect(page).toHaveURL(/\/instructor$/);
  await page.goto("/instructor/authoring");

  await expectHeading(page, "Course authoring");

  await page.getByRole("button", { name: "Create course" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create course" });
  await createDialog.getByLabel("Course title").fill(createdTitle);
  await createDialog
    .getByLabel("Short description")
    .fill("Playwright coverage for instructor create flow.");
  await createDialog
    .getByTestId("course-description-editor")
    .locator('[contenteditable="true"]')
    .fill("Create and update course flow for desktop authoring QA.");
  await createDialog.getByLabel("Category").fill("Testing");
  await createDialog.getByRole("textbox", { name: "Price", exact: true }).fill("119000");
  await createDialog.getByRole("textbox", { name: "Sale price", exact: true }).fill("99000");
  await createDialog.getByRole("combobox", { name: "Status", exact: true }).click();
  await page.getByRole("option", { name: "Published", exact: true }).click();
  await createDialog.getByRole("button", { name: "Create course" }).click();

  await expect(page.getByText(createdTitle).last()).toBeVisible();
  await expect(page.getByRole("button", { name: "View public page" })).toBeVisible();

  await page.getByRole("tab", { name: "Lessons" }).click();
  await page.getByRole("button", { name: "Add lesson" }).click();
  const lessonDialog = page.getByRole("dialog", { name: "Create lesson" });
  await lessonDialog.getByLabel("Lesson title").fill(lessonTitle);
  await lessonDialog
    .getByLabel("Lesson summary")
    .fill("Preview lesson used for instructor authoring coverage.");
  await lessonDialog
    .getByLabel("Lesson video URL")
    .fill("https://www.w3schools.com/html/mov_bbb.mp4");
  await lessonDialog.getByLabel("Preview lesson").check();
  await lessonDialog.getByRole("button", { name: "Create lesson" }).click();

  await expect(page.getByText(lessonTitle)).toBeVisible();

  await page.getByRole("button", { name: "Edit lesson" }).first().click();
  const editLessonDialog = page.getByRole("dialog", { name: "Edit lesson" });
  await editLessonDialog.getByLabel("Lesson title").fill(updatedLessonTitle);
  await editLessonDialog.getByLabel("Lesson video URL").fill(updatedLessonVideoUrl);
  await editLessonDialog.getByRole("button", { name: "Update lesson" }).click();

  await expect(page.getByText(updatedLessonTitle)).toBeVisible();

  await page.getByRole("button", { name: "Edit lesson" }).first().click();
  const reopenedLessonDialog = page.getByRole("dialog", { name: "Edit lesson" });
  await expect(reopenedLessonDialog.getByLabel("Lesson title")).toHaveValue(updatedLessonTitle);
  await expect(reopenedLessonDialog.getByLabel("Lesson video URL")).toHaveValue(updatedLessonVideoUrl);
  await reopenedLessonDialog.getByRole("button", { name: "Close lesson editor" }).click();
  await expect(reopenedLessonDialog).not.toBeVisible();

  await page.getByRole("tab", { name: "Course details" }).click();
  await page.getByLabel("Course title").fill(updatedTitle);
  await page.getByLabel("Slug").fill(updatedSlug);
  await page.getByLabel("Short description").fill("Updated published course for public detail QA.");
  await page.getByRole("button", { name: "Update course" }).click();

  await expect(page.getByText(updatedTitle).last()).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "View public page" }).click();
  const popup = await popupPromise;

  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveURL(new RegExp(`/courses/${updatedSlug}$`));
  await expect(popup.getByRole("heading", { name: updatedTitle })).toBeVisible();
});
