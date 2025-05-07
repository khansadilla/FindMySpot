// Declare firebase as a global variable to avoid errors
var firebase = firebase || {}

// Firebase configuration and initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with default values to show the UI even without Firebase
  initializeParkingUI()

  // Try to connect to Firebase
  initializeFirebase()
})

// Function to initialize the UI with default values
function initializeParkingUI() {
  const slots = [
    { id: "slot1", initialStatus: "empty" },
    { id: "slot2", initialStatus: "empty" },
    { id: "slot3", initialStatus: "empty" },
    { id: "slot4", initialStatus: "empty" },
  ]

  // Set initial UI state
  const slotStatuses = {}
  slots.forEach((slot) => {
    slotStatuses[slot.id] = slot.initialStatus
    updateSlotUI(slot.id, slot.initialStatus)
  })

  updateAvailableCount(slotStatuses)
}

// Function to initialize Firebase
function initializeFirebase() {
  try {
    // Import Firebase modules using a more compatible approach
    const firebaseScript = document.createElement("script")
    firebaseScript.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
    firebaseScript.onload = () => {
      const databaseScript = document.createElement("script")
      databaseScript.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"
      databaseScript.onload = setupFirebase
      document.head.appendChild(databaseScript)
    }
    document.head.appendChild(firebaseScript)
  } catch (error) {
    console.error("Error loading Firebase:", error)
    showConnectionStatus("Failed to load Firebase. Check console for details.", "error")
  }
}

// Setup Firebase after scripts are loaded
function setupFirebase() {
  try {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBxJAZxfeMYoZfVe5b4QVP4H-Xg9ZC1gvs",
      authDomain: "findmyspot-parking.firebaseapp.com",
      databaseURL: "https://findmyspot-parking-default-rtdb.firebaseio.com",
      projectId: "findmyspot-parking",
      storageBucket: "findmyspot-parking.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abc123def456ghi789jkl",
    }

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig)
    const database = firebase.database()

    // Set up real-time listeners for each slot
    for (let i = 1; i <= 4; i++) {
      const slotId = `slot${i}`
      const slotRef = database.ref(`/${slotId}/status`)

      slotRef.on(
        "value",
        (snapshot) => {
          const status = snapshot.val() || "unknown"
          updateSlotUI(slotId, status)
          updateSlotStatus(slotId, status)

          // Log data received from ESP32
          console.log(`Data received from ESP32 for ${slotId}: ${status}`)
        },
        (error) => {
          console.error(`Error reading ${slotId}:`, error)
          showConnectionStatus(`Error reading ${slotId}: ${error.message}`, "error")
        },
      )
    }

    // Monitor connection state
    const connectedRef = database.ref(".info/connected")
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        showConnectionStatus("Connected to Firebase. Receiving real-time updates from ESP32 sensors.", "success")
      } else {
        showConnectionStatus("Disconnected from Firebase. Waiting for connection...", "warning")
      }
    })

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Error setting up Firebase:", error)
    showConnectionStatus("Failed to setup Firebase. Check console for details.", "error")
  }
}

// Track all slot statuses
const slotStatuses = {
  slot1: "unknown",
  slot2: "unknown",
  slot3: "unknown",
  slot4: "unknown",
}

// Update slot status in our tracking object
function updateSlotStatus(slotId, status) {
  slotStatuses[slotId] = status
  updateAvailableCount(slotStatuses)
}

// Function to update the UI based on slot status
function updateSlotUI(slotId, status) {
  const slotElement = document.getElementById(slotId)
  if (!slotElement) return

  if (status === "empty") {
    slotElement.className = "parking-slot empty"
    slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Empty`
  } else if (status === "occupied") {
    slotElement.className = "parking-slot occupied"
    slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Occupied`
  } else {
    slotElement.className = "parking-slot unknown"
    slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Unknown`
  }

  // Add last updated timestamp
  const now = new Date()
  slotElement.setAttribute("data-last-updated", now.toLocaleTimeString())

  // Add a small indicator for last update time
  const timeIndicator = document.createElement("div")
  timeIndicator.className = "update-time"
  timeIndicator.textContent = `Updated: ${now.toLocaleTimeString()}`

  // Remove any existing time indicator
  const existingIndicator = slotElement.querySelector(".update-time")
  if (existingIndicator) {
    slotElement.removeChild(existingIndicator)
  }

  slotElement.appendChild(timeIndicator)
}

// Function to update available spots count
function updateAvailableCount(slotStatuses) {
  const availableCount = Object.values(slotStatuses).filter((status) => status === "empty").length
  const availableCountElement = document.getElementById("available-count")
  if (availableCountElement) {
    availableCountElement.textContent = `Available spots: ${availableCount} of 4`
  }
}

// Function to show connection status
function showConnectionStatus(message, type) {
  const statusElement = document.getElementById("connection-status")
  if (statusElement) {
    statusElement.textContent = message
    statusElement.className = `connection-status ${type}`
  }
}
