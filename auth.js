import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const regionAuthConfig = {
  "us-east-1": {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_59GZQkxdi",
    client_id: "1u2p66b14lorj0ctn1gu9o0rqa",
    redirect_uri: "https://main.diedwkmusxaeo.amplifyapp.com/",
    cognitoDomain: "https://us-east-159gzqkxdi.auth.us-east-1.amazoncognito.com"
  },
  "us-west-2": {
    authority: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_jiY8N2wRe", 
    client_id: "5dsha53i7c4octocrumtvlopl1",
    redirect_uri: "https://main.d94v42z7ykhoh.amplifyapp.com/",
    cognitoDomain: "https://us-west-2jiy8n2wre.auth.us-west-2.amazoncognito.com"
  }
};

// Create a UserManager based on region
export function getUserManager(region) {
  const config = regionAuthConfig[region];

  return new UserManager({
    authority: config.authority,
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    response_type: "code",
    scope: "email openid phone",
    userStore: new WebStorageStateStore({ store: window.localStorage })
  });
}

// Sign-out function using region
export function signOutRedirect(region) {
  const config = regionAuthConfig[region];
  const logoutUrl = `${config.cognitoDomain}/logout?client_id=${config.client_id}&logout_uri=${encodeURIComponent(config.redirect_uri)}`;
  localStorage.clear(); 
  window.location.href = logoutUrl;
}

