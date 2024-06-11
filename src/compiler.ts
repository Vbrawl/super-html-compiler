import { parse } from "node-html-parser";
import { readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

export class Compiler {
    cwd:string;

    constructor(cwd:string) {
        this.cwd = path.resolve(process.cwd(), cwd);
    }

    async compile_file(input_file:string, output_file:string) {
        const root = await this.load_file(input_file);

        var statics = root.getElementsByTagName("static-import");
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

        const all_heads = root.getElementsByTagName("head");
        if(all_heads.length === 1 && all_heads[0] !== undefined) {
            const head = all_heads[0];

            var requirements = root.getElementsByTagName("static-requirement");
            while (requirements.length !== 0) {
                for (let static_requirement = requirements.pop(); static_requirement !== undefined; static_requirement = requirements.pop()) {
                    while(static_requirement.firstChild !== undefined) {
                        head.appendChild(static_requirement.firstChild);
                    }
                    static_requirement.remove();
                }
                break;
            }
        }

        await writeFile(output_file, root.outerHTML);
    }

    async load_file(file:string) {
        return parse(await readFile(file, "utf-8"));
    }
}