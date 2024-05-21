// posmp2.mjs
//
// Simple Web Audio Sampler 2
//
// (CCby4.0) 2018-2023 D.F.Mac.@TripArts Music

const LOGLEVEL = 1; // 0: none, 1: errLog only, 2: inoLog+errLog
let instanceCount = 0;

class posmp2 {
  constructor(context){
    this.audioctx = null;
    if(context != undefined){
      this.audioctx = context;
    }else{
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      this.audioctx = new AudioContext();
    }
    this.startTime = null;
    this.startTimeStamp = null;
  }
  init(src){
    return new Promise((resolve,reject)=>{
      this.uid = instanceCount;
      instanceCount ++;
      infoLog("posmp("+this.uid+"):init() with:["+src+"]");
      this.rythmicFilter = this.audioctx.createGain();
      this.masterVolume = this.audioctx.createGain();
      this.rythmicFilter.gain.value = 0;
      this.masterVolume.gain.value = 1;
      this.rythmicFilter.connect(this.masterVolume);
      this.masterVolume.connect(this.audioctx.destination);
      this.buffer = null;
      this.gbufSrc = null;
      this.gStarted = false;
      if(src != null){
        this.src = src;
        this._load(this.src).catch((err)=>{
          errLog("posmp("+this.uid+"):init()->load() :"+this.src+" error");
          reject(err);
        }).then(()=>{
          infoLog("posmp("+this.uid+"):init()->load() :"+this.src+" done");
          resolve(this);
        });
      }else{
        infoLog("posmp("+this.uid+"):init() only -> done");
        resolve(this);
      }
    });
  }
  go(){
    console.log("@posmp.go()")
    this.audioctx.resume();
    this.startTime = performance.now() - this.audioctx.currentTime * 1000;
    this.startTimeStamp = (performance.timeOrigin + performance.now()) - this.audioctx.currentTime * 1000;
  }
  _load (src){
    return new Promise((resolve,reject)=>{
      infoLog("posmp("+this.uid+"):load("+src+") start");
      fetch(src).then((res)=>{
        if(res.ok){
          infoLog("posmp("+this.uid+"):fetch() OK");
          return res.arrayBuffer();
        }else{
          throw new Error(res.status);
        }
      }).catch((e)=>{
        errLog("posmp("+this.uid+"):load() ERROR:"+e);
        reject(e);
      }).then((buf)=>{
        this.audioctx.decodeAudioData(buf).then((buffer)=>{
          infoLog("posmp("+this.uid+"):load() OK");
          this.buffer = buffer;
          resolve();
        },(err)=>{
          errLog("posmp("+this.uid+"):load() error: "+err);
          reject(err);
        });
      });
    });
  }
  play(opt){
    infoLog("posmp("+this.uid+"):play()");
    if(this.buffer != null){
      this.audioctx.resume();

      let src = this.audioctx.createBufferSource();
      let when = 0;
      src.playbackRate.value = 1.0;
//      console.log("@@@@@ src.playbackRate >>>>");
//      console.dir(src.playbackRate);
      src.loopStart = 0;
      src.loop = false;
      src.loopEnd = this.buffer.duration;
      infoLog("posmp("+this.uid+")buffer.duration:"+this.buffer.duration);
      if(opt){
        if(typeof opt.rate === 'number'){
          src.playbackRate.value = opt.rate;
        }
        if(typeof opt.loop === 'number'){
          src.loop = opt.loop;
        }
        if(typeof opt.lstart === 'number'){
          src.loopStart = opt.lstart;
        }
        if(typeof opt.lend === 'number'){
          src.loopEnd = opt.lend;
        }
        if(typeof opt.when === 'number'){
          let ct = this.audioctx.currentTime;
          let duration = opt.when - ct;
//          console.log("play() duration="+duration)

          when = opt.when;
        }

      }
      src.buffer = this.buffer;
//      src.connect(this.audioctx.destination);

      let masterVolume = this.audioctx.createGain();
      masterVolume.gain.value = 0.2;
      masterVolume.connect(this.audioctx.destination);
      src.connect(masterVolume);
      src.start(when);
    }
  }
/*
  looperStart(at,rate,gain){
    infoLog("posmp("+this.uid+"):gnyotch()");
    if(this.buffer != null){
      if(this.gStarted == false){
        this.gStarted = true;
        this.audioctx.resume();
        this.gbufSrc = this.audioctx.createBufferSource();
        this.gbufSrc.loopStart = 0;
        this.gbufSrc.loop = true;
        this.gbufSrc.loopEnd = this.buffer.duration;
        infoLog("posmp("+this.uid+")buffer.duration:"+this.buffer.duration);
        this.gbufSrc.buffer = this.buffer;
        this.gbufSrc.connect(this.rythmicFilter);
        this.rythmicFilter.gain.value = gain;
        this.gbufSrc.start(at);
      }
      this.looperSpeed(rate,at);
    }
  }
  looperFilterGain(at,value){
    if(this.gStarted == true){
      if(at == 0){
        this.rythmicFilter.gain.value = value;
      }else{
        this.rythmicFilter.gain.exponentialRampToValueAtTime(value,at);
      }
    }
  }
  looperSpeed(at,rate){
    if(this.gStarted == true){
      this.gbufSrc.playbackRate.exponentialRampToValueAtTime(rate,at);
    }
  }
  looperPause(){
    if(this.gbufSrc != null){
      console.log("posmp:stop()");
      this.rythmicFilter.gain.value = 0;
//      this.audioctx.suspend();
    }
  }
  stop(){
    if(this.gbufSrc != null){
      console.log("posmp:stop()");
      this.gbufSrc.close();
      this.gbufSrc = null;
      this.gStarted = false;
    }
  }
*/
  resume(){
    infoLog("posmp("+this.uid+"):resume()");
    if(this.buffer != null){
      this.audioctx.resume();
///      this.rythmicFilter.gain.value = 0.2;
    }
  }
  wait(ms){
    infoLog("posmp("+this.uid+"):wait()");
    return new Promise((resolve)=>{setTimeout(resolve,ms);});
  }
}

let infoLog = (str)=>{};
let errLog = (str)=>{};
let setLogLevel = function(log){
  if(log > 1){
    infoLog = console.log.bind(console, "%c%s", "color:blue;");
  }
  if(log > 0){
    errLog = console.log.bind(console, "%c%s", "color:red;font-weight:bold;");
  }
};

setLogLevel(LOGLEVEL);

export default posmp2;
