// نظام التقارير والإحصائيات المتقدم

class ReportsSystem {
  constructor() {
    this.orders = JSON.parse(localStorage.getItem("orders") || "[]")
    this.services = JSON.parse(localStorage.getItem("services") || "[]")
  }

  // توليد تقرير المبيعات
  generateSalesReport(startDate = null, endDate = null) {
    let filteredOrders = this.orders

    if (startDate && endDate) {
      filteredOrders = this.orders.filter((order) => {
        const orderDate = new Date(order.date)
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
      })
    }

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = filteredOrders.length
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      avgOrder: avgOrder.toFixed(2),
      completedOrders: filteredOrders.filter((o) => o.status === "completed").length,
      pendingOrders: filteredOrders.filter((o) => o.status === "pending").length,
    }
  }

  // تقرير الخدمات الأكثر طلباً
  getTopServices() {
    const serviceStats = {}

    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!serviceStats[item.id]) {
          serviceStats[item.id] = { name: item.name, count: 0, revenue: 0 }
        }
        serviceStats[item.id].count++
        serviceStats[item.id].revenue += item.price
      })
    })

    return Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue)
  }

  // تقرير المبيعات اليومية
  getDailySalesReport() {
    const dailyStats = {}

    this.orders.forEach((order) => {
      const date = order.date
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, revenue: 0 }
      }
      dailyStats[date].orders++
      dailyStats[date].revenue += order.total
    })

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // حساب معدل التحويل
  getConversionRate() {
    const totalOrders = this.orders.length
    const completedOrders = this.orders.filter((o) => o.status === "completed").length
    return totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
  }

  // تصدير التقرير إلى CSV
  exportToCSV() {
    const report = this.generateSalesReport()
    const topServices = this.getTopServices()

    let csv = "تقرير المبيعات\n"
    csv += `إجمالي المبيعات,${report.totalSales}\n`
    csv += `عدد الطلبات,${report.totalOrders}\n`
    csv += `متوسط الطلب,${report.avgOrder}\n\n`

    csv += "الخدمات الأكثر طلباً\n"
    csv += "الخدمة,عدد الطلبات,الإيرادات\n"
    topServices.forEach((service) => {
      csv += `${service.name},${service.count},${service.revenue.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }
}

// إنشاء مثيل من نظام التقارير
const reportsSystem = new ReportsSystem()

// دوال التقارير للاستخدام في الأدمن
function generateReport() {
  const startDate = document.getElementById("report-start-date").value
  const endDate = document.getElementById("report-end-date").value

  const report = reportsSystem.generateSalesReport(startDate, endDate)
  const topServices = reportsSystem.getTopServices()
  const dailyReport = reportsSystem.getDailySalesReport()
  const conversionRate = reportsSystem.getConversionRate()

  // تحديث عناصر التقرير
  document.getElementById("total-sales").textContent = report.totalSales + " ر.س"
  document.getElementById("total-orders-report").textContent = report.totalOrders
  document.getElementById("avg-order").textContent = report.avgOrder + " ر.س"
  document.getElementById("conversion-rate").textContent = conversionRate + "%"

  // تحديث جدول الخدمات
  const servicesBody = document.getElementById("services-report-body")
  servicesBody.innerHTML = topServices
    .map((service) => {
      const percentage = ((service.revenue / (report.totalSales * 1)) * 100).toFixed(1)
      return `
        <tr>
            <td>${service.name}</td>
            <td>${service.count}</td>
            <td>${service.revenue.toFixed(2)} ر.س</td>
            <td>${percentage}%</td>
        </tr>
    `
    })
    .join("")

  // تحديث التقرير اليومي
  const dailyBody = document.getElementById("daily-report-body")
  dailyBody.innerHTML = dailyReport
    .map((day) => {
      return `
        <tr>
            <td>${day.date}</td>
            <td>${day.orders}</td>
            <td>${day.revenue.toFixed(2)} ر.س</td>
        </tr>
    `
    })
    .join("")
}

function exportReport() {
  reportsSystem.exportToCSV()
}
