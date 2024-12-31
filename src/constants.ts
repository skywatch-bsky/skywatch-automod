// Add new regexes here

// Check for Fundraising Links
export const fundraising = new RegExp(
  "gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.app|cash\\.me|paypal\\.com|paypal\\.me|gogetfunding\\.com|winred\\.com|actblue\\.com|givesendgo\\.com",
  "i",
);

// Check for Fringe Media Links
export const fringeMedia = new RegExp(
  "\\b(([^.]+\\.)?(allstaredge\\.info|americanactionnews\\.com|thepoliticalinsider\\.com|americadaily\\.com|bles\\.com|dkn\\.tv|theepochtimes\\.(com|de|fr|gr)|genuinenewspaper\\.com|tierrapura\\.org|truthandtradition\\.news|visiontimes\\.com|bigleaguepolitics\\.com|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|flvoicenews\\.com|breitbart\\.com|americasvoice\\.news|gnews\\.org|dailycaller\\.com|thefederalist\\.com|lewrockwell\\.com|loomered\\.com|newsmax\\.com|oann\\.com|patriotpost\\.us|prageru\\.com|truthfeed\\.com|thegatewaypundit\\.com|westernjournal\\.com|townhall\\.com|zerohedge\\.com|dailywire\\.com|washingtontimes\\.com|texasscorecard\\.com|babylonbee\\.com|revolver\\.news|thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|hotair\\.com|pjmedia\\.com|redstate\\.com|thepostmillenial\\.com|rightmemenews\\.com))",
  "i",
);

// Check for Alternative Tech Links
export const altTech = new RegExp(
  "givesendgo\\.com|rumble\\.com|gab\\.com|truthsocial\\.com|gettr\\.com",
  "i",
);

// Check for Disinformation Network Links
export const disinfoNetwork = new RegExp(
  "thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|\\.rt\\.com|sputniknews\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|presstv\\.ir|www\\.presstv\\.ir|x\\.com\\/Partisangirl|sputnikglobe\\.com",
  "i",
);

// Check for Sports Betting Links
export const sportsBetting = new RegExp(
  "(^|.*\\.)fanduel\\.com|(^|.*\\.)draftkings\\.com|draftkings\\.com|fanduel\\.com|betmgm\\.com|(^|.*\\.)betmgm\\.com|sportsbook\\.caesars\\.com|(^|.*\\.)caesars\\.com\\/sportsbook-and-casino|(^|.*\\.)espnbet\\.com|espnbet\\.com",
  "i",
);

// Check for Gore
export const gore = new RegExp("watchpeopledie\\.tv", "i");

// Check for Trumpworld Related Names
export const magaTrump = new RegExp(
  "(donald(trump|.*trump|jtrump|.*trumpjr)|real(-donald-trump|donaldtrump)|president.*trump|[proud|king]magat?|ivan.*trump|eric.*trump|tiffany.*trump|melania.*trump|trump.*(202[48]|america|won|wins|47|maga|god|jesus|lord|[0-9]{2,4})|potus47|jdvance|marjorietaylorgreen|laura.*loomer|\\bloomered\\b|barron.*(trump|2040)|steve.*bannon|nick.*fuentes|mattgaetz|rfk-?jr|project.*2025|ultramaga|maga.*(202[48]|trump)|catturd|cat-turd|king.*trump|trump.?king|trump.?train|trump.?army|trump.?nation|trump.?world)",
  "i",
);

/* We need a seperate profile related regexp because resist libs insist on using all the most useful terms in their profiles */
export const magaTrumpProfile = new RegExp("#MAGA\\b|#Trump ?2024🇺🇸?", "i");

export const trollProfile = new RegExp(
  "only ?2.*genders?|(?<!(anti|[🚫]) ?)groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|rightmemenews\\.com",
  "i",
);

// Some people insist on these handles
export const whitelist = new RegExp(
  "magazine|stop.*project2025|fucktrump|trumphater|.*trooney|p[ae]troon|poltroon|ascottishtroon",
  "i",
);

// Check for Elon Musk
export const elonMusk = new RegExp(
  "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann",
  "i",
);

// Check for Troll Handles
export const troll = new RegExp(
  "(l[i4]bt[a4]rd|libsof(tiktok|x|bsky|bluesky)|libs[- ]of[- ](tiktok|x|bsky|bluesky)|liberal.*tears?|lib.*tears|democrat.*tears|end.*woke(ness|ns)|triggering.*libs?|copemore|only ?2.*genders?|gender.*only ?2|only ?two.*genders?|wokemind|woke.*virus|crybabylib|snowflakelib|woke.*snowflake|scaredlib|liberals.*suck|lynch.*?(black|nigger)s?]|total[ -]?(nigger|troon|tranny)[ -]?death|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r)|lgb✂️tq|no such thing as trans|rightmemenews\\.com",
  "i",
);

/* We need a seperate regexp for posts because libs will not stop reclaiming anything that moves */
export const trollPosts = new RegExp(
  "(l[i4]bt[a4]rd|only ?2.*genders?|gender.*only ?2|only ?two.*genders?|wokemind|woke.*virus|crybabylib|snowflakelib|woke.*snowflake|scaredlib|liberals.*suck|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lynch.*?(black|nigger)s?]|total[ -]?(nigger|troon|tranny)[ -]?death)|no such thing as trans|lgb✂️tq",
  "i",
);

// Check for Nazism
export const nazism = new RegExp(
  "(h[i1]tl[e3]r|goebbels|göring|himmler|\\bführer\\b|reichskanzler|HWABAG|nazigamingclan\.com)",
  "i",
);

// Check for Nazi Symbolism
export const swastika = new RegExp("卐|\\bHH ?1488\\b", "i");

// Check for Hammer and Sickle
export const hammerAndSickle = new RegExp("☭", "i");

// Check for Slurs
/* Checks for singular and plural, but one is left in as plural regardless to avoid picking up a spanish name */
export const slur = new RegExp(
  "\\b([tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ])[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
  "i",
);

// Again with the Scottish
export const slurWhiteList = new RegExp(
  "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard",
  "i",
);

// This needs to be built out more
export const terf = new RegExp(
  "[🌈🏳️‍🌈]?lgb(✂️tq|, without the)[🌈🏳️‍🌈]?|#KPSS",
  "iu",
);

// Evolving list of follow back spam phrases
export const followBackSpam = new RegExp(
  "💙Vetted RESISTERS🦋|Follow Back Pack|💙Amazing Blue Accounts",
  "i",
);

export const followfarming = new RegExp(
  "blueskyfollower\\.com|#MEGABOOST|#NoDemUnder5k|#NoDemUnder1k|#FBR|#BlueCrew|#DonkParty|#ifbap",
  "i",
);
