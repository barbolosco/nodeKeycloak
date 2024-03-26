export default {
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
      case "login1":
        sessionStorage.setItem(
          "logs",
          (this.logs += "clicked login1|||||||||||")
        );
        sessionStorage.setItem("clientId", "response_type_code");
        window.location.href = "http://localhost:8080/login1";

        break;
      case "login4":
        sessionStorage.setItem(
          "logs",
          (this.logs += "clicked login4|||||||||||")
        );
        sessionStorage.setItem("clientId", "response_type_code_token");
        window.location.href = "http://localhost:8080/login4";

        break;
      case "login5":
        this.handleLogin5();
        sessionStorage.setItem(
          "logs",
          (this.logs += "clicked login5|||||||||||")
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
        const base64Url = AccessTooken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const parsedData = JSON.parse(json);
        const Response = parsedData.scope.toString();
        if (Response.includes("privilegiati")) {
          this.response =
            "this is the premium message because you are part of the privilegiati group";
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
        "http://localhost:8080/resource?type=public"
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
        "http://localhost:8080/resource?type=private&access_token=" +
        (params.get("access_token") || sessionStorage.getItem("accessToken")) +
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
  handleLogin5() {
    sessionStorage.setItem(
      "logs",
      (this.logs += "executing login5|||||||||||")
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
    const redirectUri = "http://localhost:3000/App.vue";
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
        (this.logs += "executing login5|||||||||||")
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
      window.location.href = "http://localhost:8080/login5";
    } else {
      sessionStorage.setItem(
        "logs",
        (this.logs += "you have a client|||||||||||")
      );
      const url = new URL(
        "https://localhost:8443/realms/myrealm/protocol/openid-connect/logout"
      );
      url.searchParams.set("response_type", sessionStorage.getItem("clientId"));
      url.searchParams.set("client_id", sessionStorage.getItem("clientId"));
      url.searchParams.set(
        "post_logout_redirect_uri",
        "http://localhost:3000/App.vue"
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
          (this.logs += "rechieved a result in refreshed token call|||||||||||")
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
    urlencoded.append("redirect_uri", "http://localhost:3000/App.vue");
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
        sessionStorage.setItem("access_token", JSON.parse(result).access_token);
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
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const parsedData = JSON.parse(json);
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
};
