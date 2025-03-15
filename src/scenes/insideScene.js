import { dialogueData, scaleFactorInside, scaleFactorInsidePlayer } from "../core/constants.js";
import { k } from "../core/kaboomContext.js";
import { displayDialogue, setCamScale, updateDialoguePosition } from "../core/utils.js";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("mapinside", "/images/mapinside.png");
k.setBackground(k.Color.fromHex("#000000"));

k.scene("insideScene", async () => {
  const mapData = await (await fetch("/maps/mapinside.json")).json();
  const layers = mapData?.layers || [];

  if (layers.length === 0) {
    console.error("pas de layer found!");
    return;
  }

  let map = k.add([k.sprite("mapinside"), k.pos(0), k.scale(scaleFactorInside)]);

  let player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactorInsidePlayer),
    { speed: 250, direction: "down", isInDialogue: false },
    "player",
  ]);

  layers.forEach((layer) => {
    if (layer.name === "Collisions") {
      layer.objects.forEach((boundary) => {
        let shape;
      
        if (boundary.polygon) {
          const points = boundary.polygon.map((p) => k.vec2(boundary.x + p.x, boundary.y + p.y));
          shape = new k.Polygon(points);
        } else {
          shape = new k.Rect(k.vec2(0), boundary.width, boundary.height);
        }
      
        map.add([
          k.area({ shape }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);
      
        if (boundary.name === "sortie") {
          player.onCollide("sortie", () => k.go("main"));
        } else if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
            updateDialoguePosition(k, player.pos.x, player.pos.y, k.camPos());
          });
        }
      });
    }

  if (layer.name === "Spawnpoint") {
    layer.objects.forEach((entity) => {
      console.log("Objet :", entity.name, "Coord :", entity.x, entity.y);
      if (entity.name === "Spawnpointplayer") {
        const spawnPosition = k.vec2(123.88908694773681, 304.7954052063735);
        player.pos = spawnPosition;      
        console.log("Joueur1spawnpoint", player.pos);
        console.log("Joueur2 spawnpoint:", player.worldPos());
      }
    });
  }
  });

  setCamScale(k);
  k.onResize(() => setCamScale(k));
  k.onUpdate(() => {
    console.log("Coord j marche: ", player.worldPos());
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });
  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;
    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);
    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (mouseAngle > lowerBound && mouseAngle < upperBound) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
    } else if (mouseAngle < -lowerBound && mouseAngle > -upperBound) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
    } else if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
    } else {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
    }
  });

  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);

  k.onKeyDown(() => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = keyMap.filter(Boolean).length;
    if (nbOfKeyPressed > 1 || player.isInDialogue) return;

    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
    } else if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
    } else if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
    } else if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});
console.log("InsideScene ok");
