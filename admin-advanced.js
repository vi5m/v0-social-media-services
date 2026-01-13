// نظام الإشعارات
const notificationSystem = {
  addNotification: (message, type) => {
    console.log(`[${type}] ${message}`)
  },
}

// إدارة المستخدمين الأدمن
function addAdminUser() {
  const username = prompt("اسم المستخدم الجديد:")
  const password = prompt("كلمة المرور:")

  if (username && password) {
    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    admins.push({
      id: Date.now(),
      username,
      password, // Note: في التطبيق الحقيقي يجب تشفيرها
      createdAt: new Date(),
    })
    localStorage.setItem("admins", JSON.stringify(admins))
    notificationSystem.addNotification("تم إضافة أدمن جديد بنجاح", "success")
    loadAdminUsers()
  }
}

function loadAdminUsers() {
  const admins = JSON.parse(localStorage.getItem("admins") || "[]")
  const tbody = document.getElementById("admins-tbody")
  if (!tbody) return

  tbody.innerHTML = ""
  admins.forEach((admin, index) => {
    const row = tbody.insertRow()
    row.innerHTML = `
        <td>${admin.username}</td>
        <td>${new Date(admin.createdAt).toLocaleDateString("ar-SA")}</td>
        <td>
            <button class="action-btn delete-btn" onclick="deleteAdmin(${index})">حذف</button>
        </td>
    `
  })
}

function deleteAdmin(index) {
  if (confirm("هل أنت متأكد من حذف هذا الأدمن؟")) {
    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    admins.splice(index, 1)
    localStorage.setItem("admins", JSON.stringify(admins))
    notificationSystem.addNotification("تم حذف الأدمن بنجاح", "success")
    loadAdminUsers()
  }
}

// إدارة العروض الخاصة والخصومات
class DiscountSystem {
  constructor() {
    this.discounts = JSON.parse(localStorage.getItem("discounts") || "[]")
  }

  addDiscount(data) {
    const discount = {
      id: Date.now(),
      code: data.code.toUpperCase(),
      percentage: data.percentage,
      maxUses: data.maxUses,
      currentUses: 0,
      expiryDate: data.expiryDate,
      status: "active",
    }

    this.discounts.push(discount)
    this.save()
    return discount
  }

  removeDiscount(id) {
    this.discounts = this.discounts.filter((d) => d.id !== id)
    this.save()
  }

  applyDiscount(code, totalPrice) {
    const discount = this.discounts.find((d) => d.code === code.toUpperCase() && d.status === "active")

    if (!discount) return { valid: false, error: "كود الخصم غير صحيح" }

    if (discount.currentUses >= discount.maxUses) {
      return { valid: false, error: "انتهى عدد استخدامات هذا الكود" }
    }

    if (new Date(discount.expiryDate) < new Date()) {
      return { valid: false, error: "انتهت صلاحية هذا الكود" }
    }

    const discountAmount = (totalPrice * discount.percentage) / 100
    discount.currentUses++
    this.save()

    return { valid: true, percentage: discount.percentage, amount: discountAmount.toFixed(2) }
  }

  save() {
    localStorage.setItem("discounts", JSON.stringify(this.discounts))
  }
}

const discountSystem = new DiscountSystem()

// دالة إدارة الخصومات
function manageDiscounts() {
  const code = prompt("أدخل كود الخصم:")
  const percentage = prompt("نسبة الخصم (%):")
  const maxUses = prompt("الحد الأقصى للاستخدامات:")
  const expiryDate = prompt("تاريخ الانتهاء (YYYY-MM-DD):")

  if (code && percentage && maxUses && expiryDate) {
    const discount = discountSystem.addDiscount({
      code,
      percentage: Number.parseFloat(percentage),
      maxUses: Number.parseInt(maxUses),
      expiryDate,
    })

    notificationSystem.addNotification(`تم إضافة كود الخصم: ${discount.code}`, "success")
    renderDiscounts()
  }
}

