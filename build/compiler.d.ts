export declare class Compiler {
    cwd: string;
    constructor(cwd: string);
    compile_file(input_file: string, output_file: string): Promise<void>;
    load_file(file: string): Promise<import("node-html-parser").HTMLElement>;
}
