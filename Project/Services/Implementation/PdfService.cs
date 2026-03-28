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
                    page.ContinuousSize(80, Unit.Millimetre);
                    page.Margin(5, Unit.Millimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header().Element(header => ComposeHeader(header, order));
                    page.Content().Element(content => ComposeContent(content, order));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container, OrderResponseDto order)
        {
            container.Column(column =>
            {
                column.Item().AlignCenter().Text("LoungeBar").FontSize(20).SemiBold().FontColor(Colors.Black);
                column.Item().AlignCenter().Text("Address: Rruga Fadil Elshani, Suharek");
                column.Item().AlignCenter().Text("Phone: +355 69 123 4567");
                
                column.Item().PaddingTop(10).Text($"Invoice #{order.OrderId}").FontSize(14).SemiBold();
                column.Item().Text($"Date: {order.OrderDate:dd/MM/yyyy HH:mm}");
                column.Item().Text($"Table: {order.TableNumber}");
                if (!string.IsNullOrEmpty(order.UserName))
                {
                    column.Item().Text($"Waiter: {order.UserName}");
                }
            });
        }

        private void ComposeContent(IContainer container, OrderResponseDto order)
        {
            container.PaddingVertical(5, Unit.Millimetre).Column(column =>
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
                    columns.ConstantColumn(20); // Qty
                    columns.RelativeColumn();   // Item
                    columns.ConstantColumn(50); // Total
                });

                // step 2: define header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Qty");
                    header.Cell().Element(CellStyle).Text("Item");
                    header.Cell().Element(CellStyle).AlignRight().Text("Total");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(2).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                // step 3: define items
                foreach (var item in order.Items)
                {
                    table.Cell().Element(CellStyle).Text(item.Quantity.ToString());
                    table.Cell().Element(CellStyle).Text(item.MenuItemName);
                    
                    var total = item.UnitPrice * item.Quantity;
                    table.Cell().Element(CellStyle).AlignRight().Text($"{total:C}");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2);
                    }
                }
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.PaddingTop(10).AlignCenter().Text("Thank you for your visit!").SemiBold();
        }
    }
}
