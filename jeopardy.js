// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

//let res_cats = axios.get('https://rithm-jeopardy.herokuapp.com/api/categories?count=[integer]')
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  //call endpoint to fetch cats
  let response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/categories?count=1000"
  );
  //get six random entries
  let random_6 = _.sampleSize(response.data, 6);
  // response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
  //console.log(random_6)

  //return ids
  return random_6.map((a) => a.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  //call endpoint for catid
  let response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/category",
    {
      params: { id: catId },
    }
  );
  //access the data from the endpoint
  let cat = response.data;
  //randomize the 5 questions in a category
  let randomClues = _.sampleSize(cat.clues, 5).map((a) => ({
    question: a.question,
    answer: a.answer,
  }));
  //return an object from the category with keys - {titles, clues}
  console.log({ title: cat.title, clues: randomClues });
  return { title: cat.title, clues: randomClues };

  //
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  hideLoadingView();
  //fill table head with rows of the different categories
  let tr = document.createElement("tr");
  for (let cat of categories) {
    let th = document.createElement("th");
    th.textContent = cat.title;
    tr.append(th);
  }
  $("#table-jeo thead").append(tr);

  for (let clueIdx = 0; clueIdx < 5; clueIdx++) {
    let trClues = document.createElement("tr");
    for (let catIdx = 0; catIdx < 6; catIdx++) {
      let td = document.createElement("td");
      td.textContent = "?";
      td.setAttribute("id", `${catIdx}-${clueIdx}`);
      trClues.append(td);
    }
    $("#table-jeo tbody").append(trClues);
  }
  //fill table body with rows of the number of questions per category with the questions in its corresponding cell

  //have the question/answer appear at first with a '?'
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let target = $(evt.target);
  let id = target.attr("id");
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
    target.addClass("disabled");
  } else {
    return;
  }

  target.html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
let loadIcon = document.getElementById('loadContainer')

function showLoadingView() {
  $("#table-jeo thead").empty();
  $("#table-jeo tbody").empty();

  $("#startBtn").addClass("disabled").text("loading...");
  loadIcon.style.display = 'inline-block'
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#startBtn").removeClass("disabled").text("Restart!");
  loadIcon.style.display ='none'
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let loading = $("#startBtn").text() === "loading...";

  if (!loading) {
    showLoadingView();

    let catIds = await getCategoryIds();

    categories = [];

    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }

    fillTable();
  }
}

/** On click of start / restart button, set up game. */

// TODO
$("#startBtn").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */

// TODO
$(async function () {
  $("#table-jeo").on("click", "td", handleClick);
});
