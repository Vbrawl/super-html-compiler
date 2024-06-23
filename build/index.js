"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const compiler_1 = require("./compiler");
function compile(input_file, output_file, options) {
    const compiler = new compiler_1.Compiler(options.projectRoot, options.allowDuplicatedRequirements);
    compiler.compile_file(input_file, output_file);
    console.log(`${output_file}: Created from ${input_file}`);
}
commander.program
    .description("Compile separated HTML files to a single HTML file.")
    .argument("<input file>", "File to compile")
    .argument("<output file>", "Output file")
    .option("-p, --project-root [string]", "Root of source code", ".")
    .option("--allow-duplicated-requirements", "Allow requirements to be duplicated (ie, specified more than once)")
    .action(compile)
    .parse(process.argv);
