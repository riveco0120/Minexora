document.addEventListener("DOMContentLoaded", () => {
  const planes = document.querySelectorAll(".plan");

  // Efecto de selección: solo un plan puede estar activo
  planes.forEach(plan => {
    plan.addEventListener("click", () => {
      planes.forEach(p => p.classList.remove("activo"));
      plan.classList.add("activo");
    });
  });

  // Animación de entrada secuencial
  planes.forEach((plan, index) => {
    plan.style.opacity = 0;
    plan.style.transform = "translateY(30px)";
    setTimeout(() => {
      plan.style.transition = "all 0.5s ease-out";
      plan.style.opacity = 1;
      plan.style.transform = "translateY(0)";
    }, 100 * index);
  });
});