var express = require("express");
var router = express.Router();

const routeHelper = require("./routeHelpers.js");

const Team = require("../models/team");

router.get("/", async function (req, res) {
  let teamList = await Team.find().sort("name").exec();
  //pass an object with one property
  res.render("teamList.ejs", { teamList: teamList });
});

router.get("/id/:id", async function (req, res) {
  let team = await Team.findById(req.params.id).exec();
  //Team doesn't know about heroes that are members
  //but provides a property to find them
  let members = await team.members;

  //pass the team and members list to the view
  res.render("teamSingle.ejs", { team: team, members: members });
});

router.get("/create", function (req, res) {
  //Make a new Team object just to get any default values
  // and to have the right properties for the form
  let team = new Team({});
  res.render("teamForm.ejs", { title: "Create Team", team: team });
});

//Handles the initial request (get) to load an update page
router.get("/update/:id", async function (req, res, next) {
  try {
    let team = await Team.findById(req.params.id).exec();
    console.log(team);
    res.render("teamForm.ejs", { title: "Update Team", team: team });
  } catch (err) {
    var err = new Error("Team not found");
    err.status = 404;
    return next(err);
  }
});

//Handles the actual submission (post) of the update
router.post("/update/:id", async function (req, res, next) {
  //If team exists in DB, fetch it
  let team = await Team.findById(req.params.id).exec();
  //If not, make one
  if (team === null)
    team = new Team({
      _id: req.body.id,
    });

  console.log(req.body);

  //Replace existing data
  team.squadName = req.body.squadName;
  team.homeTown = req.body.homeTown;
  team.formed = req.body.formed;
  //team.active is boolean, req.body.active is string
  //Need to turn "true"/undefined value into true/false
  team.active = req.body.active === "true" ? true : false;

  console.log(team);

  //Try to save it
  team
    .save()
    .then((team) => {
      //Success, redirect to details view of team
      res.redirect(team.url);
    })
    .catch((err) => {
      console.log(err.message);
      //Problem, show the form with error messages
      res.render("teamForm.ejs", {
        title: "Update Team",
        team: team,
        errors: routeHelper.errorParser(err.message),
      });
    });
});

module.exports = router;
