"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const node_html_parser_1 = require("node-html-parser");
const promises_1 = require("node:fs/promises");
const path = require("node:path");
class Compiler {
    cwd;
    constructor(cwd) {
        this.cwd = path.resolve(process.cwd(), cwd);
    }
    async compile_file(input_file, output_file) {
        const root = await this.load_file(input_file);
        const all_heads = root.getElementsByTagName("head");
        var head = undefined;
        if (all_heads.length === 1 && all_heads[0] !== undefined) {
            head = all_heads[0];
        }
        var action_taken = true;
        while (action_taken) {
            action_taken = false;
            action_taken = await this.replace_imports(root) || action_taken;
            if (head)
                action_taken = await this.replace_requirements(root, head) || action_taken;
        }
        await (0, promises_1.writeFile)(output_file, root.outerHTML);
    }
    async replace_imports(root) {
        var statics = root.getElementsByTagName("static-import");
        const action_taken = statics.length !== 0;
        while (statics.length !== 0) {
            for (let i = 0; i < statics.length; i++) {
                const static_import = statics[i];
                if (static_import !== undefined) {
                    const import_path = path.resolve(this.cwd, static_import.innerText);
                    static_import.replaceWith(await this.load_file(import_path));
                }
            }
            statics = root.getElementsByTagName("static-import");
        }
        return action_taken;
    }
    async replace_requirements(root, output) {
        var requirements = root.getElementsByTagName("static-requirement");
        const action_taken = requirements.length !== 0;
        while (requirements.length !== 0) {
            for (let static_requirement = requirements.pop(); static_requirement !== undefined; static_requirement = requirements.pop()) {
                while (static_requirement.firstChild !== undefined) {
                    output.appendChild(static_requirement.firstChild);
                }
                static_requirement.remove();
            }
        }
        return action_taken;
    }
    async load_file(file) {
        return (0, node_html_parser_1.parse)(await (0, promises_1.readFile)(file, "utf-8"));
    }
}
exports.Compiler = Compiler;
//# sourceMappingURL=compiler.js.map