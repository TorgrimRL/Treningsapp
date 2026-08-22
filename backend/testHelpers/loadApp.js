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

export async function loadAppWithQuery(
  query,
  jwtSecret = "test-secret",
  environment = {}
) {
  if (!query) {
    throw new Error("loadAppWithQuery requires a query function");
  }

  jest.resetModules();
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET_KEY = jwtSecret;

  const controlledEnvironment = {
    TRUST_PROXY: "",
    ...environment,
  };
  const previousEnvironment = new Map();
  for (const [name, value] of Object.entries(controlledEnvironment)) {
    previousEnvironment.set(name, process.env[name]);
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

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

  try {
    await import(moduleHref("../index.js"));
  } finally {
    for (const [name, value] of previousEnvironment) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }

  if (!app) {
    throw new Error("Express app was not created while importing index.js");
  }

  return app;
}
