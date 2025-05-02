using FlipYourPC.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipYourPC.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) :base(options)
        {
            
        }

        public DbSet<Component> Components { get; set; }
        public DbSet<PC> PCs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // En PC kan ha många komponenter
            modelBuilder.Entity<Component>()
                .HasOne(c => c.PC)  // En komponent tillhör en PC
                .WithMany(p => p.Components)  // En PC kan ha många komponenter
                .HasForeignKey(c => c.PCId)  // PCId är FK i Component (kan vara null)
                .IsRequired(false);  // Tillåt nullvärden för FK (det är valfritt att en komponent tillhör en PC)
        }
    }
}
