using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PiataOnline.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStallRatingAndReviewsCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Stalls");

            migrationBuilder.DropColumn(
                name: "ReviewsCount",
                table: "Stalls");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "Stalls",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "ReviewsCount",
                table: "Stalls",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
