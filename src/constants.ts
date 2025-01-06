import { Checks } from "./types.js";

export const PROFILE_CHECKS: Checks[] = [
  {
    label: "report-to-bsky",
    comment: "Profile is being reported too frequently",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "dobolen\\.eu\\.org|getallmylinks\\.com|Eve 🍬 Free Onlyfans",
      "i",
    ),
  },
  {
    label: "troll",
    comment: "Troll language found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|[o0]n[l1]y ?([t7][wvv][o0]|2) ?[g9][e3][n][d][e3][r][s5]?|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|rightmemenews\\.com|[nh]ate ?[nh]iggers?",
      "i",
    ),
    whitelist: new RegExp("(anti|[🚫]|DNI)[ -:]?groyper", "i"),
    ignoredDIDs: [
      "did:plc:lmuoejh44euyubyxynofwavg", //Has "Anti-Groyper" in their profile and this was getting flagged before I refactored the whitelist regex.
    ],
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "#MAGA\\b|#Trump ?2024🇺🇸?|(barron|donald|eric)(trump|.*trump|jtrump|.*trumpjr)",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account
    ],
  },
  {
    label: "elon-musk",
    comment: "Elon Musk found in profile",
    description: false,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann",
      "i",
    ),
  },
  {
    label: "nazi-symbolism",
    comment: "Nazi symbolism found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "(h[i1]tl[e3]r|goebbels|göring|himmler|\\bführer\\b|reichskanzler|HWABAG|nazigamingclan\.com|卐|\\bHH ?1488\\b)",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:f4bb6sbdilvedzkdhqcxsmau", //camwhitler.bsky.social - Cam Whitler
      "did:plc:tl4m3mk2rrz2ewe27umm3ay4", // some NAFO guy with RU卐卐IA in his bio
    ],
  },
  {
    label: "hammer-sickle",
    comment: "Hammer and sickle found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp("☭", "i"),
    ignoredDIDs: [
      "did:plc:stu4unkwieyt5suhyfl6u5e4", //marlo.ooo
    ],
  },
  {
    label: "contains-slur",
    comment: "Slur found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "\\b([tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
    ],
  },
  {
    label: "terf-gc",
    comment: "TERF language found in profile",
    description: true,
    displayName: true,
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "[🌈🏳️‍🌈]?lgb(✂️tq|, without the)|#KPSS|Adult Human Female",
      "iu",
    ),
  },
];

export const HANDLE_CHECKS: Checks[] = [
  {
    label: "troll",
    comment: "Troll language found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "l[i4]bt[a4]rd|libs[ -]?of[ -]?(tiktok|x|bsky|bluesky)|liberal.*tears?|lib.*tears|democrat.*tears|end.*woke(ness|ns)|triggering.*libs?|only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|wokemind|woke.*virus|crybabylib|snowflakelib|woke.*snowflake|scaredlib|liberals.*suck|lynch.*?(black|nigger)s?|total[ -]?(nigger|troon|tranny)[ -]?death|(?<!(anti|[🚫]) ?)groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y[ -]?([t7][wvv][o0]|2)[ -]?[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|no such thing as trans|rightmemenews\\.com|[nh]ate ?[nh]iggers?",
      "i",
    ),
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "(donald(trump|.*trump|jtrump|.*trumpjr)|real(-donald-trump|donaldtrump)|president.*trump|[proud|king]magat?|ivan.*trump|eric.*trump|tiffany.*trump|melania.*trump|trump.*(202[48]|america|won|wins|47|maga|god|jesus|lord|[0-9]{2,4})|potus47|jdvance|marjorietaylorgreen|laura.*loomer|\\bloomered\\b|barron.*(trump|2040)|steve.*bannon|nick.*fuentes|mattgaetz|rfk-?jr|project.*2025|ultramaga|maga.*(202[48]|trump)|catturd|cat-turd|king.*trump|trump.?king|trump.?train|trump.?army|trump.?nation|trump.?world)",
      "i",
    ),
    whitelist: new RegExp("magazine|stop.*project2025|fucktrump|trumphater"),
    ignoredDIDs: [
      "did:plc:ugtulcml7ptsivphrwpigrb6", //catturd2.bsky.social - Tom Mckay
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account]
    ],
  },
  {
    label: "elon-musk",
    comment: "Elon Musk found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann",
      "i",
    ),
  },
  {
    label: "nazi-symbolism",
    comment: "Nazi symbolism found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "(h[i1]tl[e3]r|goebbels|göring|himmler|\\bführer\\b|reichskanzler|HWABAG|nazigamingclan\.com)",
      "i",
    ),
  },
  {
    label: "contains-slur",
    comment: "Slur found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "\\b([tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
    ],
  },
];

