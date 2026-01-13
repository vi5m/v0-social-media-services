// ========== PERFORMANCE OPTIMIZATION ==========
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      loadTime: 0,
      storageSize: 0,
      optimizedImages: 0,
    }
  }

  measureLoadTime() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      this.metrics.loadTime = loadTime
      console.log(`[v0] وقت التحميل الإجمالي: ${loadTime}ms`)
      return loadTime
    }
    return 0
  }

  optimizeStorage() {
    try {
      let storageSize = 0
      const keys = Object.keys(localStorage)

      keys.forEach((key) => {
        const item = localStorage.getItem(key)
        if (item) {
          storageSize += item.length
        }
      })

      const sizeInKB = (storageSize / 1024).toFixed(2)
      this.metrics.storageSize = sizeInKB
      console.log(`[v0] حجم التخزين المستخدم: ${sizeInKB} KB`)

      // تنظيف البيانات القديمة (أكثر من 90 يوم)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")

      if (orders.length > 0) {
        const originalCount = orders.length
        const filteredOrders = orders.filter((o) => {
          try {
            return new Date(o.date) > ninetyDaysAgo
          } catch (e) {
            return true
          }
        })

        if (filteredOrders.length < originalCount) {
          localStorage.setItem("orders", JSON.stringify(filteredOrders))
          console.log(`[v0] تم حذف ${originalCount - filteredOrders.length} طلب قديم`)
        }
      }

      return sizeInKB
    } catch (error) {
      console.error("[v0] خطأ في تحسين التخزين:", error)
      return 0
    }
  }

  optimizeImages() {
    const images = document.querySelectorAll("img")
    let optimizedCount = 0

    images.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy")
        optimizedCount++
      }

      // إضافة معالج للأخطاء
      if (!img.hasAttribute("onerror")) {
        img.onerror = function () {
          this.src = "/customer-service-interaction.png"
        }
      }
    })

    this.metrics.optimizedImages = optimizedCount
    if (optimizedCount > 0) {
      console.log(`[v0] تم تطبيق lazy loading على ${optimizedCount} صورة`)
    }

    return optimizedCount
  }

  async runOptimizations() {
    console.log("[v0] بدء تحسينات الأداء...")

    try {
      this.measureLoadTime()
      this.optimizeStorage()
      this.optimizeImages()

      console.log("[v0] اكتملت تحسينات الأداء بنجاح")
      return this.metrics
    } catch (error) {
      console.error("[v0] خطأ في تحسينات الأداء:", error)
      return this.metrics
    }
  }

  generatePerformanceReport() {
    const report = {
      وقت_التحميل_ms: this.metrics.loadTime,
      حجم_التخزين_KB: this.metrics.storageSize,
      الصور_المحسنة: this.metrics.optimizedImages,
      الوقت: new Date().toLocaleString("ar-SA"),
    }

    console.log("[v0] تقرير الأداء:")
    console.table(report)
    return report
  }
}

// ========== AUTOMATED TESTING ==========
class AutomatedTesting {
  constructor() {
    this.tests = []
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    }
  }

  addTest(name, testFunc) {
    this.tests.push({ name, testFunc, status: null })
  }

  async runAllTests() {
    console.log("\n" + "=".repeat(60))
    console.log("بدء نظام الاختبارات الآلية")
    console.log("=".repeat(60) + "\n")

    this.results.total = this.tests.length

    for (const test of this.tests) {
      try {
        await Promise.resolve(test.testFunc())
        test.status = "passed"
        this.results.passed++
        console.log(`✓ ${test.name}`)
      } catch (error) {
        test.status = "failed"
        this.results.failed++
        console.error(`✗ ${test.name}`)
        console.error(`  السبب: ${error.message}`)
      }
    }

    this.printSummary()
    return this.results
  }

  printSummary() {
    const passPercentage = ((this.results.passed / this.results.total) * 100).toFixed(1)
    console.log("\n" + "=".repeat(60))
    console.log("ملخص الاختبارات:")
    console.log(`إجمالي الاختبارات: ${this.results.total}`)
    console.log(`نجح: ${this.results.passed} ✓`)
    console.log(`فشل: ${this.results.failed} ✗`)
    console.log(`نسبة النجاح: ${passPercentage}%`)
    console.log("=".repeat(60) + "\n")
  }
}

