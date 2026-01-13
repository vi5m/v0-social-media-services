// ========== ADMIN STATE & INITIALIZATION ==========
let adminUser = null
let services = []
let orders = []
let users = []
let paymentMethods = {
  bank: {
    enabled: true,
    name: "بنك الراجحي",
    account: "1234567890",
    iban: "SA00 0000 0000 0000 0000",
  },
  likeCard: {
    enabled: true,
    code: "XXXXXXXXXXXX",
    url: "https://like.card",
  },
  whatsapp: {
    enabled: true,
    number: "+966594569011",
    channel: "https://whatsapp.com/channel/0029VbCXW248qIzki3MIvE44",
  },
  card: {
    enabled: true,
    message: "يرجى الاتصال بنا للدفع ببطاقة ائتمان",
  },
}
let siteSettings = {
  siteName: "خدمات التواصل الاجتماعي",
  siteDesc: "متخصصون في بيع خدمات التواصل",
  siteEmail: "info@example.com",
  sitePhone: "+966594569011",
  minOrder: 0,
  welcomeMessage: "مرحباً بك في خدماتنا",
  socialLinks: {
    tiktok: "https://tiktok.com/@yourusername",
    instagram: "https://instagram.com/yourusername",
    facebook: "https://facebook.com/yourusername",
    twitter: "https://twitter.com/yourusername",
  },
}

let isAdminDarkMode = false
let editingServiceId = null

const adminCredentials = {
  username: "admin",
  password: "admin123",
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  loadAdminTheme()
  loadAllAdminData()
  checkAdminSession()
})

// ========== THEME MANAGEMENT ==========
function toggleAdminTheme() {
  isAdminDarkMode = !isAdminDarkMode
  document.body.classList.toggle("dark-mode", isAdminDarkMode)
  localStorage.setItem("adminTheme", isAdminDarkMode ? "dark" : "light")
  updateAdminThemeIcon()
  showNotification("تم تغيير المظهر بنجاح", "success")
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

// ========== DATA LOADING ==========
function loadAllAdminData() {
  const savedServices = localStorage.getItem("services")
  const savedOrders = localStorage.getItem("orders")
  const savedUsers = localStorage.getItem("users")
  const savedPaymentMethods = localStorage.getItem("paymentMethods")
  const savedSettings = localStorage.getItem("siteSettings")

  if (savedServices) services = JSON.parse(savedServices)
  if (savedOrders) orders = JSON.parse(savedOrders)
  if (savedUsers) users = JSON.parse(savedUsers)
  if (savedPaymentMethods) paymentMethods = JSON.parse(savedPaymentMethods)
  if (savedSettings) siteSettings = JSON.parse(savedSettings)
}

function saveAllData() {
  localStorage.setItem("services", JSON.stringify(services))
  localStorage.setItem("orders", JSON.stringify(orders))
  localStorage.setItem("users", JSON.stringify(users))
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods))
  localStorage.setItem("siteSettings", JSON.stringify(siteSettings))
}

// ========== AUTHENTICATION ==========
function adminLogin(event) {
  event.preventDefault()
  const username = document.getElementById("admin-username").value.trim()
  const password = document.getElementById("admin-password").value.trim()

  if (username === adminCredentials.username && password === adminCredentials.password) {
    adminUser = {
      username,
      loginTime: new Date().toLocaleString("ar-SA"),
    }
    localStorage.setItem("adminUser", JSON.stringify(adminUser))
    localStorage.setItem("adminLoggedIn", "true")
    document.getElementById("admin-login").style.display = "none"
    document.getElementById("admin-dashboard").style.display = "flex"
    document.getElementById("admin-name").textContent = username
    loadDashboardData()
    showNotification("مرحباً بك في لوحة التحكم", "success")
  } else {
    document.getElementById("login-error").textContent = "بيانات المستخدم غير صحيحة"
    showNotification("فشل تسجيل الدخول", "error")
  }
}

function adminLogout() {
  adminUser = null
  localStorage.removeItem("adminUser")
  localStorage.removeItem("adminLoggedIn")
  document.getElementById("admin-login").style.display = "flex"
  document.getElementById("admin-dashboard").style.display = "none"
  document.getElementById("admin-username").value = ""
  document.getElementById("admin-password").value = ""
  showNotification("تم تسجيل الخروج بنجاح", "success")
}

function checkAdminSession() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn")
  if (isLoggedIn === "true") {
    const savedUser = localStorage.getItem("adminUser")
    if (savedUser) {
      adminUser = JSON.parse(savedUser)
      document.getElementById("admin-login").style.display = "none"
      document.getElementById("admin-dashboard").style.display = "flex"
      document.getElementById("admin-name").textContent = adminUser.username
      loadDashboardData()
    }
  }
}

