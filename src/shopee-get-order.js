const { ShopeeMallApi, Configuration } = require('@mychaelgo/shopee');
const { format } = require('date-fns');

const { getPersonalFinancesDataStores, updateTransactionInGoogleSheets, updatePersonalFinancesDataStores } = require('./utils/pipedream');

const epochToDate = (timestamp) => {
    return format(new Date(timestamp * 1000), 'dd/MM/yyyy');
};

const getPurchaseDate = (processingInfo) => {
    let purchaseDate, purchaseDateFormatted;
    processingInfo.info_rows.forEach(row => {
        if (row.info_label.text === 'label_odp_order_time') {
            purchaseDate = Number(row.info_value.value);
            purchaseDateFormatted = epochToDate(purchaseDate);
            return;
        }
    })

    return {
        purchase_date: purchaseDate,
        purchase_date_formatted: purchaseDateFormatted
    };
};

const generateProducts = (itemGroups) => {
    const products = itemGroups.map(itemGroup => {
        return itemGroup.items[0].name;
    }).join('\n');

    return `[${process.env.PIPEDREAM_WORKFLOW_UPDATE_GOOGLE_SHEETS_SOURCE}] - ${products}`;
};

const test = async () => {
    console.log('Get last order id from Pipedream');
    const { data: db } = await getPersonalFinancesDataStores();
    const lastOrderKey = process.env.PIPEDREAM_DB_SHOPEE_LAST_ORDER_KEY;
    const lastOrderId = db[lastOrderKey];
    console.log(`Last order id ${lastOrderId}`);

    const configuration = new Configuration({
        basePath: 'https://shopee.co.id',
        baseOptions: {
            headers: {
                cookie: process.env.SHOPEEMALL_TOKEN
            }
        }
    });
    const shopeeMallApi = new ShopeeMallApi(configuration);

    console.log('Get order list');
    const orderList = await shopeeMallApi.getOrderList({
        limit: 100,
        listType: 3, // 3 = selesai, 7 = dikemas, 8 = dikirim
        offset: 0
    });

    if (orderList.data.data === null) {
        console.log(`No data. Error ${orderList.data.error}`);
        return;
    }

    console.log('Filtering order');
    let orderIds = [];
    const data = orderList.data.data.details_list
        .filter(order => {
            return order.info_card.order_id > lastOrderId;
        })
        .reverse()
        .map(order => {
            const orderId = order.info_card.order_id;
            const itemsShopee = order.info_card.order_list_cards[0].product_info.item_groups;
            const total = order.info_card.final_total / 100000;
            // console.log({
            //     orderId,
            //     itemsShopee,
            //     total
            // });

            orderIds.push(orderId);

            return {
                order_id: orderId,
                invoice_url: `https://shopee.co.id/user/purchase/order/${orderId}`,
                total_price: total,
                products: generateProducts(itemsShopee)
            }

        })

    console.log('Get all orders detail');
    const orderDetails = await Promise.all(orderIds.map(orderId => {
        return shopeeMallApi.getOrderDetail({
            orderId
        });
    }));

    console.log('Constructing data...');
    let updatedLastOrderId;
    orderDetails.forEach((od, i) => {
        const purchaseDate = getPurchaseDate(od.data.data.processing_info);
        data[i] = {
            ...data[i],
            payment_date: purchaseDate.purchase_date_formatted,
            time: purchaseDate.purchase_date
        }

        updatedLastOrderId = data[i].order_id;
    });

    if (data.length == 0) {
        console.log('No new data');
        return;
    }

    console.log(`Inserting ${data.length} rows`);
    // trigger workflow update google sheets
    await updateTransactionInGoogleSheets(data);


    console.log('Update last order id in Pipedream');
    // update last order id in pipedream
    await updatePersonalFinancesDataStores(lastOrderKey, updatedLastOrderId)

    console.log(data);
};

test();