"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander = __importStar(require("commander"));
const compiler_1 = require("./compiler");
function compile(input_file, output_file, options) {
    const compiler = new compiler_1.Compiler(options.projectRoot);
    compiler.compile_file(input_file, output_file);
    console.log(`${output_file}: Created from ${input_file}`);
}
commander.program
    .version("1.0.0")
    .description("Compile separated HTML files to a single HTML file.")
    .argument("<input file>", "File to compile")
    .argument("<output file>", "Output file")
    .option("-p, --project-root [string]", "Root of source code", ".")
    .action(compile)
    .parse(process.argv);
