using TasksManagementApi.Models;

namespace TasksManagementApi.Services;

public interface ITaskService
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? GetById(int id);
    TaskItem Create(TaskItem task);
    bool Update(int id, TaskItem task);
    bool Delete(int id);
}
