using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Project.Dtos;
using System.Security.Claims;

namespace Project.Hubs
{
    [Authorize]
    public class ChatHub : Hub<IChatHub>
    {
        public async Task SendMessage(string message)
        {
            var user = Context.User;
            var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = user?.FindFirst(ClaimTypes.Name)?.Value;

            var dto = new ChatMessageDto(userId, userName, message, DateTimeOffset.Now);

            await Clients.All.ReceiveMessage(dto);
        }
    }
}
