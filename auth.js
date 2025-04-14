import { UserManager } from 'oidc-client-ts';

// Cognito OIDC configuration (adjust these with your settings)
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_59GZQkxdi",  // Replace with your Cognito domain
  client_id: "1u2p66b14lorj0ctn1gu9o0rqa",  // Replace with your Client ID
  redirect_uri: "https://main.diedwkmusxaeo.amplifyapp.com/",  // Local redirect URL (adjust as per your setup)
  response_type: "code",
  scope: "email openid phone",
};

// Create a UserManager instance
export const userManager = new UserManager({
  ...cognitoAuthConfig,
});

// Sign-out functionality
export async function signOutRedirect() {
  const clientId = "1u2p66b14lorj0ctn1gu9o0rqa";  // Replace with your Client ID
  const logoutUri = "https://main.diedwkmusxaeo.amplifyapp.com/";  // Set this to your logout URI
  const cognitoDomain = "https://us-east-159gzqkxdi.auth.us-east-1.amazoncognito.com";  // Replace with your Cognito domain
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};
