const buttons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

buttons.forEach(function (button) {
    button.addEventListener("click", function() {

        panels.forEach(function (panel){
            panel.classList.remove("active");
        });

        document.getElementById(button.dataset.target).classList.add("active");
    });
});