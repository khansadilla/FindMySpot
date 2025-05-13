// Declare firebase as a global variable to avoid errors
var firebase = firebase || {}

// Initialize Firebase and handle parking slot updates
document.addEventListener("DOMContentLoaded", () => {
  // Set current date
  const now = new Date()
  const options = { day: "numeric", month: "short" }
  document.getElementById("current-date").textContent = now.toLocaleDateString("en-US", options)

  // Initialize last updated time
  const lastUpdatedTime = new Date()
  updateLastUpdatedTime()

  // Start timer to update "minutes ago" text
  setInterval(updateLastUpdatedTime, 60000) // Update every minute

  // Initialize Firebase
  initializeFirebase()

  // Add refresh button functionality
  document.getElementById("refresh-button").addEventListener("click", () => {
    refreshData()
  })
})

// Function to update the "last updated" time display
function updateLastUpdatedTime() {
  const now = new Date()
  const lastUpdated = document.getElementById("last-updated")
  const diffInMinutes = Math.floor((now - lastUpdatedTime) / 60000)
  lastUpdated.textContent = diffInMinutes
}

// Function to refresh data
function refreshData() {
  const refreshButton = document.getElementById("refresh-button")
  refreshButton.disabled = true
  refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...'

  // Simulate refresh delay
  setTimeout(() => {
    // Update the last updated time
    lastUpdatedTime = new Date()
    updateLastUpdatedTime()

    // Re-enable the refresh button
    refreshButton.disabled = false
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status'

    // Force a re-read from Firebase
    const database = firebase.database()
    const slotRef = database.ref()
    slotRef
      .once("value")
      .then((snapshot) => {
        console.log("Data refreshed from Firebase")
      })
      .catch((error) => {
        console.error("Error refreshing data:", error)
      })
  }, 1000)
}

// Function to initialize Firebase
function initializeFirebase() {
  try {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBtgVIVierhgo0jUXCbHBvMtLlRBzSEmp8",
      authDomain: "findmyspot-88397.firebaseapp.com",
      databaseURL: "https://findmyspot-88397-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "findmyspot-88397",
      storageBucket: "findmyspot-88397.firebasestorage.app",
      messagingSenderId: "428682515015",
      appId: "1:428682515015:web:9f809579d54d201cbd9762",
      measurementId: "G-0NH31RNKMX",
    }

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig)
    const database = firebase.database()

    // Update connection status
    updateConnectionStatus("connecting", "Connecting to Firebase...")

    // Check Firebase connection
    const connectedRef = firebase.database().ref(".info/connected")
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        updateConnectionStatus("connected", "Connected to Firebase")
      } else {
        updateConnectionStatus("disconnected", "Disconnected from Firebase")
      }
    })

    // Get data from Firebase and display slot status
    const slotRef = database.ref()
    slotRef.on(
      "value",
      (snapshot) => {
        console.log("Data from Firebase: ", snapshot.val())

        const data = snapshot.val()
        if (data) {
          // Update each slot with its status from Firebase
          for (let i = 1; i <= 4; i++) {
            const slotKey = `slot${i}`
            const slotData = data[slotKey]

            if (slotData && slotData.status) {
              updateSlot(slotKey, slotData.status)
            } else {
              console.warn(`No data found for ${slotKey}`)
              updateSlot(slotKey, "unknown")
            }
          }

          // Update occupied count
          updateOccupiedCount(data)

          // Update last updated time
          lastUpdatedTime = new Date()
          updateLastUpdatedTime()
        } else {
          updateConnectionStatus("disconnected", "No data found in Firebase")
          console.warn("No data received from Firebase")
        }
      },
      (error) => {
        console.error("Error reading data: ", error)
        updateConnectionStatus("disconnected", "Error connecting to Firebase")
      },
    )

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Error setting up Firebase:", error)
    updateConnectionStatus("disconnected", "Failed to setup Firebase")
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

// Function to update connection status
function updateConnectionStatus(status, message) {
  const connectionStatus = document.getElementById("connection-status")
  const statusIndicator = connectionStatus.querySelector(".status-indicator")
  const statusText = connectionStatus.querySelector(".status-text")

  statusIndicator.className = "status-indicator " + status
  statusText.textContent = message

  // Hide connection status after 5 seconds if connected
  if (status === "connected") {
    setTimeout(() => {
      connectionStatus.style.display = "none"
    }, 5000)
  } else {
    connectionStatus.style.display = "flex"
  }
}

// Track previous slot statuses to detect changes
const previousStatuses = {
  slot1: null,
  slot2: null,
  slot3: null,
  slot4: null,
}

// Function to update slot UI
function updateSlot(slotId, status) {
  const slotElement = document.getElementById(slotId)
  if (!slotElement) {
    console.error(`Element with ID ${slotId} not found`)
    return
  }

  console.log(`Updating ${slotId} with status: ${status}`)

  // Remove all status classes
  slotElement.classList.remove("empty", "occupied", "unknown")

  // Add appropriate class based on status
  if (status === "empty") {
    slotElement.classList.add("empty")
  } else if (status === "occupied") {
    slotElement.classList.add("occupied")
  } else {
    slotElement.classList.add("unknown")
  }

  // Add animation for status change
  slotElement.classList.add("status-changed")
  setTimeout(() => {
    slotElement.classList.remove("status-changed")
  }, 500)
}

// Function to update summary counts
function updateSummary(data) {
  let emptyCount = 0
  let occupiedCount = 0

  // Count slots by status
  for (let i = 1; i <= 4; i++) {
    const slotKey = `slot${i}`
    const status = data[slotKey]?.status

    if (status === "empty") {
      emptyCount++
    } else if (status === "occupied") {
      occupiedCount++
    }
  }

  // Update summary elements
  document.getElementById("available-count").textContent = emptyCount
  document.getElementById("occupied-count").textContent = occupiedCount
}

// Function to update occupied count
function updateOccupiedCount(data) {
  let occupiedCount = 0

  // Count occupied slots
  for (let i = 1; i <= 4; i++) {
    const slotKey = `slot${i}`
    const status = data[slotKey]?.status

    if (status === "occupied") {
      occupiedCount++
    }
  }

  // Update counter in header
  document.getElementById("occupied-count").textContent = occupiedCount
}

// Global variable for last updated time
let lastUpdatedTime = new Date()
