# 🧩 TaskFlow API — Tasks Management API (.NET 8)

REST API بسيطة وواضحة لإدارة المهام، مبنية على ASP.NET Core 8 مع Minimal Hosting و Swagger، وتخزين In-Memory لتسهيل التشغيل المحلي والتعلّم.

## 🎯 المشكلة
كثير من الفرق تحتاج خدمة خفيفة لإدارة المهام (إنشاء/تعديل/إكمال/حذف) بدون تعقيدات قاعدة بيانات. هذا المشروع يقدّم نقطة انطلاق نظيفة لأي فريق .NET، وهو أول مشروع Back-end في الـ Portfolio لبدء **المرحلة 4 (.NET API)**.

## ✨ المزايا
- نقاط نهاية REST كاملة (CRUD): GET / POST / PUT / DELETE
- توثيق تفاعلي عبر Swagger UI
- بنية طبقات منظمة: `Models` · `Services` · `Controllers`
- Dependency Injection للخدمات
- تخزين In-Memory جاهز، يمكن استبداله لاحقًا بـ EF Core
- بيانات نموذجية (Seed Data) للبدء فورًا
- كود نظيف ومُعلَّق لتسهيل القراءة

## 🛠️ التقنيات
- **.NET 8** (ASP.NET Core Web API)
- **C# 12**
- **Swagger / OpenAPI** (Swashbuckle)
- **Dependency Injection**
- **Minimal Hosting Model**

## 🗂️ هيكل المشروع
```
tasks-management-api/
├── Controllers/
│   └── TasksController.cs
├── Models/
│   └── TaskItem.cs
├── Services/
│   ├── ITaskService.cs
│   └── TaskService.cs
├── Program.cs
├── appsettings.json
└── TasksManagementApi.csproj
```

## ▶️ خطوات التشغيل المحلي
```bash
cd backend/tasks-management-api
dotnet restore
dotnet run
```
ثم افتح: `https://localhost:5001/swagger` لاستعراض الـ API تفاعليًا.

## 📡 نقاط النهاية (Endpoints)
| Method | Endpoint | الوصف |
|---|---|---|
| `GET` | `/api/tasks` | جلب كل المهام |
| `GET` | `/api/tasks/{id}` | جلب مهمة محددة |
| `POST` | `/api/tasks` | إنشاء مهمة جديدة |
| `PUT` | `/api/tasks/{id}` | تعديل مهمة |
| `DELETE` | `/api/tasks/{id}` | حذف مهمة |

## 🧪 مثال طلب إنشاء مهمة
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "إنهاء توثيق المشروع",
  "description": "كتابة README شامل",
  "priority": "High",
  "dueDate": "2026-05-10T00:00:00Z"
}
```

## 🗺️ خطة التطوير (Roadmap)
- [ ] استبدال In-Memory بـ **EF Core + SQL Server**
- [ ] إضافة **Authentication / JWT**
- [ ] إضافة **Validation** عبر FluentValidation
- [ ] إضافة طبقة **Logging** (Serilog)
- [ ] كتابة **Unit Tests** بـ xUnit
- [ ] إضافة **Pagination** و **Filtering** و **Sorting**
- [ ] نشر تلقائي عبر **GitHub Actions** و **Docker**

---
_جزء من Monorepo `My-Portfolio` لتعلّم Full Stack .NET بالتدرّج._
