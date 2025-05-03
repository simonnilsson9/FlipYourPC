namespace FlipYourPC.Models.DTO
{
    public class PCUpdateDTO
    {
        public string Name { get; set; }
        public int Description { get; set; }
        public List<Guid> ComponentIds { get; set; }
        public int Price { get; set; }
        public string ImageURL { get; set; }
        public bool IsSold { get; set; }
    }
}
