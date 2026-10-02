document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================= */

    const masterBoard =
        document.getElementById("masterBoard");

    const turnPlayer =
        document.getElementById("turnPlayer");

    const availability =
        document.getElementById("availability");

    const instruction =
        document.getElementById("instruction");

    const ruleChip =
        document.getElementById("ruleChip");

    const statusTitle =
        document.getElementById("statusTitle");

    const statusText =
        document.getElementById("statusText");

    const messageIcon =
        document.getElementById("messageIcon");

    const xScoreElement =
        document.getElementById("xScore");

    const oScoreElement =
        document.getElementById("oScore");

    const newGameButton =
        document.getElementById("newGame");

    const restartButton =
        document.getElementById("restartButton");

    const winnerOverlay =
        document.getElementById("winnerOverlay");

    const winnerTitle =
        document.getElementById("winnerTitle");

    const winnerText =
        document.getElementById("winnerText");

    const finalXScore =
        document.getElementById("finalXScore");

    const finalOScore =
        document.getElementById("finalOScore");

    const matchStatus =
        document.getElementById("matchStatus");


    /* =========================
       WINNING LINES
    ========================= */

    const WIN_LINES = [

        [0, 1, 2],

        [3, 4, 5],

        [6, 7, 8],

        [0, 3, 6],

        [1, 4, 7],

        [2, 5, 8],

        [0, 4, 8],

        [2, 4, 6]

    ];


    /* =========================
       GAME VARIABLES
    ========================= */

    let boards;

    let boardOwners;

    let currentPlayer;

    let activeBoards;

    let gameActive;

    let xScore = 0;

    let oScore = 0;


    /* =========================
       EMPTY MINI BOARD
    ========================= */

    function emptyMiniBoard() {

        return [
            "",
            "",
            "",

            "",
            "",
            "",

            "",
            "",
            ""
        ];
    }


    /* =========================
       RESET GAME DATA
    ========================= */

    function resetState() {

        boards =
            Array.from(
                {
                    length: 9
                },
                emptyMiniBoard
            );


        boardOwners = [

            "",
            "",
            "",

            "",
            "",
            "",

            "",
            "",
            ""

        ];


        currentPlayer = "X";

        activeBoards = [];

        gameActive = true;
    }


    /* =========================
       CREATE 9 MINI BOARDS
    ========================= */

    function buildBoards() {

        masterBoard.innerHTML = "";


        for (
            let boardIndex = 0;
            boardIndex < 9;
            boardIndex++
        ) {

            const miniBoard =
                document.createElement("div");


            miniBoard.className =
                "mini-board";


            miniBoard.dataset.board =
                boardIndex;


            miniBoard.style.setProperty(
                "--active-glow",
                "rgba(53,185,255,.32)"
            );


            for (
                let cellIndex = 0;
                cellIndex < 9;
                cellIndex++
            ) {

                const cell =
                    document.createElement("button");


                cell.type = "button";


                cell.className =
                    "cell";


                cell.dataset.board =
                    boardIndex;


                cell.dataset.cell =
                    cellIndex;


                cell.setAttribute(
                    "aria-label",
                    `Board ${boardIndex + 1}, cell ${cellIndex + 1}`
                );


                miniBoard.appendChild(cell);

            }


            masterBoard.appendChild(
                miniBoard
            );
        }
    }


    /* =========================
       CHECK WINNER
    ========================= */

    function getWinner(values) {

        for (
            const line of WIN_LINES
        ) {

            const value =
                values[line[0]];


            if (

                value !== "" &&

                value !== "D" &&

                values[line[1]] === value &&

                values[line[2]] === value

            ) {

                return value;
            }
        }


        return null;
    }


    /* =========================
       CHECK FULL BOARD
    ========================= */

    function isFull(values) {

        return values.every(
            value => value !== ""
        );
    }


    /* =========================
       GET PLAYABLE BOARDS
    ========================= */

    function getPlayableBoards() {

        const playable = [];


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            if (
                boardOwners[i] === ""
            ) {

                if (
                    boards[i].some(
                        cell => cell === ""
                    )
                ) {

                    playable.push(i);
                }
            }
        }


        return playable;
    }


    /* =========================
       SELECT AVAILABLE BOARDS
    ========================= */

    function chooseActiveBoards() {

        const playable =
            getPlayableBoards();


        if (
            playable.length === 0
        ) {

            activeBoards = [];

            return;
        }


        /*
            38% chance:
            ALL playable boards open.
        */

        const openAll =
            Math.random() < 0.38;


        /*
            If only 1 or 2 boards
            remain, open all of them.
        */

        if (
            openAll ||
            playable.length <= 2
        ) {

            activeBoards =
                [...playable];

            return;
        }


        /*
            Otherwise randomly
            open 2–4 boards.
        */

        const maximum =
            Math.min(
                4,
                playable.length
            );


        const minimum =
            Math.min(
                2,
                maximum
            );


        const count =
            randomInteger(
                minimum,
                maximum
            );


        activeBoards =
            shuffle(playable)
                .slice(0, count);
    }


    /* =========================
       RANDOM INTEGER
    ========================= */

    function randomInteger(
        min,
        max
    ) {

        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }


    /* =========================
       SHUFFLE
    ========================= */

    function shuffle(array) {

        const copy =
            [...array];


        for (
            let i = copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                copy[i],
                copy[j]
            ] =
            [
                copy[j],
                copy[i]
            ];
        }


        return copy;
    }


    /* =========================
       RENDER ALL BOARDS
    ========================= */

    function renderBoards() {

        const miniBoards =
            masterBoard.querySelectorAll(
                ".mini-board"
            );


        miniBoards.forEach(
            (
                miniBoard,
                boardIndex
            ) => {

                const cells =
                    miniBoard.querySelectorAll(
                        ".cell"
                    );


                miniBoard.classList.remove(

                    "open",

                    "locked",

                    "owned-x",

                    "owned-o",

                    "drawn",

                    "master-winner"

                );


                /*
                    Board already won by X
                */

                if (
                    boardOwners[boardIndex] === "X"
                ) {

                    miniBoard.classList.add(
                        "owned-x"
                    );

                }


                /*
                    Board already won by O
                */

                else if (
                    boardOwners[boardIndex] === "O"
                ) {

                    miniBoard.classList.add(
                        "owned-o"
                    );

                }


                /*
                    Board ended in draw
                */

                else if (
                    boardOwners[boardIndex] === "D"
                ) {

                    miniBoard.classList.add(
                        "drawn"
                    );

                }


                /*
                    Board is available
                */

                else if (
                    activeBoards.includes(
                        boardIndex
                    )
                ) {

                    miniBoard.classList.add(
                        "open"
                    );


                    miniBoard.style.setProperty(

                        "--active-glow",

                        currentPlayer === "X"

                            ? "rgba(53,185,255,.34)"

                            : "rgba(255,95,162,.34)"

                    );

                }


                /*
                    Board is locked
                */

                else {

                    miniBoard.classList.add(
                        "locked"
                    );
                }


                /*
                    Render all 9 cells
                */

                cells.forEach(
                    (
                        cell,
                        cellIndex
                    ) => {

                        const value =
                            boards[
                                boardIndex
                            ][
                                cellIndex
                            ];


                        cell.textContent =
                            value;


                        cell.classList.toggle(
                            "taken",
                            value !== ""
                        );


                        cell.classList.toggle(
                            "x",
                            value === "X"
                        );


                        cell.classList.toggle(
                            "o",
                            value === "O"
                        );


                        const boardFinished =
                            boardOwners[
                                boardIndex
                            ] !== "";


                        const unavailable =

                            !activeBoards.includes(
                                boardIndex
                            )

                            ||

                            boardFinished

                            ||

                            value !== "";


                        cell.disabled =
                            unavailable;

                    }
                );

            }
        );
    }


    /* =========================
       TURN UI
    ========================= */

    function updateTurnUI() {

        turnPlayer.textContent =
            currentPlayer;


        if (
            currentPlayer === "X"
        ) {

            turnPlayer.style.color =
                "var(--x)";


            turnPlayer.style.textShadow =
                "0 0 24px rgba(53,185,255,.45)";

        }

        else {

            turnPlayer.style.color =
                "var(--o)";


            turnPlayer.style.textShadow =
                "0 0 24px rgba(255,95,162,.45)";
        }


        const playableCount =
            getPlayableBoards().length;


        const activeCount =
            activeBoards.length;


        /*
            ALL boards available
        */

        if (
            activeCount === playableCount
        ) {

            availability.textContent =
                "ALL BOARDS OPEN";


            instruction.textContent =
                "Choose any glowing board";


            ruleChip.textContent =
                "ALL ACCESS";
        }


        /*
            Only some boards available
        */

        else {

            availability.textContent =
                `${activeCount} BOARD${
                    activeCount === 1
                        ? ""
                        : "S"
                } OPEN`;


            instruction.textContent =
                `Choose 1 of ${activeCount} glowing boards`;


            ruleChip.textContent =
                "LIMITED ACCESS";
        }


        statusTitle.textContent =
            `${currentPlayer}'s turn`;


        statusText.textContent =

            activeCount === playableCount

                ? "Every unfinished board is available."

                : "Only the glowing boards are available.";


        messageIcon.textContent =

            currentPlayer === "X"
                ? "✦"
                : "◆";


        messageIcon.style.color =

            currentPlayer === "X"

                ? "var(--x)"

                : "var(--o)";


        messageIcon.style.background =

            currentPlayer === "X"

                ? "rgba(53,185,255,.09)"

                : "rgba(255,95,162,.09)";
    }


    /* =========================
       COMPLETE SMALL BOARD
    ========================= */

    function markSmallBoardFinished(
        boardIndex,
        winner
    ) {

        boardOwners[
            boardIndex
        ] = winner;


        const miniBoard =
            masterBoard.querySelector(

                `.mini-board[data-board="${boardIndex}"]`

            );


        if (!miniBoard) {
            return;
        }


        miniBoard.classList.remove(
            "open",
            "locked"
        );


        if (
            winner === "X"
        ) {

            miniBoard.classList.add(
                "owned-x"
            );
        }


        else if (
            winner === "O"
        ) {

            miniBoard.classList.add(
                "owned-o"
            );
        }


        else {

            miniBoard.classList.add(
                "drawn"
            );
        }


        const cells =
            miniBoard.querySelectorAll(
                ".cell"
            );


        cells.forEach(
            cell => {

                cell.disabled = true;

            }
        );
    }


    /* =========================
       HIGHLIGHT MASTER WIN
    ========================= */

    function highlightMasterWinner(
        winner
    ) {

        const winningLine =
            WIN_LINES.find(
                line =>

                    line.every(
                        index =>
                            boardOwners[
                                index
                            ] === winner
                    )
            );


        if (!winningLine) {
            return;
        }


        winningLine.forEach(
            index => {

                const board =
                    masterBoard.querySelector(

                        `.mini-board[data-board="${index}"]`

                    );


                if (board) {

                    board.classList.add(
                        "master-winner"
                    );
                }

            }
        );
    }


    /* =========================
       X / O WINS MATCH
    ========================= */

    function finishMatch(
        winner
    ) {

        gameActive = false;


        /*
            Highlight the 3
            winning mini boards.
        */

        highlightMasterWinner(
            winner
        );


        /*
            Update score.
        */

        if (
            winner === "X"
        ) {

            xScore++;

        }

        else {

            oScore++;
        }


        xScoreElement.textContent =
            xScore;


        oScoreElement.textContent =
            oScore;


        finalXScore.textContent =
            xScore;


        finalOScore.textContent =
            oScore;


        /*
            Winner popup.
        */

        winnerTitle.textContent =
            `${winner} WINS!`;


        winnerTitle.style.color =

            winner === "X"

                ? "var(--x)"

                : "var(--o)";


        winnerTitle.style.textShadow =

            winner === "X"

                ? "0 0 30px rgba(53,185,255,.45)"

                : "0 0 30px rgba(255,95,162,.45)";


        winnerText.textContent =
            `${winner} conquered three boards in a row.`;


        matchStatus.textContent =
            `${winner} WON THE MATCH`;


        matchStatus.style.color =

            winner === "X"

                ? "var(--x)"

                : "var(--o)";


        winnerOverlay.classList.add(
            "show"
        );


        winnerOverlay.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    /* =========================
       DRAW
    ========================= */

    function finishDraw() {

        gameActive = false;

        activeBoards = [];


        renderBoards();


        finalXScore.textContent =
            xScore;


        finalOScore.textContent =
            oScore;


        winnerTitle.textContent =
            "DRAW!";


        winnerTitle.style.color =
            "var(--gold)";


        winnerTitle.style.textShadow =
            "0 0 30px rgba(255,209,102,.35)";


        winnerText.textContent =
            "All nine boards were completed without a three-board line.";


        matchStatus.textContent =
            "DRAW MATCH";


        matchStatus.style.color =
            "var(--gold)";


        winnerOverlay.classList.add(
            "show"
        );


        winnerOverlay.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    /* =========================
       NEXT TURN
    ========================= */

    function nextTurn() {

        currentPlayer =

            currentPlayer === "X"

                ? "O"

                : "X";


        chooseActiveBoards();


        renderBoards();


        updateTurnUI();
    }


    /* =========================
       START NEW MATCH
    ========================= */

    function startNewMatch() {

        resetState();


        chooseActiveBoards();


        renderBoards();


        updateTurnUI();


        matchStatus.textContent =
            "MATCH IN PROGRESS";


        matchStatus.style.color =
            "";


        winnerOverlay.classList.remove(
            "show"
        );


        winnerOverlay.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    /* =========================
       CELL CLICK
    ========================= */

    masterBoard.addEventListener(
        "click",
        event => {

            /*
                Ignore clicks after
                game has ended.
            */

            if (!gameActive) {
                return;
            }


            /*
                Find the clicked cell.
            */

            const cell =
                event.target.closest(
                    ".cell"
                );


            if (!cell) {
                return;
            }


            /*
                Read board/cell numbers.
            */

            const boardIndex =
                Number(
                    cell.dataset.board
                );


            const cellIndex =
                Number(
                    cell.dataset.cell
                );


            /*
                Safety check.
            */

            if (

                !Number.isInteger(
                    boardIndex
                )

                ||

                !Number.isInteger(
                    cellIndex
                )

                ||

                boardIndex < 0

                ||

                boardIndex > 8

                ||

                cellIndex < 0

                ||

                cellIndex > 8

            ) {

                return;
            }


            /*
                Player may only
                use an active board.
            */

            if (
                !activeBoards.includes(
                    boardIndex
                )
            ) {

                return;
            }


            /*
                Finished board?
            */

            if (
                boardOwners[
                    boardIndex
                ] !== ""
            ) {

                return;
            }


            /*
                Already occupied?
            */

            if (
                boards[
                    boardIndex
                ][
                    cellIndex
                ] !== ""
            ) {

                return;
            }


            /*
                ======================
                MAKE MOVE
                ======================
            */

            boards[
                boardIndex
            ][
                cellIndex
            ] = currentPlayer;


            cell.textContent =
                currentPlayer;


            cell.classList.add(
                "taken"
            );


            if (
                currentPlayer === "X"
            ) {

                cell.classList.add(
                    "x"
                );

            }

            else {

                cell.classList.add(
                    "o"
                );
            }


            cell.disabled = true;


            /*
                ======================
                CHECK SMALL BOARD WIN
                ======================
            */

            const smallWinner =
                getWinner(
                    boards[
                        boardIndex
                    ]
                );


            if (
                smallWinner
            ) {

                markSmallBoardFinished(
                    boardIndex,
                    smallWinner
                );


                /*
                    ==================
                    CHECK BIG WIN
                    ==================
                */

                const masterWinner =
                    getWinner(
                        boardOwners
                    );


                if (
                    masterWinner
                ) {

                    finishMatch(
                        masterWinner
                    );

                    return;
                }
            }


            /*
                ======================
                CHECK SMALL BOARD DRAW
                ======================
            */

            else if (
                isFull(
                    boards[
                        boardIndex
                    ]
                )
            ) {

                markSmallBoardFinished(
                    boardIndex,
                    "D"
                );
            }


            /*
                ======================
                ARE ANY BOARDS LEFT?
                ======================
            */

            const playableBoards =
                getPlayableBoards();


            if (
                playableBoards.length === 0
            ) {

                finishDraw();

                return;
            }


            /*
                ======================
                NEXT PLAYER
                ======================
            */

            nextTurn();

        }
    );


    /* =========================
       BUTTONS
    ========================= */

    newGameButton.addEventListener(
        "click",
        startNewMatch
    );


    restartButton.addEventListener(
        "click",
        startNewMatch
    );


    /* =========================
       START GAME
    ========================= */

    buildBoards();

    startNewMatch();

});