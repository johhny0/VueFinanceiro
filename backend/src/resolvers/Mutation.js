const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const { getUserId } = require('./../utils')


function createAccount(_, args, ctx, info) {
    const userId = getUserId(ctx);
    return ctx.db.mutation.createAccount({
        data: {
            description: args.description,
            user: { connect: { id: userId } }
        }
    }, info);
}

function createCategory(_, args, ctx, info) {
    const userId = getUserId(ctx);
    return ctx.db.mutation.createCategory({
        data: {
            description: args.description,
            operation: args.operation,
            user: { connect: { id: userId } }
        }
    }, info)
}

function createRecord(_, args, ctx, info) {
    const userId = getUserId(ctx);
    console.clear();
    console.log("ARGS: ", args);
    return ctx.db.mutation.createRecord({
        data: {
            user: { connect: { id: userId } },
            account: { connect: { id: args.accountId } },
            category: { connect: { id: args.categoryId } },
            amout: args.amout,
            type: args.type,
            date: args.date,
            description: args.description,
            tags: args.tags,
            note: args.note,
            user: { connect: { id: userId } }
        }
    }, info)
}

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
    createAccount,
    createCategory,
    createRecord,
    signup,
    login
}