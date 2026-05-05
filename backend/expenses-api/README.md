# Expenses API

> .NET 8 Minimal Web API لإدارة المصروفات الشخصية مع CRUD كامل وقاعدة بيانات SQLite عبر EF Core.

## 📌 المشكلة
معظم تطبيقات تتبع المصروفات تحتاج لخدمة خلفية موثوقة تخزّن البيانات وتعرض API منظّم. هذا المشروع يقدّم نموذجًا مبسطًا وقابلًا للتوسعة لخدمة `Expenses API` يمكن استهلاكها من أي Front-end (مثل [`expense-tracker-app`](../../frontend/expense-tracker-app)).

## ✨ المزايا
- CRUD كامل: إنشاء/قراءة/تحديث/حذف للمصروفات.
- تصنيفات (Food, Transport, Bills, Entertainment, Other).
- فلترة حسب التاريخ والتصنيف.
- ملخص شهري (إجمالي المصروفات لكل تصنيف).
- توثيق تلقائي عبر Swagger / OpenAPI.
- Logging مدمج + Validation عبر Data Annotations.
- بيانات Seed تلقائية في أول تشغيل.

## 🧰 التقنيات
- .NET 8 (Minimal APIs)
- Entity Framework Core 8 + SQLite
- Swashbuckle (Swagger UI)
- xUnit (مخطط لاحقًا)

## 🚀 التشغيل المحلي
```bash
cd backend/expenses-api
dotnet restore
dotnet ef database update    # ينشئ ملف expenses.db تلقائيًا
dotnet run
```
ثم افتح: <http://localhost:5080/swagger>

## 🔗 نقاط النهاية الرئيسية
| Method | Endpoint                          | الوصف                          |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/expenses`                   | قائمة المصروفات (مع فلاتر)     |
| GET    | `/api/expenses/{id}`              | مصروف واحد                     |
| POST   | `/api/expenses`                   | إضافة مصروف جديد               |
| PUT    | `/api/expenses/{id}`              | تحديث مصروف                    |
| DELETE | `/api/expenses/{id}`              | حذف مصروف                      |
| GET    | `/api/expenses/summary?month=...` | ملخص شهري حسب التصنيف          |

## 🗺️ خطة التطوير (Roadmap)
- [ ] JWT Authentication + Users.
- [ ] ربط مع SQL Server بدلًا من SQLite.
- [ ] Pagination + Sorting موحَّدين.
- [ ] CI Workflow + اختبارات xUnit.
- [ ] نشر على Azure App Service.

## 📂 البنية
```
expenses-api/
├── Program.cs
├── expenses-api.csproj
├── appsettings.json
├── Models/
│   └── Expense.cs
├── Data/
│   └── ExpensesDbContext.cs
└── Endpoints/
    └── ExpensesEndpoints.cs
```
