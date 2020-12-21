import { Color } from "./color";
import { Point, Ray } from "./point";

export interface Scene {
    iterations: number;
    camera: Ray;
    light: Point;
    background: Color;
    shapes: Shape[]
}

export interface Ball {
    shape: "Ball";
    center: Point;
    radius: number;
}

export interface Material {
    diffuse: Color;
    shininess: number;
    // specular: Color;
    reflectivity: number;
}

export type Shape = Ball & Material;