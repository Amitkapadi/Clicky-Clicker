const initVM = {1:10, 5:100, 15: 1000, 50:10000}; //initial dig and cost for each miner
const upgds = {First:[5, 0, {0: 1, 1:2}], Second:[200, 0, {2:1}], Third:[300, 0, {3:1}]}; //upgrades with structure name:[cost, {target: ammount}]

let ps = { //player state
    score: 0, //how much money
    power: 1, //how much do I get on click of buttons
    numberOfMiners: Object.keys(initVM).length, //how many minersfields there are
    miners: [], //miners list
    gps: 0, //gain per second
    upgradez: [],
};

//initializing game
if(localStorage.getItem('playerstate')!=null) {  //checking if previous state exists
    ps=JSON.parse(localStorage.getItem('playerstate')); //parsing state into an object
    for(let i = 0; i < ps.numberOfMiners; i++){ //initializing Miners based on previous state
        ps.miners[i]=new Miner(...Object.values(ps.miners[i]));
        updateMiners(i);
        upScore(0);
        setGps(ps.gps);
    }
    for(let i = 0; i < ps.upgradez.length; i++){
        ps.upgradez[i]=new MinersUpgrade(...Object.values(ps.upgradez[i]))
    }
} else { //initialiting fresh miners
    for(let i = 0; i < ps.numberOfMiners; i++){
        ps.miners[i]=new Miner(0, Object.keys(initVM)[i], Object.values(initVM)[i]);
    }//loading upgrades into array
    for(let i = 0; i < Object.keys(upgds).length; i++){
        ps.upgradez.push(new MinersUpgrade(false ,Object.keys(upgds)[i], ...Object.values(upgds)[i]));
    }
}
updateClickPower(0);

console.log(ps.upgradez)

//creating upgrades buttons
for(let i=0; i<ps.upgradez.length; i++){
    if(!ps.upgradez[i].bought){
        $(".upgradesList").append(`
            <button class=upgrade id=upgrade${i}>
            ${ps.upgradez[i].cost}
            </button>
        `);
    }
}

//creating miners buttons
for(let i=0; i<ps.miners.length; i++){
    $(".mines").append(`
        <button class="miner" id="miner${i}">
        <p>#${i+1} : <span class="ammount">0</span></p>
        <p>Total income: <span class="income">0</span></p>
        <p>Buy new: <span class="cost">${ps.miners[i].cost}<span></p>
        </button>
    `);
}

//showing updated values on buttons
function updateMiners(id) {
    $("#miner"+id).find(".ammount").text(ps.miners[id].units); //updating units shown to player
    $("#miner"+id).find(".cost").text(ps.miners[id].cost); //updating cost shown to player
    $("#miner"+id).find(".income").text(ps.miners[id].getIncome); //updating income shown to player
}

//power update
function updateClickPower(ammount){
    ps.power=ps.power+ammount;
    $("#gpc").text(ps.power);
}

//setting gain per second on screen
function setGps(value){
    ps.gps = value;
    $("#gps").text(ps.gps);
}

//adding some amount to score
function upScore(ammount){
    ps.score += ammount;
    $("#score").text(ps.score);
}

//handling upgrades buying
$(".upgrade").click((event)=>{
    id = +($(event.currentTarget).attr("id").substring(7));
    if(ps.score >= ps.upgradez[id].cost){
        upScore(-ps.upgradez[id].cost);
        pairs=Object.entries(ps.upgradez[id].buyMe());
        for(pair of pairs){
            if(pair[0]==0){
                updateClickPower(pair[1]);
            }else{
                id=pair[0]-1;
                ps.miners[id].newDpu(pair[1]);
                updateMiners(id);
            }
        }

    }
});

//handling miners buying
$(".miner").click((event)=>{
    id = +($(event.currentTarget).attr("id").substring(5));
    if(ps.score >= ps.miners[id].cost){ //chceking if you have enough of money
        upScore(-ps.miners[id].cost);
        ps.miners[id].buyMe();
        updateMiners(id);
    }
});

//handling mining by hand
$("#increment").click(()=>{upScore(ps.power)});

//handling mining by miners
setInterval(() => {
        let income = 0;
        for(let i = 0; i < ps.numberOfMiners; i++){
            income += ps.miners[i].getIncome;
        }
        upScore(income);
        setGps(income);
    }, 1000);

//saving game
setInterval(() => {
        localStorage.setItem('playerstate', JSON.stringify(ps));
        console.log("saved");
    }, 30000);
