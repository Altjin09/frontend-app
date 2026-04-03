const SOAP_URL = "https://user-soap-service-vk5h.onrender.com/ws";
const JSON_URL = "https://user-json-service-acfz.onrender.com/ws";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function registerUser() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const output = document.getElementById("registerResult");

  if (!username || !password) {
    output.textContent = "Username болон password оруулна уу.";
    return;
  }

  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:lab="http://lab.com/soap">
      <soapenv:Header/>
      <soapenv:Body>
        <lab:registerUserRequest>
          <lab:username>${escapeXml(username)}</lab:username>
          <lab:password>${escapeXml(password)}</lab:password>
        </lab:registerUserRequest>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const res = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8"
      },
      body: soapBody
    });

    const text = await res.text();
    output.textContent = text;
  } catch (err) {
    output.textContent = "Register алдаа: " + err.message;
  }
}

async function loginUser() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const output = document.getElementById("loginResult");

  if (!username || !password) {
    output.textContent = "Username болон password оруулна уу.";
    return;
  }

  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:lab="http://lab.com/soap">
      <soapenv:Header/>
      <soapenv:Body>
        <lab:loginUserRequest>
          <lab:username>${escapeXml(username)}</lab:username>
          <lab:password>${escapeXml(password)}</lab:password>
        </lab:loginUserRequest>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const res = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8"
      },
      body: soapBody
    });

    const text = await res.text();
    output.textContent = text;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const tokenNode = xmlDoc.getElementsByTagName("token")[0];
    const messageNode = xmlDoc.getElementsByTagName("message")[0];

    const token = tokenNode ? tokenNode.textContent : "";
    const message = messageNode ? messageNode.textContent : "";

    if (token && message === "Login success") {
      localStorage.setItem("token", token);
      window.location.href = "profile.html";
    }
  } catch (err) {
    output.textContent = "Login алдаа: " + err.message;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

async function createProfile() {
  const output = document.getElementById("profileResult");
  const token = getToken();

  if (!token) {
    output.textContent = "Эхлээд login хийнэ үү.";
    return;
  }

  const body = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    phone: document.getElementById("phone").value.trim()
  };

  try {
    const res = await fetch(`${JSON_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Create profile алдаа: " + err.message;
  }
}

async function getProfile() {
  const output = document.getElementById("profileResult");
  const token = getToken();
  const id = document.getElementById("profileId").value.trim();

  if (!token) {
    output.textContent = "Эхлээд login хийнэ үү.";
    return;
  }

  if (!id) {
    output.textContent = "Profile ID оруулна уу.";
    return;
  }

  try {
    const res = await fetch(`${JSON_URL}/users/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (data.name !== undefined) document.getElementById("name").value = data.name || "";
    if (data.email !== undefined) document.getElementById("email").value = data.email || "";
    if (data.bio !== undefined) document.getElementById("bio").value = data.bio || "";
    if (data.phone !== undefined) document.getElementById("phone").value = data.phone || "";
  } catch (err) {
    output.textContent = "Get profile алдаа: " + err.message;
  }
}

async function updateProfile() {
  const output = document.getElementById("profileResult");
  const token = getToken();
  const id = document.getElementById("profileId").value.trim();

  if (!token) {
    output.textContent = "Эхлээд login хийнэ үү.";
    return;
  }

  if (!id) {
    output.textContent = "Profile ID оруулна уу.";
    return;
  }

  const body = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    phone: document.getElementById("phone").value.trim()
  };

  try {
    const res = await fetch(`${JSON_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Update profile алдаа: " + err.message;
  }
}

async function deleteProfile() {
  const output = document.getElementById("profileResult");
  const token = getToken();
  const id = document.getElementById("profileId").value.trim();

  if (!token) {
    output.textContent = "Эхлээд login хийнэ үү.";
    return;
  }

  if (!id) {
    output.textContent = "Profile ID оруулна уу.";
    return;
  }

  try {
    const res = await fetch(`${JSON_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await res.text();
    output.textContent = text;
  } catch (err) {
    output.textContent = "Delete profile алдаа: " + err.message;
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}