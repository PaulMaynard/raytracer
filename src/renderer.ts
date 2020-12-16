import { Scene } from "./scene";

export interface Renderer {
    render(scene: Scene): void;
    canvas: Element;
}