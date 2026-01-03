export async function createGame(parent: HTMLElement): Promise<import("phaser").Game> {
  // IMPORTANT: Phaser touches `window` at import-time, so only load it on the client.
  const Phaser = (await import("phaser")) as typeof import("phaser");
  const { createScenes } = await import("./scenes");
  const { TitleScene, RoleScene, PlayScene } = createScenes(Phaser);

  const config: import("phaser").Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "rgba(0,0,0,0)",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [TitleScene, RoleScene, PlayScene],
  };

  const game = new Phaser.Game(config);
  game.registry.set("shared", { state: null, seed: 0 });
  return game;
}

