const toggleButtons = document.querySelectorAll("[data-toggle-password]");

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.getAttribute("data-toggle-password");
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? "Show" : "Hide";
  });
});