export const POST_CHECKS: Checks[] = [
  {
    label: "fundraising-link",
    comment: "Fundraising link found in post",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.app|cash\\.me|paypal\\.com|paypal\\.me|gogetfunding\\.com|winred\\.com|actblue\\.com|givesendgo\\.com|chuffed\\.org ",
      "i",
    ),
  },
  {
    label: "fringe-media",
    comment: "Fringe media source found in post",
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "\\b(([^.]+\\.)?(allstaredge\\.info|americanactionnews\\.com|thepoliticalinsider\\.com|americadaily\\.com|bles\\.com|dkn\\.tv|theepochtimes\\.(com|de|fr|gr)|genuinenewspaper\\.com|tierrapura\\.org|truthandtradition\\.news|visiontimes\\.com|bigleaguepolitics\\.com|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|flvoicenews\\.com|breitbart\\.com|americasvoice\\.news|gnews\\.org|dailycaller\\.com|thefederalist\\.com|lewrockwell\\.com|loomered\\.com|newsmax\\.com|oann\\.com|patriotpost\\.us|prageru\\.com|truthfeed\\.com|thegatewaypundit\\.com|westernjournal\\.com|townhall\\.com|zerohedge\\.com|dailywire\\.com|washingtontimes\\.com|texasscorecard\\.com|babylonbee\\.com|revolver\\.news|thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|hotair\\.com|pjmedia\\.com|redstate\\.com|thepostmillenial\\.com|rightmemenews\\.com|rebelnews\\.com/))",
      "i",
    ),
  },
  {
    label: "alt-tech",
    comment: "Alt-tech platform found in post",
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "givesendgo\\.com|rumble\\.com|gab\\.com|truthsocial\\.com|gettr\\.com",
      "i",
    ),
  },
  {
    label: "disinformation-network",
    comment: "Disinformation network found in post",
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|\\.rt\\.com|sputniknews\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|presstv\\.ir|www\\.presstv\\.ir|x\\.com\\/Partisangirl|sputnikglobe\\.com",
      "i",
    ),
  },
  {
    label: "sports-betting",
    comment: "Sports betting site found in post",
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "(^|.*\\.)fanduel\\.com|(^|.*\\.)draftkings\\.com|draftkings\\.com|fanduel\\.com|betmgm\\.com|(^|.*\\.)betmgm\\.com|sportsbook\\.caesars\\.com|(^|.*\\.)caesars\\.com\\/sportsbook-and-casino|(^|.*\\.)espnbet\\.com|espnbet\\.com",
      "i",
    ),
  },
  {
    label: "gore",
    comment: "Gore content found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp("watchpeopledie\\.tv", "i"),
  },
  {
    label: "contains-slur",
    comment: "Slur found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "\\b([tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
    ],
  },
  {
    label: "follow-farming",
    comment: "Follow farming hashtags found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "blueskyfollower\\.com|#MEGABOOST|#NoDemUnder5k|#NoDemUnder1k|#FBR|#BlueCrew|#DonkParty|#ifbap",
      "i",
    ),
  },
  {
    label: "follow-back-spam",
    comment: "Follow back spam found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "💙Vetted RESISTERS🦋|Follow Back Pack|💙Amazing Blue Accounts",
      "iu",
    ),
  },
  {
    label: "suspected-inauthentic",
    comment: "Suspected inauthentic behavior found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "only (2|two) genders((?=.*transition)(?=.*mental health challenges)(?=.*love)(?=.*ideology))|luxuryhousezone\\.com|3sblog\\.com",
      "i",
    ),
  },
  {
    label: "troll",
    comment: "Trolling found in post",
    reportOnly: true,
    commentOnly: false,
    check: new RegExp(
      "only (2|two) genders((?=.*transition)(?=.*mental health challenges)(?=.*love)(?=.*ideology))|luxuryhousezone\\.com|3sblog\\.com",
      "i",
    ),
  },
];
