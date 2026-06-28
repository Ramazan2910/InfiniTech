using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfiniTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Categories ────────────────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Slug", "IconEmoji" },
                values: new object[,]
                {
                    { 1, "Laptops",        "laptops",        "💻" },
                    { 2, "Processors",     "processors",     "⚡" },
                    { 3, "Graphics Cards", "graphics-cards", "🎮" },
                    { 4, "RAM",            "ram",            "🧠" },
                    { 5, "Storage",        "storage",        "💾" },
                    { 6, "Monitors",       "monitors",       "🖥" },
                    { 7, "Smartphones",    "smartphones",    "📱" },
                    { 8, "Peripherals",    "peripherals",    "⌨️" }
                });

            // ── Users ─────────────────────────────────────────────────────────
            // BCrypt called at runtime so hashes are fresh and verifiable.
            var adminId   = "a1000000-0000-0000-0000-000000000001";
            var masterId  = "a2000000-0000-0000-0000-000000000002";
            var clientId  = "a4000000-0000-0000-0000-000000000004";

            var adminHash  = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            var masterHash = BCrypt.Net.BCrypt.HashPassword("Master123!");
            var clientHash = BCrypt.Net.BCrypt.HashPassword("Client123!");
            var now        = "2026-06-28 12:00:00";

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "FirstName", "LastName", "Phone", "Role", "CreatedAt", "IsActive" },
                values: new object[,]
                {
                    { adminId,  "admin@test.az",   adminHash,  "Test", "Admin",  null, 2, now, true },
                    { masterId, "master1@test.az", masterHash, "Test", "Master", null, 1, now, true },
                    { clientId, "client1@test.az", clientHash, "Test", "Client", null, 0, now, true }
                });

            // ── Products ──────────────────────────────────────────────────────
            var p1  = "b1000000-0000-0000-0000-000000000001";
            var p2  = "b2000000-0000-0000-0000-000000000002";
            var p3  = "b3000000-0000-0000-0000-000000000003";
            var p4  = "b4000000-0000-0000-0000-000000000004";
            var p5  = "b5000000-0000-0000-0000-000000000005";
            var p6  = "b6000000-0000-0000-0000-000000000006";
            var p7  = "b7000000-0000-0000-0000-000000000007";
            var p8  = "b8000000-0000-0000-0000-000000000008";
            var p9  = "b9000000-0000-0000-0000-000000000009";
            var p10 = "b0000000-0000-0000-0000-000000000010";
            var p11 = "b0000000-0000-0000-0000-000000000011";
            var p12 = "b0000000-0000-0000-0000-000000000012";
            var p13 = "b0000000-0000-0000-0000-000000000013";

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "Description", "SKU", "Price", "StockQuantity", "Condition", "CategoryId", "ImagePath", "CreatedAt", "UpdatedAt", "IsActive" },
                values: new object[,]
                {
                    // Laptops (Cat 1) — New
                    { p1, "Lenovo ThinkPad E14 Gen 5",
                      "Intel Core i5-1335U, 16GB RAM, 512GB NVMe SSD, 14\" FHD IPS, Windows 11 Pro",
                      "LTP-TP-E14-G5-001", 1449.00m, 8, 0, 1, null, now, now, true },

                    { p2, "ASUS VivoBook 15 X1504",
                      "Intel Core i3-1215U, 8GB RAM, 256GB SSD, 15.6\" FHD, FreeDOS",
                      "LTP-ASUS-VB15-001", 749.00m, 12, 0, 1, null, now, now, true },

                    // Processors (Cat 2) — New
                    { p3, "AMD Ryzen 5 7600X",
                      "6 cores / 12 threads, 4.7GHz base / 5.3GHz boost, AM5 socket, 105W TDP",
                      "CPU-AMD-R5-7600X", 499.00m, 15, 0, 2, null, now, now, true },

                    { p4, "Intel Core i5-13400F",
                      "10 cores / 16 threads, 2.5GHz base / 4.6GHz boost, LGA1700, 65W TDP",
                      "CPU-INT-I5-13400F", 429.00m, 10, 0, 2, null, now, now, true },

                    // Graphics Cards (Cat 3) — mix
                    { p5, "NVIDIA GeForce RTX 3060 12GB",
                      "ASUS DUAL OC edition, 12GB GDDR6, HDMI 2.1, 3×DP 1.4a, 170W TDP",
                      "GPU-RTX3060-ASUS-D12", 849.00m, 6, 0, 3, null, now, now, true },

                    { p6, "NVIDIA GeForce RTX 2060 6GB (Used)",
                      "ASUS TUF edition, 6GB GDDR6, previously used in workstation, tested & cleaned",
                      "GPU-RTX2060-USED-001", 399.00m, 3, 1, 3, null, now, now, true },

                    // RAM (Cat 4) — New
                    { p7, "Kingston FURY Beast DDR5 32GB (2×16GB)",
                      "DDR5-5200MHz, CL40, 1.1V, Intel XMP 3.0 / AMD EXPO compatible",
                      "RAM-KNG-DDR5-32G-5200", 299.00m, 20, 0, 4, null, now, now, true },

                    // Storage (Cat 5) — New
                    { p8, "Samsung 990 Pro 1TB NVMe SSD",
                      "PCIe 4.0 M.2 2280, Read 7450MB/s, Write 6900MB/s, 5-year warranty",
                      "SSD-SAM-990PRO-1TB", 349.00m, 18, 0, 5, null, now, now, true },

                    { p9, "Seagate BarraCuda 2TB HDD (Used)",
                      "3.5\" SATA 6Gb/s, 7200RPM, 256MB cache, tested with CrystalDiskInfo — Good",
                      "HDD-SEA-BARCUDA-2TB-U", 89.00m, 5, 1, 5, null, now, now, true },

                    // Monitors (Cat 6) — New
                    { p10, "Dell UltraSharp 27\" 4K USB-C Monitor (U2723DE)",
                      "27\" IPS, 3840×2160, 60Hz, USB-C 90W, HDMI, DP, Height-adjustable stand",
                      "MON-DELL-U2723DE", 1299.00m, 4, 0, 6, null, now, now, true },

                    // Smartphones (Cat 7) — Used
                    { p11, "Apple iPhone 14 128GB (Used)",
                      "Space Black, iOS 17, Face ID, 6.1\" Super Retina XDR, 12MP dual camera, battery 89%",
                      "PHN-APPL-IP14-128-U", 799.00m, 2, 1, 7, null, now, now, true },

                    // Peripherals (Cat 8) — New
                    { p12, "Logitech MX Keys S Wireless Keyboard",
                      "Backlit, multi-device, USB-C charging, compatible with Windows/macOS/Linux",
                      "PER-LOG-MXKEYS-S", 199.00m, 25, 0, 8, null, now, now, true },

                    { p13, "Logitech MX Master 3S Mouse",
                      "8000 DPI, Electromagnetic scroll wheel, USB-C, Bluetooth + USB receiver, silent clicks",
                      "PER-LOG-MXMAS-3S", 179.00m, 20, 0, 8, null, now, now, true }
                });

            // ── Repair Tickets ────────────────────────────────────────────────
            var t1 = "c1000000-0000-0000-0000-000000000001";
            var t2 = "c2000000-0000-0000-0000-000000000002";

            migrationBuilder.InsertData(
                table: "RepairTickets",
                columns: new[] { "Id", "ClientId", "MasterId", "DeviceType", "DeviceBrand", "DeviceModel",
                                 "ProblemDescription", "SerialNumber", "Status", "DiagnosisResult",
                                 "RepairCost", "CreatedAt", "UpdatedAt", "CompletedAt" },
                values: new object[,]
                {
                    // Ticket 1 — InRepair, assigned to master
                    {
                        t1, clientId, masterId,
                        0, "Lenovo", "ThinkPad E14 Gen 4",
                        "Laptop won't turn on after water spill on keyboard",
                        "LNV-E14-SN-2024-001",
                        3,  // InRepair
                        "Keyboard matrix shorted, motherboard south bridge damaged.",
                        250.00m,
                        "2026-06-20 09:00:00", "2026-06-25 14:30:00", null
                    },
                    // Ticket 2 — WaitingForMaster (unassigned)
                    {
                        t2, clientId, null,
                        2, "Apple", "iPhone 14",
                        "Screen cracked, touch unresponsive in bottom third",
                        "APL-IP14-SN-2024-002",
                        0,  // WaitingForMaster
                        null, null,
                        "2026-06-27 11:00:00", "2026-06-27 11:00:00", null
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData("RepairTickets", "Id", new[]
            {
                "c1000000-0000-0000-0000-000000000001",
                "c2000000-0000-0000-0000-000000000002"
            });

            for (int i = 1; i <= 13; i++)
                migrationBuilder.DeleteData("Products", "Id", i <= 9
                    ? $"b{i}000000-0000-0000-0000-00000000000{i}"
                    : $"b0000000-0000-0000-0000-0000000000{i}");

            migrationBuilder.DeleteData("Users", "Id", new[]
            {
                "a1000000-0000-0000-0000-000000000001",
                "a2000000-0000-0000-0000-000000000002",
                "a4000000-0000-0000-0000-000000000004"
            });

            migrationBuilder.DeleteData("Categories", "Id", new[] { 1, 2, 3, 4, 5, 6, 7, 8 });
        }
    }
}