function renderDiscounts() {
  const tbody = document.getElementById("discounts-tbody")
  if (!tbody) return

  tbody.innerHTML = ""
  discountSystem.discounts.forEach((discount) => {
    const row = tbody.insertRow()
    row.innerHTML = `
        <td>${discount.code}</td>
        <td>${discount.percentage}%</td>
        <td>${discount.currentUses}/${discount.maxUses}</td>
        <td>${discount.expiryDate}</td>
        <td>
            <select onchange="updateDiscountStatus(${discount.id}, this.value)">
                <option value="active" ${discount.status === "active" ? "selected" : ""}>نشط</option>
                <option value="inactive" ${discount.status === "inactive" ? "selected" : ""}>معطل</option>
            </select>
        </td>
        <td>
            <button class="action-btn delete-btn" onclick="deleteDiscount(${discount.id})">حذف</button>
        </td>
    `
  })
}

function updateDiscountStatus(id, status) {
  const discount = discountSystem.discounts.find((d) => d.id === id)
  if (discount) {
    discount.status = status
    discountSystem.save()
    renderDiscounts()
  }
}

function deleteDiscount(id) {
  if (confirm("هل أنت متأكد من حذف هذا الخصم؟")) {
    discountSystem.removeDiscount(id)
    notificationSystem.addNotification("تم حذف الخصم بنجاح", "success")
    renderDiscounts()
  }
}

// نظام العودة والاسترجاع
class ReturnSystem {
  constructor() {
    this.returns = JSON.parse(localStorage.getItem("returns") || "[]")
  }

  createReturn(orderId, reason) {
    const return_ = {
      id: Date.now(),
      orderId,
      reason,
      status: "pending",
      requestDate: new Date(),
      approvalDate: null,
    }

    this.returns.push(return_)
    this.save()
    return return_
  }

  approveReturn(returnId) {
    const return_ = this.returns.find((r) => r.id === returnId)
    if (return_) {
      return_.status = "approved"
      return_.approvalDate = new Date()
      this.save()
    }
  }

  rejectReturn(returnId) {
    const return_ = this.returns.find((r) => r.id === returnId)
    if (return_) {
      return_.status = "rejected"
      this.save()
    }
  }

  save() {
    localStorage.setItem("returns", JSON.stringify(this.returns))
  }
}

const returnSystem = new ReturnSystem()

// دالة عرض طلبات العودة
function renderReturns() {
  const tbody = document.getElementById("returns-tbody")
  if (!tbody) return

  tbody.innerHTML = ""
  returnSystem.returns.forEach((return_) => {
    const row = tbody.insertRow()
    const order = JSON.parse(localStorage.getItem("orders") || "[]").find((o) => o.id === return_.orderId)
    row.innerHTML = `
        <td>#${return_.orderId}</td>
        <td>${return_.reason}</td>
        <td>${new Date(return_.requestDate).toLocaleDateString("ar-SA")}</td>
        <td>
            <select onchange="updateReturnStatus(${return_.id}, this.value)">
                <option value="pending" ${return_.status === "pending" ? "selected" : ""}>قيد الانتظار</option>
                <option value="approved" ${return_.status === "approved" ? "selected" : ""}>موافق عليه</option>
                <option value="rejected" ${return_.status === "rejected" ? "selected" : ""}>مرفوض</option>
            </select>
        </td>
    `
  })
}

function updateReturnStatus(returnId, status) {
  if (status === "approved") {
    returnSystem.approveReturn(returnId)
    notificationSystem.addNotification("تمت الموافقة على طلب العودة", "success")
  } else if (status === "rejected") {
    returnSystem.rejectReturn(returnId)
    notificationSystem.addNotification("تم رفض طلب العودة", "error")
  }
  renderReturns()
}

// نظام الفاتورات
function generateInvoice(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  const order = orders.find((o) => o.id === orderId)

  if (!order) return

  const invoiceContent = `
        ==========================================
        فاتورة مبيعات
        ==========================================
        رقم الفاتورة: ${order.id}
        التاريخ: ${order.date}
        
        تفاصيل الخدمات:
        ${order.items.map((item) => `- ${item.name} (${item.quantity}): ${item.price} ر.س`).join("\n")}
        
        ==========================================
        الإجمالي: ${order.total} ر.س
        ==========================================
    `

  const element = document.createElement("a")
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(invoiceContent))
  element.setAttribute("download", `invoice-${orderId}.txt`)
  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
