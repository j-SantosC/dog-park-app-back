class LoginUser {
    constructor(firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    async execute(email, password) {
        try {
            const user = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
            return user;
        } catch (error) {
            throw new Error('Login failed');
        }
    }
}

module.exports = { LoginUser };

class CreateUser {
    constructor(firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    async execute(email, password) {
        try {
            const userRecord = await this.firebaseAuth.createUser({
                email: email,
                password: password
            });
            return userRecord;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }
}

module.exports = { CreateUser };