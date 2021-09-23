const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1 Get players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team ORDER BY player_id;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// API 3 Get player based on player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const singlePlayer = `
    SELECT 
    * 
    FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};`;
  const player = await db.get(singlePlayer);
  response.send(convertDbObjectToResponseObject(player));
});

// API 2 POST PLayer

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  try {
    const addPlayerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES 
        ('${playerName}', ${jerseyNumber}, '${role}');`;
    const player = await db.run(addPlayerQuery);
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`error: ${e.message}`);
    process.exit(1);
  }
});

// API 4 Update player Details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team 
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE 
        player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 5 Delete player Details

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
