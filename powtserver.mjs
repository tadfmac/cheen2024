//
// powtserver.mjs by D.F.Mac.@TripArts Music
//

import { Http3Server } from "@fails-components/webtransport";
import { nanoid } from 'nanoid';

class powtServer {
  constructor(){
    console.log("powtServer.constructor()");
    this.isKilled = false;
    this.sessions = {};
    this.onNewSession = null;
    this.onCloseSession = null;
    this.onBidiRecieved = null;
    this.onDgramRecieved = null;
  }
  start(config){
    console.log("powtServer.start()");
//    console.dir(config);
    this.port = config.PORT;
    this.host = config.HOST;
    this.cert = config.cert;
    this.key  = config.key;
    this.path = config.path;
    this.h3Server = new Http3Server({
      port: config.PORT,
      host: config.HOST,
      secret: "changeit",
      cert: config.cert,
      privKey: config.key
    });
    this.h3Server.startServer();
    (async ()=>{
      await this.startSessionReader(this.path);
    })();
  }
  getSessionIds(){
    return Object.keys(this.sessions);
  }
  async startSessionReader(path){
    console.log("powtServer.startSessionReader()");
    try{
      this.sessionStream = await this.h3Server.sessionStream(path);
      this.sessionReader = this.sessionStream.getReader();
      this.sessionReader.closed.catch((e) =>{
        console.log("session reader closed with error!", e);
      });
      while(!this.isKilled){
        console.log("sessionReader.read() - waiting for session...");
        const session = await this.sessionReader.read();
        console.log("read new session !");
        if (session.done) {
          console.log("done! break loop.");
          break;
        }

        session.value.closed.then(() => {
          console.log("Session closed! id="+session._userData.id);
          delete this.sessions[session._userData.id];
          if(this.onCloseSession){
            this.onCloseSession(session._userData.id);
          }
        }).catch((e) => {
          console.log("Session closed with error! " + e);
          delete this.sessions[session._userData.id];
          if(this.onCloseSession){
            this.onCloseSession(session._userData.id);
          }
        });

        session.value.ready.then(async () => {
          console.log("session ready!");

          if(session._userData == undefined){
            session._userData = {};
            let idcandidate;
            for(;;){
              idcandidate = nanoid(8);
              if(this.sessions[idcandidate] == undefined){
                break;
              }
            }
            session._userData.id = idcandidate;
            console.log("new session id="+session._userData.id);

/*

            const bidi = await session.value.createBidirectionalStream().catch((e)=>{
               console.log("failed to create bidirectional stream!", e);
            });

            session._userData.bidi = bidi;
            const writer = bidi.writable.getWriter();
            writer.closed.catch((e) => {
              console.log("writer closed with error!", e);
              session._userData.bidiWriter = null;
            });
            session._userData.bidiWriter = writer;

            const reader = bidi.readable.getReader();
            reader.closed.catch((e) => {
              console.log("reader closed with error!", e);
              session._userData.bidiReader = null;
            });
            session._userData.bidiReader = reader;
*/

            this.bidiReadableWaiting(session,session._userData.id).catch((e)=>{
              console.log("bidireader closed with error!", e);
            });

            const dgramWriter = session.value.datagrams.writable.getWriter();
            dgramWriter.closed.then(() =>{
              console.log("datagram writer closed successfully!");
              session._userData.dgramWriter = null;
            }).catch((e) => {
              console.log("datagram writer closed with error!", e);  
            });
            session._userData.dgramWriter = dgramWriter;

            const dgramReader = session.value.datagrams.readable.getReader();
            dgramReader.closed.then(() =>{
              console.log("datagram reader closed successfully!");
              session._userData.dgramReader = null;
            }).catch((e) => {
              console.log("datagram reader closed with error!", e);  
            });

            this.dgramReadableWaiting(dgramReader,session._userData.id).catch((e)=>{
              console.log("dgramReader closed with error!", e);
            });
            session._userData.dgramReader = dgramReader;

            this.sessions[session._userData.id] = session;
            if(this.onNewSession){
              this.onNewSession(session._userData.id);
            }
          }else{
            console.log("session exists id="+session._userData.id);
          }
        }).catch((e) => {
          console.log("session failed to be ready! : "+e);
        });
      }
    }catch(e){
      console.log("startSessionReader failed :"+e);
    };
  }
  async send(id,uint8Arr){
    console.log("powtServer.send() id="+id+" data="+uint8Arr);
    if(this.sessions[id]){
      let stream = await this.sessions[id].value.createBidirectionalStream().catch((e)=>{
        console.log("failed to create bidirectional stream!", e);
        return;
      });
      if(stream){
        const writer = stream.writable.getWriter();
        writer.closed.catch((e) => {
          console.log("writer closed with error!", e);
          return;
        });
        await writer.write(uint8Arr);
        await writer.close();
      }else{
        console.log("stream error");
      }
    }else{
      console.log("invalid id!");
    }
  }
  async sendDgram(id,uint8Arr){
    console.log("powtServer.sendDgram() id="+id+" data="+uint8Arr);
    if(this.sessions[id]){
      if(this.sessions[id]._userData.dgramWriter){
        this.sessions[id]._userData.dgramWriter.write(uint8Arr);
        console.log("powtServer.sendDgram() sent id="+id+" data="+uint8Arr);     
      }else{
        console.log("dgramWriter closed");
      }
    }else{
      console.log("invalid id!");
    }
  }
  async broadcast(uint8Arr,except){
    console.log("powtServer.broadcast() except="+except+" data="+uint8Arr);
    for(let id in this.sessions){
      if(id !== except){
        await this.send(id,uint8Arr);
      }
    }
  }
  async broadcastDgram(uint8Arr,except){
    console.log("powtServer.broadcastDgram() except="+except+" data="+uint8Arr);
    for(let id in this.sessions){
      if(id !== except){
        await this.sendDgram(id,uint8Arr);
      }
    }
  }
  async bidiReadableWaiting(session,id){
    const reader = session.value.incomingBidirectionalStreams.getReader();
    reader.closed.catch((e) => {
      console.log("reader closed with error!", e);
    });

    while(true){
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // read stream
      console.log("bidi read----");
      this.readStream(value.readable,id);
      /*
      if(this.onBidiRecieved != null){
        this.onBidiRecieved(value,id);
      }*/
    }
  }
  async readStream(stream,id){
    let reader = stream.getReader();
    let buffer = new Uint8Array();
    while(true){
      const { value, done } = await reader.read();
      if(done){
        if(this.onBidiRecieved != null){
          this.onBidiRecieved(buffer,id);
        }
        return;
      }
      buffer = this.joinUint8Arr(buffer,value);
    }
  }
  async dgramReadableWaiting(reader,id){
    while(true){
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      console.log("dgram read----");
      if(this.onDgramRecieved != null){
        this.onDgramRecieved(value,id);
      }
    }
  }
  joinUint8Arr(Arr1,Arr2){
    let length1 = Arr1.length;
    let length2 = Arr2.length;
    let newArr = new Uint8Array(length1+length2);
    let cnt = 0;
    for(;cnt<length1;cnt++){
      newArr[cnt] = Arr1[cnt];
    }
    for(let cnt2=0;cnt2<length2;cnt2++){
      newArr[cnt] = Arr2[cnt2];
      cnt++;
    }
    return newArr;
  }

}

export default new powtServer();
