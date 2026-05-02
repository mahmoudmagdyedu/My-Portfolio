using Microsoft.AspNetCore.Mvc;
using TasksManagementApi.Models;
using TasksManagementApi.Services;

namespace TasksManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service) => _service = service;

    /// <summary>جلب كل المهام.</summary>
    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetAll() => Ok(_service.GetAll());

    /// <summary>جلب مهمة محددة.</summary>
    [HttpGet("{id:int}")]
    public ActionResult<TaskItem> GetById(int id)
    {
        var task = _service.GetById(id);
        return task is null ? NotFound() : Ok(task);
    }

    /// <summary>إنشاء مهمة جديدة.</summary>
    [HttpPost]
    public ActionResult<TaskItem> Create([FromBody] TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            return BadRequest("Title is required.");

        var created = _service.Create(task);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>تعديل مهمة قائمة.</summary>
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] TaskItem task)
        => _service.Update(id, task) ? NoContent() : NotFound();

    /// <summary>حذف مهمة.</summary>
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
        => _service.Delete(id) ? NoContent() : NotFound();
}
