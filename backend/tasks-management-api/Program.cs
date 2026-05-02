using TasksManagementApi.Services;

var builder = WebApplication.CreateBuilder(args);

// إضافة الخدمات للحاوية (Dependency Injection)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "TaskFlow API",
        Version = "v1",
        Description = "Tasks Management REST API built with .NET 8"
    });
});

// تسجيل خدمة المهام كـ Singleton (تخزين in-memory)
builder.Services.AddSingleton<ITaskService, TaskService>();

var app = builder.Build();

// إعداد الـ pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
