import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom に無い API。radix (RadioGroup など) が使う
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// globals を有効にしていないので Testing Library の自動 cleanup が効かない。明示的に呼ぶ
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
