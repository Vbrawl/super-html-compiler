"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const node_html_parser_1 = require("node-html-parser");
const html_1 = require("html");
const promises_1 = require("node:fs/promises");
const path = require("node:path");
class Compiler {
    cwd;
    allow_duplicated_requirements;
    constructor(cwd, allow_duplicated_requirements = false) {
        this.cwd = path.resolve(process.cwd(), cwd);
        this.allow_duplicated_requirements = allow_duplicated_requirements;
    }
    async compile_file(input_file, output_file) {
        const root = await this.load_file(input_file);
        const fake_head = new node_html_parser_1.HTMLElement("head", {});
        var action_taken = true;
        while (action_taken) {
            action_taken = false;
            action_taken = await this.replace_imports(root) || action_taken;
            action_taken = this.replace_requirements(root, fake_head) || action_taken;
        }
        if (!this.allow_duplicated_requirements) {
            this.remove_duplicates(fake_head);
        }
        this.place_requirements(root, fake_head);
        await (0, promises_1.writeFile)(output_file, (0, html_1.prettyPrint)(root.outerHTML));
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
    replace_requirements(root, output) {
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
    remove_duplicates(container) {
        var action_taken = false;
        for (let i = 0; i < container.childNodes.length; i++) {
            const node = container.childNodes[i];
            if (!node)
                continue;
            for (let j = i + 1; j < container.childNodes.length; j++) {
                const jnode = container.childNodes[j];
                if (!jnode)
                    continue;
                if (node.toString() === jnode.toString()) {
                    jnode.remove();
                    action_taken = true;
                    j--;
                }
            }
        }
        return action_taken;
    }
    place_requirements(root, fake_head) {
        var requirement_placeholder = new node_html_parser_1.HTMLElement("static-requirement-placeholder", {});
        var placeholder_found = false;
        const heads = root.getElementsByTagName("head");
        const requirement_placeholders = root.getElementsByTagName("static-requirement-placeholder");
        if (heads.length > 1) {
            throw new Error("Invalid Document: Multiple <head> tags found!");
        }
        if (requirement_placeholders.length > 1) {
            throw new Error("Invalid Document: Multiple <static-requirement-placeholder> tags found!");
        }
        if (requirement_placeholders.length === 1 && requirement_placeholders[0] !== undefined) {
            requirement_placeholder = requirement_placeholders[0];
            placeholder_found = true;
        }
        else if (heads.length === 1 && heads[0] !== undefined) {
            heads[0].appendChild(requirement_placeholder);
            placeholder_found = true;
        }
        else {
            console.warn("No <head> or <static-requirement-placeholder> tags found, requirements were not added to the document!");
        }
        if (placeholder_found) {
            requirement_placeholder.insertAdjacentHTML('beforebegin', fake_head.innerHTML);
            requirement_placeholder.remove();
        }
        return placeholder_found;
    }
    async load_file(file) {
        return (0, node_html_parser_1.parse)(await (0, promises_1.readFile)(file, "utf-8"));
    }
}
exports.Compiler = Compiler;
