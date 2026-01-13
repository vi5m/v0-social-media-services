// ========== INITIALIZE APP ==========
let cart = []
let currentUser = null
let services = []
let orders = []
let paymentMethods = {}
let isDarkMode = false

const currencyRates = {
  SAR: 1,
  AED: 0.27,
  USD: 0.27,
  OMR: 0.1,
}

// ========== THEME MANAGEMENT ==========
function toggleTheme() {
  isDarkMode = !isDarkMode
  document.body.classList.toggle("dark-mode")
  localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  updateThemeIcon()
}

function updateThemeIcon() {
  const icon = document.getElementById("theme-toggle").querySelector("i")
  icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon"
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    isDarkMode = true
    document.body.classList.add("dark-mode")
    updateThemeIcon()
  }
}

// ========== DATA MANAGEMENT ==========
function loadData() {
  const savedCart = localStorage.getItem("cart")
  const savedUser = localStorage.getItem("currentUser")
  const savedServices = localStorage.getItem("services")
  const savedOrders = localStorage.getItem("orders")
  const savedPaymentMethods = localStorage.getItem("paymentMethods")

  if (savedCart) cart = JSON.parse(savedCart)
  if (savedUser) currentUser = JSON.parse(savedUser)
  if (savedServices) services = JSON.parse(savedServices)
  if (savedOrders) orders = JSON.parse(savedOrders)
  if (savedPaymentMethods) paymentMethods = JSON.parse(savedPaymentMethods)

  if (services.length === 0) {
    loadDefaultServices()
  }

  // Initialize default payment methods if not set
  if (!paymentMethods.bankName) {
    paymentMethods = {
      bankName: "بنك الراجحي",
      bankAccount: "XXXXXXXXXXXX",
      bankIban: "SA00 0000 0000 0000 0000 0000",
      likeCardCode: "XXXXXXXXXXXX",
    }
    savePaymentMethods()
  }
}

function loadDefaultServices() {
  services = [
    {
      id: 1,
      name: "متابعين تيك توك",
      description: "زيادة متابعين حقيقيين على تيك توك بسرعة وأمان",
      platform: "tiktok",
      prices: { 100: 50, 500: 200, 1000: 350 },
      image: "/images/img-20260113-wa0005.jpg",
    },
    {
      id: 2,
      name: "لايكات انستغرام",
      description: "الحصول على لايكات وتفاعل عالي على منشورات إنستغرام",
      platform: "instagram",
      prices: { 50: 25, 100: 40, 500: 150 },
      image: "/images/img-20260113-wa0003.jpg",
    },
    {
      id: 3,
      name: "متابعين فيسبوك",
      description: "بناء مجتمع فعال وحقيقي على صفحة فيسبوك",
      platform: "facebook",
      prices: { 100: 60, 500: 250, 1000: 400 },
      image: "/images/img-20260113-wa0004.jpg",
    },
  ]
  saveServices()
}

function saveServices() {
  localStorage.setItem("services", JSON.stringify(services))
}

function savePaymentMethods() {
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods))
}

// ========== SERVICES RENDERING ==========
function renderServicesByPlatform() {
  const tiktokServices = services.filter((s) => s.platform === "tiktok")
  const instagramServices = services.filter((s) => s.platform === "instagram")
  const facebookServices = services.filter((s) => s.platform === "facebook")

  renderServicesInContainer("tiktok-services", tiktokServices)
  renderServicesInContainer("instagram-services", instagramServices)
  renderServicesInContainer("facebook-services", facebookServices)
}

function renderServicesInContainer(containerId, servicesList) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = ""
  servicesList.forEach((service) => {
    const card = createServiceCard(service)
    container.appendChild(card)
  })
}

function createServiceCard(service) {
  const card = document.createElement("div")
  card.className = "service-card"

  const pricesHtml = Object.entries(service.prices)
    .map(([quantity, price]) => `<div class="price-item">${quantity}: ${price} ر.س</div>`)
    .join("")

  card.innerHTML = `
    ${service.image ? `<img src="${service.image}" alt="${service.name}">` : ""}
    <div class="service-card-content">
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="prices">${pricesHtml}</div>
      <button class="add-to-cart" onclick="openServiceModal(${service.id})">
        <i class="fas fa-plus"></i> إضافة للسلة
      </button>
    </div>
  `

  return card
}

