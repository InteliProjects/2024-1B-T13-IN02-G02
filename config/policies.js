/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const ManualsController = require("../api/controllers/ManualsController");



module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions, unless overridden.       *
     * (`true` allows public access)                                            *
     *                                                                          *
     ***************************************************************************/

    // '*': true,
    TasksController: {
        listTasksByUser: 'isLogged',
        homepage: 'isLogged'
    },
    UsersController: {
        login: true,
        register: true,
        updateTeamById: 'isAdmin'
    },
    FavoritesController: {
        addFavorite: 'isLogged',
        deleteFavorite: 'isLogged',
        listFavorites: 'isLogged'
    },
    ManualsController: {
        listManuals: 'isLogged',
    }

};
