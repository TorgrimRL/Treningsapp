import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

async function expectNoDocumentOverflow(page) {
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1);
}

async function getBox(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box;
}

async function expectCenteredWithin(page, locator, maxWidth) {
  const viewport = page.viewportSize();
  const box = await getBox(locator);
  const expectedX = (viewport.width - box.width) / 2;

  expect(box.width).toBeLessThanOrEqual(maxWidth + 1);
  expect(Math.abs(box.x - expectedX)).toBeLessThanOrEqual(2);
}

function isDesktop(page) {
  return page.viewportSize().width >= 1280;
}

async function expectNavbarUsesViewportEdges(page) {
  const viewport = page.viewportSize();
  const contentBox = await getBox(page.getByTestId("navbar-content"));
  const brandBox = await getBox(page.getByTestId("navbar-brand"));
  const edgePadding = viewport.width >= 768 ? 24 : 16;

  expect(contentBox.x).toBeLessThanOrEqual(1);
  expect(contentBox.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(Math.abs(brandBox.x - edgePadding)).toBeLessThanOrEqual(1);

  const trailingControl =
    viewport.width >= 768
      ? page.getByTestId("navbar-desktop-menu")
      : page.getByTestId("navbar-menu-button");
  const trailingBox = await getBox(trailingControl);
  const rightGap = viewport.width - (trailingBox.x + trailingBox.width);

  expect(Math.abs(rightGap - edgePadding)).toBeLessThanOrEqual(1);
}

test("landing shell and feature content stay within responsive bounds", async ({
  page,
}) => {
  await page.goto("/");

  const navbar = page.getByTestId("navbar");
  const hero = page.getByTestId("landing-hero");
  const navbarBox = await getBox(navbar);
  const heroBox = await getBox(hero);

  expect(heroBox.x).toBeLessThanOrEqual(1);
  expect(heroBox.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
  expect(heroBox.y).toBeGreaterThanOrEqual(navbarBox.y + navbarBox.height - 1);
  if (isDesktop(page)) {
    expect(heroBox.height).toBeGreaterThanOrEqual(
      Math.min(page.viewportSize().width * 1.5, 2600) - 1
    );
  } else {
    expect(Math.abs(heroBox.height / heroBox.width - 1.5)).toBeLessThan(0.01);
  }

  const heroImage = page.getByTestId("landing-hero-image");
  await expect(heroImage).toHaveCSS("object-fit", "contain");
  await expect(heroImage).toHaveCSS(
    "object-position",
    isDesktop(page) ? "50% 50%" : "50% 0%"
  );
  await expect(
    hero.locator('img[src="/images/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"]')
  ).toHaveCount(1);
  await expect(hero).toHaveCSS("background-image", /linear-gradient/);

  const heroContentBox = await getBox(page.getByTestId("landing-hero-content"));
  const heroHeadingBox = await getBox(
    page.getByRole("heading", { name: "Simplifying Muscle Growth" }).first()
  );
  expect(heroContentBox.y).toBeGreaterThanOrEqual(heroBox.y - 1);
  expect(heroHeadingBox.y).toBeLessThan(page.viewportSize().height * 0.75);

  const targetImageBox = await getBox(
    page.getByTestId("target-recommendation-image")
  );
  const dumbbellsImageBox = await getBox(
    page.getByTestId("landing-dumbbells-image")
  );

  expect(
    Math.abs(targetImageBox.width / targetImageBox.height - 375 / 782)
  ).toBeLessThan(0.01);
  expect(
    Math.abs(dumbbellsImageBox.width / dumbbellsImageBox.height - 1280 / 1919)
  ).toBeLessThan(0.01);

  if (!isDesktop(page)) {
    expect(targetImageBox.width).toBeGreaterThanOrEqual(
      page.viewportSize().width - 34
    );
  }

  await expectNavbarUsesViewportEdges(page);
  await expectCenteredWithin(
    page,
    page.getByTestId("landing-feature-content"),
    1152
  );
  await expectCenteredWithin(
    page,
    page.getByTestId("site-footer").locator(":scope > div"),
    1280
  );
  const donationLink = page.getByTestId("vipps-donation-link");
  await expect(donationLink).toBeVisible();
  await expect(donationLink).toHaveAccessibleName("Support with Vipps");
  await expect(donationLink).toHaveAttribute(
    "href",
    "https://qr.vipps.no/box/89367565-e970-4b18-89ab-6a35c66c09b3/pay-in"
  );
  await expect(donationLink).toHaveAttribute("target", "_blank");
  await expect(donationLink).toHaveAttribute("rel", "noopener noreferrer");
  const donationLinkBox = await getBox(donationLink);
  expect(donationLinkBox.height).toBeGreaterThanOrEqual(44);
  await expectNoDocumentOverflow(page);
});

test("current workout is centered, sticky, and remains one column", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const navbarBox = await getBox(page.getByTestId("navbar"));
  const stickyHeader = page.getByTestId("current-workout-sticky-header");
  const stickyBox = await getBox(stickyHeader);

  expect(stickyBox.y).toBeGreaterThanOrEqual(
    navbarBox.y + navbarBox.height - 1
  );
  await expectCenteredWithin(
    page,
    page.getByTestId("current-workout-layout"),
    768
  );

  const cards = page.getByTestId(/^workout-exercise-\d+$/);
  await expect(cards).toHaveCount(2);
  const firstCard = await getBox(cards.nth(0));
  const secondCard = await getBox(cards.nth(1));

  expect(Math.abs(firstCard.x - secondCard.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(firstCard.width - secondCard.width)).toBeLessThanOrEqual(1);
  expect(secondCard.y).toBeGreaterThanOrEqual(
    firstCard.y + firstCard.height - 1
  );
  expect(firstCard.y).toBeGreaterThanOrEqual(
    stickyBox.y + stickyBox.height - 1
  );

  if (!isDesktop(page)) {
    expect(firstCard.x).toBeLessThanOrEqual(1);
    expect(firstCard.width).toBeGreaterThanOrEqual(
      page.viewportSize().width - 1
    );
  }

  await page.evaluate(() => window.scrollTo(0, 200));
  const scrollTop = await page.evaluate(() => window.scrollY);
  if (scrollTop > 0) {
    const scrolledStickyBox = await getBox(stickyHeader);
    expect(
      Math.abs(scrolledStickyBox.y - (navbarBox.y + navbarBox.height))
    ).toBeLessThanOrEqual(1);
  }

  await expectNoDocumentOverflow(page);
});

test("templates switch from a list to a three-column desktop grid", async ({
  page,
}) => {
  await loginAsDemoUser(page);

  const grid = page.getByTestId("templates-grid");
  const cards = page.getByTestId(/^template-card-\d+$/);
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  await expectCenteredWithin(page, grid, 1152);

  const first = await getBox(cards.nth(0));
  const second = await getBox(cards.nth(1));
  const third = await getBox(cards.nth(2));

  if (isDesktop(page)) {
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - third.y)).toBeLessThanOrEqual(1);
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    expect(third.x).toBeGreaterThan(second.x + second.width - 1);
  } else {
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height - 1);
  }

  await expectNoDocumentOverflow(page);
});

