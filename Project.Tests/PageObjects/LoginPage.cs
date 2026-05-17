using OpenQA.Selenium;

namespace Project.Tests.PageObjects
{
    public class LoginPage
    {
        private readonly IWebDriver _driver;

        // Page locators
        private readonly By EmailInputLocator = By.Id("email");
        private readonly By PasswordInputLocator = By.Id("password");
        private readonly By LoginButtonLocator = By.XPath("//button[contains(text(), 'Login')]");
        private readonly By RegisterLinkLocator = By.XPath("//a[contains(text(), 'Register')]");
        private readonly By ErrorMessageLocator = By.ClassName("error-message");
        private readonly By SuccessMessageLocator = By.ClassName("success-message");

        public LoginPage(IWebDriver driver)
        {
            _driver = driver;
        }

        // Page actions
        public void EnterEmail(string email)
        {
            var emailInput = _driver.FindElement(EmailInputLocator);
            emailInput.Clear();
            emailInput.SendKeys(email);
        }

        public void EnterPassword(string password)
        {
            var passwordInput = _driver.FindElement(PasswordInputLocator);
            passwordInput.Clear();
            passwordInput.SendKeys(password);
        }

        public void ClickLoginButton()
        {
            _driver.FindElement(LoginButtonLocator).Click();
        }

        public void ClickRegisterLink()
        {
            _driver.FindElement(RegisterLinkLocator).Click();
        }

        public void LoginWithCredentials(string email, string password)
        {
            EnterEmail(email);
            EnterPassword(password);
            ClickLoginButton();
        }

        public string? GetErrorMessage()
        {
            try
            {
                return _driver.FindElement(ErrorMessageLocator).Text;
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        }

        public string? GetSuccessMessage()
        {
            try
            {
                return _driver.FindElement(SuccessMessageLocator).Text;
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        }

        public bool IsEmailInputVisible()
        {
            try
            {
                return _driver.FindElement(EmailInputLocator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public bool IsLoginButtonEnabled()
        {
            try
            {
                var button = _driver.FindElement(LoginButtonLocator);
                return button.Enabled;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }
    }
}
