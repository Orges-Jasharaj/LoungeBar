using Project.Dtos.Hubs;

namespace Project.Hubs
{
    public interface IChatHub
    {
        Task ReceiveMessage(ChatMessageDto chatMessageDto);
    }
}
