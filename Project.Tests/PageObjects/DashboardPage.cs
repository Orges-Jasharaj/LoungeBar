using OpenQA.Selenium;

namespace Project.Tests.PageObjects
{
    public class DashboardPage
    {
        private readonly IWebDriver _driver;

        // Page locators
        private readonly By CreateOrderButtonLocator = By.XPath("//button[contains(text(), 'Create Order')]");
        private readonly By MyOrdersTabLocator = By.XPath("//a[contains(text(), 'My Orders')]");
        private readonly By ReservationsTabLocator = By.XPath("//a[contains(text(), 'Reservations')]");
        private readonly By ProfileMenuLocator = By.Id("profile-menu");
        private readonly By LogoutButtonLocator = By.XPath("//button[contains(text(), 'Logout')]");
        private readonly By OrdersListLocator = By.ClassName("orders-list");
        private readonly By UserNameLocator = By.ClassName("user-name");
        private readonly By GreetingMessageLocator = By.ClassName("greeting-message");

        public DashboardPage(IWebDriver driver)
        {
            _driver = driver;
        }

        // Page actions
        public void ClickCreateOrderButton()
        {
            _driver.FindElement(CreateOrderButtonLocator).Click();
        }

        public void ClickMyOrdersTab()
        {
            _driver.FindElement(MyOrdersTabLocator).Click();
        }

        public void ClickReservationsTab()
        {
            _driver.FindElement(ReservationsTabLocator).Click();
        }

        public void ClickProfileMenu()
        {
            _driver.FindElement(ProfileMenuLocator).Click();
        }

        public void ClickLogoutButton()
        {
            ClickProfileMenu();
            _driver.FindElement(LogoutButtonLocator).Click();
        }

        public bool IsCreateOrderButtonVisible()
        {
            try
            {
                return _driver.FindElement(CreateOrderButtonLocator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public bool AreOrdersDisplayed()
        {
            try
            {
                var ordersList = _driver.FindElement(OrdersListLocator);
                return ordersList.Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public string? GetUserName()
        {
            try
            {
                return _driver.FindElement(UserNameLocator).Text;
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        }

        public string GetGreetingMessage()
        {
            return _driver.FindElement(GreetingMessageLocator).Text;
        }

        public int GetOrdersCount()
        {
            try
            {
                var orders = _driver.FindElements(By.XPath("//div[@class='order-item']"));
                return orders.Count;
            }
            catch
            {
                return 0;
            }
        }
    }
}
