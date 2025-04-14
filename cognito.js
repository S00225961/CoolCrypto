const config = {
  authority: "https://us-east-159gzqkxdi.auth.us-east-1.amazoncognito.com", // Your Cognito domain
  client_id: "1u2p66b14lorj0ctn1gu9o0rqa", // Your app client ID
  redirect_uri: window.location.origin + "/", // This should be allowed in Cognito callback URLs
  response_type: "code",
  scope: "openid profile email"
};

const userManager = new Oidc.UserManager(config);

// Check auth and redirect if not authenticated
userManager.getUser().then(user => {
  if (!user || user.expired) {
    userManager.signinRedirect();
  } else {
    localStorage.setItem("id_token", user.id_token);
    renderCharts(); // From app.js
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("id_token");
    userManager.signoutRedirect({
      post_logout_redirect_uri: "https://your-site.com/" // ✅ Add this URL in Cognito Logout URLs
    });
  });
}).catch(error => {
  console.error("Auth error:", error);
  userManager.signinRedirect();
});


