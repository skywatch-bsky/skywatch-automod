import { Checks } from "./types.js";

export const PROFILE_CHECKS: Checks[] = [
  {
    label: "blue-heart-emoji",
    comment: "💙 found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp("💙🌊|🌊💙|💙{2,}", "u"),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜💙|💚💙|💙🤍🕊|☂💙|🩵🩷🤍🩷🩵|💙🩷🤍🩷💙|💙💜(💖|💗|🩷)|💛💙",
      "u",
    ),
    ignoredDIDs: [
      "did:plc:knoepjiqknech5vqiht4bqu6", // buffer.com
    ],
  },
  {
    label: "testing-blue-heart-emoji",
    comment: "Testing: 💙 found in profile",
    description: true,
    displayName: true,
    reportOnly: true,
    commentOnly: false,
    check: new RegExp("💙+?", "u"),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜💙|💚💙|💙🤍🕊|☂💙|🩵🩷🤍🩷🩵|💙🩷🤍🩷💙|💙💜(💖|💗|🩷)|💛💙",
      "u",
    ),
    ignoredDIDs: [
      "did:plc:knoepjiqknech5vqiht4bqu6", // buffer.com
    ],
  },
  {
    label: "suspect-inauthentic",
    comment: "Account is suspected to be inauthentic or spammy. Please review.",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "💘📲 👉👌|[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))(20)?25\\.bsky\\.social|getallmylinks\\.com/(alexxmini|eviepie|camisosa|cuteyalex|alexiaarmaniii|janeyy|yourbella|urjane|onlylara|lliiyy[0-9]*?|lilyscottx|janesworld|sarahheree[0-9]*?|bellasdream|amberbunnyxx|anatoom|cutexjaney|arianaslavens1sb|faykatz|freeliz)|snipfeed\\.co/(jaxtravis)|hoo\\.be/(marcroseonly)|saweria\\.co/(coltliqekajaya)|linktr\\.ee/(marcroseof|yourfavlegs|diazchat)|instagram\\.com/(pixiexbelle)|planoly\\.store/(chloeeadams[0-9]*?)|(didunddkjd|alycemi|alessakiss83|faykatz|laurenbabygirl|babyalexis|vortexdancer)\\.bsky\\.social|beacons\\.ai/(dianadicksy|dianadickzzy)|(lolizy|liizzyyyy|lizzikissi|janeangel|ALEXsWOrld|CUTeyBELLa|shinyalex).carrd.co|onlyfans\\.com/(aliceeeeeeeeeeeeee|avafiery|kawaiilavina)|bit\\.ly/(norasblueescape|naomitribe)",
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
      "#(MAGA|MAHA)\\b|#Trump ?2024🇺🇸?|((real|president|king|queen)? ?(barron|donald|eric|ivan(k)?a|tiffany|melenia) ?(john|j)? ?((trump)( |, )?(jr)?))|(proud|king)magat?|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga [0-9]{2,4}|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))",
      "i",
    ),
    whitelist: new RegExp(
      "((anti|[🚫]|DNI)[ -:]?(Trump|MAGA(t)?))|#?(Never|Fuck)[ -:]?Trump[ -]?(hater)?|magazine|stop[ -]?project[ -:]?2025",
      "iu",
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
    ignoredDIDs: [
      "did:plc:dyf6o6q3rvdrza3xwgpn56gz", // typescript.monster - obvious shitposter
    ],
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
    label: "inverted-red-triangle",
    comment: "🔻 found in profile",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp("🔻", "iu"),
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
      "l[i4]bt[a4]rd|libs[ -]?of[ -]?(tiktok|x|bsky|bluesky)|(liberal|lib|dem|democrat|snowflake).*?tears?|end.*?woke(ness|ns)|triggering.*libs?|only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|wokemind|woke.*?virus|(crybaby|snowflake)lib(eral)?|woke.*snowflake|(snowflake|scared).*?lib|lib(eral)s?.*?suck|lynch.*?(black|nigger)s?|total[ -]?(nigger|troon|tranny)[ -]?death|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y[ -]?([t7][wvv][o0]|2)[ -]?[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.(party|st|tv)|soybooru\\.com|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|(soy|troon)jak|kamalasu(cks|x)|p[e3]d[o0]hunter|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|no such thing as trans|rightmemenews\\.com|[nh]ate ?[nh]iggers?",
      "i",
    ),
    whitelist: new RegExp("(anti|[🚫]|DNI)[ -:]?groyper", "iu"),
  },
  {
    label: "suspect-inauthentic",
    comment: "Account is suspected to be inauthentic or spammy. Please review.",
    description: true,
    displayName: true,
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))(20)?25\\.bsky\\.social|(didunddkjd|alycemi|alessakiss83|faykatz|layahheilpern.*?|heyyougay69)\\.bsky\\.social",
      "i",
    ),
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in handle",
    reportOnly: false,
    commentOnly: false,
    check: new RegExp(
      "#(MAGA|MAHA)\\b|#Trump-?2024🇺🇸?|((real|president|king|queen)?-?(barron|donald|eric|ivan(k)?a|tiffany|melenia)-?(john|j)?-?((trump)-?(jr)?))|(proud|king)magat?|(trump-?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga-[0-9]{2,4}|(trump-?(is)?-?(my|your)?-?(king|maga|train|daddy|army|nation|world))|jdvance|marjorietaylorgreen|laura-?loomer|\\bloomered\\b|steve-?bannon|nick-?(j)?-?fuentes|mattgaetz|rfk-?jr|project?-2025",
      "i",
    ),
    whitelist: new RegExp(
      "((anti|[🚫]|DNI)[ -:]?(Trump|MAGA(t)?))|#?(Never|Fuck)[ -:]?Trump[ -]?(hater)?|magazine|stop[ -]?project[ -:]?2025",
      "iu",
    ),
    ignoredDIDs: [
      "did:plc:ugtulcml7ptsivphrwpigrb6", //catturd2.bsky.social - Tom Mckay
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account
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
      "gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.app|cash\\.me|paypal\\.com|paypal\\.me|gogetfunding\\.com|winred\\.com|actblue\\.com|givesendgo\\.com|chuffed\\.org",
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
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "blueskyfollower\\.com|#ifbap|#socialistsunday|#follow4follow|#followback|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#fbpe|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty",
      "i",
    ),
  },
  {
    label: "follow-back-spam",
    comment: "Follow back spam found in post",
    reportOnly: false,
    commentOnly: true,
    check: new RegExp(
      "💙Vetted RESISTERS🦋|Follow Back Pack|💙Amazing Blue Accounts|#Strongertogether|#meidasmighty|#resist|#resistance|#Theresistance|#Resisters|#Wearetheresistance|#bluedotredstate|#Blueunderground|#NAFO|#fellas",
      "iu",
    ),
  },
  {
    label: "suspect-inauthentic",
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
      "only (2|two) genders((?=.*transition)(?=.*mental health challenges)(?=.*love)(?=.*ideology))|trump is (your ?)(king|god|jesus|daddy)|(there (are|is))? only (two|2) genders",
      "i",
    ),
  },
];
