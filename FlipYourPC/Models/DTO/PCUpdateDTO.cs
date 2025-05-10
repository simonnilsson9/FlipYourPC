namespace FlipYourPC.Models.DTO
{
    public class PCUpdateDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Price { get; set; }
        public string ImageURL { get; set; }
        public bool IsSold { get; set; }
        public DateTime ListedAt { get; set; }
        public DateTime? SoldAt { get; set; }
    }
}
