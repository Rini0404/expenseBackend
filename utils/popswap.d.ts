export declare class Pop {
    uuid: string;
    childSwaps: string[];
    description: string;
    creator: string;
    topic: string;
    parentUUID: string;

    constructor(uuid: string, description: string, creator: string, topic: string, audience: string);

    async getChild(index: number): Promise<null | Swap>;

    static async getByUUID(uuid: string): Promise<null | Swap>;

    async write(): Promise<void>;

    get json():
    {
        uuid: string,
        description: string,
        creator: string,
        topic: string,
        parentUUID: string,
        childSwaps: string[]
    };
    
}

export declare class Swap extends Pop {
    get parent(): Swap;
    constructor(uuid: string, description: string, creator: string, topic: string, audience: string, parentUUID: string);
}