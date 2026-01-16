using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Project.Dtos;
using Project.Dtos.Hubs;
using Project.Data.Models;
using System.Security.Claims;

namespace Project.Hubs
{

    public class ChatHub : Hub<IChatHub>
    {
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                Context.Abort();
                return;
            }

            var user = Context.User;
            var isSuperAdmin = user.IsInRole(RoleTypes.SuperAdmin);
            var isAdmin = user.IsInRole(RoleTypes.Admin);
            var isEmployee = user.IsInRole(RoleTypes.Employee);

            if (!isSuperAdmin && !isAdmin && !isEmployee)
            {
                Context.Abort();
                return;
            }

            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string message)
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException("Authentication required");
            }

            var user = Context.User;
            var isSuperAdmin = user.IsInRole(RoleTypes.SuperAdmin);
            var isAdmin = user.IsInRole(RoleTypes.Admin);
            var isEmployee = user.IsInRole(RoleTypes.Employee);

            if (!isSuperAdmin && !isAdmin && !isEmployee)
            {
                throw new UnauthorizedAccessException("Access denied. Only SuperAdmin, Admin, and Employee can use chat.");
            }

            var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = user?.FindFirst(ClaimTypes.Name)?.Value;

            var dto = new ChatMessageDto(userId, userName, message, DateTimeOffset.Now);

            await Clients.All.ReceiveMessage(dto);
        }
    }
}
