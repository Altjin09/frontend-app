const SOAP_URL = "https://orca-app-2-r3hld.ondigitalocean.app/ws";
const JSON_URL = "https://squid-app-jpwir.ondigitalocean.app";
const FILE_URL = "https://orca-app-ua4oq.ondigitalocean.app";
let uploadedImageUrl = "";

// -----------------------------
// Utility functions
// -----------------------------
function escapeXml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getToken() {
  return localStorage.getItem("token");
}

function setOutput(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent =
      typeof message === "string" ? message : JSON.stringify(message, null, 2);
  }
}

function showPreview(url) {
  const preview = document.getElementById("previewImage");
  if (!preview) return;

  if (url) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}

function collectProfileForm() {
  return {
    name: document.getElementById("name")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    bio: document.getElementById("bio")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    imageUrl: uploadedImageUrl || ""
  };
}

// -----------------------------
// SOAP: Register
// -----------------------------
async function registerUser() {
  const username = document.getElementById("regUsername")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  if (!username || !password) {
    setOutput("registerResult", "Username болон password оруулна уу.");
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
    setOutput("registerResult", text);
  } catch (err) {
    setOutput("registerResult", "Register алдаа: " + err.message);
  }
}

// -----------------------------
// SOAP: Login
// -----------------------------
async function loginUser() {
  const username = document.getElementById("loginUsername")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!username || !password) {
    setOutput("loginResult", "Username болон password оруулна уу.");
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
    setOutput("loginResult", text);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const tokenNode = xmlDoc.getElementsByTagName("token")[0];
    const messageNode = xmlDoc.getElementsByTagName("message")[0];

    const token = tokenNode ? tokenNode.textContent.trim() : "";
    const message = messageNode ? messageNode.textContent.trim() : "";

    if (token && message === "Login success") {
      localStorage.setItem("token", token);
      window.location.href = "index.html";
    }
  } catch (err) {
    setOutput("loginResult", "Login алдаа: " + err.message);
  }
}

// -----------------------------
// File upload
// -----------------------------
async function uploadImage() {
  const token = getToken();
  const fileInput = document.getElementById("profileImage");
  const file = fileInput?.files?.[0];

  if (!token) {
    alert("Эхлээд login хийнэ үү.");
    return;
  }

  if (!file) {
    alert("Зураг сонгоно уу.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${FILE_URL}/files/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    uploadedImageUrl = data.url || "";
    showPreview(uploadedImageUrl);

    alert("Зураг амжилттай upload хийгдлээ.");
  } catch (error) {
    console.error(error);
    alert("Upload алдаа: " + error.message);
  }
}

// -----------------------------
// JSON: Create profile
// -----------------------------
async function createProfile() {
  const token = getToken();

  if (!token) {
    setOutput("profileResult", "Эхлээд login хийнэ үү.");
    return;
  }

  const body = collectProfileForm();

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
    setOutput("profileResult", data);

    if (data.imageUrl) {
      uploadedImageUrl = data.imageUrl;
      showPreview(data.imageUrl);
    }
  } catch (err) {
    setOutput("profileResult", "Create profile алдаа: " + err.message);
  }
}

// -----------------------------
// JSON: Get profile
// -----------------------------
async function getProfile() {
  const token = getToken();
  const id = document.getElementById("profileId")?.value.trim();

  if (!token) {
    setOutput("profileResult", "Эхлээд login хийнэ үү.");
    return;
  }

  if (!id) {
    setOutput("profileResult", "Profile ID оруулна уу.");
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
    setOutput("profileResult", data);

    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("bio").value = data.bio || "";
    document.getElementById("phone").value = data.phone || "";

    if (data.imageUrl) {
      uploadedImageUrl = data.imageUrl;
      showPreview(data.imageUrl);
    } else {
      uploadedImageUrl = "";
      showPreview("");
    }
  } catch (err) {
    setOutput("profileResult", "Get profile алдаа: " + err.message);
  }
}

// -----------------------------
// JSON: Update profile
// -----------------------------
async function updateProfile() {
  const token = getToken();
  const id = document.getElementById("profileId")?.value.trim();

  if (!token) {
    setOutput("profileResult", "Эхлээд login хийнэ үү.");
    return;
  }

  if (!id) {
    setOutput("profileResult", "Profile ID оруулна уу.");
    return;
  }

  const body = collectProfileForm();

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
    setOutput("profileResult", data);

    if (body.imageUrl) {
      showPreview(body.imageUrl);
    }
  } catch (err) {
    setOutput("profileResult", "Update profile алдаа: " + err.message);
  }
}

// -----------------------------
// JSON: Delete profile
// -----------------------------
async function deleteProfile() {
  const token = getToken();
  const id = document.getElementById("profileId")?.value.trim();

  if (!token) {
    setOutput("profileResult", "Эхлээд login хийнэ үү.");
    return;
  }

  if (!id) {
    setOutput("profileResult", "Profile ID оруулна уу.");
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
    setOutput("profileResult", text);

    uploadedImageUrl = "";
    showPreview("");
  } catch (err) {
    setOutput("profileResult", "Delete profile алдаа: " + err.message);
  }
}

// -----------------------------
// Logout
// -----------------------------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}