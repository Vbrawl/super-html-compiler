module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            options: {
                fast: "never"
            },
            build: {
                tsconfig: true,

            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts"]);
}