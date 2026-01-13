// ========== ADMIN STATE ==========
let adminUser = null
let services = []
let orders = []
let paymentMethods = {
  bankName: "بنك الراجحي",
  bankAccount: "XXXXXXXXXXXX",
  bankIban: "SA00 0000 0000 0000 0000 0000",
  likeCardCode: "XXXXXXXXXXXX",
  likeCardUrl: "",
  whatsappNumber: "+966594569011",
  whatsappChannel: "https://whatsapp.com/channel/0029VbCXW248qIzki3MIvE44",
  cardMessage: "يرجى الاتصال بنا لمعرفة تفاصيل الدفع ببطاقة ائتمان",
}
let siteSettings = {
  siteName: "خدمات التواصل",
  siteDesc: "متخصصون في بيع خدمات وسائل التواصل الاجتماعي",
  siteEmail: "info@example.com",
  minOrder: 0,
  welcomeMessage: "مرحباً بك في خدماتنا",
}
let isAdminDarkMode = false
let editingServiceId = null

const adminCredentials = {
  username: "admin",
  password: "admin123",
}

// ========== THEME MANAGEMENT ==========
function toggleAdminTheme() {
  isAdminDarkMode = !isAdminDarkMode
  document.body.classList.toggle("dark-mode")
  localStorage.setItem("adminTheme", isAdminDarkMode ? "dark" : "light")
  updateAdminThemeIcon()
}

function updateAdminThemeIcon() {
  const icon = document.querySelector(".theme-toggle i")
  if (icon) {
    icon.className = isAdminDarkMode ? "fas fa-sun" : "fas fa-moon"
  }
}

function loadAdminTheme() {
  const savedTheme = localStorage.getItem("adminTheme")
  if (savedTheme === "dark") {
    isAdminDarkMode = true
    document.body.classList.add("dark-mode")
    updateAdminThemeIcon()
  }
}

// ========== DATA MANAGEMENT ==========
function loadAdminData() {
  const savedServices = localStorage.getItem("services")
  const savedOrders = localStorage.getItem("orders")
  const savedPaymentMethods = localStorage.getItem("paymentMethods")
  const savedSettings = localStorage.getItem("siteSettings")

  if (savedServices) services = JSON.parse(savedServices)
  if (savedOrders) orders = JSON.parse(savedOrders)
  if (savedPaymentMethods) paymentMethods = JSON.parse(savedPaymentMethods)
  if (savedSettings) siteSettings = JSON.parse(savedSettings)
}

function saveServices() {
  localStorage.setItem("services", JSON.stringify(services))
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders))
}

function savePaymentMethods() {
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods))
}

function saveSiteSettings() {
  localStorage.setItem("siteSettings", JSON.stringify(siteSettings))
}

// ========== AUTHENTICATION ==========
function adminLogin(event) {
  event.preventDefault()
  const username = document.getElementById("admin-username").value.trim()
  const password = document.getElementById("admin-password").value.trim()

  if (username === adminCredentials.username && password === adminCredentials.password) {
    adminUser = { username, loginTime: new Date().toLocaleString("ar-SA") }
    localStorage.setItem("adminUser", JSON.stringify(adminUser))
    showAdminDashboard()
    showNotification("تم الدخول بنجاح", "success")
  } else {
    document.getElementById("login-error").textContent = "اسم المستخدم أو كلمة المرور غير صحيحة"
    showNotification("فشل تسجيل الدخول", "error")
  }
}

function adminLogout() {
  if (confirm("هل تريد تسجيل الخروج؟")) {
    adminUser = null
    localStorage.removeItem("adminUser")
    document.getElementById("admin-login").style.display = "flex"
    document.getElementById("admin-dashboard").style.display = "none"
    document.getElementById("admin-username").value = ""
    document.getElementById("admin-password").value = ""
    document.getElementById("login-error").textContent = ""
    showNotification("تم تسجيل الخروج بنجاح", "success")
  }
}

// ========== DASHBOARD ==========
function showAdminDashboard() {
  document.getElementById("admin-login").style.display = "none"
  document.getElementById("admin-dashboard").style.display = "flex"
  loadAdminData()
  loadAdminTheme()
  document.getElementById("admin-name").textContent = adminUser.username
  showAdminSection("dashboard")
  updateDashboard()
}

function showAdminSection(section) {
  // Hide all sections
  document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"))
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))

  // Show selected section
  const targetSection = document.getElementById(section + "-section")
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Mark button as active
  event.currentTarget?.classList.add("active")

  // Load section data
  if (section === "dashboard") {
    updateDashboard()
  } else if (section === "services") {
    renderServicesTable()
  } else if (section === "orders") {
    renderOrdersTable()
  } else if (section === "payment-methods") {
    loadPaymentMethods()
  } else if (section === "settings") {
    loadSettingsForm()
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.style.display = sidebar.style.display === "none" ? "block" : "none"
}

