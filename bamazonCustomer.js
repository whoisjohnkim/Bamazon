var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
});

connection.connect(function(err){
    if(err) throw err;
    displayProducts();

})

function displayProducts(){
    connection.query("SELECT item_id, product_name, price FROM products", function(err, resp){
        if(err) throw err;
        console.log("Item ID | Product Name                | Price");
        console.log("-----------------------------------------------")
        for(var i = 0; i < resp.length; i++){
            var output = "";
            output += resp[i].item_id;
            output = addSpaces(8, output);
            output += " " + resp[i].product_name;
            output = addSpaces(38, output);
            output += " " + resp[i].price.toFixed(2);
            console.log(output);
        }
        inquireUser();
    })
}

function inquireUser(){
    inquirer.prompt([
        {
            name: "id",
            message: "What is the item id of the product you want to purchase?"
        },
        {
            name: "quantity",
            message: "What quantity would you like to purchase of the selected item?"
        }
    ]).then(function(iResp){
        connection.query("SELECT * FROM products WHERE item_id=?", [iResp.id], function(err, resp){
            if(err) throw err;
            // Exit program if the user enters a product id that doesn't exist
            if(resp.length === 0){
                console.log("The item you are looking for does not exist. Please enter a valid product ID.")
                connection.end();
            }else{
                buyItem(resp[0], iResp.quantity);
            }

        })
    })
}

function buyItem(resp, quantity){
    if(quantity > resp.stock_quantity){
        console.log("Your order cannot be fulfilled. Insufficient quantity!")
        connection.end();
    }else{
        connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [parseFloat(resp.stock_quantity) - quantity, resp.item_id], function(err, resp){
            if(err) throw err;
            connection.end();
        })

        var totalCost = parseInt(quantity) * parseFloat(resp.price);
        addTotal(resp.item_id, resp.product_sales, totalCost);
        console.log("The total cost of your purchase: $" + totalCost.toFixed(2));
    }
}

function addTotal(id, sales, totalProfit){
    connection.query("UPDATE products SET product_sales=? WHERE item_id=?", [parseFloat(sales) + parseFloat(totalProfit), id], function(err, resp){
        if(err) throw err;
    })
}

// Function to make spacing of the output match the header
function addSpaces(total, output){
    var newOutput = output;
    if(output.length < total){
        for(var i = 0; i < total - output.length; i++){
            newOutput += " ";
        }
        newOutput += "|"
    }
    return newOutput;
}