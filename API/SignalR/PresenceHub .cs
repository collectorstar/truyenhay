using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize(Policy = "RequireMemberRole")]
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker _tracker;

        public PresenceHub(PresenceTracker tracker)
        {
            _tracker = tracker;
        }

        public override async Task OnConnectedAsync()
        {
            var isOnline = await _tracker.UserConnected(Context.User.GetUserId().ToString(), Context.ConnectionId);
            // if (isOnline)
            //     await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUserId().ToString());

            // var currentUsers = await _tracker.GetOnlineUsers();

            // await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var isOffline = await _tracker.UserDisconnected(Context.User.GetUserId().ToString(), Context.ConnectionId);

            // if (isOffline)
            //     await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUserId().ToString());

            await base.OnDisconnectedAsync(exception);
        }

    }
}