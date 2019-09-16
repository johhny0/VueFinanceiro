const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function login(_, args, ctx, info) {
    const { email, password } = args;

    const user = await ctx.db.query.user({ where: { email } });

    if (!user) {
        throw new Error('Invalid Credentials');
    }

    const valid = await bcript.compare(password, user.password);

    if (!valid) {
        throw new Error('Invalid Credentials');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' });

    return {
        token,
        user
    }
}
async function signup(_, args, ctx, info) {
    const password = await bcript.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({ data: { ...args, password } });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' });

    return {
        token,
        user
    }
}

module.exports = {
    signup,
    login
}