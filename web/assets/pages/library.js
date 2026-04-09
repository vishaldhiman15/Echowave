const libraryFilters = document.querySelectorAll(".js-library-filter");
libraryFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    libraryFilters.forEach((item) => item.classList.remove("is-active"));
    filter.classList.add("is-active");
  });
});
