module.exports = function (grunt) {

    // Project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: [
                    'src/Heatmap.js',
                    'src/component/dataConverter.js',
                    'src/component/TileUrlsGenerator.js',
                    'src/component/Canvas.js'
                ],
                dest: 'build/Heatmap.js'
            }
        },
        uglify: {
            build: {
                src: 'build/Heatmap.js',
                dest: 'build/Heatmap.min.js'
            }
        },
        watch: {
            files: 'src/**/*.js',
            tasks: 'default'
        }
    });

    // Load the plugin
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task
    grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};