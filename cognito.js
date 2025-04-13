import { UserManager } from "https://cdn.skypack.dev/oidc-client-ts";

const cognitoAuthConfig = {
  authority: "https://<your-user-pool-domain>.auth.<region>.amazoncognito.com",
  client_id: "<your-client-id>",
  redirect_uri: "https://<your-app-domain>/callback.html",
  response_type: "code",
  scope: "openid email profile"
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
  const clientId = cognitoAuthConfig.client_id;
  const logoutUri = "https://<your-app-domain>/index.html";
  const cognitoDomain = cognitoAuthConfig.authority;
  localStorage.removeItem("id_token");
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
