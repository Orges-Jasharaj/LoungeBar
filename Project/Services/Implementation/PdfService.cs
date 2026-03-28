using Project.Dtos.Responses;
using Project.Services.Interface;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Project.Services.Implementation
{
    public class PdfService : IPdfService
    {
        public byte[] GenerateInvoicePdf(OrderResponseDto order)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Header().Element(header => ComposeHeader(header, order));
                    page.Content().Element(content => ComposeContent(content, order));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container, OrderResponseDto order)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("LoungeBar").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
                    column.Item().Text("Address: Rruga Fadil Elshani, Suharek");
                    column.Item().Text("Email: info@loungebar.com");
                    column.Item().Text("Phone: +355 69 123 4567");
                });

                row.ConstantItem(150).Column(column =>
                {
                    column.Item().Text($"Invoice #{order.OrderId}").FontSize(16).SemiBold();
                    column.Item().Text($"Date: {order.OrderDate:dd/MM/yyyy HH:mm}");
                    column.Item().Text($"Table: {order.TableNumber}");
                    if (!string.IsNullOrEmpty(order.UserName))
                    {
                        column.Item().Text($"Waiter: {order.UserName}");
                    }
                });
            });
        }

        private void ComposeContent(IContainer container, OrderResponseDto order)
        {
            container.PaddingVertical(1, Unit.Centimetre).Column(column =>
            {
                column.Item().Element(tableContainer => ComposeTable(tableContainer, order));

                column.Item().PaddingTop(15).AlignRight().Text($"Total: {order.TotalAmount:C}")
                    .FontSize(14).SemiBold();
            });
        }

        private void ComposeTable(IContainer container, OrderResponseDto order)
        {
            container.Table(table =>
            {
                // step 1: define columns
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(30);
                    columns.RelativeColumn();
                    columns.ConstantColumn(80);
                    columns.ConstantColumn(80);
                    columns.ConstantColumn(80);
                });

                // step 2: define header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("#");
                    header.Cell().Element(CellStyle).Text("Item");
                    header.Cell().Element(CellStyle).AlignRight().Text("Unit Price");
                    header.Cell().Element(CellStyle).AlignCenter().Text("Quantity");
                    header.Cell().Element(CellStyle).AlignRight().Text("Total");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                // step 3: define items
                var index = 1;
                foreach (var item in order.Items)
                {
                    table.Cell().Element(CellStyle).Text(index.ToString());
                    table.Cell().Element(CellStyle).Text(item.MenuItemName);
                    table.Cell().Element(CellStyle).AlignRight().Text($"{item.UnitPrice:C}");
                    table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString());
                    
                    var total = item.UnitPrice * item.Quantity;
                    table.Cell().Element(CellStyle).AlignRight().Text($"{total:C}");

                    index++;

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                    }
                }
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.AlignCenter().Text(x =>
            {
                x.Span("Page ");
                x.CurrentPageNumber();
                x.Span(" out of ");
                x.TotalPages();
            });
        }
    }
}