// ========== DASHBOARD ==========
function loadDashboardData() {
  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  document.getElementById("total-orders").textContent = totalOrders
  document.getElementById("total-sales").textContent = totalSales.toFixed(2) + " ر.س"
  document.getElementById("pending-orders").textContent = pendingOrders
  document.getElementById("completed-orders").textContent = completedOrders

  loadRecentOrders()
}

function loadRecentOrders() {
  const tbody = document.getElementById("recent-orders-tbody")
  tbody.innerHTML = ""

  const recentOrders = orders.slice(-5).reverse()
  recentOrders.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.date}</td>
      <td>${order.services.length} خدمات</td>
      <td>${order.total.toFixed(2)} ر.س</td>
      <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
    `
    tbody.appendChild(row)
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

// ========== SIDEBAR & SECTIONS ==========
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.toggle("collapsed")
}

function showAdminSection(sectionName) {
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.style.display = "none"
  })
  document.getElementById(sectionName + "-section").style.display = "block"

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  if (sectionName === "services") {
    loadServicesTable()
  } else if (sectionName === "orders") {
    loadOrdersTable()
  } else if (sectionName === "payment-methods") {
    loadPaymentMethodsData()
  } else if (sectionName === "dashboard") {
    loadDashboardData()
  }
}

// ========== SERVICES MANAGEMENT ==========
function showAddServiceForm() {
  editingServiceId = null
  document.getElementById("form-title").textContent = "إضافة خدمة جديدة"
  document.getElementById("service-form-container").style.display = "block"
  document.getElementById("service-name").value = ""
  document.getElementById("service-platform").value = ""
  document.getElementById("service-desc").value = ""
  document.getElementById("service-image").value = ""
  document.getElementById("image-preview").style.display = "none"
  document.getElementById("prices-container").innerHTML = ""
  addPriceInput()
}

function addPriceInput() {
  const container = document.getElementById("prices-container")
  const priceDiv = document.createElement("div")
  priceDiv.className = "price-input-group"
  priceDiv.innerHTML = `
    <input type="number" placeholder="الكمية" min="1" class="input-field" style="flex: 1;">
    <input type="number" placeholder="السعر بالريال" min="0" step="0.01" class="input-field" style="flex: 1;">
    <button type="button" onclick="this.parentElement.remove()" class="remove-btn">
      <i class="fas fa-trash"></i>
    </button>
  `
  container.appendChild(priceDiv)
}

function submitService(event) {
  event.preventDefault()

  const name = document.getElementById("service-name").value.trim()
  const platform = document.getElementById("service-platform").value
  const desc = document.getElementById("service-desc").value.trim()
  const imageFile = document.getElementById("service-image").files[0]

  const priceInputs = document.querySelectorAll(".price-input-group")
  const prices = []

  priceInputs.forEach((group) => {
    const quantity = Number.parseFloat(group.querySelector("input").value)
    const price = Number.parseFloat(group.querySelectorAll("input")[1].value)
    if (quantity && price) {
      prices.push({ quantity, price })
    }
  })

  if (!name || !platform || !desc || prices.length === 0) {
    showNotification("يرجى ملء جميع الحقول", "error")
    return
  }

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      saveService(name, platform, desc, prices, e.target.result)
    }
    reader.readAsDataURL(imageFile)
  } else {
    saveService(name, platform, desc, prices, null)
  }
}

function saveService(name, platform, desc, prices, image) {
  if (editingServiceId) {
    const serviceIndex = services.findIndex((s) => s.id === editingServiceId)
    if (serviceIndex !== -1) {
      services[serviceIndex] = {
        ...services[serviceIndex],
        name,
        platform,
        desc,
        prices,
        image: image || services[serviceIndex].image,
      }
    }
    showNotification("تم تحديث الخدمة بنجاح", "success")
  } else {
    const newService = {
      id: Date.now(),
      name,
      platform,
      desc,
      prices,
      image,
      createdAt: new Date().toLocaleString("ar-SA"),
    }
    services.push(newService)
    showNotification("تمت إضافة الخدمة بنجاح", "success")
  }

  saveAllData()
  cancelServiceForm()
  loadServicesTable()
}

function editService(serviceId) {
  const service = services.find((s) => s.id === serviceId)
  if (!service) return

  editingServiceId = serviceId
  document.getElementById("form-title").textContent = "تعديل الخدمة"
  document.getElementById("service-form-container").style.display = "block"

  document.getElementById("service-name").value = service.name
  document.getElementById("service-platform").value = service.platform
  document.getElementById("service-desc").value = service.desc

  if (service.image) {
    document.getElementById("image-preview").src = service.image
    document.getElementById("image-preview").style.display = "block"
  }

  const pricesContainer = document.getElementById("prices-container")
  pricesContainer.innerHTML = ""
  service.prices.forEach((price) => {
    const priceDiv = document.createElement("div")
    priceDiv.className = "price-input-group"
    priceDiv.innerHTML = `
      <input type="number" placeholder="الكمية" min="1" value="${price.quantity}" class="input-field" style="flex: 1;">
      <input type="number" placeholder="السعر بالريال" min="0" step="0.01" value="${price.price}" class="input-field" style="flex: 1;">
      <button type="button" onclick="this.parentElement.remove()" class="remove-btn">
        <i class="fas fa-trash"></i>
      </button>
    `
    pricesContainer.appendChild(priceDiv)
  })

  window.scrollTo(0, 0)
}

function deleteService(serviceId) {
  if (confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
    services = services.filter((s) => s.id !== serviceId)
    saveAllData()
    loadServicesTable()
    showNotification("تم حذف الخدمة بنجاح", "success")
  }
}

function cancelServiceForm() {
  document.getElementById("service-form-container").style.display = "none"
  editingServiceId = null
}

function loadServicesTable() {
  const tbody = document.getElementById("services-tbody")
  tbody.innerHTML = ""

  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد خدمات</td></tr>'
    return
  }

  services.forEach((service) => {
    const pricesText = service.prices.map((p) => `${p.quantity}: ${p.price}ر.س`).join(" | ")
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>
        ${service.image ? `<img src="${service.image}" alt="${service.name}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">` : "بدون صورة"}
      </td>
      <td>${service.name}</td>
      <td>${service.platform}</td>
      <td>${pricesText}</td>
      <td>
        <button onclick="editService(${service.id})" class="action-btn edit-btn" title="تعديل">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteService(${service.id})" class="action-btn delete-btn" title="حذف">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// ========== ORDERS MANAGEMENT ==========
function loadOrdersTable() {
  const tbody = document.getElementById("orders-tbody")
  tbody.innerHTML = ""

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">لا توجد طلبات</td></tr>'
    return
  }

  orders.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.date}</td>
      <td>${order.customerName}</td>
      <td>${order.services.length} خدمة</td>
      <td>${order.total.toFixed(2)} ر.س</td>
      <td>${order.paymentMethod}</td>
      <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
      <td>
        <button onclick="viewOrderDetails(${order.id})" class="action-btn view-btn" title="عرض">
          <i class="fas fa-eye"></i>
        </button>
        <select onchange="updateOrderStatus(${order.id}, this.value)" class="input-field" style="width: 120px;">
          <option value="">غير الحالة</option>
          <option value="pending">معلقة</option>
          <option value="completed">مكتملة</option>
          <option value="cancelled">ملغاة</option>
        </select>
        <button onclick="deleteOrder(${order.id})" class="action-btn delete-btn" title="حذف">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function viewOrderDetails(orderId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return

  const servicesDetails = order.services
    .map((s) => `<li>${s.name} (${s.quantity}) - ${s.price.toFixed(2)} ر.س</li>`)
    .join("")

  const detailsHTML = `
    <div class="order-details-view">
      <p><strong>رقم الطلب:</strong> #${order.id}</p>
      <p><strong>اسم العميل:</strong> ${order.customerName}</p>
      <p><strong>البريد الإلكتروني:</strong> ${order.email}</p>
      <p><strong>التاريخ:</strong> ${order.date}</p>
      <p><strong>الخدمات:</strong></p>
      <ul>${servicesDetails}</ul>
      <p><strong>الإجمالي:</strong> ${order.total.toFixed(2)} ر.س</p>
      <p><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
      <p><strong>الحالة:</strong> <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></p>
    </div>
  `

  document.getElementById("order-details-content").innerHTML = detailsHTML
  document.getElementById("order-details-modal").style.display = "flex"
}

function closeOrderDetails() {
  document.getElementById("order-details-modal").style.display = "none"
}

function updateOrderStatus(orderId, status) {
  if (!status) return
  const orderIndex = orders.findIndex((o) => o.id === orderId)
  if (orderIndex !== -1) {
    orders[orderIndex].status = status
    saveAllData()
    loadOrdersTable()
    showNotification("تم تحديث حالة الطلب بنجاح", "success")
  }
}

function deleteOrder(orderId) {
  if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
    orders = orders.filter((o) => o.id !== orderId)
    saveAllData()
    loadOrdersTable()
    loadDashboardData()
    showNotification("تم حذف الطلب بنجاح", "success")
  }
}

function filterOrders() {
  const filter = document.getElementById("order-filter").value
  const tbody = document.getElementById("orders-tbody")
  const rows = tbody.querySelectorAll("tr")

  rows.forEach((row) => {
    if (filter === "") {
      row.style.display = ""
    } else {
      const statusBadge = row.querySelector(".status-badge")
      const orderStatus = statusBadge ? statusBadge.className.match(/status-(\w+)/)[1] : ""
      row.style.display = orderStatus === filter ? "" : "none"
    }
  })
}

// ========== PAYMENT METHODS ==========
function loadPaymentMethodsData() {
  if (paymentMethods.bank) {
    document.getElementById("bank-name").value = paymentMethods.bank.name || ""
    document.getElementById("bank-account").value = paymentMethods.bank.account || ""
    document.getElementById("bank-iban").value = paymentMethods.bank.iban || ""
  }

  if (paymentMethods.likeCard) {
    document.getElementById("like-card-code").value = paymentMethods.likeCard.code || ""
    document.getElementById("like-card-url").value = paymentMethods.likeCard.url || ""
  }

  if (paymentMethods.whatsapp) {
    document.getElementById("whatsapp-number").value = paymentMethods.whatsapp.number || ""
    document.getElementById("whatsapp-channel").value = paymentMethods.whatsapp.channel || ""
  }

  if (paymentMethods.card) {
    document.getElementById("card-message").value = paymentMethods.card.message || ""
  }
}

function savePaymentMethod(event, method) {
  event.preventDefault()

  if (method === "bank") {
    paymentMethods.bank = {
      enabled: true,
      name: document.getElementById("bank-name").value.trim(),
      account: document.getElementById("bank-account").value.trim(),
      iban: document.getElementById("bank-iban").value.trim(),
    }
  } else if (method === "like-card") {
    paymentMethods.likeCard = {
      enabled: true,
      code: document.getElementById("like-card-code").value.trim(),
      url: document.getElementById("like-card-url").value.trim(),
    }
  } else if (method === "whatsapp") {
    paymentMethods.whatsapp = {
      enabled: true,
      number: document.getElementById("whatsapp-number").value.trim(),
      channel: document.getElementById("whatsapp-channel").value.trim(),
    }
  } else if (method === "card") {
    paymentMethods.card = {
      enabled: true,
      message: document.getElementById("card-message").value.trim(),
    }
  }

  saveAllData()
  showNotification(
    `تم حفظ ${method === "bank" ? "بيانات البنك" : method === "like-card" ? "بيانات لايك كارد" : "بيانات الدفع"} بنجاح`,
    "success",
  )
}

// ========== SETTINGS ==========
function loadSettingsForm() {
  document.getElementById("site-name").value = siteSettings.siteName
  document.getElementById("site-desc").value = siteSettings.siteDesc
  document.getElementById("site-email").value = siteSettings.siteEmail
  document.getElementById("site-phone").value = siteSettings.sitePhone || ""
  document.getElementById("min-order").value = siteSettings.minOrder
  document.getElementById("welcome-message").value = siteSettings.welcomeMessage

  if (siteSettings.socialLinks) {
    document.getElementById("tiktok-link").value = siteSettings.socialLinks.tiktok || ""
    document.getElementById("instagram-link").value = siteSettings.socialLinks.instagram || ""
    document.getElementById("facebook-link").value = siteSettings.socialLinks.facebook || ""
    document.getElementById("twitter-link").value = siteSettings.socialLinks.twitter || ""
  }
}

function saveSettings(event) {
  event.preventDefault()

  siteSettings = {
    siteName: document.getElementById("site-name").value.trim(),
    siteDesc: document.getElementById("site-desc").value.trim(),
    siteEmail: document.getElementById("site-email").value.trim(),
    sitePhone: document.getElementById("site-phone").value.trim(),
    minOrder: Number.parseFloat(document.getElementById("min-order").value) || 0,
    welcomeMessage: document.getElementById("welcome-message").value.trim(),
    socialLinks: {
      tiktok: document.getElementById("tiktok-link").value.trim(),
      instagram: document.getElementById("instagram-link").value.trim(),
      facebook: document.getElementById("facebook-link").value.trim(),
      twitter: document.getElementById("twitter-link").value.trim(),
    },
  }

  saveAllData()
  showNotification("تم حفظ الإعدادات بنجاح", "success")
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    ${message}
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

document.addEventListener("change", (e) => {
  if (e.target.id === "service-image") {
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
  }
})
