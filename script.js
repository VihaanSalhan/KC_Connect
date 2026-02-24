const API = "/api/server";

async function signup() {
  const username = newuser.value;
  const password = newpass.value;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", username, password })
  });

  alert((await res.json()).message);
  window.location = "index.html";
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password })
  });

  const data = await res.json();

  if (data.message === "Login success") {
    localStorage.setItem("user", username);
    window.location = "home.html";
  } else {
    alert(data.message);
  }
}

async function addFriend() {
  const from = localStorage.getItem("user");
  const to = friendname.value;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addfriend", from, to })
  });

  alert("Request sent");
}