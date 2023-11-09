const base_API = "http://jservice.io/api/";
const MAX_NUM_CATEGORIES = 6;
const CLUES_PER_CAT = 5;


let $jeopardyCard = $("#card");
let isLoading = false;


let categories = []; 



/*
 * Get NUM_CATEGORIES random category from API.
 *                                                 ???
 * Returns array of category ids
*/




async function getData()
{
    let response = await axios.get(`${base_API}categories`, {params: {count: 100}})
    console.log(response);

    let catIds = response.data.map(categories => categories.id);
    return _.sampleSize(catIds, MAX_NUM_CATEGORIES);

    //return randomCatIds;
    
}

/*
 * Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare"},
 *      {question: "Bell Jar Author", answer: "Plath"},
 *      ...
 *   ]
*/


async function getCategory(categoryId) {
    let response = await axios.get(`${base_API}category`, {params: {id: categoryId}});
    console.log("InitResponse: " + response);
    let category = response.data;
    console.log("response: " + category);

   
    
    let sampledClues = _.sampleSize(category.clues, CLUES_PER_CAT + 1).map(clue =>({
        title: category.title,
        value: clue.value,
        question: clue.question,
        answer: clue.answer,
        showing: null
    }));

    console.log("sampledClues Object" + sampledClues);
    
    //console.log({title: category.title, clue: sampledClues});
    
    return {title: category.title, clue: sampledClues};



}

/*
 * Fill the HTML Card#jeopardy with the categories & cells for questions.
 *
 * - It should contain Card Container div and inside this it contain
 * - Card header div where Category title will be prsent
 * - The it should contain Card body div that contain Category Question,
 * - And in last ist should contain Footer div where it should contain answer which will appear on click.
 * 
*/

async function fillTable() {
    // Clear the existing content of the table
    $("#jeopardy-tablehead").empty();
    $("#jeopardy-tablebody").empty();

    // Add headers
    let $theadRow = $("<tr>");
    for (let category of categories) {
        $theadRow.append($("<th>").text(category.title));
    }
    $("#jeopardy-tablehead").append($theadRow);

    // Add rows and cells
    for (let i = 0; i < CLUES_PER_CAT; i++) {
        let $tr = $("<tr>");
        for (let j = 0; j < categories.length; j++) {
            const clue = categories[j].clue[i]; // Access the i-th clue for the current category
            // debugger
            $tr.append(
                $("<td>")
                .attr("id", `${j}-${i}`)
                // TODO: Fix this
                    .append($("<i>")).text(clue.value)
                    .addClass("question-classing")
            );
        }
        $("#jeopardy-tablebody").append($tr);
    }
}

$("#jeopardy-tablebody").on("click", "td", handleClick);


/*
 * Handle clicking on a clue: show the question or answer.
 *
 * Uses showed property on category Index to determine what to show:
 * - if currently null, show question & set showed to "true" and render card with current index
 * - if currently true, show answer & set index to index+1" 
*/


function handleClick(event) {
    let $target = $(event.target);
    let id = $target.attr("id");
    let [categoryId, clueId] = id.split("-");
    console.log(categories, categoryId, clueId)
    let clue = categories[categoryId].clue[clueId];

    let msg;
    console.log("a click has happened")

    if (clue.showing === null) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        msg = clue.answer; // Show the answer on the second click
        clue.showing = "answer";
        $target.off("click"); // Disable further clicks on this cell
        $target.addClass("disabled");
    } else {
        return; // Do nothing on subsequent clicks
    }

    // Update the cell's content
    $target.html(msg);
}

/*
 * Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
*/

function showLoadingView() {
    // Clear the table
    $("#jeopardy-tablehead").empty();
    $("#jeopardy-tablebody").empty();

    // Show the spinner
    $("#spin-container").show();

    // Disable the start button
    $("#start").addClass("disabled");
}
/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    // Hide the spinner
    $("#spin-container").hide();

    // Enable the start button
    $("#start").removeClass("disabled");
}


/*
 on start, get random catIds, getData for each cat, create the html table
*/

async function setupAndStart() { 
    console.log("the game has started");
    
    
    
    if (!isLoading) {
        showLoadingView();

        let categoryIds = await getData();
        categories = [];
        console.log(categories);
        for (let categoryId of categoryIds){
            categories.push(await getCategory(categoryId));
        }
        console.log(categories);

        fillTable(); 
        hideLoadingView();
    
    }
        
}

//start game events
const $startButton = $("#start");
$startButton.on("click", setupAndStart);