// ========== DASHBOARD SECTION ==========
function updateDashboard() {
  const totalOrders = orders.length
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const completedOrders = orders.filter((o) => o.status === "completed").length

  document.getElementById("total-orders").textContent = totalOrders
  document.getElementById("total-sales").textContent = totalSales.toFixed(2) + " ر.س"
  document.getElementById("pending-orders").textContent = pendingOrders
  document.getElementById("completed-orders").textContent = completedOrders

  renderRecentOrders()
}

function renderRecentOrders() {
  const tbody = document.getElementById("recent-orders-tbody")
  tbody.innerHTML = ""

  const recentOrders = orders.slice(-5).reverse()

  if (recentOrders.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-gray);">لا توجد طلبات</td></tr>'
    return
  }

  recentOrders.forEach((order) => {
    const row = tbody.insertRow()
    row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.date}</td>
            <td>${order.items.map((i) => i.name).join(", ")}</td>
            <td>${order.total.toFixed(2)} ر.س</td>
            <td><button class="status-btn status-${order.status}">${getStatusText(order.status)}</button></td>
        `
  })
}

function getStatusText(status) {
  const statusMap = {
    pending: "معلقة",
    completed: "مكتملة",
    cancelled: "ملغاة",
  }
  return statusMap[status] || status
}

// ========== SERVICES MANAGEMENT ==========
function renderServicesTable() {
  const tbody = document.getElementById("services-tbody")
  tbody.innerHTML = ""

  if (services.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-gray);">لا توجد خدمات - أضف خدمة جديدة</td></tr>'
    return
  }

  services.forEach((service, index) => {
    const pricesText = Object.entries(service.prices)
      .map(([qty, price]) => `${qty}: ${price} ر.س`)
      .join("<br>")

    const row = tbody.insertRow()
    row.innerHTML = `
            <td style="text-align: center;">
                <img src="${service.image}" alt="${service.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
            </td>
            <td>${service.name}</td>
            <td>${service.platform}</td>
            <td>${pricesText}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editService(${index})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="action-btn delete-btn" onclick="deleteService(${index})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `
  })
}

function showAddServiceForm() {
  editingServiceId = null
  document.getElementById("form-title").textContent = "إضافة خدمة جديدة"
  document.getElementById("service-name").value = ""
  document.getElementById("service-desc").value = ""
  document.getElementById("service-platform").value = ""
  document.getElementById("prices-container").innerHTML = ""
  addMorePrice()
  document.getElementById("service-image").value = ""
  document.getElementById("image-preview").style.display = "none"
  document.getElementById("service-form-container").style.display = "block"
}

function addMorePrice() {
  const container = document.getElementById("prices-container")
  const priceInput = document.createElement("div")
  priceInput.className = "price-input"
  priceInput.innerHTML = `
        <input type="number" placeholder="الكمية" min="1" class="input-field" required>
        <input type="number" placeholder="السعر (ر.س)" min="0" step="0.01" class="input-field" required>
        <button type="button" class="remove-price-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `
  container.appendChild(priceInput)
}

function editService(index) {
  const service = services[index]
  editingServiceId = index
  document.getElementById("form-title").textContent = "تعديل الخدمة"
  document.getElementById("service-name").value = service.name
  document.getElementById("service-desc").value = service.description
  document.getElementById("service-platform").value = service.platform

  // Load prices
  const container = document.getElementById("prices-container")
  container.innerHTML = ""
  Object.entries(service.prices).forEach(([qty, price]) => {
    const priceInput = document.createElement("div")
    priceInput.className = "price-input"
    priceInput.innerHTML = `
            <input type="number" placeholder="الكمية" min="1" value="${qty}" class="input-field" required>
            <input type="number" placeholder="السعر (ر.س)" min="0" step="0.01" value="${price}" class="input-field" required>
            <button type="button" class="remove-price-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `
    container.appendChild(priceInput)
  })

  if (service.image && !service.image.includes("placeholder")) {
    document.getElementById("image-preview").src = service.image
    document.getElementById("image-preview").style.display = "block"
  }

  document.getElementById("service-form-container").style.display = "block"
}

function cancelServiceForm() {
  document.getElementById("service-form-container").style.display = "none"
  editingServiceId = null
}

