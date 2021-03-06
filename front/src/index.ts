import 'phaser';
import GameConfig = Phaser.Types.Core.GameConfig;
import {DEBUG_MODE, JITSI_URL, RESOLUTION} from "./Enum/EnvironmentVariable";
import {cypressAsserter} from "./Cypress/CypressAsserter";
import {LoginScene} from "./Phaser/Login/LoginScene";
import {ReconnectingScene} from "./Phaser/Reconnecting/ReconnectingScene";
import {SelectCharacterScene} from "./Phaser/Login/SelectCharacterScene";
import {EnableCameraScene} from "./Phaser/Login/EnableCameraScene";
import {FourOFourScene} from "./Phaser/Reconnecting/FourOFourScene";
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer;
import {OutlinePipeline} from "./Phaser/Shaders/OutlinePipeline";
import {CustomizeScene} from "./Phaser/Login/CustomizeScene";
import {ResizableScene} from "./Phaser/Login/ResizableScene";
import {EntryScene} from "./Phaser/Login/EntryScene";
import {coWebsiteManager} from "./WebRtc/CoWebsiteManager";

// Load Jitsi if the environment variable is set.
if (JITSI_URL) {
    const jitsiScript = document.createElement('script');
    jitsiScript.src = 'https://' + JITSI_URL + '/external_api.js';
    document.head.appendChild(jitsiScript);
}

const {width, height} = coWebsiteManager.getGameSize();

const config: GameConfig = {
    title: "WorkAdventure",
    width: width / RESOLUTION,
    height: height / RESOLUTION,
    parent: "game",
    scene: [EntryScene, LoginScene, SelectCharacterScene, EnableCameraScene, ReconnectingScene, FourOFourScene, CustomizeScene],
    zoom: RESOLUTION,
    physics: {
        default: "arcade",
        arcade: {
            debug: DEBUG_MODE
        }
    },
    callbacks: {
        postBoot: game => {
            // FIXME: we should fore WebGL in the config.
            const renderer = game.renderer as WebGLRenderer;
            renderer.addPipeline(OutlinePipeline.KEY, new OutlinePipeline(game));
        }
    }
};

cypressAsserter.gameStarted();

const game = new Phaser.Game(config);

window.addEventListener('resize', function (event) {
    const {width, height} = coWebsiteManager.getGameSize();
    game.scale.resize(width / RESOLUTION, height / RESOLUTION);

    // Let's trigger the onResize method of any active scene that is a ResizableScene
    for (const scene of game.scene.getScenes(true)) {
        if (scene instanceof ResizableScene) {
            scene.onResize(event);
        }
    }
});
coWebsiteManager.onStateChange(() => {
    const {width, height} = coWebsiteManager.getGameSize();
    game.scale.resize(width / RESOLUTION, height / RESOLUTION);
});
