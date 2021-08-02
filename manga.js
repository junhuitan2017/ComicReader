// Functions for changing pages
const pageUtils = (function () {
    let currPage = 2;       // The middle page of current set of page eg. [2, [3], 4] or [1, 2, [3], 4, 5]
    let latestPage = 100;   // The latest page from xkcd

    // Updating latest page number
    fetch("https://xkcd.vercel.app/?comic=latest").then((res) => {
        res.json().then((result) => {
            latestPage = result.num;
        });
    });

    return {
        getPage: () => currPage,
        getLatest: () => latestPage,
        changePage: (numPageChange) => {
            // To flip the set of pages
            currPage += numPageChange;
            if (currPage < 1) {
                // If page number goes below 1, loop back to latest page number
                currPage += latestPage;
            } else if (currPage > latestPage) {
                // If page number exceeds latest page num, loop back to 1
                currPage -= latestPage;
            }
        },
        setPage: (page) => {
            // To set page number when navigating to specific page
            currPage = page;
        }
    }
})();

// Functions for changing display
const mainFunctions = (function () {
    let numDisplay = 3; // The number of pages to display at once

    return {
        // Set the number of comic display
        setDisplay: (num) => {
            numDisplay = num;

            const midPage = pageUtils.getPage();
            const lastPage = pageUtils.getLatest();

            const mainDisplayElement = document.querySelector("#main-display"); // Div element that contains the comics
            updateMainDisplayClass(num);
            // Create the individual divs for the comic content first
            mainDisplayElement.innerHTML = Array(num).fill(0).map((val, idx) => `<div id="manga${idx + 1}"></div>`).join("");
            // Determine the page number for each comic
            for (let idx = 1; idx <= num; idx++) {
                /* Eg. midPage = 1000, numDisplay = 3
                 * leftPage = 1000 + 1 - Math.ceil(3/2) = 999
                 * midPage = 1000 + 2 - Math.ceil(3/2) = 1000
                 * rightPage = 1000 + 3 - Math.ceil(3/2) = 1001
                 */
                let pageNo = midPage + idx - (Math.ceil(num / 2));
                if (pageNo < 1) {
                    pageNo = lastPage + pageNo;
                } else if (pageNo > lastPage) {
                    pageNo = pageNo - lastPage;
                }
                displayManga(`manga${idx}`, pageNo);
            };
        },
        // When previous button is clicked
        prevClick: () => {
            pageUtils.changePage(-numDisplay);
            mainFunctions.setDisplay(numDisplay);
        },
        // When nex button is clicked
        nextClick: () => {
            pageUtils.changePage(numDisplay);
            mainFunctions.setDisplay(numDisplay);
        },
        // When random button is clicked
        randomClick: () => {
            pageUtils.setPage(Math.floor(Math.random() * pageUtils.getLatest()));
            mainFunctions.setDisplay(numDisplay);
        },
        // To determine if a particular number of display is being selected
        isSelected: (selected) => {
            return selected === numDisplay;
        },
        // When a preference is submitted (Specific page or number of display)
        goClick: (event) => {
            event.preventDefault();
            const pageInput = document.querySelector("#select-page"); // The input field element
            let pageValue = pageInput.value;                          // The page number that the user inputted
            // Only navigate when user input something
            if (pageValue != "") {
                navigateToPage(parseInt(pageValue), numDisplay);
                pageInput.value = ""; // Reset the field after submitting
            }

            const selectedDisplay = parseInt(document.querySelector("#display-dropdown").value); // The selected option of the dropdown
            // Only update when the number of display is changed
            if (selectedDisplay != numDisplay) {
                changeNumDisplay(selectedDisplay);
                // Update the dropdown option
                document.querySelector("#display-dropdown").innerHTML = `
                <option value="1" ${mainFunctions.isSelected(1) ? "selected" : ""}>1</option>
                <option value="3" ${mainFunctions.isSelected(3) ? "selected" : ""}>3</option>
                <option value="5" ${mainFunctions.isSelected(5) ? "selected" : ""}>5</option>
                `
            }
        }
    };
})();

function updateMainDisplayClass(numDisplay) {
    const mainDisplayElement = document.querySelector("#main-display");
    // Remove all display class first
    mainDisplayElement.classList.remove("display1", "display3", "display5");
    // Add the correct class
    mainDisplayElement.classList.add(`display${numDisplay}`);
}

// Navigate to specific page and update the UI
function navigateToPage(selectedPage, numDisplay) {
    if (selectedPage < 1 || selectedPage > pageUtils.getLatest()) {
        // When user input page that is out of range, show error message
        alert(`Please select a number between 1 and ${pageUtils.getLatest()}`);
    } else {
        // Update the UI
        pageUtils.setPage(selectedPage);
        mainFunctions.setDisplay(numDisplay);
    }
}

// Change the number of comics displayed and update the UI
function changeNumDisplay(selectedDisplay) {
    // Eg. When the current page displayed is [1, 2, 3], then user change to displaying 5
    // The page will display [1, 2, 3, 4, 5] instead of [latest page, 1, 2, 3, 4]
    if (pageUtils.getPage() < selectedDisplay / 2) {
        pageUtils.setPage(Math.ceil(selectedDisplay / 2));
    }
    // Update the UI
    mainFunctions.setDisplay(selectedDisplay);
}

// Make comic pop up when clicked
function imgClick(img) {
    window.event.stopPropagation();
    document.querySelector(`#grey-screen`).classList.toggle("hide");
    document.querySelector(`#zoom-img`).src = img;
}

// Zoom comic when img is clicked
function toggleImgZoom(e) {
    e.stopPropagation(); // Prevent parent onclick function from running
    const elem = document.querySelector("#zoom-img");
    elem.classList.toggle("img-popup");
    elem.classList.toggle("img-popup-zoom");
}

/*
Example Result
{
"month": "1",
"num": 1,
"link": "",
"year": "2006",
"news": "",
"safe_title": "Barrel - Part 1",
"transcript": "[[A boy sits in a barrel which is floating in an ocean.]]\nBoy: I wonder where I'll float next?\n[[The barrel drifts into the distance. Nothing else can be seen.]]\n{{Alt: Don't we all.}}",
"alt": "Don't we all.",
"img": "https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg",
"title": "Barrel - Part 1",
"day": "1"
}
*/
// Call API and change comic img accordingly
function displayManga(id, page) {
    fetch(`https://xkcd.vercel.app/?comic=${page}`).then((res) => {
        res.json().then((result) => {
            // Update the values of the specific div holding the comic
            const comicDivParts = document.querySelector(`#${id}`).children; // Div that holds the comic content
            comicDivParts[0].innerHTML = result.safe_title;
            comicDivParts[1].id = `manga-${result.num}`;
            comicDivParts[1].src = result.img;
            comicDivParts[1].addEventListener('click', () => { imgClick(result.img) });
            comicDivParts[2].innerHTML = result.num;
        })
    });

    // Display loading gif first while fetching the API
    document.querySelector(`#${id}`).innerHTML = `
        <h1>Loading...</h1>
        <img src="https://cdn.dribbble.com/users/712682/screenshots/11956378/media/50c8e606db69f492200555d72b34f308.gif"/>
        <h3>-</h3>
    `
}

// Run when document is loaded
window.onload = () => {
    mainFunctions.setDisplay(3); // Initialise page with 3 comic display
    document.querySelector("#sel-container").addEventListener("submit", mainFunctions.goClick);
}