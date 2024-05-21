import https from "https";
import express from 'express';
import cors from 'cors';
import config from "./config.mjs";
import powtServer from "powt";
import protocol from "./www/protocol.mjs";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(config.path,express.static("./www"));
app.use("/lib",express.static("./node_modules/powt/lib"));

const webServer = https.createServer({cert: config.cert, key: config.key},app);
webServer.listen(config.PORT);

powtServer.onDgramReceived = onReceived;
powtServer.onNewSession = onNewSession;
powtServer.onCloseSession = onCloseSession;
powtServer.start(config);

async function onReceived(uint8Arr,id){
  let data = protocol.parse(uint8Arr);
  console.log("onRecieved() type="+data.type+" from="+id);
  switch(data.type){
    case "cheen":
    case "jreen":
    case "text":
      if(data.toId == "00000000"){
        await powtServer.broadcastDgram(uint8Arr,id);
      }else{
        await powtServer.sendDgram(data.toId,uint8Arr);
      }
      break;
    default:break;
  }
}

function onNewSession(id){
  let uint8Arr = protocol.encode("myId",id);
  powtServer.sendDgram(id,uint8Arr);
  setTimeout(()=>{
    let ids = powtServer.getSessionIds();
    let arr = protocol.encode("idList",ids);
    powtServer.broadcastDgram(arr);
  },100);
}

function onCloseSession(id){
  let ids = powtServer.getSessionIds();
  let uint8Arr = protocol.encode("idList",ids);
  powtServer.broadcastDgram(uint8Arr);
}