import person1 from "../Images/angela.png";
import person2 from "../Images/Erica.jpeg";
import person3 from "../Images/rachel.jpeg";

const TESTIMONIALS = [
  {
    image: person1,
    name: "Angela Ju",
    location: "Austin, TX",
    stars: 5,
    text: "The day we brought Biscuit home, my daughter sat on the kitchen floor and cried — happy tears. He's a golden retriever with the world's goofiest smile and zero concept of personal space. Best decision our family has ever made.",
  },
  {
    image: person2,
    name: "Erica Norman",
    location: "Brooklyn, NY",
    stars: 5,
    text: "I went to Ado-Pet to foster 'temporarily.' That was fourteen months ago. The cat I was supposedly just babysitting has since claimed my pillow, my hoodie, and my Netflix password. I have been completely and joyfully deceived. Ten out of ten, would do it again.",
  },
  {
    image: person3,
    name: "Rachel Muldoon",
    location: "Scottsdale, AZ",
    stars: 5,
    text: "After losing our horse of 18 years, I didn't think I'd ever be ready again. Ado-Pet never rushed me. They matched me with Sage — a rescued mare who was just as nervous as I was. We've spent the last year healing together, trail by trail. I'm not sure who saved whom.",
  },
];

function StarRating({ count }) {
  return (
    <span className="testimonial-stars" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function HomeClientsTestimonials() {
  return (
    <section className="clients-testimonias-container">
      <div className="clients-testimonias-header">
        <h2 className="clients-testimonias-heading">CLIENT'S TESTIMONIALS</h2>
      </div>
      <div className="clients-testimonias-content">
        {TESTIMONIALS.map(({ image, name, location, stars, text }) => (
          <div key={name} className="clients-testimonias-person">
            <img src={image} className="clients-testimonias-person-image" alt={name} />
            <span className="clients-testimonias-person-name">{name}</span>
            <span className="testimonial-location">{location}</span>
            <StarRating count={stars} />
            <p className="clients-testimonias-person-recommendation">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeClientsTestimonials;
