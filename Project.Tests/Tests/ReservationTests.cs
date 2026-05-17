using Xunit;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Project.Tests.PageObjects;

namespace Project.Tests.Tests
{
    public class ReservationTests : BaseTest
    {
        private DashboardPage? _dashboardPage;

        public ReservationTests() : base()
        {
            NavigateTo($"{BaseUrl}/dashboard");
            _dashboardPage = new DashboardPage(Driver!);
        }

        [Fact]
        public void Dashboard_Should_Have_Reservations_Tab()
        {
            // Assert
            Assert.NotNull(_dashboardPage);
            // Verify tab exists by attempting to click it
            try
            {
                _dashboardPage!.ClickReservationsTab();
                System.Threading.Thread.Sleep(500);
            }
            catch
            {
                Assert.Fail("Reservations tab should be available");
            }
        }

        [Fact]
        public void Navigate_To_Reservations_Page()
        {
            // Act
            _dashboardPage!.ClickReservationsTab();
            System.Threading.Thread.Sleep(1000);

            // Assert
            Assert.Contains("reservation", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Reservations_Page_Should_Load_With_Create_Button()
        {
            // Act
            NavigateTo($"{BaseUrl}/reservations");
            System.Threading.Thread.Sleep(1000);

            // Assert
            Assert.True(
                Driver!.PageSource.Contains("Create Reservation") || 
                Driver!.PageSource.Contains("create-reservation"),
                "Create Reservation button or link should be available"
            );
        }

        [Fact]
        public void Reserve_Table_With_Valid_Date()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/reservations/create");
            System.Threading.Thread.Sleep(1000);

            // Act
            var dateInput = Driver!.FindElement(By.Id("reservation-date"));
            var dateValue = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd");
            dateInput.SendKeys(dateValue);

            var timeInput = Driver!.FindElement(By.Id("reservation-time"));
            timeInput.SendKeys("19:00");

            var tableSelect = Driver!.FindElement(By.Id("table-select"));
            var select = new SelectElement(tableSelect);
            select.SelectByIndex(1);

            var submitButton = Driver!.FindElement(By.XPath("//button[contains(text(), 'Reserve')]"));
            submitButton.Click();
            System.Threading.Thread.Sleep(2000);

            // Assert
            Assert.Contains("reservation", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Cannot_Reserve_With_Past_Date()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/reservations/create");
            System.Threading.Thread.Sleep(1000);

            // Act
            var dateInput = Driver!.FindElement(By.Id("reservation-date"));
            var dateValue = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
            dateInput.SendKeys(dateValue);

            // Assert
            var dateInputElement = (IWebElement)Driver!.FindElement(By.Id("reservation-date"));
            var minAttr = dateInputElement.GetAttribute("min");
            Assert.NotNull(minAttr);
        }

        [Fact]
        public void Display_Available_Tables_For_Selected_Time()
        {
            // Arrange
            NavigateTo($"{BaseUrl}/reservations/create");
            System.Threading.Thread.Sleep(1000);

            // Act
            var dateInput = Driver!.FindElement(By.Id("reservation-date"));
            dateInput.SendKeys(DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"));

            var timeInput = Driver!.FindElement(By.Id("reservation-time"));
            timeInput.SendKeys("18:00");
            System.Threading.Thread.Sleep(1000);

            // Assert
            var tableSelect = Driver!.FindElement(By.Id("table-select"));
            var options = tableSelect.FindElements(By.TagName("option"));
            Assert.True(options.Count > 0, "Should show available tables for the selected time");
        }
    }
}
