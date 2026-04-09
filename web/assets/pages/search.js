const filterChips = document.querySelectorAll(".js-filter");
filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
  });
});
