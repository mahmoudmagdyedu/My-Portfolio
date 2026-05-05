using ExpensesApi.Data;
using ExpensesApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpensesApi.Endpoints;

public static class ExpensesEndpoints
{
    public static void MapExpensesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/expenses").WithTags("Expenses");

        group.MapGet("/", async (ExpensesDbContext db, string? category, DateTime? from, DateTime? to) =>
        {
            var query = db.Expenses.AsQueryable();
            if (!string.IsNullOrWhiteSpace(category)) query = query.Where(e => e.Category == category);
            if (from.HasValue) query = query.Where(e => e.Date >= from.Value);
            if (to.HasValue)   query = query.Where(e => e.Date <= to.Value);
            return Results.Ok(await query.OrderByDescending(e => e.Date).ToListAsync());
        });

        group.MapGet("/{id:int}", async (int id, ExpensesDbContext db) =>
            await db.Expenses.FindAsync(id) is { } expense ? Results.Ok(expense) : Results.NotFound());

        group.MapPost("/", async ([FromBody] Expense expense, ExpensesDbContext db) =>
        {
            db.Expenses.Add(expense);
            await db.SaveChangesAsync();
            return Results.Created($"/api/expenses/{expense.Id}", expense);
        });

        group.MapPut("/{id:int}", async (int id, [FromBody] Expense input, ExpensesDbContext db) =>
        {
            var expense = await db.Expenses.FindAsync(id);
            if (expense is null) return Results.NotFound();
            expense.Title = input.Title;
            expense.Amount = input.Amount;
            expense.Category = input.Category;
            expense.Date = input.Date;
            expense.Notes = input.Notes;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id, ExpensesDbContext db) =>
        {
            var expense = await db.Expenses.FindAsync(id);
            if (expense is null) return Results.NotFound();
            db.Expenses.Remove(expense);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapGet("/summary", async (ExpensesDbContext db, int? month, int? year) =>
        {
            var now = DateTime.UtcNow;
            var m = month ?? now.Month;
            var y = year ?? now.Year;
            var data = await db.Expenses
                .Where(e => e.Date.Month == m && e.Date.Year == y)
                .GroupBy(e => e.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount), Count = g.Count() })
                .ToListAsync();
            return Results.Ok(new { Month = m, Year = y, Items = data });
        });
    }
}
