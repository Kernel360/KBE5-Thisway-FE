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

export function getUserRole(token = getToken()) {
  if (isTokenExpired(token)) return null;
  const payload = parseJwt(token);
  if (!Array.isArray(payload?.roles)) return null;
  return ["ADMIN", "COMPANY_CHEF", "COMPANY_ADMIN", "MEMBER"]
    .find(role => payload.roles.includes(role)) ?? null;
}

export function getCompanyId() {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) return null;
  return payload.companyId;
}

export function getCompanyName() {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) return null;
  return payload.companyName;
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !Number.isFinite(payload.exp) || payload.exp <= 0) return true;
  // exp는 초 단위, JS의 Date.now()는 ms 단위
  return Date.now() >= payload.exp * 1000;
}