function submitService(event) {
  event.preventDefault()

  const name = document.getElementById("service-name").value.trim()
  const desc = document.getElementById("service-desc").value.trim()
  const platform = document.getElementById("service-platform").value
  const imageFile = document.getElementById("service-image").files[0]

  if (!name || !desc || !platform) {
    showNotification("يرجى ملء جميع الحقول المطلوبة", "warning")
    return
  }

  // Collect prices
  const prices = {}
  const priceInputs = document.querySelectorAll(".price-input")
  priceInputs.forEach((input) => {
    const qtyInput = input.querySelector('input[type="number"]:first-child')
    const priceInputEl = input.querySelector('input[type="number"]:last-child')
    const qty = qtyInput?.value
    const price = priceInputEl?.value
    if (qty && price) {
      prices[qty] = Number.parseFloat(price)
    }
  })

  if (Object.keys(prices).length === 0) {
    showNotification("يرجى إضافة سعر واحد على الأقل", "warning")
    return
  }

  const handleImageAndSave = (imageUrl) => {
    const serviceData = {
      id: editingServiceId !== null ? services[editingServiceId].id : services.length + 1,
      name,
      description: desc,
      platform,
      prices,
      image: imageUrl,
    }

    if (editingServiceId !== null) {
      services[editingServiceId] = serviceData
      showNotification("تم تحديث الخدمة بنجاح", "success")
    } else {
      services.push(serviceData)
      showNotification("تم إضافة الخدمة بنجاح", "success")
    }

    saveServices()
    renderServicesTable()
    cancelServiceForm()
  }

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleImageAndSave(e.target.result)
    }
    reader.readAsDataURL(imageFile)
  } else {
    const currentImage =
      editingServiceId !== null
        ? services[editingServiceId].image
        : "/placeholder.svg?height=220&width=320&query=" + platform
    handleImageAndSave(currentImage)
  }
}

function deleteService(index) {
  if (confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
    services.splice(index, 1)
    saveServices()
    renderServicesTable()
    showNotification("تم حذف الخدمة بنجاح", "success")
  }
}

