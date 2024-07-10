module.exports = function(grunt) {
    grunt.config.set('sails-linker', {
        devJs: {
            options: {
                startTag: '<!--SCRIPTS-->',
                endTag: '<!--SCRIPTS END-->',
                fileTmpl: '<script src="%s"></script>',
                appRoot: '.tmp/public'
            },
            files: {
                '.tmp/public/**/*.html': ['.tmp/public/js/**/*.js', '.tmp/public/dependencies/bootstrap/dist/js/bootstrap.bundle.min.js'],
                'views/**/*.ejs': ['.tmp/public/dependencies/bootstrap/dist/js/bootstrap.bundle.min.js', '.tmp/public/js/**/*.js']
            }
        },
        devStyles: {
            options: {
                startTag: '<!--STYLES-->',
                endTag: '<!--STYLES END-->',
                fileTmpl: '<link rel="stylesheet" href="%s">',
                appRoot: '.tmp/public'
            },
            files: {
                '.tmp/public/**/*.html': ['.tmp/public/styles/**/*.css', '.tmp/public/dependencies/bootstrap/dist/css/bootstrap.min.css', '.tmp/public/dependencies/bootstrap/dist/css/bootstrap.rtl.min.css'],
                'views/**/*.ejs': ['.tmp/public/dependencies/bootstrap/dist/css/bootstrap.min.css', '.tmp/public/dependencies/bootstrap/dist/css/bootstrap.rtl.min.css', '.tmp/public/styles/dashboard.css', '.tmp/public/styles/global.css', '.tmp/public/styles/importer.css', '.tmp/public/styles/loading.css', '.tmp/public/styles/manual-page.css', '.tmp/public/styles/manualCard.css', '.tmp/public/styles/modal-new-notification.css', '.tmp/public/styles/pagination.css', '.tmp/public/styles/report-error-modal.css']
            }
        }
    });

    grunt.loadNpmTasks('grunt-sails-linker');
};
