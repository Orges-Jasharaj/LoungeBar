namespace Project.Dtos.Responses
{
    public class PaymentResponseDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Method { get; set; }
        public string Status { get; set; }
        public DateTime PaymentDate { get; set; }
        public string CreatedBy { get; set; }
    }
}
