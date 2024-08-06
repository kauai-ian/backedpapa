require("dotenv").config();
const { auth } = require("express-oauth2-jwt-bearer");

//authorization middleware when used, the access token must exist and be verified against the Auth0 JWKS
exports.checkJwt = auth({
  audience: "honuahou",
  issuerBaseURL: "https://dev-j6guopzlzs227dgo.us.auth0.com",
  tokenSigningAlg: "RS256",
});
console.log(this.checkJwt);
