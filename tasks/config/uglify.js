module.exports = function(grunt) {
    grunt.config.set('uglify', {
        dist: {
            options: {
                mangle: false,
                compress: {
                    drop_console: true
                },
                onError: function(error) {
                    grunt.log.warn(error);
                },
                warnings: false // Ignorar avisos
            },
            files: {
                '.tmp/public/concat/production.min.js': [
                    'assets/js/bootstrap.bundle.min.js', // Inclua apenas o arquivo necessário do Bootstrap
                    'assets/js/report-modal-toggle.js', // Inclua apenas o arquivo necessário do Bootstrap
                    'assets/js/verify-token.js', // Inclua apenas o arquivo necessário do Bootstrap
                    'assets/js/websocket-client.js',
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
