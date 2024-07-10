const USER = {
    id: "cce825bf-09d5-4c8e-a9be-9f4f4a9dba5d",
    username: "felipeS",
    email: "felipe.s@gmail.com",
    bio: "adoro esportes",
    password: "password1234",
};

const USER_2 = {
    id: "cce825bf-09d5-4c8e-a9be-9f4f4a9dba5d",
    username: "Julin",
    email: "joão.s@gmail.com",
    bio: "Sou o julin",
    password: "password123",
};
const FILE = (fieldName) => {
    return {
        upload: (options, callback) => {
            // Simular o upload do arquivo
            callback(null, [{ fd: "caminho/do/arquivo" }]);
        },
    };
};