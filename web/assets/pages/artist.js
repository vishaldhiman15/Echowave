const artistRows = document.querySelectorAll(".track-row");
artistRows.forEach((row) => {
  row.addEventListener("click", () => {
    row.classList.toggle("is-active");
  });
});
