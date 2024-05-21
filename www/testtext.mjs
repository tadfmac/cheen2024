//
// testtext.mjs by D.F.Mac.@TripArts Music
// from https://ja.wikipedia.org/wiki/煬帝
//

const texts = {
  cheen:[
    "ち〜ん",
    "ちーーーん",
    "ちん",
    "チーン",
    "ち〜〜ん",
    "cheen",
    "cheeeeeeeeeeeeeeeeeeeeeeeeeeen"
  ],
  etc:[
    "田中ーーーーーーー！！！！！",
    "由美ちゃん？",
    "その響きで心躍る！",
    "新たな世界への扉を開こう！",
    "ドキドキ",
    "缶はないの？",
    "楽しい！",
    "ふーん",
    "おいおい！",
    "草",
    "wwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "www",
    "wwwwwwwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "エモい",
    "ちょっと地味ね",
    "うるさい"
  ]
};

class generateText{
  constructor(){
  	this.texts = texts;
  }
  get(){
    console.dir(this.texts);
  	if((Math.random()*10) < 0.3){
      let idx =  Math.floor(Math.random()*this.texts.etc.length);
      return this.texts.etc[idx];
  	}else{
      let idx =  Math.floor(Math.random()*this.texts.cheen.length);
      return this.texts.cheen[idx];
  	}
  }
}

export default new generateText();
