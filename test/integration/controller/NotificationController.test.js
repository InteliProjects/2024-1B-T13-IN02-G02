const assert = require('assert');
const sinon = require('sinon');
const jwt = require('jsonwebtoken'); // Ensure jwt is imported
const NotificationController = require('../../../api/controllers/NotificationsController');
const { debug } = require('console');
const { NOTIFICATIONS } = require('../../util/notification');
const { mockAsync, RESPONSE } = require('../../util/utils');

describe('NotificationController', () => {
    const findOne = (query) => {
        const filtred = NOTIFICATIONS.filter((notification) => notification.id === query.id);
        return filtred.length > 0 ? filtred[0] : null;
    };

    describe('markAsReadFunction', () => {
        let findOneStub, markAsReadStub;

        beforeEach(() => {
            RESPONSE.ok.resetHistory();
            RESPONSE.notFound.resetHistory();
            RESPONSE.serverError.resetHistory();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve marcar uma notificação como lida', async() => {
            const req = {
                params: {
                    id: 1
                }
            };
            findOneStub = mockAsync(Notification, 'findOne', findOne({ id: req.params.id }));
            markAsReadStub = mockAsync(Notification, 'update').returns({
                set: sinon.stub().resolves()
            });
            await NotificationController.markAsRead(req, RESPONSE);
            debug("Teste de debug " + RESPONSE.ok.calledWith({ message: 'Notificação marcada como lida.' }));
            assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], { message: 'Notificação marcada como lida.' });
        });

        it('Deve não achar a notificação e retornar 404', async() => {
            const req = {
                params: {
                    id: 50
                }
            };
            findOneStub = mockAsync(Notification, 'findOne', findOne({ id: req.params.id }));
            markAsReadStub = mockAsync(Notification, 'update').returns({
                set: sinon.stub().resolves(null)
            });
            await NotificationController.markAsRead(req, RESPONSE);
            assert.deepStrictEqual(RESPONSE.notFound.firstCall.args[0], { error: 'Notificação não encontrada.' });
        });

        it('Deve retornar erro 500', async() => {
            const req = {
                params: {
                    id: 1
                }
            };
            findOneStub = mockAsync(Notification, 'findOne', findOne({ id: req.params.id }));
            markAsReadStub = mockAsync(Notification, 'update').rejects();
            await NotificationController.markAsRead(req, RESPONSE);
            assert.ok(RESPONSE.serverError.firstCall.args[0], {});
        });
    });

    describe('markAllAsReadFunction', () => {
        let markAllAsReadStub;

        beforeEach(() => {
            RESPONSE.ok.resetHistory();
            RESPONSE.serverError.resetHistory();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve marcar todas as notificações como lidas', async() => {
            const req = {
                headers: {
                    authorization: 'Bearer token'
                }
            };
            const jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
                return { id: "1"};
            });
            markAllAsReadStub = mockAsync(Notification, 'update').returns({
                set: sinon.stub().resolves()
            });
            await NotificationController.markAllAsRead(req, RESPONSE);
            debug("Teste de debug " + RESPONSE.ok.firstCall);
            assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], { message: 'Todas as notificações marcadas como lidas.' });
            jwtVerifyStub.restore(); // Ensure the jwtVerifyStub is restored
        });

        it('Deve retornar erro 500', async() => {
            const req = {
                headers: {
                    authorization: 'Bearer token'
                }
            };
            debug("Teste de debug");
            markAllAsReadStub = mockAsync(Notification, 'update').rejects();
            await NotificationController.markAllAsRead(req, RESPONSE);
            assert.ok(RESPONSE.serverError.firstCall.args[0], {});
        });
    });
});
