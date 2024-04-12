function CheckAuth(data) {
  if (data?.token) {
    sessionStorage.setItem("Token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    return data.token;
  } else {
    // Check if session storage is present
    token = sessionStorage.getItem("Token");
    if (!token) {
      //Show a html dialog box to enter the token

      const setToken = () => {
        let token = prompt("Please enter your token", "");
        if (token != null) {
          sessionStorage.setItem("Token", token);
          return token;
        }
        setToken();
      };

      setToken();
    }

    return token;
  }
}
