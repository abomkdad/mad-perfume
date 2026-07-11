import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("redirects the root path to the exact customer HTML", async () => {
  const response = await render();
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 307);
  assert.equal(location.pathname, "/customer.html");
  assert.equal(location.searchParams.get("v"), "e1eff09");
});

test("redirects clean customer links while preserving query params", async () => {
  const response = await render("/customer?lang=he&p=123");
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 307);
  assert.equal(location.pathname, "/customer.html");
  assert.equal(location.searchParams.get("lang"), "he");
  assert.equal(location.searchParams.get("p"), "123");
  assert.equal(location.searchParams.get("v"), "e1eff09");
});

test("ships the full upstream customer HTML", async () => {
  const html = await readFile(new URL("../public/customer.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="ar" dir="rtl">/i);
  assert.match(html, /const CATALOG_URL = "https:\/\/script\.google\.com\/macros\/s\/AKfycbyOedaaojoXQ6UNdzelH4YP0IUVuROnJydls8OBRsF4djuUtPrybSF_8zzyS2I5KD5pNQ\/exec"/);
  assert.match(html, /const ORDER_WEBAPP_URL = "https:\/\/script\.google\.com\/macros\/s\/AKfycbzd4FSy5fKZ5B3LF4ogDerw25K16oikiNv0j-4QPZGE4CzbvZFiw5vFIQpE09w486ldCA\/exec"/);
  assert.match(html, /D2D02JBC77U4ENLN9SBG/);
  assert.match(html, /1072283127290819/);
  assert.match(html, /MAD Club/);
  assert.match(html, /MAD Rewards/);
  assert.match(html, /37 فرع/);
});

test("redirects the privacy route to the static HTML page", async () => {
  const response = await render("/privacy");
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 307);
  assert.equal(location.pathname, "/privacy.html");
});

test("ships the privacy policy HTML", async () => {
  const html = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");

  assert.match(html, /Privacy policy for the MAD PERFUME mobile app/);
  assert.match(html, /info@madperfume\.co\.il/);
  assert.match(html, /delete-account/);
});

test("redirects the delete-account route to the static HTML page", async () => {
  const response = await render("/delete-account");
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 307);
  assert.equal(location.pathname, "/delete-account.html");
});

test("ships the account deletion HTML", async () => {
  const html = await readFile(new URL("../public/delete-account.html", import.meta.url), "utf8");

  assert.match(html, /Request deletion of your MAD PERFUME account/);
  assert.match(html, /MAD PERFUME account deletion request/);
  assert.match(html, /info@madperfume\.co\.il/);
});

test("redirects the support route to the static HTML page", async () => {
  const response = await render("/support");
  const location = new URL(response.headers.get("location"));

  assert.equal(response.status, 307);
  assert.equal(location.pathname, "/support.html");
});

test("ships the support HTML", async () => {
  const html = await readFile(new URL("../public/support.html", import.meta.url), "utf8");

  assert.match(html, /Support for the MAD PERFUME customer app/);
  assert.match(html, /Privacy policy/);
  assert.match(html, /delete-account/);
});
