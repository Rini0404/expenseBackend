export declare class Swap {
    uuid: string;
    childSwaps: string[];

    constructor(uuid: string, desc: string, poster: string, title: string, parentUUID: string);

    getChild(index: number): Swap;
}