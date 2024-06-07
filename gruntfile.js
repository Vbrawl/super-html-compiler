module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            options: { fast: "never" },
            build: { tsconfig: true, }
        },

        super_html_compiler: {
            test: {
                files: [{
                    expand: false,
                    cwd: "tests/html",
                    src: ["**/*.html"],
                    dest: "tests/",
                    ext: ".super-html"
                }]
            },
        }
    });

    grunt.loadTasks("tasks");

    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts"]);
}