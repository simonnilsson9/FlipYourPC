namespace FlipYourPC.Models.DTO
{
    public class PCDTO
    {
        public string Name { get; set; }
        public List<Guid> ComponentIds { get; set; }
        public DateTime ListedAt { get; set; }
    }
}
