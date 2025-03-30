document.addEventListener("DOMContentLoaded", function () {
    const courts = document.querySelectorAll(".court");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const courtDescription = entry.target.querySelector(".court-description");
            const courtImage = entry.target.querySelector(".court-img");

            if (entry.isIntersecting) {
                // Wait until the image is fully loaded before displaying the description
                if (courtImage.complete) {
                    // If the image is already loaded, show the description
                    courtDescription.classList.remove("hidden");
                    courtDescription.classList.add("show");
                } else {
                    // If the image isn't loaded yet, add an onload event
                    courtImage.onload = () => {
                        courtDescription.classList.remove("hidden");
                        courtDescription.classList.add("show");
                    };
                }
            } else {
                // Hide the description when not in view
                courtDescription.classList.add("hidden");
                courtDescription.classList.remove("show");
            }
        });
    }, { threshold: 0.5 });

    courts.forEach(court => observer.observe(court));
});
