declare module 'cubejs' {
  export type Move = number;
  export type Algorithm = string | Move | Move[];

  export interface CubeState {
    center: number[];
    cp: number[];
    co: number[];
    ep: number[];
    eo: number[];
  }

  export default class Cube {
    constructor(state?: Cube | CubeState);

    // State management
    init(state: Cube | CubeState): this;
    identity(): this;
    toJSON(): CubeState;
    asString(): string;
    clone(): Cube;

    // Randomization
    static random(): Cube;
    randomize(): this;

    // Checks
    isSolved(): boolean;

    // Moves & orientation
    move(algorithm: Algorithm): this;
    upright(): string;

    // Multiplication helpers
    centerMultiply(other: Cube): this;
    cornerMultiply(other: Cube): this;
    edgeMultiply(other: Cube): this;
    multiply(other: Cube): this;

    // Solving
    solve(maxDepth?: number): string;
    solveUpright(maxDepth?: number): string;

    // Async solving (browser WebWorker-based)
    asyncSolve(callback: (algorithm: string) => void): void;

    // Static helpers
    static fromString(str: string): Cube;

    static inverse(algorithm: string): string;
    static inverse(moves: Move[]): Move[];
    static inverse(move: Move): Move;

    static initSolver(): void;
    static scramble(): string;

    // Async (static)
    static asyncOK: boolean;
    static asyncInit(workerURI: string, callback: () => void): void;
    static asyncScramble(callback: (algorithm: string) => void): void;
    static _asyncSolve(cube: Cube, callback: (algorithm: string) => void): void;
  }
}

