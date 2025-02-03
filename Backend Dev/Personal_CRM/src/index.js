import dotenv from "dotenv";
import {app} from "./app.js";
dotenv.config();
// dotenv.config({
//     path: "./config.env"
// });

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port: ${process.env.PORT}`);
});