import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/integ/*.test.ts"],
    threads: false,
    setupFiles: ["src/integ/helpers/setup.ts"],
  },
  resolve: {
    alias: {
      lib: "/src/lib",
    },
  },
});
