async function  evaluate (access_token_resource: string,client_id_resource: string): Promise<any>{

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", access_token);
  urlencoded.append("client_id", client_id_resource);
  urlencoded.append("client_secret", "5XM3ChALFgB3oQ5ym0fW42O4aZgmQl1k");
  
  const requestOptions :RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };
  
  const response = await fetch("http://keycloak.local:8085/realms/myrealm/protocol/openid-connect/token/introspect", requestOptions);
  if (response.ok) {
      const responseData = await response.text();
      console.log("introspector: ",responseData);
      return responseData;
      //res.send(responseData);
      
      
  }  else {
      console.error("ERROR: ", response.statusText);
      res.status(response.status).send(response.statusText);
  }
  

  }