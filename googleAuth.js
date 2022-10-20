const { google } = require("googleapis");

function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    "510294674624-02sudfml9lovu8g87hvsn5j8rhiab9f9.apps.googleusercontent.com",
    "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",
    "https://auth.expo.io/@voxp/purple"
  );

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
  });

  console.log(authorizationUrl);
}
