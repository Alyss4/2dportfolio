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

  for (const layer of layers) {
    if (layer.name === "Decors3") {
      for (const Decors3 of layer.objects) {
        player.onCollide(Decors3.name, () => {
          if (Decors3.name === "exit") {
            k.go("insideScene");
            return;
          }
        });
      }
      continue;
    }
    if (layer.name === "Spawnpoint") {
      for (const entity of layer.objects) {
        if (entity.name === "Spawnpointplayer") {
          player.pos = k.vec2(123.88908694773681, 304.7954052063735);
        }
      }
    }
  }

  const collisions = [
    { pos: [410, 310], size: [101, 15], name: "canapeCollision" },
    { pos: [435, 420], size: [45, 65], name: "tvCollision" },
    { pos: [580, 320], size: [40, 40], name: "fauteuil" },
    { pos: [753.32, 440.68], size: [50, 50], name: "ordi" },
    { pos: [1010.38, 475.43], size: [55, 100], name: "lit" },
    { pos: [1001, 418], size: [40, 40], name: "chevet" },
    { pos: [997.54, 190.08], size: [80.86, 10.84], name: "bureau" },
    { pos: [1294.21, 107.44], size: [7.19, 82.82], name: "armoireChambre" },
    { pos: [1160.32, 652.57], size: [88.78, 42.30], name: "commode" }
  ];
  collisions.forEach(({ pos, size, name }) => {
    k.add([
      k.area({ shape: new k.Rect(k.vec2(0), ...size) }),
      k.body({ isStatic: true }),
      k.pos(...pos),
      name
    ]);
  });

  setCamScale(k);
  k.onResize(() => setCamScale(k));
  k.onUpdate(() => {
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
