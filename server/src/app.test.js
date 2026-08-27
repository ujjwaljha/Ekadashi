import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.js";
import { getNextEkadashi, getEkadashis } from "./ekadashiData.js";

async function withServer(run) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("health endpoint reports ok", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  });
});

test("ekadashis endpoint returns the full 2026 list", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/ekadashis?year=2026`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.year, 2026);
    assert.equal(body.count, 24);
    assert.equal(body.ekadashis.length, 24);
    assert.ok(body.ekadashis.every((e) => e.date && e.name && e.paksha));
  });
});

test("unknown year returns an empty list", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/ekadashis?year=1999`);
    const body = await res.json();
    assert.equal(body.count, 0);
  });
});

test("next endpoint returns an upcoming Ekadashi with daysUntil", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/ekadashis/next`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.name, "should have a name");
    assert.ok(body.daysUntil >= 0, "daysUntil should be non-negative");
  });
});

test("getNextEkadashi finds the correct entry for a fixed date", () => {
  const next = getNextEkadashi(new Date("2026-08-27T00:00:00Z"));
  assert.equal(next.name, "Parsva");
  assert.equal(next.date, "2026-08-28");
  assert.equal(next.daysUntil, 1);
});

test("dataset entries are chronologically sorted", () => {
  const dates = getEkadashis(2026).map((e) => e.date);
  const sorted = [...dates].sort();
  assert.deepEqual(dates, sorted);
});
