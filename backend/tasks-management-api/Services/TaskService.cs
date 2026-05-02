using TasksManagementApi.Models;

namespace TasksManagementApi.Services;

/// <summary>
/// خدمة المهام بتخزين In-Memory مع بيانات نموذجية للبدء.
/// </summary>
public class TaskService : ITaskService
{
    private readonly List<TaskItem> _tasks;
    private int _nextId;

    public TaskService()
    {
        _tasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "تعلم .NET 8", Description = "دراسة Minimal APIs", Priority = "High" },
            new() { Id = 2, Title = "بناء API لإدارة المهام", IsCompleted = true, Priority = "High" },
            new() { Id = 3, Title = "إضافة Swagger UI", Priority = "Medium" }
        };
        _nextId = _tasks.Max(t => t.Id) + 1;
    }

    public IEnumerable<TaskItem> GetAll() => _tasks;

    public TaskItem? GetById(int id) => _tasks.FirstOrDefault(t => t.Id == id);

    public TaskItem Create(TaskItem task)
    {
        task.Id = _nextId++;
        task.CreatedAt = DateTime.UtcNow;
        _tasks.Add(task);
        return task;
    }

    public bool Update(int id, TaskItem updated)
    {
        var task = GetById(id);
        if (task is null) return false;

        task.Title = updated.Title;
        task.Description = updated.Description;
        task.IsCompleted = updated.IsCompleted;
        task.DueDate = updated.DueDate;
        task.Priority = updated.Priority;
        return true;
    }

    public bool Delete(int id)
    {
        var task = GetById(id);
        if (task is null) return false;
        _tasks.Remove(task);
        return true;
    }
}
