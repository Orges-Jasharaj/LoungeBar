using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace Project.Tests.PageObjects
{
    public class CreateOrderPage
    {
        private readonly IWebDriver _driver;

        // Page locators
        private readonly By CategorySelectLocator = By.Id("category-select");
        private readonly By MenuItemSelectLocator = By.Id("menuitem-select");
        private readonly By QuantityInputLocator = By.Id("quantity-input");
        private readonly By AddItemButtonLocator = By.XPath("//button[contains(text(), 'Add Item')]");
        private readonly By RemoveItemButtonLocator = By.XPath("//button[contains(text(), 'Remove')]");
        private readonly By TotalPriceLocator = By.ClassName("total-price");
        private readonly By SubmitOrderButtonLocator = By.XPath("//button[contains(text(), 'Submit Order')]");
        private readonly By CancelButtonLocator = By.XPath("//button[contains(text(), 'Cancel')]");
        private readonly By OrderItemsListLocator = By.ClassName("order-items");
        private readonly By TableSelectLocator = By.Id("table-select");

        public CreateOrderPage(IWebDriver driver)
        {
            _driver = driver;
        }

        // Page actions
        public void SelectCategory(string categoryName)
        {
            var select = new SelectElement(_driver.FindElement(CategorySelectLocator));
            select.SelectByText(categoryName);
        }

        public void SelectMenuItem(string itemName)
        {
            var select = new SelectElement(_driver.FindElement(MenuItemSelectLocator));
            select.SelectByText(itemName);
        }

        public void SelectTable(string tableNumber)
        {
            var select = new SelectElement(_driver.FindElement(TableSelectLocator));
            select.SelectByText(tableNumber);
        }

        public void EnterQuantity(int quantity)
        {
            var quantityInput = _driver.FindElement(QuantityInputLocator);
            quantityInput.Clear();
            quantityInput.SendKeys(quantity.ToString());
        }

        public void ClickAddItemButton()
        {
            _driver.FindElement(AddItemButtonLocator).Click();
        }

        public void ClickRemoveItemButton()
        {
            _driver.FindElement(RemoveItemButtonLocator).Click();
        }

        public void ClickSubmitOrderButton()
        {
            _driver.FindElement(SubmitOrderButtonLocator).Click();
        }

        public void ClickCancelButton()
        {
            _driver.FindElement(CancelButtonLocator).Click();
        }

        public void AddItemToOrder(string categoryName, string itemName, int quantity)
        {
            SelectCategory(categoryName);
            SelectMenuItem(itemName);
            EnterQuantity(quantity);
            ClickAddItemButton();
        }

        public decimal GetTotalPrice()
        {
            var priceText = _driver.FindElement(TotalPriceLocator).Text;
            // Extract numeric value from text (e.g., "$100.00" -> 100.00)
            var cleanPrice = System.Text.RegularExpressions.Regex.Replace(priceText, @"[^\d.]", "");
            return decimal.Parse(cleanPrice);
        }

        public int GetOrderItemsCount()
        {
            try
            {
                var items = _driver.FindElements(By.XPath("//div[@class='order-item']"));
                return items.Count;
            }
            catch
            {
                return 0;
            }
        }

        public bool IsSubmitButtonEnabled()
        {
            try
            {
                return _driver.FindElement(SubmitOrderButtonLocator).Enabled;
            }
            catch
            {
                return false;
            }
        }
    }
}
