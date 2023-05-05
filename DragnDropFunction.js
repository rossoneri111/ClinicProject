function dragnDrop() {

   const cardsContainer = document.getElementById("cards");

   const observer = new MutationObserver(function (mutations) {
      document.addEventListener("mousedown", (ev) => {
         if (
            ev.target.closest(".card-header") &&
            !ev.target.classList.contains("btn__delete")
         ) {
            const card = ev.target.closest(".patient-card");
            const shift = {
               x: ev.offsetX,
               y: ev.offsetY,
            };
            card.style.position = "absolute";
            card.style.zIndex = 1000;
            document.body.appendChild(card);

            function moveCard(e) {
               card.style.left = e.pageX - shift.x + "px";
               card.style.top = e.pageY - shift.y + "px";
            }

            document.addEventListener("mousemove", moveCard);
            document.addEventListener("mouseup", function up() {
               document.removeEventListener("mousemove", moveCard);
               document.removeEventListener("mouseup", up);
            });
         }
      });
   });

   observer.observe(cardsContainer, { childList: true });
}

export { dragnDrop };
