// What this file is:
// A "smoke test" — the simplest possible test. It just checks the component
// renders without throwing an error. Think of it as turning the lights on to
// confirm the wiring isn't broken. It doesn't test behaviour yet.

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Pantry uses <Link>, which needs a Router context
import Pantry from "./Pantry";

// beforeEach runs before every test in this file.
// We mock (fake) the global fetch so the test doesn't try to hit the real backend.
// Without this, the test would fail because there's no backend running in CI.
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]), // pretend the backend returned an empty pantry
    })
  );
});

afterEach(() => {
  jest.resetAllMocks(); // clean up the fake fetch after each test
});

// test() defines a single test case.
// The string is the human-readable description — shown in the output if it fails.
// async/await here because the component fetches data on mount — we need to
// wait for that to finish before we can assert what's on screen.
test("Pantry page renders the heading", async () => {
  render(
    <MemoryRouter>
      <Pantry />
    </MemoryRouter>
  );

  // findByText waits (up to 1s) for the element to appear — unlike getByText which
  // throws immediately if it's not there yet. We need this because the component
  // starts in a loading state, then switches to showing content after fetch resolves.
  const heading = await screen.findByText("My Pantry");
  expect(heading).toBeInTheDocument();
});

test("shows loading message while fetching", () => {
  render(
    <MemoryRouter>
      <Pantry />
    </MemoryRouter>
  );

  // getByText (no await) is fine here — loading shows synchronously on the very
  // first render, before the fetch has had a chance to resolve.
  expect(screen.getByText("Loading…")).toBeInTheDocument();
});
