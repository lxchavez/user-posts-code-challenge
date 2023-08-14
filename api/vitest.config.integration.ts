import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/*.integ.ts"],
    threads: false,
    maxConcurrency: 1,
    setupFiles: ["src/tests/helpers/setup.ts"],
  },
});
