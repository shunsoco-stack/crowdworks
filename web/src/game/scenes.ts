import roles from "@/data/roles.json";
import offers from "@/data/offers.json";
import events from "@/data/events.json";
import type { EventCard, Offer, Role } from "./types";
import { applyEvent, buyOffer, canAfford, drawEvent, drawOffers, endMonth, fmt, isWin, monthStart, netMonthly, newGame } from "./engine";

type PhaserNS = typeof import("phaser");

const ROLES = roles as Role[];
const OFFERS = offers as Offer[];
const EVENTS = events as EventCard[];

type Shared = {
  state: ReturnType<typeof newGame> | null;
  seed: number;
};

export function createScenes(Phaser: PhaserNS) {
  function uiText(scene: import("phaser").Scene, x: number, y: number, text: string, size = 18, color = "#E5E7EB") {
    return scene.add.text(x, y, text, { fontFamily: "system-ui, sans-serif", fontSize: `${size}px`, color });
  }

  function pill(scene: import("phaser").Scene, x: number, y: number, w: number, h: number) {
    const g = scene.add.graphics();
    g.fillStyle(0x111b2e, 0.75);
    g.lineStyle(1, 0x2a344a, 1);
    g.fillRoundedRect(x, y, w, h, 14);
    g.strokeRoundedRect(x, y, w, h, 14);
    return g;
  }

  function button(
    scene: import("phaser").Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    tone: "primary" | "neutral" = "neutral",
  ) {
    const container = scene.add.container(x, y);
    const bg = scene.add.graphics();
    const fill = tone === "primary" ? 0x7c3aed : 0x111b2e;
    const line = tone === "primary" ? 0x000000 : 0x2a344a;
    bg.fillStyle(fill, 0.9);
    bg.lineStyle(1, line, 1);
    bg.fillRoundedRect(0, 0, w, h, 14);
    bg.strokeRoundedRect(0, 0, w, h, 14);

    const t = scene.add.text(w / 2, h / 2, label, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      color: "#E5E7EB",
      fontStyle: "700",
    });
    t.setOrigin(0.5, 0.5);

    const hit = scene.add.rectangle(w / 2, h / 2, w, h, 0xffffff, 0.0001);
    hit.setInteractive({ useHandCursor: true });
    hit.on(
      "pointerdown",
      (_p: import("phaser").Input.Pointer, _lx: number, _ly: number, ev: import("phaser").Types.Input.EventData) => {
      // Prevent the scene-level drag-scroll handler from also firing.
      // (Some environments may not pass EventData reliably.)
      const maybe = ev as unknown as { stopPropagation?: () => void };
      if (typeof maybe?.stopPropagation === "function") maybe.stopPropagation();
      onClick();
      },
    );
    hit.on("pointerover", () => scene.tweens.add({ targets: container, y: y - 1, duration: 80 }));
    hit.on("pointerout", () => scene.tweens.add({ targets: container, y, duration: 80 }));

    container.add([bg, t, hit]);
    return container;
  }

  function card(scene: import("phaser").Scene, x: number, y: number, w: number, h: number) {
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    g.fillStyle(0x111b2e, 0.72);
    g.lineStyle(1, 0x2a344a, 1);
    g.fillRoundedRect(0, 0, w, h, 18);
    g.strokeRoundedRect(0, 0, w, h, 18);
    c.add(g);
    return c;
  }

  class TitleScene extends Phaser.Scene {
    declare shared: Shared;
    private bg?: import("phaser").GameObjects.Rectangle;

    constructor() {
      super("Title");
    }

    create() {
      this.ensureSolidBg();
      this.shared = this.registry.get("shared") as Shared;

      const { width, height } = this.scale;
      uiText(this, 30, 28, "Cashflow Steps", 34).setFontStyle("900");
      uiText(this, 32, 70, "初心者向け / ソロ / 30分目安", 14, "rgba(229,231,235,.75)");

      const p = card(this, width / 2 - 320, height / 2 - 140, 640, 280);
      uiText(this, p.x + 24, p.y + 24, "目標", 18).setFontStyle("800");
      uiText(this, p.x + 24, p.y + 56, "パッシブ収入（毎月） ≥ 固定費（毎月）", 20, "#E5E7EB").setFontStyle("700");

      uiText(this, p.x + 24, p.y + 104, "進め方", 18).setFontStyle("800");
      uiText(this, p.x + 24, p.y + 134, "1) 月の開始 → 収支計算", 16, "rgba(229,231,235,.8)");
      uiText(this, p.x + 24, p.y + 160, "2) イベント発生（収入/支出が変化）", 16, "rgba(229,231,235,.8)");
      uiText(this, p.x + 24, p.y + 186, "3) オファーを買う（投資/副業/スキル）", 16, "rgba(229,231,235,.8)");

      button(
        this,
        width / 2 - 120,
        height / 2 + 170,
        240,
        48,
        "はじめる",
        () => {
          this.scene.start("Role");
        },
        "primary",
      );

      this.scale.on("resize", () => this.ensureSolidBg());
    }

    private ensureSolidBg() {
      const { width, height } = this.scale;
      if (!this.bg) {
        this.bg = this.add.rectangle(0, 0, width, height, 0x0b1220, 1);
        this.bg.setOrigin(0, 0);
        this.bg.setDepth(-10_000);
        this.bg.setScrollFactor(0);
      } else {
        this.bg.setSize(width, height);
      }
    }
  }

  class RoleScene extends Phaser.Scene {
    declare shared: Shared;
    private bg?: import("phaser").GameObjects.Rectangle;

    constructor() {
      super("Role");
    }

    create() {
      this.ensureSolidBg();
      this.shared = this.registry.get("shared") as Shared;
      const { width, height } = this.scale;

      uiText(this, 30, 28, "職業を選ぶ", 28).setFontStyle("900");
      uiText(this, 32, 62, "給与・固定費・初期現金が変わります。", 14, "rgba(229,231,235,.75)");

      const seed = Math.floor(Math.random() * 1_000_000_000);
      this.shared.seed = seed;

      const listX = 60;
      let y = 110;
      const rowH = 62;

      for (const r of ROLES) {
        const row = card(this, listX, y, width - 120, 54);
        const title = uiText(this, row.x + 18, row.y + 12, r.name, 18).setFontStyle("800");
        uiText(
          this,
          row.x + 18,
          row.y + 34,
          `給与 ${fmt(r.salary)} / 固定費 ${fmt(r.fixed_expenses)} / 現金 ${fmt(r.starting_cash)}`,
          14,
          "rgba(229,231,235,.78)",
        );
        const hit = this.add.rectangle(row.x + (width - 120) / 2, row.y + 27, width - 120, 54, 0xffffff, 0.0001);
        hit.setInteractive({ useHandCursor: true });
        hit.on("pointerdown", () => {
          this.shared.state = newGame(r, seed);
          this.scene.start("Play");
        });
        hit.on("pointerover", () => {
          title.setColor("#FFFFFF");
          this.tweens.add({ targets: row, x: row.x + 2, duration: 90 });
        });
        hit.on("pointerout", () => {
          title.setColor("#E5E7EB");
          this.tweens.add({ targets: row, x: listX, duration: 90 });
        });
        y += rowH;
      }

      button(this, 30, height - 70, 160, 44, "戻る", () => this.scene.start("Title"), "neutral");

      this.scale.on("resize", () => this.ensureSolidBg());
    }

    private ensureSolidBg() {
      const { width, height } = this.scale;
      if (!this.bg) {
        this.bg = this.add.rectangle(0, 0, width, height, 0x0b1220, 1);
        this.bg.setOrigin(0, 0);
        this.bg.setDepth(-10_000);
        this.bg.setScrollFactor(0);
      } else {
        this.bg.setSize(width, height);
      }
    }
  }

  class PlayScene extends Phaser.Scene {
    declare shared: Shared;

    private hud?: import("phaser").GameObjects.Container;
    private fixed?: import("phaser").GameObjects.Container;
    private center?: import("phaser").GameObjects.Container;
    private msg?: import("phaser").GameObjects.Text;
    private bg?: import("phaser").GameObjects.Rectangle;
    private scrollBound = false;
    private isDragging = false;
    private dragStartY = 0;
    private camStartY = 0;
    private contentHeight = 860;
    private bottomBarH = 84;

    constructor() {
      super("Play");
    }

    create() {
      this.ensureSolidBg();
      this.shared = this.registry.get("shared") as Shared;
      if (!this.shared.state) {
        this.scene.start("Role");
        return;
      }
      this.drawFrame();
      this.setupScrolling();
      this.render();

      this.scale.on("resize", () => this.ensureSolidBg());
    }

    private ensureSolidBg() {
      const { width, height } = this.scale;
      if (!this.bg) {
        this.bg = this.add.rectangle(0, 0, width, height, 0x0b1220, 1);
        this.bg.setOrigin(0, 0);
        this.bg.setDepth(-10_000);
        this.bg.setScrollFactor(0);
      } else {
        this.bg.setSize(width, height);
      }
    }

    private drawFrame() {
      const { width } = this.scale;
      this.hud?.destroy(true);
      this.fixed?.destroy(true);
      this.center?.destroy(true);

      this.hud = this.add.container(0, 0);
      this.fixed = this.add.container(0, 0);
      this.center = this.add.container(0, 0);

      pill(this, 20, 18, width - 40, 64);
      this.hud.add(uiText(this, 34, 34, "", 16, "rgba(229,231,235,.8)").setName("hud_left"));
      this.hud.add(uiText(this, width - 34, 34, "", 16, "rgba(229,231,235,.8)").setOrigin(1, 0).setName("hud_right"));
      this.hud.setScrollFactor(0);
      this.hud.setDepth(900);

      // Fixed overlay for buttons / tips etc.
      this.fixed.setScrollFactor(0);
      this.fixed.setDepth(1000);
    }

    private setupScrolling() {
      // Re-register once
      if (this.scrollBound) return;
      this.scrollBound = true;

      const cam = this.cameras.main;
      cam.setBounds(0, 0, this.scale.width, this.contentHeight);

      // Mouse wheel scroll
      this.input.on(
        "wheel",
        (
          _pointer: import("phaser").Input.Pointer,
          _gameObjects: unknown[],
          _dx: number,
          dy: number,
        ) => {
        const maxScroll = Math.max(0, this.contentHeight - this.scale.height);
        cam.scrollY = Phaser.Math.Clamp(cam.scrollY + dy * 0.7, 0, maxScroll);
        },
      );

      // Touch / drag scroll
      this.input.on("pointerdown", (p: import("phaser").Input.Pointer) => {
        // Don't drag-scroll on the start screen (button interactions should feel stable).
        if (!this.shared?.state?.inMonth) return;
        // Don't start drag-scroll from the bottom action bar area.
        if (p.y >= this.scale.height - this.bottomBarH) return;

        this.isDragging = true;
        this.dragStartY = p.y;
        this.camStartY = cam.scrollY;
      });
      this.input.on("pointerup", () => {
        this.isDragging = false;
      });
      this.input.on("pointermove", (p: import("phaser").Input.Pointer) => {
        if (!this.isDragging) return;
        const maxScroll = Math.max(0, this.contentHeight - this.scale.height);
        const delta = this.dragStartY - p.y;
        cam.scrollY = Phaser.Math.Clamp(this.camStartY + delta, 0, maxScroll);
      });

      // On resize, keep scroll bounds consistent
      this.scale.on("resize", () => {
        cam.setBounds(0, 0, this.scale.width, this.contentHeight);
        const maxScroll = Math.max(0, this.contentHeight - this.scale.height);
        cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, maxScroll);
        this.render();
      });
    }

    private render() {
      const s = this.shared.state!;
      const { width, height } = this.scale;
      const isNarrow = width < 860;
      this.bottomBarH = isNarrow ? 92 : 84;

      const hudLeft = this.hud!.getByName("hud_left") as import("phaser").GameObjects.Text;
      const hudRight = this.hud!.getByName("hud_right") as import("phaser").GameObjects.Text;

      hudLeft.setText(`月 ${s.month}  /  役職：${s.roleName}`);
      hudRight.setText(
        `現金 ${fmt(s.cash)}  |  給与 ${fmt(s.salary)}  |  固定費 ${fmt(s.fixedExpenses)}  |  パッシブ ${fmt(s.passiveIncome)}`,
      );

      this.center!.removeAll(true);
      this.fixed!.removeAll(true);
      this.msg?.destroy(true);
      this.msg = uiText(this, 30, 98, "", 14, "rgba(229,231,235,.75)");
      this.fixed!.add(this.msg);

      // Progress bar
      const denom = Math.max(1, s.fixedExpenses);
      const p = Math.max(0, Math.min(1, s.passiveIncome / denom));
      const barX = 20;
      const barY = 90;
      const barW = width - 40;
      const barH = 10;
      const g = this.add.graphics();
      g.fillStyle(0x111b2e, 0.8);
      g.fillRoundedRect(barX, barY, barW, barH, 999);
      g.fillStyle(0x10b981, 0.9);
      g.fillRoundedRect(barX, barY, Math.max(6, barW * p), barH, 999);
      this.fixed!.add(g);

      // Bottom action bar (fixed)
      const bar = this.add.graphics();
      const by = height - this.bottomBarH;
      bar.fillStyle(0x0b1220, 0.72);
      bar.fillRect(0, by, width, this.bottomBarH);
      bar.lineStyle(1, 0x2a344a, 1);
      bar.strokeLineShape(new Phaser.Geom.Line(0, by, width, by));
      this.fixed!.add(bar);

      if (isWin(s)) {
        this.showWin();
        return;
      }

      if (!s.inMonth) {
        this.msg.setText(isNarrow ? "▶ 今月を開始しよう" : "▶ 今月を開始しよう（収支計算 → イベント → オファー）");
        // Start button sits above the bottom bar for better thumb reach on mobile.
        const startW = isNarrow ? Math.min(380, width - 60) : 340;
        const startX = (width - startW) / 2;
        const startY = by - 70;
        this.fixed!.add(button(this, startX, startY, startW, 52, "今月を開始", () => this.startMonth(), "primary"));
        return;
      }

      // Event panel
      const ev = s.currentEvent!;
      const evPanel = card(this, 40, 120, width - 80, 150);
      this.center!.add(evPanel);
      this.center!.add(uiText(this, 60, 142, "⚡ イベント", 16, "rgba(229,231,235,.75)").setFontStyle("800"));
      this.center!.add(uiText(this, 60, 170, ev.name, 22).setFontStyle("900"));
      this.center!.add(uiText(this, 60, 204, ev.description, 16, "rgba(229,231,235,.80)"));
      this.center!.add(uiText(this, 60, 236, `影響：${evEffect(ev)}`, 14, "rgba(229,231,235,.70)"));

      // Offer cards
      const offersNow = s.currentOffers ?? [];
      this.center!.add(
        uiText(this, 40, 292, "🃏 オファー（どれか1つ買うか、スキップ）", 16, "rgba(229,231,235,.75)").setFontStyle("800"),
      );
      const cardH = isNarrow ? 232 : 250;
      const y = 320;

      if (isNarrow) {
        const cardW = width - 80;
        this.offerCard(offersNow[0], 40, y, cardW, cardH);
        this.offerCard(offersNow[1], 40, y + cardH + 22, cardW, cardH);
      } else {
        const cardW = (width - 120) / 2;
        this.offerCard(offersNow[0], 40, y, cardW, cardH);
        this.offerCard(offersNow[1], 80 + cardW, y, cardW, cardH);
      }

      // Bottom controls
      const net = netMonthly(s);
      const netColor = net >= 0 ? "rgba(16,185,129,.95)" : "rgba(239,68,68,.95)";
      const netY = isNarrow ? y + cardH * 2 + 22 + 16 : y + cardH + 16;
      this.center!.add(uiText(this, 40, netY, `今月の純キャッシュフロー：${net >= 0 ? "+" : ""}${fmt(net)}`, 16, netColor).setFontStyle("800"));

      // These controls stay on screen inside the bottom bar
      const btnH = 46;
      const btnY = by + (this.bottomBarH - btnH) / 2;
      const nextW = isNarrow ? 170 : 170;
      const skipW = isNarrow ? 140 : 170;
      const gap = 12;
      const nextX = width - 24 - nextW;
      const skipX = nextX - gap - skipW;
      this.fixed!.add(button(this, nextX, btnY, nextW, btnH, "次の月へ", () => this.nextMonth(), "primary"));
      this.fixed!.add(button(this, skipX, btnY, skipW, btnH, "スキップ", () => this.nextMonth(), "neutral"));

      // Update scroll bounds (content may exceed viewport on small screens)
      // Rough bottom of content: y + cardH + labels + padding
      const contentBottom = isNarrow ? y + cardH * 2 + 22 + 160 : y + cardH + 160;
      // Add extra room so content can scroll above bottom bar (avoid being hidden behind fixed UI)
      this.contentHeight = Math.max(860, contentBottom + this.bottomBarH + 24);
      const cam = this.cameras.main;
      cam.setBounds(0, 0, width, this.contentHeight);
      const maxScroll = Math.max(0, this.contentHeight - height);
      cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, maxScroll);
    }

    private startMonth() {
      const s = this.shared.state!;
      monthStart(s);
      const ev = drawEvent(s, EVENTS);
      applyEvent(s, ev);
      s.currentOffers = drawOffers(s, OFFERS);
      this.render();
      this.cameras.main.flash(160, 124, 58, 237);
    }

    private offerCard(offer: Offer | undefined, x: number, y: number, w: number, h: number) {
      const c = card(this, x, y, w, h);
      this.center!.add(c);
      if (!offer) return c;

      this.center!.add(uiText(this, x + 18, y + 16, offer.name, 18).setFontStyle("900"));
      this.center!.add(uiText(this, x + 18, y + 44, kindLabel(offer.kind), 12, "rgba(229,231,235,.70)"));

      const lines = wrapText(offer.description, 42);
      this.center!.add(uiText(this, x + 18, y + 70, lines, 14, "rgba(229,231,235,.80)"));

      this.center!.add(uiText(this, x + 18, y + 156, `頭金：${fmt(offer.down_payment)}`, 14, "rgba(229,231,235,.75)"));
      this.center!.add(uiText(this, x + 18, y + 178, `パッシブ：+${fmt(offer.passive_income_delta)}/月`, 14, "rgba(16,185,129,.95)"));
      this.center!.add(uiText(this, x + 18, y + 200, `給与：+${fmt(offer.salary_delta)}/月`, 14, "rgba(59,130,246,.95)"));
      this.center!.add(
        uiText(this, x + 18, y + 222, `一時影響：${offer.cash_delta >= 0 ? "+" : ""}${fmt(offer.cash_delta)}`, 14, "rgba(229,231,235,.70)"),
      );

      const affordable = canAfford(this.shared.state!, offer);
      const label = affordable ? "購入する" : "現金不足";
      const btn = button(
        this,
        x + w - 170 - 18,
        y + h - 46 - 18,
        170,
        46,
        label,
        () => {
          if (!affordable) return;
          buyOffer(this.shared.state!, offer);
          this.cameras.main.shake(120, 0.004);
          this.render();
        },
        affordable ? "primary" : "neutral",
      );
      this.center!.add(btn);

      const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0.0001);
      hit.setInteractive({ useHandCursor: true });
      hit.on("pointerdown", (_p: import("phaser").Input.Pointer, _lx: number, _ly: number, ev: import("phaser").Types.Input.EventData) => {
        // Don't start drag-scrolling when clicking the card.
        const maybe = ev as unknown as { stopPropagation?: () => void };
        if (typeof maybe?.stopPropagation === "function") maybe.stopPropagation();
        this.tweens.add({
          targets: c,
          scaleX: 0.98,
          scaleY: 0.98,
          y: y + 2,
          duration: 80,
          yoyo: true,
        });
      });
      this.center!.add(hit);
      return c;
    }

    private nextMonth() {
      const s = this.shared.state!;
      endMonth(s);
      this.render();
    }

    private showWin() {
      const { width, height } = this.scale;
      const s = this.shared.state!;
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
      const box = card(this, width / 2 - 280, height / 2 - 140, 560, 280);
      uiText(this, width / 2, height / 2 - 70, "🎉 クリア！", 34).setOrigin(0.5, 0.5).setFontStyle("900");
      uiText(this, width / 2, height / 2 - 30, "パッシブ収入が固定費以上になりました。", 16, "rgba(229,231,235,.80)").setOrigin(0.5, 0.5);
      uiText(
        this,
        width / 2,
        height / 2 + 6,
        `月 ${s.month} / 現金 ${fmt(s.cash)} / パッシブ ${fmt(s.passiveIncome)} / 固定費 ${fmt(s.fixedExpenses)}`,
        14,
        "rgba(229,231,235,.70)",
      ).setOrigin(0.5, 0.5);

      const restart = button(this, width / 2 - 120, height / 2 + 70, 240, 48, "もう一度（職業選択へ）", () => {
        overlay.destroy();
        box.destroy();
        this.scene.start("Role");
      }, "primary");

      this.add.existing(box);
      this.add.existing(restart);
      this.tweens.add({ targets: box, y: box.y - 6, duration: 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
  }

  function evEffect(ev: EventCard): string {
    const parts: string[] = [];
    if (ev.cash_delta) parts.push(`現金 ${ev.cash_delta >= 0 ? "+" : ""}${fmt(ev.cash_delta)}`);
    if (ev.salary_delta) parts.push(`給与 ${ev.salary_delta >= 0 ? "+" : ""}${fmt(ev.salary_delta)}/月`);
    if (ev.fixed_expenses_delta) parts.push(`固定費 ${ev.fixed_expenses_delta >= 0 ? "+" : ""}${fmt(ev.fixed_expenses_delta)}/月`);
    if (ev.passive_income_delta) parts.push(`パッシブ ${ev.passive_income_delta >= 0 ? "+" : ""}${fmt(ev.passive_income_delta)}/月`);
    return parts.length ? parts.join(" / ") : "影響なし";
  }

  function kindLabel(kind: Offer["kind"]) {
    switch (kind) {
      case "investment":
        return "投資";
      case "side_hustle":
        return "副業";
      case "skill":
        return "スキル";
      case "safety":
        return "守り";
    }
  }

  function wrapText(s: string, max: number): string {
    const out: string[] = [];
    let line = "";
    for (const ch of s) {
      if (line.length >= max) {
        out.push(line);
        line = "";
      }
      line += ch;
    }
    if (line) out.push(line);
    return out.join("\n");
  }

  return { TitleScene, RoleScene, PlayScene };
}

