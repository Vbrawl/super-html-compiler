import { parse, HTMLElement } from "node-html-parser";
import { readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

export class Compiler {
    cwd:string;

    constructor(cwd:string) {
        this.cwd = path.resolve(process.cwd(), cwd);
    }

    async compile_file(input_file:string, output_file:string) {
        const root = await this.load_file(input_file);
        const all_heads = root.getElementsByTagName("head");
        var head = undefined;
        if(all_heads.length === 1 && all_heads[0] !== undefined) {
            head = all_heads[0];
        }
        
        var action_taken = true;
        while(action_taken) {
            action_taken = false;
            action_taken = action_taken || await this.replace_imports(root);
            if(head) action_taken = action_taken || await this.replace_requirements(root, head);
        }

        await writeFile(output_file, root.outerHTML);
    }

    async replace_imports(root:HTMLElement): Promise<boolean> {
        var statics = root.getElementsByTagName("static-import");
        const action_taken = statics.length !== 0;
        while (statics.length !== 0) {
            for (let i = 0; i < statics.length; i++) {
                const static_import = statics[i];
                if(static_import !== undefined) {
                    const import_path = path.resolve(this.cwd, static_import.innerText);
                    static_import.replaceWith(await this.load_file(import_path));
                }
            }
            statics = root.getElementsByTagName("static-import");
        }
        return action_taken;
    }

    async replace_requirements(root:HTMLElement, output:HTMLElement): Promise<boolean> {
        var requirements = root.getElementsByTagName("static-requirement");
        const action_taken = requirements.length !== 0;
        while (requirements.length !== 0) {
            for (let static_requirement = requirements.pop(); static_requirement !== undefined; static_requirement = requirements.pop()) {
                while(static_requirement.firstChild !== undefined) {
                    output.appendChild(static_requirement.firstChild);
                }
                static_requirement.remove();
            }
        }
        return action_taken;
    }

    async load_file(file:string): Promise<HTMLElement> {
        return parse(await readFile(file, "utf-8"));
    }
}