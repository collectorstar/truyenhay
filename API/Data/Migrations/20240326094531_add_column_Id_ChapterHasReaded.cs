using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class add_column_Id_ChapterHasReaded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ChapterHasReadeds",
                table: "ChapterHasReadeds");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "ChapterHasReadeds",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "ComicId",
                table: "ChapterHasReadeds",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChapterHasReadeds",
                table: "ChapterHasReadeds",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ChapterHasReadeds",
                table: "ChapterHasReadeds");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ChapterHasReadeds");

            migrationBuilder.DropColumn(
                name: "ComicId",
                table: "ChapterHasReadeds");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChapterHasReadeds",
                table: "ChapterHasReadeds",
                columns: new[] { "UserId", "ChapterId" });
        }
    }
}
