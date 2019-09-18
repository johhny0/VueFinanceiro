const { getUserId } = require('./../utils')
const moment = require('moment');

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

function records(_, args, ctx, info) {
    const userId = getUserId(ctx);
    const { type, accountsIds, categoriesIds, month } = args;

    let AND = [{ user: { id: userId } }];

    AND = !type ? AND : [...AND, { type }];

    AND = !accountsIds || accountsIds.length === 0 ? AND : [
        ...AND,
        { OR: accountsIds.map(id => ({ account: { id } })) }
    ];

    AND = !categoriesIds || categoriesIds.length === 0 ? AND : [
        ...AND,
        { OR: categoriesIds.map(id => ({ category: { id } })) }
    ];

    if (month) {
        const date = moment(month, 'MM-YYYY');
        const startDate = date.startOf('month').toISOString();
        const endDate = date.endOf('month').toISOString();

        AND = [...AND, { date_gte: startDate }, { date_lte: endDate, }];
    }

    return ctx.db.query.records({
        where: { AND },
        orderBy: 'date_ASC'
    }, info)
}

function totalBalance(_, args, ctx, info) {
    const userId = getUserId(ctx);
    const { date } = args;
    const dateISO = moment(date, 'YYYY-MM-DD').endOf('day').toISOString();
    const pgSchema = `${process.env.PRISMA_SERVICE}$${process.env.PRISMA_STAGE}`;
    const mutation = `mutation totalBalance($database: PrismaDatabase, $query: String!) {
        executeRaw(database: $database, query: $query)
    }`;

    const variables = {
        database: 'default',
        query: `SELECT SUM(r.amout) as totalbalance 
        FROM "${pgSchema}"."Record" as r
        INNER JOIN "${pgSchema}"."_RecordToUser" as ru ON ru."A" = r.id
        WHERE ru."B" = '${userId}' AND r.date <= '${dateISO}'
        `
    };

    return ctx.prisma.$graphql(mutation, variables).then(response => {
        const totalbalance = response.executeRaw[0].totalbalance;
        return totalbalance ? totalbalance : 0;
    });
}

function user(_, args, ctx, info) {
    const userId = getUserId(ctx);

    return ctx.db.query.user({ where: { id: userId } }, info);
}

module.exports = {
    user,
    accounts,
    categories,
    records,
    totalBalance
}

