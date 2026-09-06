import { getNativeAuthSettings } from "../utils/nativeAuth.js";

describe("native Auth0 configuration", () => {
  it("uses the shared Auth0 issuer and API audience", () => {
    expect(
      getNativeAuthSettings({
        AUTH0_DOMAIN: "https://tenant.eu.auth0.com/",
        AUTH0_AUDIENCE: "https://api.setoptimizer.com",
      })
    ).toEqual({
      audience: "https://api.setoptimizer.com",
      issuerBaseURL: "https://tenant.eu.auth0.com",
      enabled: true,
    });
  });

  it("stays disabled until both issuer and audience are configured", () => {
    expect(getNativeAuthSettings({ AUTH0_DOMAIN: "tenant.auth0.com" })).toEqual(
      {
        audience: undefined,
        issuerBaseURL: "https://tenant.auth0.com",
        enabled: false,
      }
    );
  });
});
