export declare class Pop {
    uuid: string;
    childSwaps: string[];

    constructor(uuid: string, desc: string, poster: string, title: string, parentUUID: string);

    async getChild(index: number): Promise<null | Swap>;

    static async getByUUID(uuid: string): Promise<null | Swap>;

    async write(): Promise<void>;
}

export declare class Swap extends Pop {
    get parent(): Swap;
    constructor(uuid: string, desc: string, poster: string, title: string);
}