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
export interface Plane {
    shape: "Plane";
    center: Point;
    normal: Point;
}

export interface Material {
    diffuse: Color;
    shininess: number;
    specular: Color;
    reflectivity: Color;
}

export type Shape = (Ball | Plane) & Material;