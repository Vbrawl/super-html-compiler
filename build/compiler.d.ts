import { HTMLElement } from "node-html-parser";
export declare class Compiler {
    cwd: string;
    constructor(cwd: string);
    compile_file(input_file: string, output_file: string): Promise<void>;
    replace_imports(root: HTMLElement): Promise<boolean>;
    replace_requirements(root: HTMLElement, output: HTMLElement): Promise<boolean>;
    load_file(file: string): Promise<HTMLElement>;
}