// ========== CART MANAGEMENT ==========
function addToCart(serviceId) {
  const service = services.find((s) => s.id === serviceId)
  if (service) {
    const firstPrice = Object.values(service.prices)[0]
    const firstQty = Object.keys(service.prices)[0]
    cart.push({
      id: Date.now(),
      serviceId: serviceId,
      name: service.name,
      price: firstPrice,
      quantity: firstQty,
      platform: service.platform,
    })
    saveCart()
    updateCartCount()
    showNotification("تمت إضافة الخدمة إلى السلة بنجاح", "success")
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length
}

function toggleCart() {
  const modal = document.getElementById("cart-modal")
  if (modal.style.display === "block") {
    closeModal("cart-modal")
  } else {
    openModal("cart-modal")
    renderCart()
  }
}

function renderCart() {
  const cartItems = document.getElementById("cart-items")
  cartItems.innerHTML = ""

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-gray);">السلة فارغة</p>'
    return
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div")
    div.className = "cart-item"
    div.innerHTML = `
            <div class="cart-item-details">
                <strong>${item.name}</strong><br>
                <small>الكمية: ${item.quantity}</small>
            </div>
            <div class="cart-item-price">${item.price} ر.س</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `
    cartItems.appendChild(div)
  })

  updateCartTotal()
}

function removeFromCart(index) {
  cart.splice(index, 1)
  saveCart()
  updateCartCount()
  renderCart()
  showNotification("تم حذف الخدمة من السلة", "info")
}

function updateCartTotal() {
  const currency = document.getElementById("currency-select").value
  const currencies = {
    SAR: { rate: 1, symbol: "ر.س" },
    AED: { rate: 0.27, symbol: "د.إ" },
    USD: { rate: 0.27, symbol: "$" },
    OMR: { rate: 0.1, symbol: "ر.ع." },
  }

  const totalSAR = cart.reduce((sum, item) => sum + item.price, 0)
  const converted = (totalSAR * currencies[currency].rate).toFixed(2)

  document.getElementById("cart-total").textContent = converted
  document.getElementById("total-currency").textContent = currencies[currency].symbol
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("السلة فارغة", "warning")
    return
  }

  closeModal("cart-modal")
  document.getElementById("checkout-page").style.display = "block"
  window.scrollTo(0, 0)

  // Update checkout items
  const currency = document.getElementById("currency-select").value
  const checkoutItems = document.getElementById("checkout-items")
  checkoutItems.innerHTML = ""

  cart.forEach((item) => {
    const p = document.createElement("p")
    p.textContent = `${item.name} (${item.quantity}): ${item.price} ر.س`
    checkoutItems.appendChild(p)
  })

  updateCheckoutTotal()
}

function updateCheckoutTotal() {
  const currency = document.getElementById("currency-select").value
  const currencies = {
    SAR: { rate: 1, symbol: "ر.س" },
    AED: { rate: 0.27, symbol: "د.إ" },
    USD: { rate: 0.27, symbol: "$" },
    OMR: { rate: 0.1, symbol: "ر.ع." },
  }

  const totalSAR = cart.reduce((sum, item) => sum + item.price, 0)
  const converted = (totalSAR * currencies[currency].rate).toFixed(2)

  document.getElementById("checkout-total").textContent = converted
  document.getElementById("checkout-currency").textContent = currencies[currency].symbol
}

function backToCart() {
  document.getElementById("checkout-page").style.display = "none"
  openModal("cart-modal")
}

