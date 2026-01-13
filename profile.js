// دوال إدارة الملف الشخصي

const userSystem = {} // Declare userSystem variable
const notificationSystem = {} // Declare notificationSystem variable

function showUserProfile() {
  if (!userSystem.currentUser) {
    showLoginForm() // Declare showLoginForm function
    return
  }

  const profile = document.getElementById("user-profile")
  profile.style.display = "block"
  loadProfileData()
}

function loadProfileData() {
  const user = userSystem.currentUser
  document.getElementById("profile-name").textContent = user.name
  document.getElementById("profile-email").textContent = user.email
  document.getElementById("profile-avatar").src = user.avatar

  const memberSince = new Date(user.createdAt).toLocaleDateString("ar-SA")
  document.getElementById("profile-member-since").textContent = `عضو منذ: ${memberSince}`

  loadUserOrders()
  loadUserFavorites()
}

function loadUserOrders() {
  const orders = userSystem.getUserOrders()
  const tbody = document.getElementById("user-orders-body")
  tbody.innerHTML = ""

  if (orders.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>لا توجد طلبات</td></tr>"
    return
  }

  orders.forEach((order) => {
    const row = tbody.insertRow()
    const items = order.items.map((i) => i.name).join(", ")
    row.innerHTML = `
        <td>#${order.id}</td>
        <td>${order.date}</td>
        <td>${items}</td>
        <td>${order.total.toFixed(2)} ر.س</td>
        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
    `
  })
}

function loadUserFavorites() {
  const user = userSystem.currentUser
  const allServices = JSON.parse(localStorage.getItem("services") || "[]")
  const favorites = allServices.filter((s) => user.favorites && user.favorites.includes(s.id))

  const grid = document.getElementById("favorites-grid")
  grid.innerHTML = ""

  if (favorites.length === 0) {
    grid.innerHTML = "<p>لا توجد خدمات مفضلة</p>"
    return
  }

  favorites.forEach((service) => {
    const card = document.createElement("div")
    card.className = "service-card"
    card.innerHTML = `
        <img src="${service.image}" alt="${service.name}">
        <div class="service-card-content">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <button class="add-to-cart" onclick="addToCart(${service.id})">أضف للسلة</button>
        </div>
    `
    grid.appendChild(card)
  })
}

function showProfileTab(tab) {
  document.querySelectorAll(".profile-tab").forEach((t) => (t.style.display = "none"))
  document.querySelectorAll(".profile-nav-btn").forEach((b) => b.classList.remove("active"))

  document.getElementById(tab + "-tab").style.display = "block"
  // event.target.classList.add("active") // Removed as it was incorrect in the context

  if (tab === "orders") loadUserOrders()
  if (tab === "favorites") loadUserFavorites()
}

function saveProfile() {
  const name = document.getElementById("settings-name").value
  if (name) {
    const result = userSystem.updateProfile({ name })
    if (result.success) {
      notificationSystem.addNotification("تم تحديث الملف الشخصي بنجاح", "success")
      loadProfileData()
    }
  }
}

function changePassword() {
  const oldPassword = document.getElementById("old-password").value
  const newPassword = document.getElementById("new-password").value
  const confirmPassword = document.getElementById("confirm-password").value

  const result = userSystem.changePassword(oldPassword, newPassword, confirmPassword)
  if (result.success) {
    notificationSystem.addNotification(result.message, "success")
    document.getElementById("old-password").value = ""
    document.getElementById("new-password").value = ""
    document.getElementById("confirm-password").value = ""
  } else {
    notificationSystem.addNotification(result.error, "error")
  }
}

function logoutUser() {
  if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
    userSystem.logout()
    document.getElementById("user-profile").style.display = "none"
    notificationSystem.addNotification("تم تسجيل الخروج بنجاح", "success")
  }
}

function showLoginForm() {
  // Implementation for showLoginForm
}
