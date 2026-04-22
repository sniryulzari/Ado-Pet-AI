import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TESTIMONIALS = [
  {
    avatar:   "https://i.pravatar.cc/100?img=5",
    petPhoto: "https://images.unsplash.com/photo-1631384180633-17815c6a642f?w=640&h=380&fit=crop&auto=format",
    petName:  "Biscuit",
    name:     "Angela Ju",
    location: "Austin, TX",
    stars: 5,
    text: "The day we brought Biscuit home, my daughter sat on the kitchen floor and cried — happy tears. He's a golden retriever with the world's goofiest smile and zero concept of personal space. Best decision our family has ever made.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=47",
    petPhoto: "https://images.unsplash.com/photo-1611095459865-47682ae3c41c?w=640&h=380&fit=crop&auto=format",
    petName:  "Unnamed Cat",
    name:     "Erica Norman",
    location: "Brooklyn, NY",
    stars: 5,
    text: "I went to Ado-Pet to foster 'temporarily.' That was fourteen months ago. The cat I was supposedly just babysitting has since claimed my pillow, my hoodie, and my Netflix password. I have been completely and joyfully deceived. Ten out of ten.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=32",
    petPhoto: "https://images.unsplash.com/photo-1694885143306-3dfea504b032?w=640&h=380&fit=crop&auto=format",
    petName:  "Sage",
    name:     "Rachel Muldoon",
    location: "Scottsdale, AZ",
    stars: 5,
    text: "After losing our horse of 18 years, I didn't think I'd ever be ready again. Ado-Pet never rushed me. They matched me with Sage — a rescued mare who was just as nervous as I was. We've spent the last year healing together, trail by trail.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=12",
    petPhoto: "https://images.unsplash.com/photo-1650091507687-5ea34d80e674?w=640&h=380&fit=crop&auto=format",
    petName:  "Cat",
    name:     "Marcus Webb",
    location: "Chicago, IL",
    stars: 5,
    text: "I adopted a cat 'for the kids.' Six months later I'm the one who talks to her about my day, watches documentaries with her, and panics if she doesn't show up for dinner on time. I didn't know I needed her. She did.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=29",
    petPhoto: "https://images.unsplash.com/photo-1770498372215-3dcd33edcad4?w=640&h=380&fit=crop&auto=format",
    petName:  "Rescue Dog",
    name:     "Priya Sharma",
    location: "Seattle, WA",
    stars: 5,
    text: "The team at Ado-Pet matched us with a rescue dog who had been returned twice before. They said he was 'a lot.' They were right — he's a lot of joy, a lot of chaos, and a lot of love. He's never going back anywhere.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=58",
    petPhoto: "https://images.unsplash.com/photo-1755632095421-2c8e69e3b12c?w=640&h=380&fit=crop&auto=format",
    petName:  "Luna",
    name:     "Tomás Rivera",
    location: "Miami, FL",
    stars: 5,
    text: "I was nervous about adopting a senior dog, but the team walked me through everything. Luna is 9 years old and has more personality than most people I know. She sleeps 16 hours a day and judges me for the other 8. Worth every minute.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=21",
    petPhoto: "https://images.unsplash.com/photo-1771862956412-6ce9a725eb22?w=640&h=380&fit=crop&auto=format",
    petName:  "Baguette",
    name:     "Claire Fontaine",
    location: "Denver, CO",
    stars: 5,
    text: "My daughter asked for a pony. We got a rescue dolphin — just kidding, we got a cat named Baguette. He immediately took over her bed, her desk chair, and her iPad. She's never been happier. I think Baguette is too.",
  },
  {
    avatar:   "https://i.pravatar.cc/100?img=65",
    petPhoto: "https://images.unsplash.com/photo-1764253340476-879788b70779?w=640&h=380&fit=crop&auto=format",
    petName:  "New Friend",
    name:     "James Okafor",
    location: "Atlanta, GA",
    stars: 5,
    text: "Adopting through Ado-Pet was the smoothest, most thoughtful process I've experienced. They asked the right questions, listened carefully, and found me a match I wouldn't have chosen myself — but who turned out to be exactly right.",
  },
];

function StarRating({ count }) {
  return (
    <span className="testimonial-stars" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3 } }),
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function HomeClientsTestimonials() {
  const [[index, dir], setSlide] = useState([0, 0]);
  const isDesktop = useIsDesktop();

  const go = useCallback(
    (newDir) =>
      setSlide(([i]) => [
        (i + newDir + TESTIMONIALS.length) % TESTIMONIALS.length,
        newDir,
      ]),
    []
  );

  useEffect(() => {
    const id = setInterval(() => go(1), 4000);
    return () => clearInterval(id);
  }, [go]);

  const visible = isDesktop
    ? [0, 1].map((offset) => TESTIMONIALS[(index + offset) % TESTIMONIALS.length])
    : [TESTIMONIALS[index]];

  return (
    <section className="clients-testimonias-container">
      <div className="clients-testimonias-header">
        <p className="testimonial-section-eyebrow">Real families. Real stories.</p>
        <h2 className="clients-testimonias-heading">Happy Stories</h2>
      </div>

      <div className={`testimonial-carousel${isDesktop ? " testimonial-carousel--desktop" : ""}`}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={index}
            className={`testimonial-slide-group${isDesktop ? " testimonial-slide-group--desktop" : ""}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {visible.map((t, i) => (
              <div key={i} className="testimonial-slide">
                {/* Photo panel */}
                <div className="testimonial-photo-wrap">
                  <img
                    src={t.petPhoto}
                    alt={`${t.petName} in their new home`}
                    className="testimonial-pet-photo"
                    loading="lazy"
                  />
                  <span className="testimonial-new-home-badge">🏠 New Home</span>
                </div>

                {/* Text panel */}
                <div className="testimonial-body">
                  <StarRating count={t.stars} />
                  <p className="testimonial-quote">"{t.text}"</p>
                  <div className="testimonial-author-row">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="testimonial-avatar"
                      loading="lazy"
                    />
                    <div>
                      <span className="testimonial-author-name">{t.name}</span>
                      <span className="testimonial-author-loc">{t.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="testimonial-carousel-controls">
          <button
            className="testimonial-arrow"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft size="0.85em" />
          </button>

          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot${i === index ? " testimonial-dot--active" : ""}`}
                onClick={() => setSlide([i, i > index ? 1 : -1])}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="testimonial-arrow"
            onClick={() => go(1)}
            aria-label="Next testimonial"
          >
            <FaChevronRight size="0.85em" />
          </button>
        </div>
      </div>
    </section>
  );
}
