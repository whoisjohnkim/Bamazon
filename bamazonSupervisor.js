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

function inquireUser(){
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "task",
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }
    ]).then(function(iResp){
        switch(iResp.task){
            case "View Product Sales by Department":
                viewDepartments();
                break;
            case "Create New Department":
                createDepartment();
                break;
            case "Exit":
                connection.end();
                break;
        }
    })
}

function viewDepartments(){
    connection.query("SELECT * FROM departments", function(err, resp){
        if (err) throw err;
        console.log(" Department ID  | Department Name         | Overhead Costs | Product Sales | Total Profit")
        console.log("----------------------------------------------------------------------------------------------")
        // 16, 25, 16, 15
        for(var i = 0; i < resp.length; i++){
            printDepartment(resp[i]);
        }

        connection.end();
    })
}

function printDepartment(dep){
    connection.query("SELECT product_sales FROM products WHERE department_name=?", [dep.department_name], function(err, resp){
        if(err) throw err;
        var totalSale = 0.00;
        for(var i = 0; i < resp.length; i++){
            totalSale += parseFloat(resp[i].product_sales);
        }
        var totalProfit = totalSale - parseFloat(dep.over_head_costs);
        var output = " ";
        output += dep.department_id;
        output = addSpaces(16, output);
        output += " " + dep.department_name;
        output = addSpaces(42, output);
        output += " " + dep.over_head_costs;
        output = addSpaces(59, output);
        output += " " + totalSale;
        output = addSpaces(75, output);
        output += " " + totalProfit;
        console.log(output);
    })
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

function createDepartment(){
    inquirer.prompt([
        {
            message: "What is the name of the new departments?",
            name: "name"
        },
        {
            message: "What is the overhead cost of the department?",
            name: "overhead"
        }
    ]).then(function(iResp){
        connection.query("INSERT INTO departments(department_name, over_head_costs) VALUES (?,?)", [iResp.name, iResp.overhead], function(err, resp){
            if (err) throw resp;
            inquireUser();
        })
    })
}