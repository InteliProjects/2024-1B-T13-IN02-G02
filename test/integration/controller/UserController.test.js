const assert = require("assert");
const controller = require("../../../api/controllers/UsersController");
const sinon = require("sinon");
const jwt = require("jsonwebtoken"); // Ensure jwt is imported
const { mockAsync, RESPONSE } = require("../../util/utils");

const USER = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    team: 1 || "1",
    isAdmin: false,
    profile_photo: "profile_photo.jpg"
};

describe("UsersController", () => {
    describe("Login", () => {
        let findOneStub;
        let jwtStub;
        afterEach(() => {
            if (findOneStub) findOneStub.restore();
            if (jwtStub) jwtStub.restore();
        });

        it("Deve retornar erro se o email não for fornecido", async () => {
            const req = {
                body: {
                    password: "password123",
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Preencha todos os campos.' })
            };

            await controller.login(req, res);

            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Preencha todos os campos.');
        });

        it("Deve retornar erro se o usuário não for encontrado", async () => {
            findOneStub = mockAsync(User, "findOne", null);

            const req = {
                body: {
                    email: "julim.l@gmail.com",
                    password: "password123",
                },
            };

            await controller.login(req, RESPONSE);

            assert.strictEqual(findOneStub.calledOnce, true);
            assert.strictEqual(RESPONSE.badRequest.calledOnce, true);
            assert.strictEqual(RESPONSE.badRequest.firstCall.args[0].error, 'Email não encontrado.');
        });

        it("Deve retornar erro se a senha estiver incorreta", async () => {
            findOneStub = mockAsync(User, "findOne", USER);

            const req = {
                body: {
                    email: USER.email,
                    password: "wrongpassword",
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Email ou senha incorretos.' })
            };

            await controller.login(req, res);

            assert.strictEqual(findOneStub.calledOnce, true);
            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Email ou senha incorretos.');
        });

        it("Deve fazer login com sucesso com as credenciais corretas", async () => {
            findOneStub = mockAsync(User, "findOne", USER);
            jwtStub = sinon.stub(jwt, "sign").callsFake(() => "token");
            const req = {
                body: {
                    email: USER.email,
                    password: USER.password,
                },
            };

            const res = {
                ok: sinon.stub()
            };

            await controller.login(req, res);

            assert.strictEqual(findOneStub.calledOnce, true);
            assert.strictEqual(res.ok.calledOnce, true);
            assert.deepStrictEqual(res.ok.firstCall.args[0], {
                user: {
                    id: USER.id,
                    name: USER.name,
                    email: USER.email,
                    isAdmin: USER.isAdmin,
                },
                token: "Bearer token",
            });
        });
    });

    describe("Create", () => {
        let createStub;
        let uploadPhotoStub;
        afterEach(() => {
            if (createStub) createStub.restore();
            if (uploadPhotoStub) uploadPhotoStub.restore();
        });

        it("Deve retornar erro se o nome não for fornecido", async () => {
            const req = {
                body: {
                    email: "email@example.com",
                    password: "password123",
                    team: "1"
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Todos os campos são obrigatórios.' }),
                serverError: sinon.stub()
            };

            await controller.create(req, res);

            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Todos os campos são obrigatórios.');
        });

        it("Deve retornar erro se o email não for fornecido", async () => {
            const req = {
                body: {
                    name: "Nome",
                    password: "password123",
                    team: "1"
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Todos os campos são obrigatórios.' }),
                serverError: sinon.stub()
            };

            await controller.create(req, res);

            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Todos os campos são obrigatórios.');
        });

        it("Deve retornar erro se a senha não for fornecida", async () => {
            const req = {
                body: {
                    name: "Nome",
                    email: "email@example.com",
                    team: "1"
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Todos os campos são obrigatórios.' }),
                serverError: sinon.stub()
            };

            await controller.create(req, res);

            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Todos os campos são obrigatórios.');
        });

        it("Deve retornar erro se o time não for fornecido", async () => {
            const req = {
                body: {
                    name: "Nome",
                    email: "email@example.com",
                    password: "password123"
                },
            };

            const res = {
                badRequest: sinon.stub().returns({ error: 'Todos os campos são obrigatórios.' }),
                serverError: sinon.stub()
            };

            await controller.create(req, res);

            assert.strictEqual(res.badRequest.calledOnce, true);
            assert.strictEqual(res.badRequest.firstCall.args[0].error, 'Todos os campos são obrigatórios.');
        });

        it("Deve criar um usuário com sucesso", async () => {
            createStub = sinon.stub(User, "create").returns({
                fetch: sinon.stub().resolves({
                    id: USER.id,
                    name: USER.name,
                    email: USER.email,
                    isAdmin: USER.isAdmin,
                    team: USER.team,
                    profile_photo: USER.profile_photo
                })
            })
            uploadPhotoStub = sinon.stub(sails.helpers, "uploadPhoto").resolves(USER.profile_photo);

            const req = {
                body: {
                    name: USER.name,
                    email: USER.email,
                    password: USER.password,
                    team: USER.team,
                    profile_photo: USER.profile_photo
                },
            };

            const res = {
                ok: sinon.stub(),
                serverError: sinon.stub(),
                badRequest: sinon.stub()
            };

            await controller.create(req, res);

            assert.strictEqual(createStub.calledOnce, true);
            assert.strictEqual(res.ok.calledOnce, true);
            assert.strictEqual(res.ok.calledOnce, true);
        });

        it("Deve retornar erro no servidor se ocorrer um erro", async () => {
            createStub = sinon.stub(User, "create").rejects(new Error("Erro no servidor"));

            const req = {
                body: {
                    name: USER.username,
                    email: USER.email,
                    password: USER.password,
                    team: USER.team,
                    profile_photo: USER.profile_photo
                },
            };

            const res = {
                serverError: sinon.stub(),
            };

            await controller.create(req, res);

            assert.strictEqual(res.serverError.calledOnce, true);
        });
    });
});
