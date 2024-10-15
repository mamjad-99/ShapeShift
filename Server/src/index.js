import app from "./app.js";
import dotenv from "dotenv";
import connectDataBase from "./database/db.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;

connectDataBase()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listining at port # ${port}`);
      app.on("error", (err) => {
        console.log(`Error on listining || ${err}`);
        throw err;
      });
    });
  })
  .catch((error) => {
    console.log(`Mongoo DB connection failure. Error : ${error}`);
  });
