import { test, expect } from "@playwright/test";

test.describe("IPP Blueprint End-to-End Suite", () => {
  test("(c) unauthenticated API rejection returns 401", async ({ request }) => {
    // 1. GET /api/ips without Authorization header
    const getRes = await request.get("/api/ips");
    expect(getRes.status()).toBe(401);
    const getJson = await getRes.json();
    expect(getJson.error).toContain("Unauthorized");

    // 2. POST /api/ips without Authorization header
    const postRes = await request.post("/api/ips", {
      data: { action: "simulate" },
    });
    expect(postRes.status()).toBe(401);
  });

  test("(b) simulation trigger with mocked API updates dashboard", async ({ page }) => {
    // Mock the /api/ips POST request to return success without depending on external host environment
    await page.route("**/api/ips", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Threat simulation completed and logged to IPS engine successfully",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");
    // Click simulate attack traffic button
    const simulateButton = page.getByRole("button", { name: /Simulate Attack Traffic/i });
    await expect(simulateButton).toBeVisible();
    await simulateButton.click();

    // Verify feedback notification banner appears
    const banner = page.locator("text=Simulated attacks successfully captured and blocked");
    await expect(banner).toBeVisible({ timeout: 10000 });
  });

  test("(a) checklist persistence across reload", async ({ page }) => {
    await page.goto("/checklist");
    await page.waitForLoadState("networkidle");

    // Click "Clear" button to clear state
    const clearButton = page.getByRole("button", { name: /^Clear$/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Click "Select All"
    const selectAllButton = page.getByRole("button", { name: /^Select All$/i });
    await expect(selectAllButton).toBeVisible();
    await selectAllButton.click();

    // Verify 100% progress badge
    await expect(page.getByText("100% Implemented")).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify state remained 100% after page reload
    await expect(page.getByText("100% Implemented")).toBeVisible();
  });
});
