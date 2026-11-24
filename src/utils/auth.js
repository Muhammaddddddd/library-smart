const USER_KEY = "user";
const LOGGED_IN_KEY = "loggedIn";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function login() {
  localStorage.setItem(LOGGED_IN_KEY, "true");
}

export function logout() {
  localStorage.removeItem(LOGGED_IN_KEY);
}

export function isLoggedIn() {
  return localStorage.getItem(LOGGED_IN_KEY) === "true" && getUser() !== null;
}