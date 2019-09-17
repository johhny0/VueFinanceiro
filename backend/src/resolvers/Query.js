const { getUserId } = require('./../utils')

function accounts(_, args, ctx, info) {
    const userId = getUserId(ctx);
    return ctx.db.query.accounts({
        where: {
            OR: [
                { user: { id: userId } },
                { user: null }
            ]
        },
        orderBy: 'description_ASC'
    }, info)
}

function categories(_, args, ctx, info) {
    const userId = getUserId(ctx);
    const { operation } = args;

    let AND = [{ OR: [{ user: { id: userId } }, { user: null }] }];

    AND = !operation ? AND : [...AND, { operation }];

    return ctx.db.query.categories({
        where: { AND },
        orderBy: 'description_ASC'
    }, info)
}

function user(_, args, ctx, info) {
    const userId = getUserId(ctx);

    return ctx.db.query.user({ where: { id: userId } }, info);
}

module.exports = {
    user,
    accounts,
    categories
}

