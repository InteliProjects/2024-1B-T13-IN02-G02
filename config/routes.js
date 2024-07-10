/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/
    '/': { view: 'pages/homepage' },
    '/engineer/dashboard': { view: 'pages/administrador/dashboard' },
    '/engineer/manual-registration': 'ManualsController.index',
    '/engineer/manual-update/:manualId': { view: 'pages/administrador/manual-update' },
    '/engineer/manual/:manualId': { view: 'pages/administrador/manual' },
    '/engineer/profile': { view: 'pages/administrador/profile' },
    '/engineer/search': { view: 'pages/administrador/search' },
    '/engineer/task-distribution': 'TasksController.index',
    '/engineer/update-team': { view: 'pages/administrador/update-team' },
    '/engineer/create-model': { view: 'pages/administrador/model' },
    '/engineer/create-team': 'TeamsController.index',
    '/engineer/profile/mounter/:id': { view: 'pages/administrador/others-profile' },
    '/engineer/edit-team/:id': { view: 'pages/administrador/edit-team' },
    '/mounter/favorites': { view: 'pages/montador/favorites' },
    '/mounter/homepage': { view: 'pages/montador/homepage' },
    '/mounter/mounter-manual/:manualId': { view: 'pages/montador/manual' },
    '/mounter/profile': { view: 'pages/montador/profile' },
    '/mounter/search': { view: 'pages/montador/search' },
    '/mounter/support': { view: 'pages/montador/support' },
    '/change-password': { view: 'pages/change-password' },
    '/login': { view: 'pages/login' },
    '/register': 'UsersController.registerIndex',
    '/reset-password': 'UsersController.renderResetPassword',

    // API
    'POST /api/reset-password': 'UsersController.resetPassword',
    'POST /api/register': 'UsersController.create', // criando user novo
    'POST /api/login': 'UsersController.login', // login do user
    'POST /api/update-team': 'TeamsController.create', // criando novo time
    'GET /api/update-team': 'TeamsController.listTeamUsers', // listando os ID's disponíveis para criação de time
    'GET /api/user/manuals': 'TasksController.listManualsByUser', // lista os manuais atarefados ao user
    'POST /api/create-task': 'TasksController.create', // criando nova task
    'GET /api/manual/:id': 'ManualsController.findOneWithFiles',
    'POST /api/favorite/add': 'FavoritesController.addFavorite', // adiciona manual aos favoritos
    'GET /api/tasks/:id/check-files-status': 'TasksController.checkFilesStatus', // checa se os arquivos do manual estão disponíveis
    'POST /api/create-manual': 'ManualsController.create', //pagina de cadastro de manual
    'POST /api/done-file': 'DoneFilesController.doneFile',
    'GET /api/mounter/token/verify': 'UsersController.verifyToken', // verifica token do montador
    'GET /api/engineer/token/verify': 'UsersController.verifyTokenEngineer', // verifica token do engenheiro
    'GET /api/mounter/tasks': 'TasksController.listTasksByUser', // lista as tarefas do montador
    'GET /api/mounter/favorites': 'FavoritesController.listFavorites', // lista os favoritos do montador
    'GET /api/mounter/list-tasks-view': 'TasksController.listTasksView',
    'GET /api/task/:id/markAsRead': 'TasksController.markTaskAsReadIfReady',
    'POST /api/addToFavorites': 'FavoritesController.addFavorite', // adiciona um manual aos favoritos do user
    'GET /api/listFavorites': 'FavoritesController.listFavorites', // lista os favoritos do user
    'GET /api/listAllFavorites': 'FavoritesController.listAllFavorites', // lista os favoritos do user
    'DELETE /api/deleteFavorite': 'FavoritesController.deleteFavorite', // deletar favorito de determinado user
    'GET /api/manuals': 'ManualsController.listManuals', // lista os manuais do montador
    'POST /notifications/support': 'NotificationsController.createSupportNotification',
    'GET /users/admins': 'UsersController.listAdmins',
    'PATCH /api/changeManualStatus/:manualId': 'ManualsController.setActive', // muda o active do manual para false ou true.
    'GET /api/getManuals/:manualId': 'FeedbackController.list', // lista os feedbacks de acordo com o manualId
    'POST /api/createFeedbacks': 'FeedbackController.create', // reporte de erro
    'POST /api/create-model': 'ModelsController.create', //Criar modelo
    'GET /api/dashboardData/:id': 'TasksController.dashboardDataGraph01',
    'GET /api/dashboardData02/:id': 'TasksController.dashBoardDataGraph02',
    'GET /api/dashboardData03/:id': 'TasksController.dashBoardDataGraph03',
    'GET /api/listOneModel/:modelId': 'ModelsController.listOneModel',
    'PUT /api/updateManualDetails/:manualId': 'ManualsController.updateManual',
    'GET /profile': 'UsersController.profile',
    'POST /api/change-password': 'UsersController.changePassword',
    'POST /api/verify/permission': 'UsersController.verifyPermission',
    'GET /api/userIdByTask/:manualId': 'TasksController.findTaskByManualId',
    'POST /api/notificationsByUser': 'NotificationsController.listNotificationByUserId',
    'POST /api/markAllAsRead': 'NotificationsController.markAllAsRead',
    'GET /api/listById/:id': 'UsersController.listById',
    'GET /api/listAllTeams': 'TeamsController.listTeams',
    'PATCH /api/updateTeamId': 'UsersController.updateTeamById',
    'GET /api/mounters': 'UsersController.listMountersAndTeams',


    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/
};