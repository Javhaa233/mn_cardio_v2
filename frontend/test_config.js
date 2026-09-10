const ConfigHelper = require("d:/Repo/ITS/mn-cardio-backend/helper/ConfigHelper.js");
async function run() {
  const cfg = ConfigHelper.getModelConfig("DoctorsTeam");
  if (cfg) {
    console.log(
      JSON.stringify(
        cfg.Fields[0].map((f) => f.Name),
        null,
        2,
      ),
    );
  } else {
    console.log("Not found");
  }
}
run();
