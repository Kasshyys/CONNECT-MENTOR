// ✅ Import Firebase (using module CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYMCVwwGLSTYeCpa63WCSSJduIdLXLUco",
  authDomain: "mentor-connect0.firebaseapp.com",
  projectId: "mentor-connect0",
  storageBucket: "mentor-connect0.appspot.com",
  messagingSenderId: "485221978277",
  appId: "1:485221978277:web:2757391e921e582319fd4c"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Toggle tag active state
const tags = document.querySelectorAll(".tag");
tags.forEach((tag) => {
  tag.addEventListener("click", () => {
    tag.classList.toggle("active");
  });
});

// ✅ Handle form submit with Firestore
document.getElementById("mentorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  alert("🚀 Form Submit Triggered!"); // Debug message

  // Collect data from form
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone")?.value.trim() || "";
  const password = document.getElementById("password")?.value.trim() || "";
  const profession = document.getElementById("profession")?.value || "";
  const languages = document.getElementById("languages")?.value.trim() || "";

  const level = document.querySelector('input[name="level"]:checked')?.value || "";
  const mode = document.querySelector('input[name="mode"]:checked')?.value || "";

  const interests = Array.from(document.querySelectorAll(".tag.active")).map(
    (tag) => tag.textContent.trim()
  );

  const topics = Array.from(
    document.querySelectorAll(".checkbox-group input[type='checkbox']:checked")
  ).map((box) => box.parentElement.textContent.trim());

  try {
    await addDoc(collection(db, "mentees"), {
      name,
      email,
      phone,
      password,
      profession,
      level,
      mode,
      interests,
      topics,
      languages,
      timestamp: new Date(),
    });

    alert("✅ Data Saved Successfully!");

    // Reset form and tags
    document.getElementById("mentorForm").reset();
    tags.forEach((tag) => tag.classList.remove("active"));
  } catch (error) {
    console.error(error);
    alert("❌ Error: " + error.message);
  }
});
