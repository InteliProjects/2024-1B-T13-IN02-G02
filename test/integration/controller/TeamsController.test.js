const assert = require('assert');
const sinon = require('sinon');
const TeamsController = require('../../../api/controllers/TeamsController');
const { RESPONSE, mockAsync } = require('../../util/utils');

describe('TeamsController', () => {
    beforeEach(() => {
        // Resetar os stubs antes de cada teste
        sinon.resetHistory();
        RESPONSE.ok.resetHistory();
        RESPONSE.badRequest.resetHistory();
        RESPONSE.serverError.resetHistory();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('create', () => {
        let createStub;
        let updateUserStub;
        afterEach(() => {
            sinon.restore();
            if (createStub) {
                createStub.restore();
            }
        })
        it('Deve criar equipe com sucesso', async () => {
            const req = {
                body: {
                    name: 'Team A',
                    description: 'Description',
                    montadores: '1,2',
                    gestor: '3',
                },
            };
            updateUserStub = sinon.stub(User, 'update').returns({ set: sinon.stub().resolves() });
            createStub = sinon.stub(Team, 'create').returns({
                fetch: sinon.stub().resolves({ id: 'team-id-1', name: 'Team A', description: 'Description' }),
            });
            
            await TeamsController.create(req, RESPONSE);

            assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], { message: 'Equipe criada com sucesso.' });
        });

        it('Deve retornar erro ao faltar campos', async () => {
            const req = {
                body: {
                    name: '',
                    description: '',
                    montadores: '',
                    gestor: null,
                },
            };
            createStub = mockAsync(Team, 'create', req.body);
            await TeamsController.create(req, RESPONSE);

            assert(RESPONSE.badRequest.calledOnce);
            assert.deepStrictEqual(RESPONSE.badRequest.firstCall.args[0], { error: 'Preencha todos os campos.' });
        });
    });

    describe('listTeams', () => {
        let findStub;
        afterEach(() => {
            sinon.restore();
            if (findStub) {
                findStub.restore();
            }
        });
        beforeEach(() => {
            RESPONSE.ok.resetHistory();
            RESPONSE.notFound.resetHistory();
            RESPONSE.serverError.resetHistory();
        });
        it('Deve listar todas as equipes', async () => {
            const req = {};
            findStub = mockAsync(Team, 'find', [
                { id: 'team-id-1', name: 'Team A', description: '', createdAt: 1718574985646, updatedAt: 1718574985646 },
                { id: 'team-id-2', name: 'Team B', description: '', createdAt: 1718575021045, updatedAt: 1718575021045 },
            ])
            await TeamsController.listTeams(req, RESPONSE);
            assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], [
                { id: 'team-id-1', name: 'Team A', description: '', createdAt: 1718574985646, updatedAt: 1718574985646 },
                { id: 'team-id-2', name: 'Team B', description: '', createdAt: 1718575021045, updatedAt: 1718575021045 },
            ]);
        });
    });

    describe('listTeamUsers', () => {
        let findStubWithUsers;

        beforeEach(() => {
            RESPONSE.ok.resetHistory();
            RESPONSE.notFound.resetHistory();
            RESPONSE.serverError.resetHistory();
        });

        afterEach(() => {
            sinon.restore();
            if (findStubWithUsers) {
                findStubWithUsers.restore();
            }
        });
        it('Deve listar equipes com usuários', async () => {
            findStubWithUsers = sinon.stub(Team, 'find').returns({
                populate: sinon.stub().resolves([
                    {
                        id: 'team-id-1', name: 'Team A', description: '', createdAt: 1718574985646, updatedAt: 1718574985646, users: [
                            { id: 'user-id-1', name: 'User 1', email: 'user1@example.com' },
                        ],
                    },
                    {
                        id: 'team-id-2', name: 'Team B', description: '', createdAt: 1718575021045, updatedAt: 1718575021045, users: [
                            { id: 'user-id-2', name: 'User 2', email: 'user2@example.com' },
                        ],
                    },
                ]),
            });
            const req = {};

            await TeamsController.listTeamUsers(req, RESPONSE);

            assert.strictEqual(Team.find.calledOnce, true);
            assert(RESPONSE.ok.calledOnce);
            assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], [
                {
                    id: 'team-id-1', name: 'Team A', description: '', createdAt: 1718574985646, updatedAt: 1718574985646, users: [
                        { id: 'user-id-1', name: 'User 1', email: 'user1@example.com' },
                    ],
                },
                {
                    id: 'team-id-2', name: 'Team B', description: '', createdAt: 1718575021045, updatedAt: 1718575021045, users: [
                        { id: 'user-id-2', name: 'User 2', email: 'user2@example.com' },
                    ],
                },
            ]);
        });
    });
});
