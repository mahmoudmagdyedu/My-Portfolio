using System.ComponentModel.DataAnnotations;

namespace ExpensesApi.Models;

public class Expense
{
    public int Id { get; set; }

    [Required, StringLength(120)]
    public string Title { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required, StringLength(40)]
    public string Category { get; set; } = "Other";

    public DateTime Date { get; set; } = DateTime.UtcNow;

    [StringLength(500)]
    public string? Notes { get; set; }
}
