const path = require("node:path");
const fs = require("node:fs/promises");

module.exports = function(grunt) {
    grunt.initConfig({
        super_html_compiler: {
            test: {
                files: [{
                    expand: false,
                    cwd: "tests/sources",
                    src: ["**/*.html", "!**/_*.html"],
                    dest: "tests/actual_results",
                    ext: ".html"
                }]
            },
        },

        file_compare: {
            test: {
                options: {
                    expected_results_folder: "tests/expected_results",
                    actual_results_folder: "tests/actual_results"
                }
            }
        },

        exec: {
            ts: {
                command: "npx tsc"
            }
        }
    });

    grunt.loadTasks("tasks");
    grunt.loadNpmTasks("grunt-exec");


    grunt.registerTask("test", ["super_html_compiler", "file_compare"]);
    grunt.registerTask("build", ["exec:ts"]);
    grunt.registerTask("default", ["build", "test"]);


    grunt.registerMultiTask("file_compare", "Compare all files under actual_results_folder and expected_results_folder", function() {
        var done = this.async();
        var options = this.options({
            expected_results_folder: undefined,
            actual_results_folder: undefined
        });

        if(!options.expected_results_folder || !grunt.file.isDir(options.expected_results_folder)) {
            grunt.fail.fatal("expected_results_folder needs to point to a directory.")
        }
        if(!options.actual_results_folder || !grunt.file.isDir(options.actual_results_folder)) {
            grunt.fail.fatal("actual_results_folder needs to point to a directory.")
        }
        
        (async function(options) {
            const ar_files = await fs.readdir(options.actual_results_folder);
            const er_files = await fs.readdir(options.expected_results_folder);

            for (let i = 0; i < er_files.length; i++) {
                const file_name = er_files[i];
                const ar_i = ar_files.findIndex((v) => {return v === file_name});
                if(ar_i === -1) {
                    grunt.log.warn(`${path.basename(file_name)}: Doesn't exist in ${options.expected_results_folder}.`);
                    continue;
                }

                const expected_file_path = path.join(options.expected_results_folder, file_name);
                const actual_file_path = path.join(options.actual_results_folder, file_name);

                const ef = await fs.readFile(expected_file_path);
                const af = await fs.readFile(actual_file_path);

                if(ef.equals(af))   { grunt.log.write("[+]"["green"]); }
                else                { grunt.log.write("[-]"["red"]); }
                grunt.log.writeln(' ' + file_name);
            }
        }(options)).then(done);
    });
}