/**
 * `tasks/register/buildProd.js`
 *
 * ---------------------------------------------------------------
 *
 * This Grunt tasklist will be executed instead of `build` if you
 * run `sails www` in a production environment, e.g.:
 * `NODE_ENV=production sails www`
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/tasks/register/build-prod.js
 *
 */
module.exports = function(grunt) {
    grunt.registerTask('buildProd', [
        'compileAssets',
        // 'babel',        //« uncomment to ALSO transpile during development (for broader browser compat.)
        'linkAssetsBuild',
        'clean:build',
        'copy:build'
    ]);
};
