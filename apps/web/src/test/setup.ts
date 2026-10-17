import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals を有効にしていないので Testing Library の自動 cleanup が効かない。明示的に呼ぶ
afterEach(cleanup);
