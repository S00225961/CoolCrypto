import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_59GZQkxdi",
    client_id: "1u2p66b14lorj0ctn1gu9o0rqa",
    redirect_uri: "https://lustrous-rolypoly-ec9620.netlify.app/",
    response_type: "code",
    scope: "email openid phone"
};

// create a UserManager instance
export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

export async function signOutRedirect () {
  const clientId = "1u2p66b14lorj0ctn1gu9o0rqa";
  const logoutUri = "https://lustrous-rolypoly-ec9620.netlify.app/";
  const cognitoDomain = "https://us-east-159gzqkxdi.auth.us-east-1.amazoncognito.com";
  localStorage.removeItem("id_token");
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

export function isTokenValid(idToken) {
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    return payload.exp * 1000 > Date.now(); // Check expiration
  } catch {
    return false;
  }
}





