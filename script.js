// Declare firebase as a global variable to avoid errors
var firebase = firebase || {}

// Global variables
const lastUpdatedTime = new Date()
let selectedCarColor = "#FF9800"
let selectedCarStyle = "sedan"
let selectedSlot = "all"
let carSize = "large" // Default to large cars

// Initialize Firebase and handle parking slot updates
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Firebase
  initializeFirebase()

  // Add refresh button functionality
  document.getElementById("refresh-button").addEventListener("click", () => {
    refreshData()
  })

  // Initialize car customization panel
  initializeCarCustomization()

  // Add test buttons for development
  addTestButtons()
})

// Function to add test buttons for development
function addTestButtons() {
  // Create a container for test buttons
  const testContainer = document.createElement("div")
  testContainer.className = "test-buttons"
  testContainer.style.position = "fixed"
  testContainer.style.bottom = "10px"
  testContainer.style.right = "10px"
  testContainer.style.zIndex = "1000"
  testContainer.style.display = "flex"
  testContainer.style.flexDirection = "column"
  testContainer.style.gap = "5px"

  // Add buttons for each slot
  for (let i = 1; i <= 4; i++) {
    const slotId = `slot${i}`

    // Empty button
    const emptyBtn = document.createElement("button")
    emptyBtn.textContent = `Set ${slotId} Empty`
    emptyBtn.style.padding = "5px"
    emptyBtn.style.fontSize = "10px"
    emptyBtn.style.backgroundColor = "#4CAF50"
    emptyBtn.style.color = "white"
    emptyBtn.style.border = "none"
    emptyBtn.style.borderRadius = "3px"
    emptyBtn.style.cursor = "pointer"
    emptyBtn.onclick = () => testEmpty(slotId)

    // Occupied button
    const occupiedBtn = document.createElement("button")
    occupiedBtn.textContent = `Set ${slotId} Occupied`
    occupiedBtn.style.padding = "5px"
    occupiedBtn.style.fontSize = "10px"
    occupiedBtn.style.backgroundColor = "#F44336"
    occupiedBtn.style.color = "white"
    occupiedBtn.style.border = "none"
    occupiedBtn.style.borderRadius = "3px"
    occupiedBtn.style.cursor = "pointer"
    occupiedBtn.onclick = () => testOccupied(slotId)

    testContainer.appendChild(emptyBtn)
    testContainer.appendChild(occupiedBtn)
  }

  document.body.appendChild(testContainer)
}

// Function to initialize car customization
function initializeCarCustomization() {
  // Color buttons
  const colorButtons = document.querySelectorAll(".color-btn")
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      colorButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Set selected color
      selectedCarColor = button.dataset.color

      // Preview the color change
      previewCarSettings()
    })
  })

  // Set default active color
  colorButtons[0].classList.add("active")

  // Car style select
  const carStyleSelect = document.getElementById("car-style-select")
  carStyleSelect.addEventListener("change", () => {
    selectedCarStyle = carStyleSelect.value
    previewCarSettings()
  })

  // Slot select
  const slotSelect = document.getElementById("slot-select")
  slotSelect.addEventListener("change", () => {
    selectedSlot = slotSelect.value
    previewCarSettings()
  })

  // Apply button
  const applyButton = document.getElementById("apply-car-settings")
  applyButton.addEventListener("click", () => {
    applyCarSettings()
  })

  // Add car size option to the customization panel
  addCarSizeOption()
}

// Function to add car size option
function addCarSizeOption() {
  const customizationOptions = document.querySelector(".customization-options")

  // Create car size option container
  const carSizeOption = document.createElement("div")
  carSizeOption.className = "car-size-options"

  // Create label
  const label = document.createElement("label")
  label.textContent = "Car Size:"

  // Create select element
  const select = document.createElement("select")
  select.id = "car-size-select"

  // Add options
  const sizeOptions = [
    { value: "small", text: "Small" },
    { value: "medium", text: "Medium" },
    { value: "large", text: "Large" },
    { value: "extra-large", text: "Extra Large" },
  ]

  sizeOptions.forEach((option) => {
    const optionElement = document.createElement("option")
    optionElement.value = option.value
    optionElement.textContent = option.text
    select.appendChild(optionElement)
  })

  // Set default value
  select.value = "large"

  // Add event listener
  select.addEventListener("change", () => {
    carSize = select.value
    updateCarSize()
  })

  // Append elements
  carSizeOption.appendChild(label)
  carSizeOption.appendChild(select)

  // Add to customization options
  customizationOptions.appendChild(carSizeOption)
}

