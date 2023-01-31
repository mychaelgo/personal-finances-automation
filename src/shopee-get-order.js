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

const generateProducts = (items) => {
    return items.map(item => {
        return item.name;
    }).join('\n');
};

const test = async () => {
    const { data: db } = await getPersonalFinancesDataStores();
    const lastOrderKey = process.env.PIPEDREAM_DB_SHOPEE_LAST_ORDER_KEY;
    const lastOrderId = db[lastOrderKey];

    console.log({ lastOrderId });
    
    const configuration = new Configuration({
        basePath: 'https://shopee.co.id',
        baseOptions: {
            headers: {
                cookie: process.env.SHOPEEMALL_TOKEN
            }
        }
    });
    const shopeeMallApi = new ShopeeMallApi(configuration);
    
    const orderList = await shopeeMallApi.getOrderList({
        limit: 10,
        listType: 3, // completed
        offset: 0
    });

    if (orderList.data.data === null) {
        console.log(`No data. Error ${orderList.data.error}`);
        return;
    }

    let orderIds = [];
    const data = orderList.data.data.details_list
        .filter(order => {
            return order.info_card.order_id > lastOrderId;
        })
        .reverse()
        .map(order => {
        const orderId = order.info_card.order_id;
        const itemsShopee = order.info_card.order_list_cards[0].items;
        const total = order.info_card.final_total / 100000;

        orderIds.push(orderId);

        return {
            order_id: orderId,
            invoice_url: `https://shopee.co.id/user/purchase/order/${orderId}`,
            total_price: total,
            products: generateProducts(itemsShopee)
        }

    })

    const orderDetails = await Promise.all(orderIds.map(orderId => {
        return shopeeMallApi.getOrderDetail({
            orderId
        });
    }));

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
    // trigger workflow update google sheets
    await updateTransactionInGoogleSheets(data);


    // update last order id in pipedream
    await updatePersonalFinancesDataStores(lastOrderKey, updatedLastOrderId)

    console.log(data);
};

test();