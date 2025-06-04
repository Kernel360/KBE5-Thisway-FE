export function getToken() {
  return localStorage.getItem("token");
}

export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getUserRole() {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) return null;
  if (payload.ROLE_ADMIN) return "ADMIN";
  if (payload.ROLE_COMPANY_ADMIN) return "COMPANY_ADMIN";
  if (payload.ROLE_COMPANY_CHEF) return "COMPANY_CHEF";
  if (payload.ROLE_MEMBER) return "MEMBER";
  return null;
}
