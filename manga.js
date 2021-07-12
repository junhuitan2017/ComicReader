// Functions for changing pages
const pageUtils = (function () {
    let currPage = 2;
    let latestPage = 100;
    fetch("https://xkcd.vercel.app/?comic=latest").then((res) => {
        res.json().then((result) => {
            latestPage = result.num;
        });
    });
    return {
        getPage: () => currPage,
        getLatest: () => latestPage,
        changePage: (numPageChange) => {
            currPage += numPageChange;
            if (currPage < 1) {
                currPage += latestPage;
            } else if (currPage > latestPage) {
                currPage -= latestPage;
            }
        },
        setPage: (page) => {
            currPage = page;
        }
    }
})();

// Functions for changing display
const mainFunctions = (function () {
    let numDisplay = 3;

    return {
        // Set the number of comic display
        setDisplay: (num) => {
            numDisplay = num;

            const midPage = pageUtils.getPage();
            const lastPage = pageUtils.getLatest();

            const mainDisplayElement = document.getElementById("main-display");
            mainDisplayElement.style.gridTemplateColumns = `${90 / num}% `.repeat(num);
            mainDisplayElement.innerHTML = Array(num).fill(0).map((val, idx) => `<div id="manga${idx + 1}"></div>`).join("");
            Array(num).fill(0).forEach((val, i) => {
                const idx = i + 1;
                let pageNo = midPage + idx - (Math.ceil(num / 2));
                if (pageNo < 1) {
                    pageNo = lastPage + pageNo;
                } else if (pageNo > lastPage) {
                    pageNo = pageNo - lastPage;
                }
                displayManga(`manga${idx}`, pageNo);
            });
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
        isSelected: (selected) => {
            return selected === numDisplay;
        },
        // When a preference is submitted (Specific page or number of display)
        goClick: () => {
            let selectedPage = document.getElementById("select-page").value;
            if (selectedPage != "") {
                selectedPage = parseInt(selectedPage);
                if (selectedPage < 1 || selectedPage > pageUtils.getLatest()) {
                    alert(`Please select a number between 1 and ${pageUtils.getLatest()}`);
                } else {
                    pageUtils.setPage(selectedPage);
                    mainFunctions.setDisplay(numDisplay);
                }
            }

            const selectedDisplay = parseInt(document.getElementById("display-dropdown").value);
            if (selectedDisplay != numDisplay) {
                if (pageUtils.getPage() < selectedDisplay / 2) {
                    pageUtils.setPage(Math.ceil(selectedDisplay / 2));
                }
                mainFunctions.setDisplay(selectedDisplay);
                document.getElementById("display-dropdown").innerHTML = `
                <option value="1" ${mainFunctions.isSelected(1) ? "selected" : ""}>1</option>
                <option value="3" ${mainFunctions.isSelected(3) ? "selected" : ""}>3</option>
                <option value="5" ${mainFunctions.isSelected(5) ? "selected" : ""}>5</option>
                `
            }
        }
    };
})();

// Zoom on comic when clicked
function imgClick(img) {
    document.getElementById(`grey-screen`).classList.toggle("hide");
    document.getElementById(`zoom-img`).src = img;
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
            const comicDivParts = document.querySelector(`#${id}`).children;
            comicDivParts[0].innerHTML = result.safe_title;
            comicDivParts[1].id = `manga-${result.num}`;
            comicDivParts[1].src = result.img;
            comicDivParts[1].addEventListener('click', () => {imgClick(result.img)});
            comicDivParts[2].innerHTML = result.num;
        })
    })
    document.getElementById(id).innerHTML = `
        <h1>Loading...</h1>
        <img src="https://cdn.dribbble.com/users/712682/screenshots/11956378/media/50c8e606db69f492200555d72b34f308.gif"/>
        <h3>-</h3>
    `
}

// Initialise page with 3 comic display when loaded
window.onload = () => {
    mainFunctions.setDisplay(3);
}