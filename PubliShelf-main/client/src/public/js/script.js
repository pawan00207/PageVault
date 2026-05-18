// // Counter Animation
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");
  const speed = 100;

  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute("data-target"));
    let count = 0;
    const increment = target / speed;

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = Math.ceil(count).toLocaleString();
        setTimeout(updateCount, 1);
      } else 
        counter.innerText = target.toLocaleString();
    };

    updateCount();
  };

  // Intersection Observer for counter animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));

  // FAQ Accordion
  const faqItems = document.querySelectorAll("#faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector("button");
    const content = item.querySelector("#faq-content");
    const icon = button.querySelector("i");

    button.addEventListener("click", () => {
      const isOpen = content.classList.contains("hidden");

      // Close all other FAQs
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.querySelector("#faq-content").classList.add("hidden");
          otherItem.querySelector("i").classList.remove("fa-chevron-up");
          otherItem.querySelector("i").classList.add("fa-chevron-down");
        }
      });

      // Toggle current FAQ
      content.classList.toggle("hidden");
      if (isOpen) {
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
      } else {
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
      }
    });
  });
});