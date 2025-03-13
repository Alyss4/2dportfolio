import { k } from "./kaboomContext.js";  // Importation de k pour l'utilisation de la caméra et de l'échelle

// Fonction d'affichage du dialogue
export function displayDialogue(text, onDisplayEnd, playerX, playerY) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  // Afficher le dialogue et le positionner
  dialogueUI.style.display = "block";
  updateDialoguePosition(k, playerX, playerY, k.camPos());

  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }
    clearInterval(intervalRef);
  }, 1);

  const closeBtn = document.getElementById("close");

  // Fermeture du dialogue avec le bouton
  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);

  addEventListener("keypress", (key) => {
    if (key.code === "Enter") {
      closeBtn.click();
    }
  });
}
// Mise à jour de la position du dialogue par rapport au joueur
export function updateDialoguePosition(k, playerX, playerY, camPos) {
  const textbox = document.getElementById("textbox-container");
  const offsetX = playerX - camPos.x + k.width() / 2;
  const offsetY = playerY - camPos.y + k.height() / 2;
  const marginX = 20; 
  const marginY = -40; 
  textbox.style.left = `${offsetX + marginX}px`;
  textbox.style.top = `${offsetY - textbox.clientHeight - 20}px`; 
  textbox.style.display = "block";  
}

// Affichage du texte à côté du joueur
export function displayNextToPlayer(k, text, playerX, playerY) {
  const textbox = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  dialogue.innerHTML = text;
  updateDialoguePosition(k, playerX, playerY, k.camPos());
  textbox.style.display = "block";  
}

// Ajustement de la mise à l'échelle de la caméra
export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));  
  } else {
    k.camScale(k.vec2(1.5));  
  }
}