// Function to update car size
function updateCarSize() {
  const carIcons = document.querySelectorAll(".car-icon")

  // Remove all size classes
  carIcons.forEach((icon) => {
    icon.classList.remove("small", "medium", "large", "extra-large")

    // Apply selected size
    if (carSize === "small") {
      icon.style.width = "60px"
      icon.style.height = "30px"
    } else if (carSize === "medium") {
      icon.style.width = "90px"
      icon.style.height = "45px"
    } else if (carSize === "large") {
      icon.style.width = "120px"
      icon.style.height = "60px"
    } else if (carSize === "extra-large") {
      icon.style.width = "150px"
      icon.style.height = "75px"
    }
  })

  // Add animation
  document.querySelectorAll(".parking-slot").forEach((slot) => {
    slot.classList.add("status-changed")
    setTimeout(() => {
      slot.classList.remove("status-changed")
    }, 500)
  })
}

// Function to preview car settings
function previewCarSettings() {
  // Get slots to preview
  const slots =
    selectedSlot === "all" ? document.querySelectorAll(".parking-slot") : [document.getElementById(selectedSlot)]

  // Apply preview styles
  slots.forEach((slot) => {
    // Apply car style class
    slot.classList.remove("car-style-sedan", "car-style-suv", "car-style-sports")
    slot.classList.add(`car-style-${selectedCarStyle}`)

    // Apply car color
    const carBody = slot.querySelector(".car-body")
    if (carBody) {
      carBody.style.fill = selectedCarColor
    }

    // Add preview animation
    slot.classList.add("status-changed")
    setTimeout(() => {
      slot.classList.remove("status-changed")
    }, 500)
  })
}

// Function to apply car settings
function applyCarSettings() {
  // Get slots to apply settings to
  const slots =
    selectedSlot === "all" ? document.querySelectorAll(".parking-slot") : [document.getElementById(selectedSlot)]

  // Apply settings
  slots.forEach((slot) => {
    // Apply car style class
    slot.classList.remove("car-style-sedan", "car-style-suv", "car-style-sports")
    slot.classList.add(`car-style-${selectedCarStyle}`)

    // Apply car color
    const carBody = slot.querySelector(".car-body")
    if (carBody) {
      carBody.style.fill = selectedCarColor
    }

    // Save settings to local storage
    const slotId = slot.id
    const settings = {
      color: selectedCarColor,
      style: selectedCarStyle,
      size: carSize,
    }
    localStorage.setItem(`carSettings_${slotId}`, JSON.stringify(settings))
  })

  // Show success message
  alert("Car settings applied successfully!")
}

// Function to load saved car settings
function loadSavedCarSettings() {
  document.querySelectorAll(".parking-slot").forEach((slot) => {
    const slotId = slot.id
    const savedSettings = localStorage.getItem(`carSettings_${slotId}`)

    if (savedSettings) {
      const settings = JSON.parse(savedSettings)

      // Apply car style
      slot.classList.remove("car-style-sedan", "car-style-suv", "car-style-sports")
      slot.classList.add(`car-style-${settings.style}`)

      // Apply car color
      const carBody = slot.querySelector(".car-body")
      if (carBody) {
        carBody.style.fill = settings.color
      }

      // Apply car size if available
      if (settings.size) {
        const carIcon = slot.querySelector(".car-icon")
        if (carIcon) {
          if (settings.size === "small") {
            carIcon.style.width = "60px"
            carIcon.style.height = "30px"
          } else if (settings.size === "medium") {
            carIcon.style.width = "90px"
            carIcon.style.height = "45px"
          } else if (settings.size === "large") {
            carIcon.style.width = "120px"
            carIcon.style.height = "60px"
          } else if (settings.size === "extra-large") {
            carIcon.style.width = "150px"
            carIcon.style.height = "75px"
          }
        }
      }
    }
  })
}

// Function to update the "last updated" time display
function updateLastUpdatedTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  document.getElementById("last-updated").textContent = `${hours}:${minutes} WIB`
}

// Function to refresh data
function refreshData() {
  const refreshButton = document.getElementById("refresh-button")
  refreshButton.disabled = true
  refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...'

  // Simulate refresh delay
  setTimeout(() => {
    // Re-enable the refresh button
    refreshButton.disabled = false
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Status'

    // Update the last updated time
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    document.getElementById("last-updated").textContent = `${hours}:${minutes} WIB`

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
    // updateConnectionStatus("connecting", "Connecting to Firebase...")

    // Check Firebase connection
    // const connectedRef = firebase.database().ref(".info/connected")
    // connectedRef.on("value", (snap) => {
    //   if (snap.val() === true) {
    //     updateConnectionStatus("connected", "Connected to Firebase")

    //     // Load saved car settings after connection
    //     loadSavedCarSettings()
    //   } else {
    //     updateConnectionStatus("disconnected", "Disconnected from Firebase")
    //   }
    // })

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
            }
          }

          // Update occupied count
          updateOccupiedCount(data)
        }
      },
      (error) => {
        console.error("Error reading data: ", error)
      },
    )

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Error setting up Firebase:", error)
  }
}

