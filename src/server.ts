import express, { Request, Response } from "express";
import session, { Session } from "express-session";
import cors from "cors";
import url from 'url';
import { URLSearchParams } from "url";
import crypto from "crypto";
import { config } from 'dotenv';
import fs from 'fs';
config({ path: './assets/.env' });
var https = require('https');
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "deez_nuts",
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore(),
  })
);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
interface CustomSession extends Session {
  tokenData?: any;
  clientId?: string;
  state?: string;
  nonce?: string;
  codeVerifier?: string;
}
function generateRandomString(length: number): string {
  return Array.from(crypto.randomBytes(length))
    .map((byte) => ("0" + byte.toString(16)).substr(-2))
    .join("");
}
function generatePKCEPair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = generateRandomString(32);
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { codeVerifier, codeChallenge };
}
const authUrl = "https://localhost:8443/realms/myrealm/protocol/openid-connect/auth";
const { codeVerifier, codeChallenge } = generatePKCEPair();
app.get("/login", async (req: Request, res: Response) => {
  try {
    const responseType = "response_type_code";
    const session = req.session as CustomSession;
    session.codeVerifier = codeVerifier;
    session.clientId = responseType;
    session.nonce = generateRandomString(28);
    session.state = generateRandomString(28);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: responseType,
      redirect_uri: "https://localhost:8080/callback",
      scope: "openid privilegiati",
      state: session.state,
      nonce: session.nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    const authRedirectUrl = `${authUrl}?${params.toString()}`;
    res.status(302).redirect((authRedirectUrl.toString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during login" });
  }
});
app.get("/hybrid", async (req: Request, res: Response) => {
  try {
    const responseType = "response_type_code_token";
    const session = req.session as CustomSession;
    session.clientId = responseType;
    session.nonce = generateRandomString(28);
    session.state = generateRandomString(28);
    const params = new URLSearchParams({
      response_type: "code token",
      client_id: responseType,
      redirect_uri: "https://localhost:3000/App.vue",
      scope: "openid profile",
      state: session.state,
      nonce: session.nonce,
    });
    const authRedirectUrl = `${authUrl}?${params.toString()}`;
    res.status(302).redirect((authRedirectUrl.toString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during login" });
  }
});
app.get("/implicit", async (req: Request, res: Response) => {
  try {
    const responseType = "response_type_code_id_token";
    const session = req.session as CustomSession;
    session.codeVerifier = codeVerifier;
    session.clientId = responseType;
    session.nonce = generateRandomString(28);
    session.state = generateRandomString(28);
    const params = new URLSearchParams({
      response_type: "code id_token",
      client_id: responseType,
      redirect_uri: "https://localhost:3000/App.vue",
      scope: "openid profile",
      state: session.state,
      nonce: session.nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    const authRedirectUrl = `${authUrl}?${params.toString()}`;
    res.status(302).redirect((authRedirectUrl.toString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during login" });
  }
});
app.get("/callback", async (req: Request, res: Response) => {
  const session = req.session as CustomSession;
  try {
    const code = req.query.code?.toString();
    if (!code) {
      throw new Error("Authorization code missing in callback URL");
    } else {
      const codeVerifier = session.codeVerifier;
      if (!codeVerifier) {
        throw new Error("Code verifier not found in session");
      } else {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "response_type_code",
          redirect_uri: "https://localhost:8080/callback",
          code: code,
          code_verifier: codeVerifier,
        });
        const tokenResponse = await fetch("https://localhost:8443/realms/myrealm/protocol/openid-connect/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        if (!tokenResponse.ok) {
          console.log(`Impossibile ottenere i token: ${tokenResponse.statusText}`);
        } else {
          const tokenData = await tokenResponse.json();
          const base64Url = tokenData.access_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const json = Buffer.from(base64, 'base64').toString('binary');
          const parsedJson = JSON.parse(json);
          const name = parsedJson.nonce;
          if (parsedJson.nonce != session.nonce) { console.log("nonce diverso"); } else {
            if ((url.parse(req.url, true).query.state) != session.state) { console.log("state diverso"); } else {
              session.tokenData = tokenData;
              res.status(302).redirect("https://localhost:8080/token");
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Errore durante lo scambio del codice:", error);
    res.status(500).json({ error: "Impossibile ottenere i token" });
  }
});
app.get("/resource", (req: Request, res: Response) => {
  const typee = req.query.type;
  const access_token_resource = req.query.access_token;
  const client_id_resource = "private_server";
  if (typee == "public") {
    res.send("contenuto del public resource server");
  } else if (typee == "private" && access_token_resource && client_id_resource) {
    evaluate(access_token_resource.toString(), client_id_resource.toString(), res);
    async function evaluate(access_token_resource: string, client_id_resource: string, res: any): Promise<any> {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      urlencoded.append("token", access_token_resource);
      urlencoded.append("client_id", client_id_resource);
      urlencoded.append("client_secret", "5XM3ChALFgB3oQ5ym0fW42O4aZgmQl1k");

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };

      const response = await fetch("https://localhost:8443/realms/myrealm/protocol/openid-connect/token/introspect", requestOptions);
      if (response.ok) {

        return res.send("this is a private resource file");
        //res.send(responseData);
      } else {
        console.error("ERROR: ", response.statusText);
        res.status(response.status).send(response.statusText);
      }
    }
  
  } else {
    res.status(400).send('Bad request');
  }
});
app.get("/token", (req: Request, res: Response) => {
  const session = req.session as CustomSession;
  const accessToken = session.tokenData.access_token;
  const idToken = session.tokenData.id_token;
  const refresh_token = session.tokenData.refresh_token;

  const redirectUrl = `https://localhost:3000/App.vue?access_token=${accessToken}&id_token=${idToken}&refresh_token=${refresh_token}`;
  res.status(302).redirect(redirectUrl);
});
app.get("/logout", (req: Request, res: Response) => {
  try {
    const logoutUrl = "https://localhost:8443/realms/myrealm/protocol/openid-connect/logout";
    const session = req.session as CustomSession;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: session.clientId || "my_default_client_id",
      post_logout_redirect_uri: "https://localhost:3000/App.vue",
    });
    const logoutRedirectUrl = `${logoutUrl}?${params.toString()}`;
    req.session.destroy((error) => {
      if (error) {
        console.error("Error destroying session:", error);
        res.status(500).json({ error: "Error during logout" });
      } else {
        res.status(302).redirect(logoutRedirectUrl);
      }
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Error during logout" });
  }
});
const PORT = 8080;

const httpsOptions = {
  key: fs.readFileSync('C:/Users/TBarbolani/Desktop/keycloak-23.0.6/keycloak-23.0.6/conf/kc.key'),
  cert: fs.readFileSync('C:/Users/TBarbolani/Desktop/keycloak-23.0.6/keycloak-23.0.6/conf/kc.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});