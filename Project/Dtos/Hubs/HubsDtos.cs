namespace Project.Dtos.Hubs
{
    public record ChatMessageDto(string UserId, string UserName, string Text, DateTimeOffset Timestamp);
}
