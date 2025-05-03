namespace FlipYourPC.Models
{
    public class PC
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public int Description { get; set; }
        public List<Component> Components { get; set; }
        public int Price { get; set; }
        public string ImageURL { get; set; }
        public bool IsSold { get; set; } = false;
    }
}
