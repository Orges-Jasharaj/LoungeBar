using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Project.Data.Models;
using System.Security.Claims;

namespace Project.Hubs
{
    public class OrderHub : Hub<IOrderHub>
    {
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.Identity?.IsAuthenticated == true)
            {
                var user = Context.User;
                var isSuperAdmin = user.IsInRole(RoleTypes.SuperAdmin);
                var isAdmin = user.IsInRole(RoleTypes.Admin);
                var isEmployee = user.IsInRole(RoleTypes.Employee);

                if (isSuperAdmin || isAdmin || isEmployee)
                {
                    await base.OnConnectedAsync();
                    return;
                }
            }

            await base.OnConnectedAsync();
        }
    }
}