function completeOrder() {
  const accountName = document.getElementById("order-account").value.trim()
  const email = document.getElementById("order-email").value.trim()
  const phone = document.getElementById("order-phone").value.trim()
  const notes = document.getElementById("order-notes").value.trim()
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value

  if (!accountName || !email || !phone) {
    showToast("يرجى ملء جميع البيانات المطلوبة", "error")
    return
  }

  if (cart.length === 0) {
    showToast("السلة فارغة", "error")
    return
  }

  const currencySelect = document.getElementById("currency-select")
  const selectedCurrency = currencySelect ? currencySelect.value : "SAR"
  const totalInSAR = Number.parseFloat(document.getElementById("checkout-total").textContent)

  const order = {
    id: Date.now(),
    date: new Date().toLocaleString("ar-SA"),
    services: cart.map((item) => ({
      serviceId: item.serviceId,
      serviceName: item.name,
      platform: item.platform,
      quantity: item.quantity,
      pricePerUnit: item.price,
      subtotal: item.quantity * item.price,
    })),
    total: totalInSAR,
    currency: selectedCurrency,
    status: "pending",
    accountName: accountName,
    email: email,
    phone: phone,
    notes: notes,
    paymentMethod: paymentMethod,
    currentUser: currentUser ? currentUser.email : "guest",
  }

  // Load existing orders
  let orders = []
  const savedOrders = localStorage.getItem("orders")
  if (savedOrders) {
    orders = JSON.parse(savedOrders)
  }

  // Add new order
  orders.push(order)

  // Save to localStorage
  localStorage.setItem("orders", JSON.stringify(orders))

  console.log("[v0] Order saved to localStorage:", order)
  console.log("[v0] All orders:", orders)

  showToast("تم تأكيد الطلب بنجاح! سيتم مراجعته قريباً", "success")

  // Clear cart and close checkout
  cart = []
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartCount()

  setTimeout(() => {
    document.getElementById("checkout-page").style.display = "none"
    document.getElementById("cart-modal").style.display = "none"
    document.querySelector("main").style.display = "block"
    scrollToTop()
  }, 1500)
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// ========== AUTH FUNCTIONS ==========
function toggleAuthMenu() {
  const menu = document.getElementById("auth-menu")
  menu.style.display = menu.style.display === "block" ? "none" : "block"
}

function showLoginForm() {
  openModal("auth-modal")
  switchAuthTab("login")
  toggleAuthMenu()
}

function showRegisterForm() {
  openModal("auth-modal")
  switchAuthTab("register")
  toggleAuthMenu()
}

function goToAdmin() {
  window.location.href = "admin.html"
  toggleAuthMenu()
}

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"))
  document.querySelectorAll(".auth-tab").forEach((btn) => btn.classList.remove("active"))

  const form = document.getElementById(tab + "-form")
  const tab_btn = event.currentTarget
  if (form) form.classList.add("active")
  if (tab_btn) tab_btn.classList.add("active")
}

function login() {
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  if (!email || !password) {
    showNotification("يرجى ملء جميع الحقول", "warning")
    return
  }

  currentUser = {
    id: Date.now(),
    email,
    loginTime: new Date().toLocaleString("ar-SA"),
  }
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  showNotification("تم تسجيل الدخول بنجاح", "success")
  closeModal("auth-modal")
  updateCartCount()
}

function register() {
  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const confirm = document.getElementById("register-confirm").value

  if (!name || !email || !password || !confirm) {
    showNotification("يرجى ملء جميع الحقول", "warning")
    return
  }

  if (password !== confirm) {
    showNotification("كلمات المرور غير متطابقة", "warning")
    return
  }

  currentUser = {
    id: Date.now(),
    name,
    email,
    registerTime: new Date().toLocaleString("ar-SA"),
  }
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  showNotification("تم إنشاء الحساب بنجاح", "success")
  closeModal("auth-modal")
  updateCartCount()
}

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
  }
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

function showToast(message, type = "info") {
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

// ========== UTILITY FUNCTIONS ==========
function scrollToServices() {
  document.getElementById("services").scrollIntoView({ behavior: "smooth" })
}

// ========== EVENT LISTENERS ==========
window.addEventListener("DOMContentLoaded", () => {
  loadTheme()
  loadData()
  renderServicesByPlatform()
  updateCartCount()
})

window.addEventListener("load", () => {
  // Check if admin is already logged in
  const savedAdmin = localStorage.getItem("adminUser")
  if (savedAdmin && window.location.pathname.includes("admin.html")) {
    // Admin page will handle this
  }
})

window.onclick = (event) => {
  const cartModal = document.getElementById("cart-modal")
  const authModal = document.getElementById("auth-modal")
  const authMenu = document.getElementById("auth-menu")

  if (event.target === cartModal) closeModal("cart-modal")
  if (event.target === authModal) closeModal("auth-modal")
  if (event.target !== document.querySelector(".auth-btn") && !authMenu.contains(event.target)) {
    authMenu.style.display = "none"
  }
}

// ========== INITIALIZE ==========
