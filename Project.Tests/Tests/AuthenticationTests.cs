using Xunit;
using Project.Tests.PageObjects;

namespace Project.Tests.Tests
{
    public class AuthenticationTests : BaseTest
    {
        private LoginPage? _loginPage;

        public AuthenticationTests() : base()
        {
            NavigateTo($"{BaseUrl}/login");
            _loginPage = new LoginPage(Driver!);
        }

        [Fact]
        public void LoginPage_Should_Be_Loaded()
        {
            // Assert
            Assert.True(_loginPage!.IsEmailInputVisible(), "Email input should be visible on login page");
        }

        [Fact]
        public void LoginButton_Should_Be_Enabled_With_Valid_Credentials()
        {
            // Arrange
            _loginPage!.EnterEmail("testuser@example.com");
            _loginPage.EnterPassword("Validpassword123!");

            // Assert
            Assert.True(_loginPage.IsLoginButtonEnabled(), "Login button should be enabled with valid credentials");
        }

        [Fact]
        public void Login_With_Valid_Credentials_Should_Navigate_To_Dashboard()
        {
            // Arrange
            string validEmail = "testuser@example.com";
            string validPassword = "validpassword123";

            // Act
            _loginPage!.LoginWithCredentials(validEmail, validPassword);
            System.Threading.Thread.Sleep(2000); // Wait for navigation

            // Assert
            Assert.Contains("dashboard", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Login_With_Invalid_Email_Should_Show_Error()
        {
            // Arrange
            string invalidEmail = "invalidemail";
            string password = "password123";

            // Act
            _loginPage!.LoginWithCredentials(invalidEmail, password);
            System.Threading.Thread.Sleep(1000);

            // Assert
            var errorMessage = _loginPage.GetErrorMessage();
            Assert.NotNull(errorMessage);
        }

        [Fact]
        public void Login_With_Empty_Email_Should_Show_Error()
        {
            // Arrange
            _loginPage!.EnterPassword("password123");

            // Act
            _loginPage.ClickLoginButton();
            System.Threading.Thread.Sleep(1000);

            // Assert
            var errorMessage = _loginPage.GetErrorMessage();
            Assert.NotNull(errorMessage);
        }

        [Fact]
        public void Login_With_Empty_Password_Should_Show_Error()
        {
            // Arrange
            _loginPage!.EnterEmail("testuser@example.com");

            // Act
            _loginPage.ClickLoginButton();
            System.Threading.Thread.Sleep(1000);

            // Assert
            var errorMessage = _loginPage.GetErrorMessage();
            Assert.NotNull(errorMessage);
        }

        [Fact]
        public void Register_Link_Should_Navigate_To_Register_Page()
        {
            // Act
            _loginPage!.ClickRegisterLink();
            System.Threading.Thread.Sleep(1000);

            // Assert
            Assert.Contains("register", Driver!.Url, StringComparison.OrdinalIgnoreCase);
        }
    }
}
