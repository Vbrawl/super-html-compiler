import { HTMLElement } from "node-html-parser";
export declare class Compiler {
    cwd: string;
    allow_duplicated_requirements: boolean;
    constructor(cwd: string, allow_duplicated_requirements?: boolean);
    compile_file(input_file: string, output_file: string): Promise<void>;
    replace_imports(root: HTMLElement): Promise<boolean>;
    replace_requirements(root: HTMLElement, output: HTMLElement): boolean;
    remove_duplicates(container: HTMLElement): boolean;
    place_requirements(root: HTMLElement, fake_head: HTMLElement): boolean;
    load_file(file: string): Promise<HTMLElement>;
}
