import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import "./style.css";

const BG = "assets/bg_landscape.png";
const LOGO = "assets/logo.png";
const SPIN_BUTTON = "assets/ui/spin_btn.png";
const STOP_BUTTON = "assets/ui/stop_btn.png";
const SYMBOLS0 = "assets/symbols/11.png";
const SYMBOLS1 = "assets/symbols/00.png";
const SYMBOLS2 = "assets/symbols/01.png";
const SYMBOLS3 = "assets/symbols/02.png";
const SYMBOLS4 = "assets/symbols/03.png";
const SYMBOLS5 = "assets/symbols/04.png";
const SYMBOLS6 = "assets/symbols/05.png";
const SYMBOLS7 = "assets/symbols/06.png";
const SYMBOLS8 = "assets/symbols/07.png";
const SYMBOLS9 = "assets/symbols/08.png";
const SYMBOLS10 = "assets/symbols/09.png";
const SYMBOLS11 = "assets/symbols/10.png";

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

const app = new Application({ backgroundColor: 0xd3d3d3, width: 1280, height: 720 });
document.body.appendChild(app.view);

app.loader
    .add(BG)
    .add(LOGO)
    .add(SPIN_BUTTON)
    .add(STOP_BUTTON)
    .add(SYMBOLS0)
    .add(SYMBOLS1)
    .add(SYMBOLS2)
    .add(SYMBOLS3)
    .add(SYMBOLS4)
    .add(SYMBOLS5)
    .add(SYMBOLS6)
    .add(SYMBOLS7)
    .add(SYMBOLS8)
    .add(SYMBOLS9)
    .add(SYMBOLS10)
    .add(SYMBOLS11)
    .load(onAssetsLoaded);

function onAssetsLoaded() {
    const bg_texture = Texture.from(BG);
    const logo = Sprite.from(LOGO);
    const spin_button = Sprite.from(SPIN_BUTTON);
    const stop_button = Sprite.from(STOP_BUTTON);
    const slotTextures = [
        Texture.from(SYMBOLS0),
        Texture.from(SYMBOLS1),
        Texture.from(SYMBOLS2),
        Texture.from(SYMBOLS3),
        Texture.from(SYMBOLS4),
        Texture.from(SYMBOLS5),
        Texture.from(SYMBOLS6),
        Texture.from(SYMBOLS7),
        Texture.from(SYMBOLS8),
        Texture.from(SYMBOLS9),
        Texture.from(SYMBOLS10),
        Texture.from(SYMBOLS11),
    ];

    const bg = new Sprite(bg_texture);
    app.stage.addChild(bg);
    const reels: any[] = [];
    const reelContainer = new Container();
    reelContainer.mask = new Graphics().beginFill(0xffffff).drawRect(100, 157, 1280, 460).endFill();

    for (let i = 0; i < 5; i++) {
        const rc = new Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);
        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
        };
        for (let j = 0; j < 6; j++) {
            const symbol: Sprite = new Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            symbol.y = j * SYMBOL_SIZE;
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 6.4);
    logo.x = 450;
    logo.y = 3;
    spin_button.x = 1120;
    spin_button.scale.x = 0.6;
    spin_button.scale.y = 0.6;
    spin_button.y = 300;
    stop_button.x = spin_button.x;
    stop_button.scale.x = spin_button.scale.x;
    stop_button.scale.y = spin_button.scale.y;
    stop_button.y = spin_button.y;
    app.stage.addChild(logo);
    app.stage.addChild(spin_button);
    app.stage.addChild(stop_button);
    spin_button.interactive = true;
    stop_button.interactive = true;
    spin_button.buttonMode = true;
    stop_button.visible = false;

    spin_button.addListener("pointerdown", () => {
        spin_button.visible = false;
        stop_button.visible = true;
        startPlay();
    });
    stop_button.addListener("pointerdown", () => {
        spin_button.visible = false;
        stop_button.visible = true;
        stopPlay();
    });
    let running = false;

    function startPlay() {
        if (running) return;
        running = true;
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 50 + extra + 50;
            const time = 2500 + i * 600 + extra * 120;
            tweenTo(r, "position", target, time, backout(0), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    function stopPlay() {
        if (!running) return;
        running = false;
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            for (let b = 0; b < tweening.length; b++) {
                const t = tweening[b];
                t.target === Math.floor(r.position);
                t.time = 0;
            }
        }
    }

    function reelsComplete() {
        stop_button.visible = false;
        spin_button.visible = true;
        running = false;
    }

    app.ticker.add((delta) => {
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            r.previousPosition = r.position;
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

const tweening: any[] = [];

function tweenTo(
    object: { [x: string]: any },
    property: string,
    target: any,
    time: number,
    easing: (t: any) => number,
    onchange: null,
    oncomplete: (() => void) | null,
) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };
    tweening.push(tween);
    return tween;
}

app.ticker.add((delta) => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);
        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

function lerp(a1: number, a2: number, t: number) {
    return a1 * (1 - t) + a2 * t;
}

function backout(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
}
