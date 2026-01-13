// نظام إدارة المستخدمين المتقدم

class UserSystem {
  constructor() {
    this.users = []
    this.currentUser = null
    this.loadUsers()
    this.loadCurrentUser()
  }

  loadUsers() {
    const saved = localStorage.getItem("users")
    if (saved) this.users = JSON.parse(saved)
  }

  saveUsers() {
    localStorage.setItem("users", JSON.stringify(this.users))
  }

  loadCurrentUser() {
    const saved = localStorage.getItem("currentUser")
    if (saved) this.currentUser = JSON.parse(saved)
  }

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
    }
  }

  // التحقق من صحة البريد الإلكتروني
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // التحقق من قوة كلمة المرور
  isStrongPassword(password) {
    return password.length >= 8
  }

  // تسجيل حساب جديد
  register(userData) {
    const { name, email, password, confirmPassword } = userData

    if (!name || !email || !password || !confirmPassword) {
      return { success: false, error: "الرجاء ملء جميع الحقول" }
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: "البريد الإلكتروني غير صحيح" }
    }

    if (password !== confirmPassword) {
      return { success: false, error: "كلمات المرور غير متطابقة" }
    }

    if (!this.isStrongPassword(password)) {
      return { success: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
    }

    if (this.users.find((u) => u.email === email)) {
      return { success: false, error: "هذا البريد الإلكتروني مسجل بالفعل" }
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password: this.hashPassword(password),
      createdAt: new Date(),
      orders: [],
      favorites: [],
      avatar: this.generateAvatar(name),
    }

    this.users.push(newUser)
    this.saveUsers()

    this.currentUser = { ...newUser, password: undefined }
    this.saveCurrentUser()

    return { success: true, user: this.currentUser }
  }

  // تسجيل دخول
  login(email, password) {
    const user = this.users.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    if (!this.verifyPassword(password, user.password)) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    this.currentUser = { ...user, password: undefined }
    this.saveCurrentUser()

    return { success: true, user: this.currentUser }
  }

  // تسجيل الخروج
  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  // تحديث الملف الشخصي
  updateProfile(updates) {
    if (!this.currentUser) return { success: false, error: "لا يوجد مستخدم مسجل دخول" }

    const user = this.users.find((u) => u.id === this.currentUser.id)
    if (!user) return { success: false, error: "المستخدم غير موجود" }

    Object.assign(user, updates)
    this.saveUsers()

    this.currentUser = { ...user, password: undefined }
    this.saveCurrentUser()

    return { success: true, user: this.currentUser }
  }

  // تغيير كلمة المرور
  changePassword(oldPassword, newPassword, confirmPassword) {
    if (!this.currentUser) return { success: false, error: "لا يوجد مستخدم مسجل دخول" }

    const user = this.users.find((u) => u.id === this.currentUser.id)
    if (!user) return { success: false, error: "المستخدم غير موجود" }

    if (!this.verifyPassword(oldPassword, user.password)) {
      return { success: false, error: "كلمة المرور القديمة غير صحيحة" }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "كلمات المرور الجديدة غير متطابقة" }
    }

    if (!this.isStrongPassword(newPassword)) {
      return { success: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
    }

    user.password = this.hashPassword(newPassword)
    this.saveUsers()

    return { success: true, message: "تم تغيير كلمة المرور بنجاح" }
  }

  // دالة تشفير بسيطة (للاستخدام المحلي فقط)
  hashPassword(password) {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = (hash << 5) - hash + char
    }
    return hash.toString()
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash
  }

  // توليد صورة الملف الشخصي
  generateAvatar(name) {
    const colors = ["#FF1493", "#1E90FF", "#FFD700", "#FF6347", "#00CED1"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='${encodeURIComponent(color)}' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='40' fill='white' text-anchor='middle' dy='.3em'%3E${initials}%3C/text%3E%3C/svg%3E`
  }

  // الحصول على طلبات المستخدم
  getUserOrders() {
    if (!this.currentUser) return []
    return JSON.parse(localStorage.getItem("orders") || "[]").filter((order) => order.userId === this.currentUser.id)
  }

  // إضافة الخدمة للمفضلة
  addToFavorites(serviceId) {
    if (!this.currentUser) return { success: false, error: "يجب تسجيل الدخول أولاً" }

    const user = this.users.find((u) => u.id === this.currentUser.id)
    if (!user.favorites) user.favorites = []

    if (!user.favorites.includes(serviceId)) {
      user.favorites.push(serviceId)
      this.saveUsers()
      this.currentUser.favorites = user.favorites
      this.saveCurrentUser()
    }

    return { success: true }
  }

  // إزالة من المفضلة
  removeFromFavorites(serviceId) {
    if (!this.currentUser) return { success: false, error: "يجب تسجيل الدخول أولاً" }

    const user = this.users.find((u) => u.id === this.currentUser.id)
    user.favorites = user.favorites.filter((id) => id !== serviceId)
    this.saveUsers()
    this.currentUser.favorites = user.favorites
    this.saveCurrentUser()

    return { success: true }
  }
}

// إنشاء مثيل عام من نظام المستخدمين
const userSystem = new UserSystem()
