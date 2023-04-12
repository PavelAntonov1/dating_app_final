export function setUser(user) {
  return {
    type: "SET_USER",
    payload: user,
  };
}

export function logIn() {
  return {
    type: "LOG_IN",
  };
}

export function logOut() {
  return {
    type: "LOG_OUT",
  };
}

export function setLoading(isLoading) {
  return {
    type: "LOADING",
    payload: isLoading,
  };
}

export function setError(error) {
  return {
    type: "SET_ERROR",
    payload: error,
  };
}
