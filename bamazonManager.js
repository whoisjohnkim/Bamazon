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
    inquireUser();
})

function inquireUser (){
    inquirer.prompt([
        {
            type: "list",
            name: "task",
            message: "What would like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }
    ]).then(function(iResp){
        switch(iResp.task){
            case "View Products for Sale":
                viewTotal();
                break;
            case "View Low Inventory":
                viewLow();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
            case "Exit":
                connection.end();
                break;
        }
    })
}

function viewTotal(){
    connection.query("SELECT * FROM products", function(err, resp){
        if(err) throw err;
        printProducts(resp);
        inquireUser();
    })


}

function viewLow(){
    connection.query("SELECT * FROM products WHERE stock_quantity<=5", function(err, resp){
        if(err) throw err;
        printProducts(resp);
        inquireUser();
    })
}

function addInventory(){
    connection.query("SELECT * FROM products", function(err, resp){
        if(err) throw err;
        printProducts(resp);
        var productsArray = [];
        for(var i = 0; i < resp.length; i++){
            productsArray.push(resp[i].product_name);
        }
        inquirer.prompt([
            {
                type: "list",
                name: "product",
                message: "Which product do you want to add inventory to?",
                choices: productsArray
            },
            {
                message: "What quantity would you like to add?",
                name: "addedQuant"
            }
        ]).then(function(iResp){
            connection.query("SELECT * FROM products WHERE product_name=?", [iResp.product], function(err, resp){
                if(err) throw err;
                var stockQuant = parseInt(resp[0].stock_quantity);
                var itemID = resp[0].item_id;
                connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?",
                                  [stockQuant + parseInt(iResp.addedQuant), itemID], function(err, resp){
                    if(err) throw err;
                    console.log("You've added " + iResp.addedQuant + " units of " + iResp.product + " to your inventory!");
                    inquireUser();
                })
            })

        })
    })
}

function addProduct(){
    inquirer.prompt([
        {
            name: "productName",
            message: "What product would you like to add to the inventory?"
        },
        {
            name: "department",
            message: "Which department should we add this product to?"
        },
        {
            name: "price",
            message: "What is the price per unit? (usd)"
        },
        {
            name: "quantity",
            message: "What quantity would you like to add?"
        }
    ]).then(function(iResp){
        connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?,?,?,?)", [iResp.productName, iResp.department, iResp.price, iResp.quantity], function(err, resp){
            if(err) throw err;
            inquireUser();
        })
    })
}

function printProducts(resp){
    console.log("Item ID | Product Name                | Price   | Quantities");
    console.log("-------------------------------------------------------------")
    for(var i = 0; i < resp.length; i++){
        var output = "";
        output += resp[i].item_id;
        output = addSpaces(8, output);
        output += " " + resp[i].product_name;
        output = addSpaces(38, output);
        output += " " + resp[i].price.toFixed(2);
        output = addSpaces(48, output);
        output += " " + resp[i].stock_quantity;
        console.log(output);
    }
}

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