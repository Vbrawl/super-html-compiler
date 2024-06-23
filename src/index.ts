import * as commander from "commander";
import { Compiler } from "./compiler";


interface IOptions {
    projectRoot:string
    allowDuplicatedRequirements:boolean
}



function compile(input_file:string, output_file:string, options:IOptions) {
    const compiler = new Compiler(options.projectRoot, options.allowDuplicatedRequirements);
    compiler.compile_file(input_file, output_file)
    console.log(`${output_file}: Created from ${input_file}`);
}




commander.program
            .version("1.0.0")
            .description("Compile separated HTML files to a single HTML file."  )
            .argument("<input file>",               "File to compile")
            .argument("<output file>",              "Output file")
            .option("-p, --project-root [string]",  "Root of source code",  ".")
            .option("--allow-duplicated-requirements", "Allow requirements to be duplicated (ie, specified more than once)")
            .action(compile)
            .parse(process.argv)