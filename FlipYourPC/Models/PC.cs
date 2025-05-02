namespace FlipYourPC.Models
{
    public class PC
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public int Description { get; set; }
        public required List<Component> Components { get; set; }
        public required int Price { get; set; }
        public string ImageURL { get; set; }
    }
}
