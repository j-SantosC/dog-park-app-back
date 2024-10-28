const { LoginUser, CreateUser } = require('../domain/userCases');
const {admin} = require('../infraestructure/firebase');

const login = async (req, res) => {
    const { email, password } = req.body;
    const loginUser = new LoginUser(admin.auth());

    try {
        const user = await loginUser.execute(email, password);
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(401).json({
            message: "Login failed",
            error: error.message,
        });
    }
};

const createUser = async (req, res) => {
    const { email, password } = req.body;
    const createUserCase = new CreateUser(admin.auth());

    try {
        const user = await createUserCase.execute(email, password);
        return res.status(201).json({ user });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(400).json({
            message: "Failed to create user",
            error: error.message,
        });
    }
};

module.exports = { createUser, login };
