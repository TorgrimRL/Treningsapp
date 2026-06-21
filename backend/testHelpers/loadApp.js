import { jest } from "@jest/globals";

function copyExpressProperties(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (["length", "name", "prototype"].includes(key)) {
      continue;
    }
    Object.defineProperty(
      target,
      key,
      Object.getOwnPropertyDescriptor(source, key)
    );
  }
}

function modulePath(relativePath) {
  return new URL(relativePath, import.meta.url).pathname;
}

function moduleHref(relativePath) {
  return new URL(relativePath, import.meta.url).href;
}

export async function loadAppWithQuery(query, jwtSecret = "test-secret") {
  if (!query) {
    throw new Error("loadAppWithQuery requires a query function");
  }

  jest.resetModules();
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET_KEY = jwtSecret;

  let app;

  jest.unstable_mockModule("express", () => {
    const actualExpress = jest.requireActual("express");
    const wrappedExpress = (...args) => {
      app = actualExpress(...args);
      return app;
    };

    copyExpressProperties(wrappedExpress, actualExpress);

    return {
      default: wrappedExpress,
    };
  });

  jest.unstable_mockModule(modulePath("../remoteDatabase.js"), () => ({
    default: { sql: jest.fn() },
  }));

  jest.unstable_mockModule(modulePath("../utils/safeQuery.js"), () => ({
    safeQuery: query,
  }));

  await import(moduleHref("../index.js"));

  if (!app) {
    throw new Error("Express app was not created while importing index.js");
  }

  return app;
}
