using ExpensesApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpensesApi.Data;

public class ExpensesDbContext : DbContext
{
    public ExpensesDbContext(DbContextOptions<ExpensesDbContext> options) : base(options) { }

    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Expense>().Property(e => e.Amount).HasPrecision(18, 2);

        // Seed demo data
        modelBuilder.Entity<Expense>().HasData(
            new Expense { Id = 1, Title = "Groceries",  Amount = 35.50m, Category = "Food",          Date = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Expense { Id = 2, Title = "Metro pass", Amount = 12.00m, Category = "Transport",     Date = new DateTime(2026, 5, 2, 0, 0, 0, DateTimeKind.Utc) },
            new Expense { Id = 3, Title = "Internet",   Amount = 22.99m, Category = "Bills",         Date = new DateTime(2026, 5, 3, 0, 0, 0, DateTimeKind.Utc) },
            new Expense { Id = 4, Title = "Movie",      Amount =  8.50m, Category = "Entertainment", Date = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
