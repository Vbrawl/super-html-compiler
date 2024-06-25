import { parse, HTMLElement, Node, NodeType } from "node-html-parser";
import { prettyPrint as htmlPrettyPrint } from "html";
import { readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";


/**
 * Search children in the next level, do NOT go beyond this level.
 * IE. Run the check function on every node directly under root.
 * 
 * @param root The root of the element to check
 * @param check The function to run on each child element. Return element if this returns true.
 */
function find_in_level(root:HTMLElement, check: (child:Node) => boolean): Node|undefined {
    for (let i = 0; i < root.childNodes.length; i++) {
        const child = root.childNodes[i];
        if(!child) continue
        if(check(child)) return child;
    }
    return undefined;
}

function is_html_element(root:Node): root is HTMLElement {
    return root.nodeType === NodeType.ELEMENT_NODE;
}

/**
 * Extract the first level text of the root.
 * IE. Extract the TextNodes directly under root.
 * 
 * @param root The root with the text
 * @returns The extracted text in the first level of the children in root.
 */
function get_level_text(root:HTMLElement): string {
    var res = '';
    for (let i = 0; i < root.childNodes.length; i++) {
        const node = root.childNodes[i];
        if(!node || node.nodeType !== NodeType.TEXT_NODE) continue;
        res += node.text;
    }
    return res;
}


export class Compiler {
    cwd:string;
    allow_duplicated_requirements:boolean;

    constructor(cwd:string, allow_duplicated_requirements:boolean = false) {
        this.cwd = path.resolve(process.cwd(), cwd);
        this.allow_duplicated_requirements = allow_duplicated_requirements;
    }

    async compile_file(input_file:string, output_file:string) {
        const root = await this.load_file(input_file);
        const fake_head = new HTMLElement("head", {});
        
        // Parse and compile
        var action_taken = true;
        while(action_taken) {
            action_taken = false;
            action_taken = await this.replace_imports(root) || action_taken;
            action_taken = this.replace_requirements(root, fake_head) || action_taken;
        }

        // Remove duplicated requirements
        if(!this.allow_duplicated_requirements) {
            this.remove_duplicates(fake_head);
        }

        // Compile requirements inside the result HTML
        this.place_requirements(root, fake_head);

        await writeFile(output_file, htmlPrettyPrint(root.outerHTML));
    }

    async replace_imports(root:HTMLElement): Promise<boolean> {
        var statics = root.getElementsByTagName("static-import");
        const action_taken = statics.length !== 0;
        while (statics.length !== 0) {
            for (let i = 0; i < statics.length; i++) {
                const static_import = statics[i];
                if(static_import !== undefined) {
                    const import_path = path.resolve(this.cwd, get_level_text(static_import).trim());
                    const imported_element = await this.load_file(import_path);
                    this.replace_placeholders(imported_element, static_import);
                    static_import.replaceWith(imported_element);
                }
            }
            statics = root.getElementsByTagName("static-import");
        }
        return action_taken;
    }

    replace_requirements(root:HTMLElement, output:HTMLElement): boolean {
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

    replace_placeholders(root:HTMLElement, param_root:HTMLElement): boolean {
        var placeholders = root.getElementsByTagName("static-placeholder");
        const action_taken = placeholders.length !== 0;

        for (let i = 0; i < placeholders.length; i++) {
            const placeholder = placeholders[i];
            if(!placeholder) continue;
            
            const placeholder_name = placeholder.getAttribute("name");
            if(!placeholder_name) continue;
            const parameter = find_in_level(param_root, (child:Node): boolean => {
                if(!is_html_element(child)) return false;
                if(child.tagName.toLowerCase() !== "static-parameter") return false;

                const parameter_name = child.getAttribute("name");
                return (placeholder_name === parameter_name);
            });

            if(parameter && is_html_element(parameter)) {
                placeholder.insertAdjacentHTML("beforebegin", parameter.innerHTML);
            }
            placeholder.remove();
        }

        return action_taken;
    }

    remove_duplicates(container:HTMLElement) : boolean {
        var action_taken = false;
        for (let i = 0; i < container.childNodes.length; i++) {
            const node = container.childNodes[i];
            if(!node) continue;

            for (let j = i+1; j < container.childNodes.length; j++) {
                const jnode = container.childNodes[j];
                if(!jnode) continue;

                if(node.toString() === jnode.toString()) {
                    jnode.remove();
                    action_taken = true;
                    j--;
                }
            }
        }
        return action_taken;
    }

    place_requirements(root:HTMLElement, fake_head:HTMLElement) {
        var requirement_placeholder = new HTMLElement("static-requirement-placeholder", {});
        var placeholder_found = false;

        const heads = root.getElementsByTagName("head");
        const requirement_placeholders = root.getElementsByTagName("static-requirement-placeholder");

        // Error checking!
        if(heads.length > 1) {
            throw new Error("Invalid Document: Multiple <head> tags found!");
        }
        if(requirement_placeholders.length > 1) {
            throw new Error("Invalid Document: Multiple <static-requirement-placeholder> tags found!");
        }

        // Find placeholder
        if(requirement_placeholders.length === 1 && requirement_placeholders[0] !== undefined) {
            requirement_placeholder = requirement_placeholders[0];
            placeholder_found = true;
        }
        else if(heads.length === 1 && heads[0] !== undefined) {
            heads[0].appendChild(requirement_placeholder);
            placeholder_found = true;
        }
        else {
            // That's still valid HTML but we should warn the user.
            console.warn("No <head> or <static-requirement-placeholder> tags found, requirements were not added to the document!");
        }

        if(placeholder_found) {
            requirement_placeholder.insertAdjacentHTML('beforebegin', fake_head.innerHTML);
            requirement_placeholder.remove();
        }
        return placeholder_found;
    }

    async load_file(file:string): Promise<HTMLElement> {
        return parse(await readFile(file, "utf-8"));
    }
}