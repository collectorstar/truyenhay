using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class change_type_column_Link_to_type : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Link",
                table: "Notifys");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Notifys",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notifys");

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "Notifys",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
