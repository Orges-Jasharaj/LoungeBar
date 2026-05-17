using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using WebDriverManager;
using WebDriverManager.DriverConfigs.Impl;

namespace Project.Tests
{
    public abstract class BaseTest : IDisposable
    {
        protected IWebDriver? Driver { get; set; }
        protected const string BaseUrl = "http://localhost:3000"; // Update with your frontend URL

        protected BaseTest()
        {
            InitializeDriver();
        }

        protected virtual void InitializeDriver()
        {
            try
            {
                // Initialize WebDriver Manager for ChromeDriver
                new DriverManager().SetUpDriver(new ChromeConfig());

                var options = new ChromeOptions();
                // options.AddArgument("--headless"); // Uncomment for headless mode
                options.AddArgument("--no-sandbox");
                options.AddArgument("--disable-dev-shm-usage");

                Driver = new ChromeDriver(options);
                Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
                Driver.Manage().Window.Maximize();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing WebDriver: {ex.Message}");
                throw;
            }
        }

        public virtual void Dispose()
        {
            if (Driver != null)
            {
                try
                {
                    Driver.Quit();
                    Driver.Dispose();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error disposing WebDriver: {ex.Message}");
                }
            }
        }

        // Helper methods
        protected void NavigateTo(string url)
        {
            Driver?.Navigate().GoToUrl(url);
        }

        protected void WaitForElement(By locator, int timeoutInSeconds = 10)
        {
            if (Driver == null) throw new InvalidOperationException("WebDriver not initialized");
            var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(timeoutInSeconds));
            wait.Until(d => d.FindElement(locator));
        }

        protected void WaitForElementVisible(By locator, int timeoutInSeconds = 10)
        {
            if (Driver == null) throw new InvalidOperationException("WebDriver not initialized");
            var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(timeoutInSeconds));
            wait.Until(d => 
            {
                var element = d.FindElement(locator);
                return element.Displayed;
            });
        }

        protected bool IsElementPresent(By locator)
        {
            try
            {
                Driver?.FindElement(locator);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }
    }
}
