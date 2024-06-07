'use strict';
const compiler = require('../build/compiler');
const path = require('node:path');
const fs = require('node:fs/promises');


module.exports = function(grunt) {
    grunt.registerMultiTask('super_html_compiler', 'A task to compile html using grunt.', function() {
        var done = this.async();
        const options = this.options({
            cwd: undefined
        });

        (async function(done, options, files){
            for (let findex = 0; findex < files.length; findex++) {
                const f = files[findex];
                
                const fcwd = f.cwd || '.';
                const ccwd = options.cwd === undefined ? fcwd : options.cwd;
                const comp = new compiler.Compiler(ccwd);

                // Get only valid files
                var src = f.src.filter(function(filepath) {
                    if (grunt.file.exists(path.join(fcwd, filepath))) return true;
        
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                });
                
                for (let i = 0; i < src.length; i++) {
                    const source = path.join(fcwd, src[i]);
                    var destination = f.dest;
                    if(f.src.length > 1 || f.cwd !== undefined || f.expand !== undefined || f.ext !== undefined) {
                        destination = path.join(destination, src[i])
                    };

                    if(f.ext !== undefined) {
                        destination = destination.substr(0, destination.length - path.extname(destination).length) + f.ext;
                    }
    
                    await fs.mkdir(path.dirname(destination), {recursive: true});
                    await comp.compile_file(source, destination);
                    grunt.log.ok(`${source} -> ${destination}`);
                }
            }
            done();
        }(done, options, this.files));
    });
}