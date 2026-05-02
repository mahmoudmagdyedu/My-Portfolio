namespace TasksManagementApi.Models;

/// <summary>
/// نموذج المهمة الأساسي.
/// </summary>
public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    /// <summary>Low | Medium | High</summary>
    public string Priority { get; set; } = "Medium";
}
