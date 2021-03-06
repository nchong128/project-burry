const NotionTableId = process.env.SHOPPING_LIST_TABLE_ID;
const NotionToken = process.env.NOTION_TOKEN;
const { Client } = require("@notionhq/client");
const got = require('got');

// Initializing a client
const notion = new Client({
    auth: NotionToken,
});

const getProductIdFromLink = (link) => {
    const regExp = new RegExp("\/productdetails\/([^\/]+)");
    const matches = link.match(regExp);
    return matches[1];
}

const getProductDetails = async (link) => {
    // Find product ID
    const productId = getProductIdFromLink(link);

    // Query for price
    const url = `https://www.woolworths.com.au/apis/ui/product/detail/${productId}`; // used the wrong url lol
    // const url = `https://www.woolworths.com.au/api/v3/ui/schemaorg/product/${productId}`;

    try {
        const response = await got(url, {
            responseType: 'json'
        });

        // return response.body.Product.Price && response.body.Product.InstorePrice;
        return response.body;
    } catch (error) {
        console.error(error.code);
        console.error(error.message);
        console.error(error.stack);
    }
}

exports.handler = async function(event) {
    // Retrieve all items in shopping list
    const databases = await notion.databases.query({
        database_id: NotionTableId
    });

    let updateCount = 0;

    for (const product of databases.results) {
        const productName = product.properties.Name?.title[0]?.plain_text;
        const productUrl = product.properties.Woolworths?.url;
        const pageId = product.id;

        if (productUrl) {
            const productDetails = await getProductDetails(productUrl);
            const currentPrice = Number(productDetails?.Product?.Price);
            const prevPrice = Number(productDetails?.Product?.WasPrice);
            const quantity = String(productDetails?.Product?.PackageSize);
            const isDiscounted = Boolean(productDetails?.Product?.IsOnSpecial ||
                productDetails?.Product?.InstoreIsOnSpecial);
            const savingsAmount = Number(productDetails?.Product?.SavingsAmount);
            const savingsPct = savingsAmount / prevPrice * 100;

            const priceText = isDiscounted ? `$${currentPrice} (${savingsPct}% off)` : `$${currentPrice}`;

            await notion.pages.update({
                page_id: pageId,
                properties: {
                    'Price': {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": priceText
                                }
                            },

                        ]
                    },
                    'Quantity': {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": quantity
                                }
                            }
                        ]
                    },
                    'On-Special': {
                        "checkbox": isDiscounted
                    }
                }
            });
            updateCount++;
        }
    }

    console.log(`${updateCount} item successfully updated.`);
}