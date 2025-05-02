namespace FlipYourPC.Models.DTO
{
    public class ComponentDTO
    {
        public string Name { get; set; }
        public int Price { get; set; }
        public string Manufacturer { get; set; }
        public int TotalStock { get; set; }
        public ComponentType Type { get; set; }
    }
}
