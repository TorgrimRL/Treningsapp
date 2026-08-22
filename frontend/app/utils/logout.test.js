import { expect, it, vi } from "vitest";
import { submitCsrfLogout } from "./logout";

it("submits logout as a CSRF-protected POST navigation", () => {
  const form = {
    append: vi.fn(),
    submit: vi.fn(),
  };
  const input = {};
  const documentObject = {
    body: { append: vi.fn() },
    createElement: vi
      .fn()
      .mockReturnValueOnce(form)
      .mockReturnValueOnce(input),
  };

  submitCsrfLogout({
    baseUrl: "https://api.example.com/api/",
    csrfToken: "csrf-token",
    documentObject,
  });

  expect(form).toMatchObject({
    method: "POST",
    action: "https://api.example.com/api/auth0/logout",
    hidden: true,
  });
  expect(input).toEqual({
    type: "hidden",
    name: "_csrf",
    value: "csrf-token",
  });
  expect(form.append).toHaveBeenCalledWith(input);
  expect(documentObject.body.append).toHaveBeenCalledWith(form);
  expect(form.submit).toHaveBeenCalledOnce();
});
