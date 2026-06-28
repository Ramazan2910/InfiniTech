using InfiniTech.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace InfiniTech.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<RepairTicket> RepairTickets => Set<RepairTicket>();
    public DbSet<TicketPhoto> TicketPhotos => Set<TicketPhoto>();
    public DbSet<TicketComment> TicketComments => Set<TicketComment>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.HasQueryFilter(u => u.IsActive);

            e.HasMany(u => u.RepairTickets)
                .WithOne(t => t.Client)
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(u => u.AssignedTickets)
                .WithOne(t => t.Master)
                .HasForeignKey(t => t.MasterId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(u => u.Orders)
                .WithOne(o => o.Client)
                .HasForeignKey(o => o.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // Product
        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.SKU).IsUnique();
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(p => p.UpdatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.HasQueryFilter(p => p.IsActive);
        });

        // Order
        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.Property(o => o.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(o => o.UpdatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(oi => oi.UnitPrice).HasPrecision(18, 2);

            e.HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // RepairTicket
        modelBuilder.Entity<RepairTicket>(e =>
        {
            e.Property(t => t.RepairCost).HasPrecision(18, 2);
            e.Property(t => t.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(t => t.UpdatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(t => t.CompletedAt).HasConversion(
                v => v.HasValue ? v.Value : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);
        });

        // TicketPhoto
        modelBuilder.Entity<TicketPhoto>(e =>
        {
            e.HasOne(p => p.Ticket)
                .WithMany(t => t.Photos)
                .HasForeignKey(p => p.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.UploadedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // TicketComment
        modelBuilder.Entity<TicketComment>(e =>
        {
            e.HasOne(c => c.Ticket)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Author)
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(c => c.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // CartItem
        modelBuilder.Entity<CartItem>(e =>
        {
            e.HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(ci => ci.AddedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(r => r.Token).IsUnique();
            e.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(r => r.ExpiresAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(r => r.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // PasswordResetToken
        modelBuilder.Entity<PasswordResetToken>(e =>
        {
            e.HasIndex(p => p.Token).IsUnique();
            e.HasOne(p => p.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.ExpiresAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            e.Property(p => p.CreatedAt).HasConversion(
                v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        // Order - unique index on OrderNumber
        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.OrderNumber).IsUnique();
        });
    }
}
