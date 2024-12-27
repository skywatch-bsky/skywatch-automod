export const fundraising = new RegExp(
  "gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.app|cash\\.me|paypal\\.com|paypal\\.me|gogetfunding\\.com|winred\\.com|actblue\\.com|givesendgo\\.com",
  "i",
);

export const fringeMedia = new RegExp(
  "\\b(([^.]+\\.)?(americanactionnews\\.com|thepoliticalinsider\\.com|americadaily\\.com|bles\\.com|dkn\\.tv|theepochtimes\\.(com|de|fr|gr)|genuinenewspaper\\.com|tierrapura\\.org|truthandtradition\\.news|visiontimes\\.com|bigleaguepolitics\\.com|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|flvoicenews\\.com|breitbart\\.com|americasvoice\\.news|gnews\\.org|dailycaller\\.com|thefederalist\\.com|lewrockwell\\.com|loomered\\.com|newsmax\\.com|oann\\.com|patriotpost\\.us|prageru\\.com|truthfeed\\.com|thegatewaypundit\\.com|westernjournal\\.com|townhall\\.com|zerohedge\\.com|dailywire\\.com|washingtontimes\\.com|texasscorecard\\.com|babylonbee\\.com))",
  "i",
);

export const altTech = new RegExp(
  "givesendgo\\.com|rumble\\.com|gab\\.com|truthsocial\\.com|gettr\\.com",
  "i",
);

export const disinfoNetwork = new RegExp(
  "thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|\\.rt\\.com|sputniknews\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|presstv\\.ir|www\\.presstv\\.ir|x\\.com\\/Partisangirl|sputnikglobe\\.com",
  "i",
);

export const sportsBetting = new RegExp(
  "(^|.*\\.)fanduel\\.com|(^|.*\\.)draftkings\\.com|draftkings\\.com|fanduel\\.com|betmgm\\.com|(^|.*\\.)betmgm\\.com|sportsbook\\.caesars\\.com|(^|.*\\.)caesars\\.com\\/sportsbook-and-casino|(^|.*\\.)espnbet\\.com|espnbet\\.com",
  "i",
);

export const gore = new RegExp("watchpeopledie\\.tv", "i");

export const magaTrump = new RegExp(
  "(donald(trump|.*trump|jtrump|.*trumpjr)|real(-donald-trump|donaldtrump)|president.*trump|ivan.*trump|eric.*trump|tiffany.*trump|melania.*trump|trump.*(202[48]|america|won|wins|47|maga|god|jesus|lord|[0-9]{2,4})|potus47|jdvance|marjorietaylorgreen|laura.*loomer|barron.*(trump|2040)|steve.*bannon|nick.*fuentes|mattgaetz|rfk-?jr|project.*2025|ultramaga|maga.*(202[48]|trump)|catturd|cat-turd|king.*trump)",
  "i",
);

export const magaWhitelist = new RegExp(
  "magazine|stop.*project2025|catturd2\.bsky\.social|fucktrump|trumphater",
  "i",
);

export const elonMusk = new RegExp("elon(r?musk|.*musk|reevesmusk)", "i");

export const troll = new RegExp(
  "(l[i4]bt[a4]rd|libsof(tiktok|x|bsky|bluesky)|libs[- ]of[- ](tiktok|x|bsky|bluesky)|liberal.*tears?|lib.*tears|democrat.*tears|end.*woke(ness|ns)|triggering.*libs?|copemore|2.*gender|gender.*only2|two.*gender|wokemind|woke.*virus|crybabylib|snowflakelib|woke.*snowflake|scaredlib|liberals.*suck|groyper|kiwi-?farm|blueskycuck|[o0]n[l1]y[t7][wvv][o0][g9][e3][n][d][e3][r][s5]?|raypist|grayp|grayper|graypist|soyjack\.party|soyjack\.st|soybooru\.com|archive\.soyjack\.st|rdrama\.net|watchpeopledie\.tv|kiwifrms\.st|jewhater|jewhater[0-9]+|soyjak|troonjak)",
  "i",
);

export const nazism = new RegExp(
  "(h[i1]tl[e3]r|goebbels|göring|himmler|führer|reichskanzler|HWABAG)",
  "i",
);

export const swastika = new RegExp("卐|✠|\\bHH1488\\b", "i");
export const hammerAndSickle = new RegExp("☭", "i");
export const invertedTriangle = new RegExp("🔻", "i");
