const playlistRows = document.querySelectorAll(".track-row");
playlistRows.forEach((row) => {
  row.addEventListener("click", () => {
    row.classList.toggle("is-active");
  });
});
