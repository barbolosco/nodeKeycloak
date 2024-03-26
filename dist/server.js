"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const url_1 = require("url");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    store: new express_session_1.default.MemoryStore(),
}));
function generateRandomString(length) {
    return Array.from(crypto_1.default.randomBytes(length))
        .map((byte) => ("0" + byte.toString(16)).substr(-2))
        .join("");
}
function generatePKCEPair() {
    const codeVerifier = generateRandomString(32);
    const codeChallenge = crypto_1.default.createHash("sha256").update(codeVerifier).digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    return { codeVerifier, codeChallenge };
}
app.get("/login1", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUrl = "http://localhost:8085/realms/myrealm/protocol/openid-connect/auth";
        const redirectUri = "http://localhost/callback.html";
        const responseType = req.query.responseType;
        const { codeVerifier, codeChallenge } = generatePKCEPair();
        const session = req.session;
        session.codeVerifier = codeVerifier;
        session.clientId = responseType;
        session.nonce = generateRandomString(28);
        session.state = generateRandomString(28);
        const params = new url_1.URLSearchParams({
            response_type: "code",
            client_id: responseType,
            redirect_uri: redirectUri,
            scope: "openid profile",
            state: session.state,
            nonce: session.nonce,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });
        const authRedirectUrl = `${authUrl}?${params.toString()}`;
        res.json({ authRedirectUrl });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error during login" });
    }
}));
app.get("/logout", (req, res) => {
    try {
        const logoutUrl = "http://localhost:8085/realms/myrealm/protocol/openid-connect/logout";
        const session = req.session;
        const clientId = session.clientId || "my_default_client_id";
        const redirectUri = "http://localhost/index.html";
        const params = new url_1.URLSearchParams({
            response_type: "code",
            client_id: clientId,
            post_logout_redirect_uri: redirectUri,
        });
        const logoutRedirectUrl = `${logoutUrl}?${params.toString()}`;
        req.session.destroy((error) => {
            if (error) {
                console.error("Error destroying session:", error);
                res.status(500).json({ error: "Error during logout" });
            }
            else {
                res.json({ logoutRedirectUrl });
            }
        });
    }
    catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ error: "Error during logout" });
    }
});
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
