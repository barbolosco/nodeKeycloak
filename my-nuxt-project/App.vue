<template>
  <div class="container">
    <h1 class="heading">Welcome to My Page {{ name }}!</h1>
    <div class="dropdown">
      <label for="actions" class="label">Choose Login:</label>
      <select
        id="actions"
        v-model="selectedAction"
        @change="handleLogin"
        class="select"
      >
        <option value="">Choose Login:</option>
        <option value="login">Normal login</option>
        <option value="hybrid">Hybrid login</option>
        <option value="implicit">implicit login</option>
      </select>
      <div class="client-id">{{ clientId }}</div>
    </div>
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        Code
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'access_token' }"
        @click="activeTab = 'access_token'"
      >
        Access Token
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'id_token' }"
        @click="activeTab = 'id_token'"
      >
        ID Token
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'refresh' }"
        @click="activeTab = 'refresh'"
      >
        Refresh Token
        <button
          class="blue-rounded-btn"
          v-if="activeTab === 'refresh'"
          @click="refreshAccessToken"
          style="
            background-color: blue;
            color: white;
            border-radius: 20px;
            padding: 8px 7px;
            border: none;
            cursor: pointer;
          "
        >
          Go
        </button>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'response' }"
        @click="activeTab = 'response'"
      >
        <select
          id="actions"
          v-model="selectedAction1"
          @change="handleResource"
          class="select"
        >
          <option value="">Resource</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
          <option value="Premium">Premium</option>
        </select>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'user' }"
        @click="activeTab = 'user'"
      >
        User Info
      </button>
    </div>



    <div v-if="activeTab === 'id_token' || activeTab === 'access_token'">
      <input
        type="checkbox"
        id="toggle"
        v-model="isToggled"
        class="toggle-input"
      /><span class="toggle-message">{{ isToggled ? "On" : "Off" }}</span>
    </div>



    <div class="tab-content">
      <div class="token-data" v-if="activeTab === 'code'">{{ code }}</div>
      <div
        class="token-data"
        v-if="((activeTab === 'access_token') && (!isToggled))"
        @mouseover="decodeAccessToken"
      >
        {{ access_token }}
      </div>
      <div
        class="token-data"
        v-if="((activeTab === 'access_token') && (isToggled))"
        @mouseover="decodeAccessToken"
      >
        {{ token(access_token) }}
      </div>
      <div
        class="token-data"
        v-if="((activeTab === 'id_token') && (!isToggled))"
        @mouseover="decodeAccessToken"
      >
        {{ id_token }}
      </div>
      <div
        class="token-data"
        v-if="((activeTab === 'id_token') && (isToggled))"
        @mouseover="decodeAccessToken"
      >
        {{ token(id_token) }}
      </div>
      <div class="token-data" v-if="activeTab === 'refresh'">{{ refresh }}</div>
      <div class="token-data" v-if="activeTab === 'response'">
        {{ response }}
      </div>
      <div class="token-data" v-if="activeTab === 'user'" v-html="user"></div>
    </div>

    <button class="logout-btn" @click="handleLogout">Logout</button>
  </div>
  <div v-if="showLogss">
    {{ logs }} <button @click="deletee">delete logs</button>
  </div>
  <button @click="showLogs">show logs</button>
</template>

