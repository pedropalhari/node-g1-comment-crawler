//document.querySelectorAll('[id^="comentario"] > div.glbComentarios-conteudo > div > div.glbComentarios-dados-usuario')

//"https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/05/26/manifestantes-fazem-ato-no-rio-pelo-fim-das-politicas-de-intervencao-e-ocupacao-policial-em-areas-residenciais.ghtml"
//"https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/05/26/manifestantes-fazem-ato-pro-bolsonaro-em-copacabana.ghtml"
//"https://g1.globo.com/mundo/noticia/2019/05/27/a-visita-de-trump-a-um-ringue-de-sumo-no-japao-tarde-incrivel.ghtml"
//https://g1.globo.com/ciencia-e-saude/noticia/2019/05/27/oms-define-sindrome-de-burnout-como-estresse-cronico-e-a-inclui-na-lista-oficial-de-doencas.ghtml

const puppeteer = require("puppeteer");
const parsePage = require("./parsePage");

let workspaceEnv;

(async () => {
  const browser = await puppeteer.launch({
    //headless: false
  });

  workspaceEnv = await parsePage(
    browser,
    "https://g1.globo.com/mundo/noticia/2019/05/27/a-visita-de-trump-a-um-ringue-de-sumo-no-japao-tarde-incrivel.ghtml"
  );

  //console.log(indexNameDescMap[Math.floor(Math.random() * 10)]);

  // let a = await elements[0].getProperty("innerHTML");
  // let a2 = await a.jsonValue();
  // console.log(a2);

  //await browser.close();
})();

//NODE EXPRESS

var express = require("express");
var cors = require("cors");
var app = express();
app.use(cors());

app.get("/", function(req, res) {
  res.json(workspaceEnv);
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
