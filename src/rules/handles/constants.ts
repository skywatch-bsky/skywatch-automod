import { Checks } from "../../types.js";

export const HANDLE_CHECKS: Checks[] = [
  {
    label: "troll",
    comment: "Troll language found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "l[i4]bt[a4]rd|libs[ -]?of[ -]?(tiktok|x|bsky|bluesky)|(liberal|lib|dem|democrat|snowflake).*?tears?|end.*?woke(ness|ns)|triggering.*libs?|only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|wokemind|woke.*?virus|(crybaby|snowflake)lib(eral)?|woke.*snowflake|(snowflake|scared).*?lib|lib(eral)s?.*?suck|lynch.*?(black|nigger)s?|total[ -]?(nigger|troon|tranny)[ -]?death|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y[ -]?([t7][wvv][o0]|2)[ -]?[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.(party|st|tv)|soybooru\\.com|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|(soy|troon)jak|kamalasu(cks|x)|p[e3]d[o0]hunter|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|lgb✂️tq|no such thing as trans|rightmemenews\\.com|[nh]ate ?[nh]iggers?|libsoftiktok.*?brid\\.gy",
      "i",
    ),
    whitelist: new RegExp("(anti|[🚫]|DNI)[ -:]?groyper", "iu"),
  },
  {
    label: "alt-gov",
    comment: "Alt Gov Handle Found",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("(?:(?:[a-zA-Z]+\\.)?altgov\\.info)", "i"),
  },
  {
    label: "suspect-inauthentic",
    comment: "Account is suspected to be inauthentic or spammy. Please review.",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))[0-9]{2,4}\\.bsky\\.social|[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))[0-9]{2,4}[a-z]+\\.bsky\\.social|(didunddkjd|alycemi|alessakiss83|faykatz|layahheilpern.*?|heyyougay69)\\.bsky\\.social|hopefoundatione\\.org",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:k6iz3efpj4prqkincrejjkew", // Keeps getting flagged for no discernable reason"
      "did:plc:445avk3am7zpwlrj7aop746e", // Flagged for unclear reasons
    ],
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "#(?:MAGA|MAHA)\\b|#Trump-?2024|(?:(?:real|president|king|queen)?-?(?:barron|donald|eric|ivan(?:k)?a|tiffany|melenia)-?(?:john|j)?-?(?:(?:trump)-?(?:jr)?))|(?:proud|king)magat?|(?:trump-?(?:20(?:24|28|32|36|48)|(?:45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(?:45|46|47)|ultramagat?|maga-[0-9]{2,4}|(?:trump-?(?:is)?-?(?:my|your)?-?(?:king|maga|train|daddy|army|nation|world))|marjorie-?taylor-?green|laura-?loomer|\\bloomered\\b|steve-?bannon|nick-?(?:j)?-?fuentes|matt=?gaetz|rfk-?jr|project-?2025|(?:thomas|tom)-?homan|(?:pam|pamala)-?bondi|kash-?patel|jd-?vance|pete-?hegseth|Karoline-?Leavitt|dana-?white|susie-?wiles|libsoftiktok.*?brid\\.gy|Love Trump",
      "i",
    ),
    whitelist: new RegExp(
      "(#?(?<=Never|Fuck|anti|🚫|DNI))[ -:]{0,2}((#)?(Donald[ -:]?)?Trump|MAGA(t)?|DJT)|#?((Donald)?[ -:]?Trump[ -:]?Hater|magazine|stop[ -:]?project[ -:]?2025)",
      "iu",
    ),
    ignoredDIDs: [
      "did:plc:ugtulcml7ptsivphrwpigrb6", //catturd2.bsky.social - Tom Mckay
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account
      "did:plc:shkwqe63emneooxypi6dpw7f", // eratomag.bsky.social
      "did:plc:izhxao5rdfmmaho532pf3c33", // Gag account
      "did:plc:k6iz3efpj4prqkincrejjkew", // Keeps getting flagged for no discernable reason
      "did:plc:omwssnbnwy3lse5decneobbr", // Parody - Obnoxious but parody
      "did:plc:iw2wxg46hm4ezguswhwej6t6", // actual whitehouse
    ],
  },
  {
    label: "elon-musk",
    comment: "Elon Musk found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann|Doge-?Father",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:62cuohm6c6nefpnw4uujepty", // elonjet.net
    ],
  },
  {
    label: "nazi-symbolism",
    comment: "Nazi symbolism found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "h[i1]tl[e3]r|goebbels|göring|himmler|\\bführer\\b|reichskanzler|HWABAG|nazigamingclan\.com",
      "i",
    ),
  },
  {
    label: "contains-slur",
    comment: "Slur found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(retarded|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Ayr|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard|Troon.*wine|Troon.*(Ayrshire|Ayr|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(Ayrshire|Ayr|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿).*Troon",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", // Winemaker from Oregon's Troon Vineyards
      "did:plc:66hjw7i6p2ay4z75n5cj4siy", // Troon Vineyards
      "did:plc:yiigf6rlrsegsqhot6cndrhu", // Ayr Advertiser
    ],
  },
];