test("history switches from a list to a three-column desktop grid", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles");

  const grid = page.getByTestId("history-grid");
  const cards = page.getByTestId(/^history-card-\d+$/);
  await expect(cards).toHaveCount(3);
  await expectCenteredWithin(page, grid, 1152);

  const first = await getBox(cards.nth(0));
  const second = await getBox(cards.nth(1));
  const third = await getBox(cards.nth(2));

  if (isDesktop(page)) {
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - third.y)).toBeLessThanOrEqual(1);
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    expect(third.x).toBeGreaterThan(second.x + second.width - 1);
  } else {
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height - 1);
  }

  await expectNoDocumentOverflow(page);
});

test("planner days stack on mobile and use fixed horizontal columns on desktop", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles-new");

  await page.getByTestId("training-block-name").fill("Responsive Plan");
  await page.getByTestId("training-block-weeks").selectOption("4");
  await page.getByTestId("training-block-details-save").click();
  await page.getByTestId("add-planner-day").click();
  await page.getByTestId("add-planner-day").click();

  const planner = page.getByTestId("planner-days");
  const cards = page.getByTestId(/^planner-day-\d+$/);
  await expect(cards).toHaveCount(3);

  const first = await getBox(cards.nth(0));
  const second = await getBox(cards.nth(1));
  const third = await getBox(cards.nth(2));

  if (isDesktop(page)) {
    expect(first.width).toBeGreaterThanOrEqual(320);
    expect(first.width).toBeLessThanOrEqual(384);
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - third.y)).toBeLessThanOrEqual(1);
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    expect(third.x).toBeGreaterThan(second.x + second.width - 1);

    const scroller = await planner.locator("..").evaluate((element) => ({
      clientWidth: element.clientWidth,
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
    }));
    expect(scroller.overflowX).toBe("auto");
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
  } else {
    expect(first.x).toBeLessThanOrEqual(1);
    expect(first.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height - 1);
  }

  await expectNoDocumentOverflow(page);
});

test("tablet breakpoint uses two columns without navbar overflow", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chrome",
    "Tablet breakpoint is covered once from the desktop browser project"
  );

  await page.setViewportSize({ width: 768, height: 1024 });
  await loginAsDemoUser(page);
  await expectNavbarUsesViewportEdges(page);

  const cards = page.getByTestId(/^template-card-\d+$/);
  await expect(cards.first()).toBeVisible();
  const first = await getBox(cards.nth(0));
  const second = await getBox(cards.nth(1));
  const third = await getBox(cards.nth(2));

  expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
  expect(second.x).toBeGreaterThan(first.x + first.width - 1);
  expect(third.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
  await expect(
    page.getByRole("link", { name: "Current workout" })
  ).toBeVisible();
  await expect(page.getByTestId("vipps-donation-link")).toBeVisible();
  await expectNoDocumentOverflow(page);
});
