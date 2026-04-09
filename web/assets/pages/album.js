const albumRows = document.querySelectorAll(".track-row");
albumRows.forEach((row) => {
  row.addEventListener("click", () => {
    row.classList.toggle("is-active");
  });
});