// Track all slot statuses
// const slotStatuses = {
//   slot1: "unknown",
//   slot2: "unknown",
//   slot3: "unknown",
//   slot4: "unknown",
// }

// Update slot status in our tracking object
// function updateSlotStatus(slotId, status) {
//   slotStatuses[slotId] = status
//   updateAvailableCount(slotStatuses)
// }

// Function to update the UI based on slot status
// function updateSlotUI(slotId, status) {
//   const slotElement = document.getElementById(slotId)
//   if (!slotElement) return

//   if (status === "empty") {
//     slotElement.className = "parking-slot empty"
//     slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Empty`
//   } else if (status === "occupied") {
//     slotElement.className = "parking-slot occupied"
//     slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Occupied`
//   } else {
//     slotElement.className = "parking-slot unknown"
//     slotElement.textContent = `${slotId.charAt(0).toUpperCase() + slotId.slice(1)}: Unknown`
//   }

//   // Add last updated timestamp
//   const now = new Date()
//   slotElement.setAttribute("data-last-updated", now.toLocaleTimeString())

//   // Add a small indicator for last update time
//   const timeIndicator = document.createElement("div")
//   timeIndicator.className = "update-time"
//   timeIndicator.textContent = `Updated: ${now.toLocaleTimeString()}`

//   // Remove any existing time indicator
//   const existingIndicator = slotElement.querySelector(".update-time")
//   if (existingIndicator) {
//     slotElement.removeChild(existingIndicator)
//   }

//   slotElement.appendChild(timeIndicator)
// }

// Function to update available spots count
// function updateAvailableCount(slotStatuses) {
//   const availableCount = Object.values(slotStatuses).filter((status) => status === "empty").length
//   const availableCountElement = document.getElementById("available-count")
//   if (availableCountElement) {
//     availableCountElement.textContent = `Available spots: ${availableCount} of 4`
//   }
// }

// Function to show connection status
// function showConnectionStatus(message, type) {
//   const statusElement = document.getElementById("connection-status")
//   if (statusElement) {
//     statusElement.textContent = message
//     statusElement.className = `connection-status ${type}`
//   }
// }

// Function to update connection status
// function updateConnectionStatus(status, message) {
//   const connectionStatus = document.getElementById("connection-status")
//   const statusIndicator = connectionStatus.querySelector(".status-indicator")
//   const statusText = connectionStatus.querySelector(".status-text")

//   statusIndicator.className = "status-indicator " + status
//   statusText.textContent = message

//   // Hide connection status after 5 seconds if connected
//   if (status === "connected") {
//     setTimeout(() => {
//       connectionStatus.style.display = "none"
//     }, 5000)
//   } else {
//     connectionStatus.style.display = "flex"
//   }
// }

// Track previous slot statuses to detect changes
// const previousStatuses = {
//   slot1: null,
//   slot2: null,
//   slot3: null,
//   slot4: null,
// }

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
// function updateSummary(data) {
//   let emptyCount = 0
//   let occupiedCount = 0

//   // Count slots by status
//   for (let i = 1; i <= 4; i++) {
//     const slotKey = `slot${i}`
//     const status = data[slotKey]?.status

//     if (status === "empty") {
//       emptyCount++
//     } else if (status === "occupied") {
//       occupiedCount++
//     }
//   }

//   // Update summary elements
//   document.getElementById("available-count").textContent = emptyCount
//   document.getElementById("occupied-count").textContent = occupiedCount
// }

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

// Add manual testing functions for development
function testOccupied(slotId) {
  const slotElement = document.getElementById(slotId)
  if (slotElement) {
    slotElement.classList.remove("empty", "unknown")
    slotElement.classList.add("occupied")

    // Show car icon
    const carIcon = slotElement.querySelector(".car-icon")
    if (carIcon) {
      carIcon.style.display = "block"
    }

    // Add animation
    slotElement.classList.add("status-changed")
    setTimeout(() => {
      slotElement.classList.remove("status-changed")
    }, 500)

    // Update counter
    const count = Number.parseInt(document.getElementById("occupied-count").textContent) || 0
    document.getElementById("occupied-count").textContent = count + 1
  }
}

function testEmpty(slotId) {
  const slotElement = document.getElementById(slotId)
  if (slotElement) {
    // Only decrease counter if it was occupied
    if (slotElement.classList.contains("occupied")) {
      const count = Number.parseInt(document.getElementById("occupied-count").textContent) || 0
      if (count > 0) {
        document.getElementById("occupied-count").textContent = count - 1
      }
    }

    slotElement.classList.remove("occupied", "unknown")
    slotElement.classList.add("empty")

    // Hide car icon
    const carIcon = slotElement.querySelector(".car-icon")
    if (carIcon) {
      carIcon.style.display = "none"
    }

    // Add animation
    slotElement.classList.add("status-changed")
    setTimeout(() => {
      slotElement.classList.remove("status-changed")
    }, 500)
  }
}