// ========== INITIALIZE OPTIMIZER & TESTER ==========
const optimizer = new PerformanceOptimizer()
const tester = new AutomatedTesting()

// اختبار البيانات الأساسية
tester.addTest("اختبار تحميل الخدمات", () => {
  const services = JSON.parse(localStorage.getItem("services") || "[]")
  if (!Array.isArray(services)) {
    throw new Error("الخدمات ليست مصفوفة")
  }
})

tester.addTest("اختبار سلة التسوق", () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  if (!Array.isArray(cart)) {
    throw new Error("السلة ليست مصفوفة")
  }
})

tester.addTest("اختبار الطلبات", () => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  if (!Array.isArray(orders)) {
    throw new Error("الطلبات ليست مصفوفة")
  }
})

tester.addTest("اختبار طرق الدفع", () => {
  const paymentMethods = JSON.parse(localStorage.getItem("paymentMethods") || "{}")
  if (typeof paymentMethods !== "object") {
    throw new Error("طرق الدفع ليست كائن صحيح")
  }
})

tester.addTest("اختبار إعدادات الموقع", () => {
  const settings = JSON.parse(localStorage.getItem("siteSettings") || "{}")
  if (typeof settings !== "object") {
    throw new Error("الإعدادات ليست كائن صحيح")
  }
})

// اختبارات DOM
tester.addTest("اختبار عناصر الصفحة الأساسية", () => {
  if (!document.querySelector(".navbar")) {
    throw new Error("شريط التنقل غير موجود")
  }
  if (!document.querySelector(".footer")) {
    throw new Error("التذييل غير موجود")
  }
})

tester.addTest("اختبار وجود الأزرار الرئيسية", () => {
  const buttons = document.querySelectorAll("button")
  if (buttons.length === 0) {
    throw new Error("لا توجد أزرار في الصفحة")
  }
})

// ========== PERFORMANCE MONITORING ==========
class PerformanceMonitor {
  constructor() {
    this.logs = []
  }

  log(message, level = "info") {
    const timestamp = new Date().toLocaleTimeString("ar-SA")
    const log = { timestamp, message, level }
    this.logs.push(log)

    if (level === "error") {
      console.error(`[${timestamp}] ${message}`)
    } else if (level === "warning") {
      console.warn(`[${timestamp}] ${message}`)
    } else {
      console.log(`[${timestamp}] ${message}`)
    }
  }

  exportLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

const monitor = new PerformanceMonitor()

// ========== INITIALIZATION ==========
window.addEventListener("load", async () => {
  monitor.log("بدء تهيئة الموقع", "info")

  try {
    // تشغيل تحسينات الأداء
    await optimizer.runOptimizations()
    monitor.log("اكتملت تحسينات الأداء", "info")

    // تشغيل الاختبارات (يمكن تفعيله عند الحاجة)
    // await tester.runAllTests()

    monitor.log("اكتملت تهيئة الموقع بنجاح", "info")
  } catch (error) {
    monitor.log(`خطأ في التهيئة: ${error.message}`, "error")
  }
})

// معالجة الأخطاء العامة
window.addEventListener("error", (event) => {
  monitor.log(`خطأ: ${event.message}`, "error")
})

window.addEventListener("unhandledrejection", (event) => {
  monitor.log(`رفض غير معالج: ${event.reason}`, "error")
})

// تصدير الدوال للاستخدام
window.runTests = () => tester.runAllTests()
window.getPerformanceReport = () => optimizer.generatePerformanceReport()
window.getPerformanceLogs = () => monitor.exportLogs()