<script>
export default {
  data() {
    return {
      activeTab: "code",
      code: "",
      access_token: "",
      id_token: "",
      clientId: "",
      refresh: "",
      response: "",
      selectedAction: "",
      selectedAction1: "",
      name: "",
      user: "",
      logs: sessionStorage.getItem("logs"),
      showLogss: false,
      isToggled: false,
    };
  },
  methods: {
    token(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(json);
    },
    showLogs() {
      this.showLogss = !this.showLogss;
    },
    deletee() {
      sessionStorage.setItem("logs", "");
      this.logs = "";
    },
    handleLogin(event) {
      const selectedValue = event.target.value;
      switch (selectedValue) {
        case "login":
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked login|||||||||||")
          );
          sessionStorage.setItem("clientId", "response_type_code");
          window.location.href = "https://localhost:8080/login";

          break;
        case "hybrid":
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked hybrid|||||||||||")
          );
          sessionStorage.setItem("clientId", "response_type_code_token");
          window.location.href = "https://localhost:8080/hybrid";

          break;
        case "implicit":
          this.handleimplicit();
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked implicit|||||||||||")
          );
          break;
        default:
          console.log("Unhandled action:", selectedValue);
      }
    },
    handleResource(event) {
      const selectedValue1 = event.target.value;
      switch (selectedValue1) {
        case "Private":
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked private|||||||||||")
          );
          this.getPrivate();
          break;
        case "Public":
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked public|||||||||||")
          );
          this.getPublic();
          break;
        case "Premium":
          sessionStorage.setItem(
            "logs",
            (this.logs += "clicked premium|||||||||||")
          );
          const cleanedUrl = window.location.href.replace("#", "?");
          const params = new URLSearchParams(new URL(cleanedUrl).search);
          const AccessTooken = params.get("access_token");
          const parsedData = this.this.token(AccessTooken);
          const Response = parsedData.scope.toString();
          if (Response.includes("privilegiati")) {
            this.response =
              "this is the premium message because you are part of the privilegiati group";
          } else {
            this.response =
              "you can't view the premium message because you aren't part of the privilegiati group";
          }
          break;
        default:
          console.log("Unhandled action:", selectedValue1);
      }
    },
    async getPublic() {
      sessionStorage.setItem(
        "logs",
        (this.logs += "executing get public|||||||||||")
      );
      try {
        const response = await fetch(
          "https://localhost:8080/resource?type=public"
        );
        if (response.ok) {
          const data = await response.text();
          sessionStorage.setItem(
            "logs",
            (this.logs += "Fetched public resource|||||||||||")
          );
          this.response = data;
        } else {
          this.response = "Error: Unable to fetch public resource";
          sessionStorage.setItem(
            "logs",
            (this.logs += "Unable to fetch public resource|||||||||||")
          );
        }
      } catch (error) {
        sessionStorage.setItem(
          "logs",
          (this.logs += "Unable to fetch public resource|||||||||||")
        );
        console.error("Error:", error);
        this.response = "Error: Unable to fetch public resource";
      }
    },
    async getPrivate() {
      sessionStorage.setItem(
        "logs",
        (this.logs += "executing get private|||||||||||")
      );

      try {
        const cleanedUrl = window.location.href.replace("#", "?");
        const params = new URLSearchParams(new URL(cleanedUrl).search);
        const url =
          "https://localhost:8080/resource?type=private&access_token=" +
          (params.get("access_token") ||
            sessionStorage.getItem("accessToken")) +
          "&client_id=" +
          sessionStorage.getItem("clientId");
        const response = await fetch(url);
        if (response.ok) {
          sessionStorage.setItem(
            "logs",
            (this.logs += "fetched private resource|||||||||||")
          );
          const data = await response.text();
          this.response = data;
        } else {
          sessionStorage.setItem(
            "logs",
            (this.logs += "Unable to fetch private resource|||||||||||")
          );
        }
      } catch (error) {
        console.error("Error:", error);
        sessionStorage.setItem(
          "logs",
          (this.logs += "Unable to fetch private resource|||||||||||")
        );
        this.response = "Error: Unable to fetch public resource";
      }
    },
    handleimplicit() {
      sessionStorage.setItem(
        "logs",
        (this.logs += "executing implicit|||||||||||")
      );

      const state = Array.from(
        window.crypto.getRandomValues(new Uint32Array(28)),
        (dec) => ("0" + dec.toString(16)).substr(-2)
      ).join("");
      const nonce = Array.from(
        window.crypto.getRandomValues(new Uint32Array(28)),
        (dec) => ("0" + dec.toString(16)).substr(-2)
      ).join("");
      const clientid = "response_type_token_id_token";
      const authUrl =
        "https://localhost:8443/realms/myrealm/protocol/openid-connect/auth";
      const redirectUri = "https://localhost:3000/App.vue";
      const scope = "openid profile";
      const type = "id_token token";

      const url = new URL(authUrl);
      const params = new URLSearchParams(url.search);
      params.set("response_type", type);
      params.set("response_mode", "query");
      params.set("client_id", clientid);
      params.set("redirect_uri", redirectUri);
      params.set("scope", scope);
      params.set("state", state);
      params.set("nonce", nonce);
      url.search = params.toString();

      try {
        sessionStorage.setItem(
          "logs",
          (this.logs += "is going to the url|||||||||||")
        );
        window.location.href = url.toString();
      } catch (error) {
        sessionStorage.setItem(
          "logs",
          (this.logs += "executing implicit|||||||||||")
        );
      }
    },
    handleLogout() {
      sessionStorage.setItem("logs", (this.logs += "logging out|||||||||||"));
      if (
        sessionStorage.getItem("clientId") == null &&
        sessionStorage.getItem("clientId") == undefined
      ) {
        sessionStorage.setItem(
          "logs",
          (this.logs += "you have not a client|||||||||||")
        );
        alert("you are not logged in/no response type detected");
        window.location.href = "https://localhost:8080/implicit";
      } else {
        sessionStorage.setItem(
          "logs",
          (this.logs += "you have a client|||||||||||")
        );
        const url = new URL(
          "https://localhost:8443/realms/myrealm/protocol/openid-connect/logout"
        );
        url.searchParams.set(
          "response_type",
          sessionStorage.getItem("clientId")
        );
        url.searchParams.set("client_id", sessionStorage.getItem("clientId"));
        url.searchParams.set(
          "post_logout_redirect_uri",
          "https://localhost:3000/App.vue"
        );
        window.location.href = url.toString();

        sessionStorage.setItem("clientId", "");
        sessionStorage.setItem("refresh_token", "");
        this.refresh = "";
      }
    },
    refreshAccessToken() {
      sessionStorage.setItem(
        "logs",
        (this.logs += "refresh token is refreshing|||||||||||")
      );
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      const cleanedUrl = window.location.href.replace("#", "?");
      const params = new URLSearchParams(new URL(cleanedUrl).search);
      const urlencoded = new URLSearchParams();
      urlencoded.append("client_id", sessionStorage.getItem("clientId"));
      urlencoded.append("grant_type", "refresh_token");
      console.log(params.get("refresh_token"));
      urlencoded.append("refresh_token", params.get("refresh_token"));

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      };

      fetch(
        "https://localhost:8443/realms/myrealm/protocol/openid-connect/token",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          const at = JSON.parse(result).access_token;
          const idtoken = JSON.parse(result).id_token;
          const rtoken = JSON.parse(result).refresh_token;
          this.access_token = at;
          this.id_token = idtoken;
          this.refresh = rtoken;
          sessionStorage.setItem(
            "logs",
            (this.logs +=
              "rechieved a result in refreshed token call|||||||||||")
          );
          if (!this.refreh) {
            sessionStorage.setItem(
              "logs",
              (this.logs += "not refreshed token|||||||||||")
            );
          } else {
            sessionStorage.setItem(
              "logs",
              (this.logs += "i m secure i refreshed the token|||||||||||")
            );
          }
        })
        .catch((error) => {
          console.error(error);
          sessionStorage.setItem(
            "logs",
            (this.logs += "error in refreshing token|||||||||||")
          );
        });
    },
    authenticate(params) {
      sessionStorage.setItem(
        "logs",
        (this.logs += "try to authenticate|||||||||||")
      );
      // Authentication logic
      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/x-www-form-urlencoded");
      const urlencoded = new URLSearchParams();
      urlencoded.append("grant_type", "authorization_code");
      urlencoded.append("client_id", sessionStorage.getItem("clientId"));
      urlencoded.append("redirect_uri", "https://localhost:3000/App.vue");
      urlencoded.append("code", params.get("code"));

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      };

      fetch(
        "https://localhost:8443/realms/myrealm/protocol/openid-connect/token",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          sessionStorage.setItem("id_token", JSON.parse(result).id_token);
          sessionStorage.setItem(
            "access_token",
            JSON.parse(result).access_token
          );
          sessionStorage.setItem(
            "refresh_token",
            JSON.parse(result).refresh_token
          );
          sessionStorage.setItem(
            "logs",
            (this.logs += "authenticated|||||||||||")
          );
        })
        .catch((error) => {
          console.error("Error during authentication:", error);
          document.getElementById("callback").textContent = error;
          sessionStorage.setItem(
            "logs",
            (this.logs += "not authenticated|||||||||||")
          );
        });
    },

    parseAccessToken(accessToken) {
      sessionStorage.setItem(
        "logs",
        (this.logs += "parsing access token|||||||||||")
      );
      try {
        const parsedData = this.token(accessToken);
        this.user =
          "name:  " +
          (parsedData.name || "") +
          "<br>" +
          "email:  " +
          (parsedData.email || "") +
          "<br>" +
          "preferred_username:  " +
          (parsedData.preferred_username || "");
        +"<br>" + "scope:  " + (parsedData.scope || "");
      } catch (error) {
        console.error("Error parsing access token:", error);
      }
    },
  },
  mounted() {
    // Parse URL parameters
    const cleanedUrl = window.location.href.replace("#", "?");
    const params = new URLSearchParams(new URL(cleanedUrl).search);

    // Authenticate if the clientId is set
    if (sessionStorage.getItem("clientId") === "response_type_code_token") {
      this.authenticate(params);
    }

    // Set code from parameters
    this.code = params.get("code");

    // Set access token
    let accessToken =
      params.get("access_token") || sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("Access token not available.");
    }
    this.access_token = accessToken;

    // Set ID token
    let idToken = params.get("id_token") || sessionStorage.getItem("idToken");
    if (!idToken) {
      console.error("ID token not available.");
    }
    this.id_token = idToken;

    // Set refresh token
    let refreshToken =
      params.get("refresh_token") || sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error("Refresh token not available.");
    }
    this.refresh = refreshToken;

    // Parse access token and extract user information
    if (accessToken) {
      this.parseAccessToken(accessToken);
    } else {
      console.error("Access token not available for user data processing.");
    }
  },
};
</script>
<style scoped>
@import "@/assets/style.css";
</style>
