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
        var statics = root.getElementsByTagName("static-import");
        for (let i = 0; i < statics.length; i++) {
            const static_import = statics[i];
            if (static_import !== undefined) {
                const import_path = path.resolve(this.cwd, static_import.innerText);
                static_import.replaceWith(await this.load_file(import_path));
            }
        }
        await (0, promises_1.writeFile)(output_file, root.outerHTML);
    }
    async load_file(file) {
        return (0, node_html_parser_1.parse)(await (0, promises_1.readFile)(file, "utf-8"));
    }
}
exports.Compiler = Compiler;
//# sourceMappingURL=compiler.js.map