export function submitCsrfLogout({
  baseUrl,
  csrfToken,
  documentObject = document,
}) {
  const form = documentObject.createElement("form");
  const tokenInput = documentObject.createElement("input");

  form.method = "POST";
  form.action = `${baseUrl.replace(/\/$/, "")}/auth0/logout`;
  form.hidden = true;
  tokenInput.type = "hidden";
  tokenInput.name = "_csrf";
  tokenInput.value = csrfToken;
  form.append(tokenInput);
  documentObject.body.append(form);
  form.submit();
}
