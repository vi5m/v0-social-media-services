// نظام الإشعارات والتنبيهات المتقدم

class NotificationSystem {
  constructor() {
    this.notifications = []
    this.loadNotifications()
  }

  loadNotifications() {
    const saved = localStorage.getItem("notifications")
    if (saved) this.notifications = JSON.parse(saved)
  }

  saveNotifications() {
    localStorage.setItem("notifications", JSON.stringify(this.notifications))
  }

  // إضافة إشعار جديد
  addNotification(message, type = "info", duration = 5000) {
    const notification = {
      id: Date.now(),
      message,
      type, // success, error, warning, info
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(notification)
    this.saveNotifications()
    this.showToast(message, type, duration)

    return notification
  }

  // عرض الإشعار كـ Toast
  showToast(message, type, duration) {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.textContent = message

    const container = document.getElementById("toast-container") || this.createToastContainer()
    container.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  createToastContainer() {
    const container = document.createElement("div")
    container.id = "toast-container"
    container.className = "toast-container"
    document.body.appendChild(container)
    return container
  }

  // الحصول على الإشعارات غير المقروءة
  getUnreadNotifications() {
    return this.notifications.filter((n) => !n.read)
  }

  // تحديد الإشعار كمقروء
  markAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.saveNotifications()
    }
  }

  // إرسال إشعار للأدمن عن طلب جديد
  notifyAdminNewOrder(order) {
    const message = `طلب جديد: ${order.items.map((i) => i.name).join(", ")} - ${order.total} ر.س`
    this.addNotification(message, "success")

    // حفظ في قاعدة البيانات المحلية
    const adminNotifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]")
    adminNotifications.push({
      id: Date.now(),
      orderId: order.id,
      message,
      timestamp: new Date(),
      read: false,
    })
    localStorage.setItem("adminNotifications", JSON.stringify(adminNotifications))
  }

  // إرسال إشعار للعميل عن حالة الطلب
  notifyCustomerOrderStatus(orderId, status) {
    const statusMessages = {
      pending: "تم استقبال طلبك، جاري المعالجة",
      completed: "تم إكمال طلبك بنجاح!",
      cancelled: "تم إلغاء طلبك",
    }

    const message = `تحديث الطلب #${orderId}: ${statusMessages[status] || status}`
    this.addNotification(message, status === "completed" ? "success" : "info")
  }
}

// إنشاء مثيل عام من النظام
const notificationSystem = new NotificationSystem()
