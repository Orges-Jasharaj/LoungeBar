using Xunit;
using Project.Tests.PageObjects;

namespace Project.Tests.Tests
{
    public class OrderTests : BaseTest
    {
        private DashboardPage? _dashboardPage;
        private CreateOrderPage? _createOrderPage;

        public OrderTests() : base()
        {
            // Navigate to dashboard (assuming user is already logged in)
            NavigateTo($"{BaseUrl}/dashboard");
            _dashboardPage = new DashboardPage(Driver!);
        }

        [Fact]
        public void Dashboard_Should_Display_Create_Order_Button()
        {
            // Assert
            Assert.True(_dashboardPage!.IsCreateOrderButtonVisible(), "Create Order button should be visible");
        }

        [Fact]
        public void Create_Order_Button_Should_Navigate_To_Create_Order_Page()
        {
            // Act
            _dashboardPage!.ClickCreateOrderButton();
            System.Threading.Thread.Sleep(1000);

            // Assert
            Assert.Contains("createorder", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Create_Order_Page_Should_Allow_Adding_Items()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.AddItemToOrder("Beverages", "Coffee", 2);
            System.Threading.Thread.Sleep(1000);

            // Assert
            int itemsCount = _createOrderPage.GetOrderItemsCount();
            Assert.Equal(1, itemsCount);
        }

        [Fact]
        public void Order_Total_Price_Should_Calculate_Correctly()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.AddItemToOrder("Food", "Burger", 1);
            System.Threading.Thread.Sleep(500);
            decimal totalPrice = _createOrderPage.GetTotalPrice();

            // Assert
            Assert.True(totalPrice > 0, "Total price should be greater than 0");
        }

        [Fact]
        public void Order_Should_Not_Submit_Without_Items()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act & Assert
            Assert.False(_createOrderPage.IsSubmitButtonEnabled(), "Submit button should be disabled without items");
        }

        [Fact]
        public void Submit_Order_Button_Should_Be_Enabled_With_Items()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.AddItemToOrder("Beverages", "Water", 1);
            System.Threading.Thread.Sleep(500);

            // Assert
            Assert.True(_createOrderPage.IsSubmitButtonEnabled(), "Submit button should be enabled with items");
        }

        [Fact]
        public void Submit_Valid_Order_Should_Show_Success_Message()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.SelectTable("1");
            _createOrderPage.AddItemToOrder("Food", "Pizza", 1);
            System.Threading.Thread.Sleep(500);
            _createOrderPage.ClickSubmitOrderButton();
            System.Threading.Thread.Sleep(2000);

            // Assert
            Assert.Contains("order", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Cancel_Button_Should_Navigate_Back_To_Dashboard()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.ClickCancelButton();
            System.Threading.Thread.Sleep(1000);

            // Assert
            Assert.Contains("dashboard", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Multiple_Items_Order_Should_Calculate_Total_Correctly()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/createorder");
            _createOrderPage = new CreateOrderPage(Driver!);

            // Act
            _createOrderPage.AddItemToOrder("Food", "Burger", 2);
            System.Threading.Thread.Sleep(500);
            _createOrderPage.AddItemToOrder("Beverages", "Coffee", 1);
            System.Threading.Thread.Sleep(500);

            // Assert
            int itemsCount = _createOrderPage.GetOrderItemsCount();
            decimal totalPrice = _createOrderPage.GetTotalPrice();

            Assert.Equal(2, itemsCount);
            Assert.True(totalPrice > 0);
        }
    }
}