// ========== ORDERS MANAGEMENT ==========
function renderOrdersTable() {
  const tbody = document.getElementById("orders-tbody")
  tbody.innerHTML = ""

  if (orders.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-gray);">لا توجد طلبات</td></tr>'
    return
  }

  orders.forEach((order) => {
    const row = tbody.insertRow()
    const itemsList = order.items.map((i) => i.name).join(", ")
    const paymentMethodText = getPaymentMethodText(order.paymentMethod)

    row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.date}</td>
            <td>${order.accountName || "-"}</td>
            <td title="${itemsList}">${itemsList.substring(0, 30)}...</td>
            <td>${order.total.toFixed(2)} ر.س</td>
            <td>${paymentMethodText}</td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-btn status-${order.status}">
                    <option value="pending" ${order.status === "pending" ? "selected" : ""}>معلقة</option>
                    <option value="completed" ${order.status === "completed" ? "selected" : ""}>مكتملة</option>
                    <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>ملغاة</option>
                </select>
            </td>
            <td>
                <button class="action-btn view-btn" onclick="viewOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
            </td>
        `
  })
}

function getPaymentMethodText(method) {
  const methodMap = {
    card: "بطاقة ائتمان",
    transfer: "تحويل بنكي",
    "like-card": "لايك كارد",
    whatsapp: "واتس اب",
  }
  return methodMap[method] || method
}

function filterOrders() {
  const filter = document.getElementById("order-filter").value
  const tbody = document.getElementById("orders-tbody")
  const rows = tbody.querySelectorAll("tr")

  rows.forEach((row) => {
    if (filter === "") {
      row.style.display = ""
    } else {
      const statusSelect = row.querySelector("select")
      const currentStatus = statusSelect?.value || ""
      row.style.display = currentStatus === filter ? "" : "none"
    }
  })
}

function updateOrderStatus(orderId, status) {
  const order = orders.find((o) => o.id === orderId)
  if (order) {
    order.status = status
    saveOrders()
    showNotification(`تم تحديث حالة الطلب إلى: ${getStatusText(status)}`, "success")
  }
}

function viewOrderDetails(orderId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return

  const modal = document.getElementById("order-details-modal")
  const content = document.getElementById("order-details-content")

  const itemsHTML = order.items
    .map(
      (item) =>
        `<div class="order-detail-item">
            <strong>${item.name}</strong>
            <span>الكمية: ${item.quantity} | السعر: ${item.price} ر.س</span>
        </div>`,
    )
    .join("")

  content.innerHTML = `
        <div class="order-detail-item">
            <strong>رقم الطلب:</strong>
            <span>#${order.id}</span>
        </div>
        <div class="order-detail-item">
            <strong>التاريخ:</strong>
            <span>${order.date}</span>
        </div>
        <div class="order-detail-item">
            <strong>اسم الحساب:</strong>
            <span>${order.accountName || "-"}</span>
        </div>
        <div class="order-detail-item">
            <strong>البريد الإلكتروني:</strong>
            <span>${order.email || "-"}</span>
        </div>
        <div class="order-detail-item">
            <strong>رقم الواتس:</strong>
            <span>${order.phone || "-"}</span>
        </div>
        <div class="order-detail-item">
            <strong>طريقة الدفع:</strong>
            <span>${getPaymentMethodText(order.paymentMethod)}</span>
        </div>
        <div class="order-detail-item">
            <strong>الحالة:</strong>
            <span>${getStatusText(order.status)}</span>
        </div>
        <div class="order-detail-item">
            <strong>الخدمات:</strong>
        </div>
        ${itemsHTML}
        <div class="order-detail-item">
            <strong>الإجمالي:</strong>
            <span>${order.total.toFixed(2)} ر.س</span>
        </div>
        ${order.notes ? `<div class="order-detail-item"><strong>ملاحظات:</strong><span>${order.notes}</span></div>` : ""}
    `

  modal.style.display = "block"
}

function closeOrderDetails() {
  document.getElementById("order-details-modal").style.display = "none"
}

// ========== PAYMENT METHODS ==========
function loadPaymentMethods() {
  document.getElementById("bank-name").value = paymentMethods.bankName || ""
  document.getElementById("bank-account").value = paymentMethods.bankAccount || ""
  document.getElementById("bank-iban").value = paymentMethods.bankIban || ""
  document.getElementById("like-card-code").value = paymentMethods.likeCardCode || ""
  document.getElementById("like-card-url").value = paymentMethods.likeCardUrl || ""
  document.getElementById("whatsapp-number").value = paymentMethods.whatsappNumber || ""
  document.getElementById("whatsapp-channel").value = paymentMethods.whatsappChannel || ""
  document.getElementById("card-message").value = paymentMethods.cardMessage || ""
}

function savePaymentMethod(event, type) {
  event.preventDefault()

  if (type === "bank") {
    paymentMethods.bankName = document.getElementById("bank-name").value
    paymentMethods.bankAccount = document.getElementById("bank-account").value
    paymentMethods.bankIban = document.getElementById("bank-iban").value
  } else if (type === "like-card") {
    paymentMethods.likeCardCode = document.getElementById("like-card-code").value
    paymentMethods.likeCardUrl = document.getElementById("like-card-url").value
  } else if (type === "whatsapp") {
    paymentMethods.whatsappNumber = document.getElementById("whatsapp-number").value
    paymentMethods.whatsappChannel = document.getElementById("whatsapp-channel").value
  } else if (type === "card") {
    paymentMethods.cardMessage = document.getElementById("card-message").value
  }

  savePaymentMethods()
  showNotification("تم حفظ طريقة الدفع بنجاح", "success")
}

// ========== SETTINGS ==========
function loadSettingsForm() {
  document.getElementById("site-name").value = siteSettings.siteName || ""
  document.getElementById("site-desc").value = siteSettings.siteDesc || ""
  document.getElementById("site-email").value = siteSettings.siteEmail || ""
  document.getElementById("min-order").value = siteSettings.minOrder || 0
  document.getElementById("welcome-message").value = siteSettings.welcomeMessage || ""
}

function saveSiteSettingsForm(event) {
  event.preventDefault()

  siteSettings.siteName = document.getElementById("site-name").value
  siteSettings.siteDesc = document.getElementById("site-desc").value
  siteSettings.siteEmail = document.getElementById("site-email").value
  siteSettings.minOrder = Number.parseFloat(document.getElementById("min-order").value) || 0
  siteSettings.welcomeMessage = document.getElementById("welcome-message").value

  saveSiteSettings()
  showNotification("تم حفظ الإعدادات بنجاح", "success")
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#3b82f6"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-in-out;
  `
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 3000)
}

// ========== MODAL CLOSE ==========
window.onclick = (event) => {
  const modal = document.getElementById("order-details-modal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}

// ========== IMAGE PREVIEW ==========
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("service-image")
  if (imageInput) {
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = document.getElementById("image-preview")
          preview.src = event.target.result
          preview.style.display = "block"
        }
        reader.readAsDataURL(file)
      }
    })
  }
})

// ========== INITIALIZE ==========
window.addEventListener("load", () => {
  loadAdminTheme()

  // Check if admin is already logged in
  const savedAdmin = localStorage.getItem("adminUser")
  if (savedAdmin) {
    adminUser = JSON.parse(savedAdmin)
    showAdminDashboard()
  }
})
