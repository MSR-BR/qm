(() => {
  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const sidebar = document.querySelector(".sim-sidebar");
  const controls = sidebar?.querySelector(".sim-controls");
  const metrics = sidebar?.querySelector(".metrics-grid");
  const equations = sidebar?.querySelector(".equation-panel");

  if (!sidebar || !controls || !metrics || !equations) return;

  const updateLayout = () => {
    if (mobileQuery.matches) {
      controls.classList.add("has-mobile-numerics");
      metrics.classList.add("mobile-numerics");
      metrics.open = true;
      controls.append(metrics);
      return;
    }

    controls.classList.remove("has-mobile-numerics");
    metrics.classList.remove("mobile-numerics");
    metrics.open = false;
    sidebar.insertBefore(metrics, equations);
  };

  updateLayout();
  mobileQuery.addEventListener?.("change", updateLayout);
})();
