import { Checks } from "./types.js";

export const LINK_SHORTENER = new RegExp(
  "(?:https?:\\/\\/)?([^.]+\\.)?(tinyurl\\.com|bit\\.ly|goo\\.gl|g\\.co|ow\\.ly|shorturl\\.at|t\\.co|go\\.bsky\\.app)",
  "i",
);

export const PROFILE_CHECKS: Checks[] = [
  {
    label: "follow-farming",
    comment: "Follow farming hashtags found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "blueskyfollower\\.com|#ifbap|#socialistsunday|#follow4follow|#followback|#bluecrew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donkpack|#donkparty|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#donkconnects|#ifollowback|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|#UnitedBlueCrew",
      "i",
    ),
  },
  {
    label: "blue-heart-emoji",
    comment: "💙 found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "💙🌊|🌊💙|💙{2,}|(?<=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#fbpe|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA).*?💙|💙.*?(?=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#fbpe|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA)",
      "u",
    ),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜💙|💚💙|💙🤍🕊|☂💙|🩵🩷🤍🩷🩵|💙🩷🤍🩷💙|💙💜(💖|💗|🩷|❤️)|(🤍)?💛💙|💙💛|💙📚|💙⚾️|⚾️💙",
      "u",
    ),
    ignoredDIDs: [
      "did:plc:knoepjiqknech5vqiht4bqu6", // buffer.com
      "did:plc:nostcgoz3uy27lco4gqr62io", // Not using hearts for political reasons
      "did:plc:eh7qf2qmtt4kv54evponoo6n", // Used as part of a large bi-flag
      "did:plc:5sxudf4p3inc7zwecaivoiwu", // Bailey is not the type we need to label
      "did:plc:pb55xcxhvzkpbjxh4blel63z", // KCRoyals Fan
      "did:plc:ujxivyygagxhi72ximqsne2h", // Seems to be real
      "did:plc:aqe5xsdhbnzupirabkd4de2r", // Some edge case here
    ],
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
      "💘📲 👉👌|[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))[0-9]{2,4}\\.bsky\\.social|getallmylinks\\.com/(alexxmini|eviepie|camisosa|cuteyalex|alexiaarmaniii|janeyy|yourbella|urjane|onlylara|lliiyy[0-9]*?|lilyscottx|janesworld|sarahheree[0-9]*?|bellasdream|amberbunnyxx|anatoom|cutexjaney|arianaslavens1sb|faykatz|freeliz)|snipfeed\\.co/(jaxtravis)|hoo\\.be/(marcroseonly)|saweria\\.co/(coltliqekajaya)|linktr\\.ee/(marcroseof|yourfavlegs|diazchat|dianadickzzy)|instagram\\.com/(pixiexbelle|thatsmolpotatoxx|lizz.mlst)|planoly\\.store/(chloeeadams[0-9]*?)|(didunddkjd|alycemi|alessakiss83|faykatz|laurenbabygirl|babyalexis|vortexdancer|aigc-island-?[a-z0-9]+?|maggystn)\\.bsky\\.social|beacons\\.ai/(dianadicksy|dianadickzzy)|(lolizy|liizzyyyy|lizzikissi|janeangel|ALEXsWOrld|CUTeyBELLa|shinyalex).carrd.co|onlyfans\\.com/(aliceeeeeeeeeeeeee|avafiery|kawaiilavina)|bit\\.ly/([a-zA-Z]+?nora[a-zA-Z]+?|[a-zA-Z]+?naomi[a-zA-Z]+?)|t\\.me/(thaliaballard|Goon_mommi)|is\\.gd/((aleksandriaqt|alexithaqt|lexieqt|lara)[0-9]{1,4}|19 💕 your dream girl 🍓 spicy|alexx.crd.co|18 🌷 Your lil dream girl 😇 FREE OF ⤵️|Blessica Blimpton|tiny\\.cc/jessica[0-9]{3,}|tinyurl\\.com/xsarahCM8N)|ishortn\\.ink/(Princes{1,3}Lily{1,3})[0-9]{1,4}|mypages\\.life/(Arianna-try-[0-9]{1,4})|lilyslittlesecret\\.life|lilyspicypage\\.life|lizzyyy\\.short\\.gy|sasoa\\.short\\.gy|linktomy\\.site/onlyfans/georgia|38d.gs/.+|antimagaclub\\.com|shorturl\\.at/(8M8H|9MVL2|ro7Tt|Wn2jQ)|linktr\\.ee/RabbiRothschild|youtube\\.com/results?search_query=rabbi+rothschild&sp=EgJAAQ%253D%253D|rabbirothschild\\.blogspot\\.com",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:k6iz3efpj4prqkincrejjkew", // Keeps getting flagged for no discernable reason"
      "did:plc:445avk3am7zpwlrj7aop746e", // False Positive,
    ],
    starterPacks: [
      "at://did:plc:wedvauzlurzle6nld7jgqtvr/app.bsky.graph.list/3lfgzid6xnc22",
    ],
  },
  {
    label: "spammy",
    comment: "Account is suspected to be inauthentic or spammy. Please review.",
    description: true,
    displayName: true,
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp(
      "Verified by (Molly (Shah|Shane)|@mommunism)|Verified by Molly",
      "i",
    ),
  },
  {
    label: "troll",
    comment: "Troll language found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|[o0]n[l1]y ?([t7][wvv][o0]|2) ?[g9][e3][n][d][e3][r][s5]?|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|rightmemenews\\.com|[nh]ate ?[nh]iggers?|MAGA Colony|Bluecry",
      "i",
    ),
    whitelist: new RegExp("(anti|[🚫]|DNI)[ -:]?groyper", "i"),
    ignoredDIDs: [
      "did:plc:lmuoejh44euyubyxynofwavg", //Has "Anti-Groyper" in their profile and this was getting flagged before I refactored the whitelist regex.
    ],
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in displayName.",
    description: false,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "#(MAGA|MAHA)\\b|#Trump ?2024🇺🇸?|((real|president|king|queen)? ?(barron|donald|eric|ivan(k)?a|tiffany|melenia) ?(john|j)? ?((trump)( |, )?(jr)?))|(proud|king)magat?|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga [0-9]{2,4}|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))",
      "i",
    ),
    whitelist: new RegExp(
      "(#?(?<=Never|Fuck|anti|🚫|DNI))[ -:]{0,2}((#)?(Donald[ -:]?)?Trump|MAGA(t)?|DJT)|#?((Donald)?[ -:]?Trump[ -:]?Hater|magazine|stop[ -:]?project[ -:]?2025)",
      "iu",
    ),
    ignoredDIDs: [
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account
      "did:plc:ivyqb4avgscxb5qemod7sc3v", //Not Easily Handled in RegExp
      "did:plc:py7rpklh3yq26kx6dnsjsptd", //Not Easily Handled in RegExp
      "did:plc:zrepwyn5mdnekohyjvdk5ow3", //Not Easily Handled in RegExp
      "did:plc:4d5vewhn67xvdnzrhbmrqiul", //Not Easily Handled in RegExp
      "did:plc:iwb2gvhsevkvoj4kyycjudjh", //Not Easily Handled in RegExp
      "did:plc:yrhmtlcffcnpbiw3tx74kwzz", // NC Town Crier cries too much about this shit
      "did:plc:izhxao5rdfmmaho532pf3c33", // Gag account
      "did:plc:omwssnbnwy3lse5decneobbr", // Parody - Obnoxious but parody
    ],
  },
  {
    label: "maga-trump",
    comment: "MAGA/Trump support found in description.",
    description: true,
    displayName: false,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "#(MAGA|MAHA)\\b|#Trump ?2024🇺🇸?|#Trump20(24|28|32|36|48)|(proud|king)magat?|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga [0-9]{2,4}|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))",
      "i",
    ),
    whitelist: new RegExp(
      "(#?(?<=Never|Fuck|anti|🚫|DNI))[ -:]{0,2}((#)?(Donald[ -:]?)?Trump|MAGA(t)?|DJT)|#?((Donald)?[ -:]?Trump[ -:]?Hater|magazine|stop[ -:]?project[ -:]?2025)",
      "iu",
    ),
    ignoredDIDs: [
      "did:plc:6rah3qput4aol2iu2ecaglhm", //Squirrel Turd
      "did:plc:6nqex5psu2kg2yzqhzhq6d7b", //Brown Eyed Girl
      "did:plc:56bp6c77m2hlpa2deyi3cofa", //Parody Account
      "did:plc:ivyqb4avgscxb5qemod7sc3v", //Not Easily Handled in RegExp
      "did:plc:py7rpklh3yq26kx6dnsjsptd", //Not Easily Handled in RegExp
      "did:plc:zrepwyn5mdnekohyjvdk5ow3", //Not Easily Handled in RegExp
      "did:plc:4d5vewhn67xvdnzrhbmrqiul", //Not Easily Handled in RegExp
      "did:plc:iwb2gvhsevkvoj4kyycjudjh", //Not Easily Handled in RegExp
      "did:plc:yrhmtlcffcnpbiw3tx74kwzz", // NC Town Crier cries too much about this shit
      "did:plc:izhxao5rdfmmaho532pf3c33", // Gag account
      "did:plc:omwssnbnwy3lse5decneobbr", // Parody - Obnoxious but parody
    ],
  },
  {
    label: "elon-musk",
    comment: "Elon Musk found in profile",
    description: false,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann",
      "i",
    ),
    whitelist: new RegExp(
      "(?<=F[*u]ck|Subpeona) Elon Musk|Elon Musk(?=.*\bnazi\b)",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:dyf6o6q3rvdrza3xwgpn56gz", // typescript.monster - obvious shitposter
      "did:plc:62cuohm6c6nefpnw4uujepty", // elonjet.net
    ],
  },
  {
    label: "nazi-symbolism",
    comment: "Nazi symbolism found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("nazigamingclan\.com|卐|\\bHH ?1488\\b", "i"),
    whitelist: new RegExp("shitler", "i"),
    ignoredDIDs: [
      "did:plc:f4bb6sbdilvedzkdhqcxsmau", //camwhitler.bsky.social - Cam Whitler
      "did:plc:tl4m3mk2rrz2ewe27umm3ay4", // some NAFO guy with RU卐卐IA in his bio
      "did:plc:mxjv45hjx6hwrc5icb4oh7fy", // some dumbass calling trump Hitler 2.0
      "did:plc:sckedie5upvd7xpm5xzochw2", // Using shitler
      "did:plc:vchmnkezcmaixgo7hlsav2ix", // some dumbass calling trump Hitler 2.0
    ],
  },
  {
    label: "hammer-sickle",
    comment: "Hammer and sickle found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("☭", "i"),
    whitelist: new RegExp("☭⃠ ", "i"),
    ignoredDIDs: [
      "did:plc:stu4unkwieyt5suhyfl6u5e4", //marlo.ooo
    ],
  },
  {
    label: "inverted-red-triangle",
    comment: "🔻 found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("🔻", "iu"),
    ignoredDIDs: [
      "did:plc:xbewv2ksis5wk3rts6nvbpfh", // is already labeled, but keeps getting relabeled for some reason
      "did:plc:at2dgrn5tpzrr4vlg7gmxazm", // art account
      "did:plc:mamsgzuf7uzk4feqzzcmvdu7", // Spanish
    ],
  },
  {
    label: "contains-slur",
    comment: "Slur found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(retarded|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard|\\bsnigger(s)?",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
      "did:plc:izmavvmqfvm7je4l6aacfwlr", // Last name is troon
      "did:plc:e2ud5if7wvdhp2kysdwgz2l6", // Uses word "snigger"
      "did:plc:66hjw7i6p2ay4z75n5cj4siy", // Troon Vineyards
      "did:plc:nbyonvtuc7l5onssae2as3ns", // Uses the word troon
    ],
  },
  {
    label: "terf-gc",
    comment: "TERF language found in profile",
    description: true,
    displayName: true,
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp(
      "[🌈🏳️‍🌈]?lgb(✂️tq|, without the)|#KPSS|Adult Human Female|protect women's sports",
      "iu",
    ),
    ignoredDIDs: [
      "did:plc:bt7e7hihbqebuo3csczl6vcf", // trans woman getting flagged for "Adult Human Female" in profile
    ],
  },
  {
    label: "follow-farming",
    comment: "Joined via follow-farming starter pack",
    description: false,
    displayName: false,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("", "i"),
    ignoredDIDs: [
      "did:plc:dyf6o6q3rvdrza3xwgpn56gz", // typescript.monster - obvious shitposter
    ],
    starterPacks: [
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3lfgiqyajr723",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3lazctjtlhn2n",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3lcgshabq4s2b",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3ldbk3qwzlp2h",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3ldt2cm2wpl24",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3le64voe2ox2n",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3lefoohjmmz2r",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3lenan6v4s22r",
      "at://did:plc:dyq4pzcipzmy6fq7th5xpwqu/app.bsky.graph.starterpack/3leuvfomkpm26",
    ],
  },
];

export const HANDLE_CHECKS: Checks[] = [
  {
    label: "troll",
    comment: "Troll language found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
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
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))[0-9]{2,4}\\.bsky\\.social|[0-9]{1,2}((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(j|f|m|a|s|o|n|d))[0-9]{2,4}[a-z]+\\.bsky\\.social|(didunddkjd|alycemi|alessakiss83|faykatz|layahheilpern.*?|heyyougay69)\\.bsky\\.social",
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
      "#(MAGA|MAHA)\\b|#Trump-?2024🇺🇸?|((real|president|king|queen)?-?(barron|donald|eric|ivan(k)?a|tiffany|melenia)-?(john|j)?-?((trump)-?(jr)?))|(proud|king)magat?|(trump-?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga-[0-9]{2,4}|(trump-?(is)?-?(my|your)?-?(king|maga|train|daddy|army|nation|world))|jdvance|marjorietaylorgreen|laura-?loomer|\\bloomered\\b|steve-?bannon|nick-?(j)?-?fuentes|mattgaetz|rfk-?jr|project?-2025|(thomas|tom)homan|(pam|pamala)bondi|kashpatel",
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
    ],
  },
  {
    label: "elon-musk",
    comment: "Elon Musk found in handle",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann",
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
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
      "did:plc:66hjw7i6p2ay4z75n5cj4siy", // Troon Vineyards
      "did:plc:yiigf6rlrsegsqhot6cndrhu", // Ayr Advertiser
    ],
  },
];

export const POST_CHECKS: Checks[] = [
  {
    label: "fundraising-link",
    comment: "Fundraising link found in post",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.(?:app|me)|paypal\\.(?:com|me|app)|gogetfunding\\.com|winred\\.com|givesendgo\\.com|chuffed\\.org)",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:u2nzeo2hgx3ckofwx6zklvvl",
      "did:plc:zljlg7cgdfsl7maqvjjpp7i4",
      "did:plc:l7buhragfpktqopl7wdojhi3",
      "did:plc:5zdbkilvq75qym4t3fa5tsgk",
    ],
  },
  {
    label: "suspected-fundraising-link",
    comment: "Suspected fundraising link found in post. Please review",
    reportAcct: true,
    commentAcct: false,
    reportPost: true,
    toLabel: false,
    check: new RegExp(
      "help.*family.*tinyurl.com|family.*help.*tinyurl.com",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:u2nzeo2hgx3ckofwx6zklvvl",
      "did:plc:zljlg7cgdfsl7maqvjjpp7i4",
      "did:plc:l7buhragfpktqopl7wdojhi3",
      "did:plc:5zdbkilvq75qym4t3fa5tsgk",
    ],
  },
  {
    label: "fringe-media",
    comment: "Fringe media source found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:allstaredge\\.info|americanactionnews\\.com|thepoliticalinsider\\.com|americadaily\\.com|bles\\.com|dkn\\.tv|theepochtimes\\.(com|de|fr|gr)|genuinenewspaper\\.com|tierrapura\\.org|truthandtradition\\.news|visiontimes\\.com|bigleaguepolitics\\.com|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|flvoicenews\\.com|breitbart\\.com|americasvoice\\.news|gnews\\.org|dailycaller\\.com|thefederalist\\.com|lewrockwell\\.com|loomered\\.com|newsmax\\.com|oann\\.com|patriotpost\\.us|prageru\\.com|truthfeed\\.com|thegatewaypundit\\.com|westernjournal\\.com|townhall\\.com|zerohedge\\.com|dailywire\\.com|washingtontimes\\.com|texasscorecard\\.com|babylonbee\\.com|revolver\\.news|thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|theduran\\.com|\\.unz\\.com|hotair\\.com|pjmedia\\.com|redstate\\.com|thepostmillennial\\.com| thenationalpulse\\.com|rightmemenews\\.com|rebelnews\\.com|westernstandard.news|redice\\.tv|tnc\\.news|junonews\\.com|smalldeadanimals\\.com|mercola\\.com|infowars\\.com|prisonplanet\\.com|endgamethemovie\\.com|healthrangerreport\\.com|healthranger\\.com|naturalnews\\.com|mikeadams\\.me|newstarget\\.com|beforeitsnews\\.com|lifesitenews\\.com|buffalochronicle\\.com|dailysceptic\\.org|disclose\\.tv|expose-news\\.com|dolcacatalunya\\.com|FactCheckArmenia\\.com|wnd\\.com|voltairenet\\.org|trunews\\.com|truepundit\\.com|thepeoplesvoice\\.tv|southfront\\.press|russia-insider\\.com|	realrawnews\\.com|projectveritas\\.com|politicususa\\.com|peacedata\\.net|opindia\\.com|news-front\\.info|libertywritersnews\\.com|theleadingreport\\.com|americanactionnews\\.com|AmericanUpdate\\.com|ThePoliticalInsider\\.com|tellmenow\\.com|tmn\\.today|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|100percentfedup\\.com|bigleaguepolitics\\.com|conservativefiringline\\.com|comicallyincorrect\\.com|conservativetribune\\.com|rightwingnews\\.com|rightwing\\.news|tpnn\\.com|westernjournalism\\.com|stonecoldtruth\\.com|gnews\\.org|americasvoice\\.news|1819news\\.com|altoday\\.com|alphanewsmn\\.com|alphanews\\.org|amgreatness\\.com|american-herald\\.com|arizonamonitor\\.com|dangerandplay\\.com|freetelegraph\\.com|granitegrok\\.com|intelligencer\\.today|liveaction\\.org|eviemagazine\\.com|voz\\.us|blazetv\\.com|imprimis\\.hillsdale\\.edu|thepoliticalcesspool\\.org|ilovemyfreedom\\.org|ijr\\.com|KAGfeed\\.com|lifezette\\.com|occupydemocrats\\.com|PatriotPost\\.us|factcheckarmenia\\.com|factcheckingturkey\\.com|voxnews\\.info|banned\\.video|Brighteon\\.com|Gellerreport\\.com|hoggwatch\\.com|nationalfile\\.com|nextnewsnetwork\\.com|returnofkings\\.com|childrenshealthdefense\\.org|collective-evolution\\.com|foodbabe\\.com|geoengineeringwatch\\.org|goop\\.com|greenmedinfo\\.com|stopmandatoryvaccination\\.com|technocracy\\.news|dailysceptic\\.org|unherd\\.com|gbnews\\.com|^(?:.*\\.)?twitchy\\.com|palmerreport\\.com|news-watch\\.co\\.uk|unitynewsnetwork\\.co\\.uk|pleniiixa\\.blogspot\\.com|outkick\\.com|rumble\\.com|dallasexpress\\.com)",
      "i",
    ),
  },
  {
    label: "alt-tech",
    comment: "Alt-tech platform found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:givesendgo\\.com|rumble\\.com|gab\\.com|truthsocial\\.com|gettr\\.com)",
      "i",
    ),
  },
  {
    label: "disinformation-network",
    comment: "Disinformation network found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|\\.rt\\.com|sputniknews\\.com|zerohedge\\.com|theduran\\.com|\\.unz\\.com|presstv\\.ir|www\\.presstv\\.ir|x\\.com\\/Partisangirl|sputnikglobe\\.com)",
      "i",
    ),
  },
  {
    label: "sports-betting",
    comment: "Sports betting site found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:fanduel\\.com|draftkings\\.com|draftkings\\.com|fanduel\\.com|betmgm\\.com|betmgm\\.com|sportsbook\\.caesars\\.com|caesars\\.com\\/sportsbook-and-casino|espnbet\\.com|espnbet\\.com)",
      "i",
    ),
  },
  {
    label: "!warn",
    comment: "Gore content found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:watchpeopledie\\.tv)\\b",
      "i",
    ),
  },
  {
    label: "contains-slur",
    comment: "Slur found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(retarded|zio ?(🐷|🐖|🐀)|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard|\\bsnigger(s)?|Operation(-| )Wetback",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:5yoxqeyfviyrdw3wsfaglh23", //golfer talking about Royal Troon Golf Club
      "did:plc:kv2twqy5didztis6w4hvjn5t", //Scot from Troon, Ayrshire
      "did:plc:dtb2mkl46skh5k2ohfyxxbct", //Scottish Golfer
      "did:plc:eadsauxkjxhiygdjg6iss552", //Winemaker from Oregon's Troon Vineyards
      "did:plc:66hjw7i6p2ay4z75n5cj4siy", //Troon Vineyards
      "did:plc:lsmcyezwzoxq46gw2fj3w7fr", // Scotish Government
    ],
  },
  {
    label: "monitor-slur",
    comment: "Possible slur found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp(
      "(\\s(?:ZOG|kike|zio|towelhead|raghead|jihadi|Rapefugee|kafir|kaffir)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\s|(?:-zio\\b|\\bzio-))",
      "i",
    ),
    whitelist: new RegExp("zionist|zionism", "i"),
  },
  {
    label: "follow-farming",
    comment: "Follow farming hashtags found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "blueskyfollower\.com|#ifbap|#socialistsunday|#follow4follow|#followback|#bluecrew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donkpack|#donkparty|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#donkconnects|#ifollowback|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|#FreedomFightersRise|#fridaynightparties|#UnitedBlueCrew|#(Friday|Saturday|Sunday)Parties",
      "iu",
    ),
  },
  {
    label: "suspect-inauthentic",
    comment: "Suspected inauthentic behavior found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:antimagaclub\\.com|pleniiixa\\.blogspot\\.com)",
      "i",
    ),
    ignoredDIDs: ["did:plc:m6k7ju4wcwnwa67mnhgjc2vc"], // Labeled already but hasn't been taken down
  },
  {
    label: "troll",
    comment: "Trolling found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp(
      "only (2|two) genders((?=.*transition)(?=.*mental health challenges)(?=.*love)(?=.*ideology))|trump is (your ?)(king|god|jesus|daddy)|(there (are|is))? only (two|2) genders|Colony of New Twitter|bluecry|mutilate (adolescents|kids|children)|Floyd.*convicted|[Gg]eorge.*[Ff]entanyl|Lolcow|YWNBAW",
      "i",
    ),
  },
  {
    label: "terf-gc",
    comment: "TERF rhetoric found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp("protect women's sports|protect womens sports", "i"),
  },
];

export const STARTERPACK_CHECKS: Checks[] = [
  {
    label: "follow-farming",
    comment: "Follow farming hashtags found Starter Pack",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "blueskyfollower\.com|#ifbap|#socialistsunday|#follow4follow|#followback|#bluecrew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donkpack|#donkparty|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#donkconnects|#ifollowback|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|bluecrew|Blue Crew",
      "i",
    ),
    knownVectors: [
      "did:plc:t4q27bc5gswob4zskgcqi4b6",
      "did:plc:sw7f3v37hcnxj3424mxg5iqc",
      "did:plc:ac2ouzqymr32xttu35cszvyh",
      "did:plc:tvhxyyebhdhkwywry3gxgnl3",
    ],
  },
  {
    label: "blue-heart-emoji",
    comment: "💙 found in Starter Pack",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "💙🌊|🌊💙|💙{2,}|(?<=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#fbpe|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA).*?💙|💙.*?(?=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#fbpe|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA)",
      "u",
    ),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜💙|💚💙|💙🤍🕊|☂💙|🩵🩷🤍🩷🩵|💙🩷🤍🩷💙|💙💜(💖|💗|🩷|❤️)|(🤍)?💛💙|💙📚|💙⚾️|⚾️💙",
      "u",
    ),
    ignoredDIDs: [
      "did:plc:knoepjiqknech5vqiht4bqu6", // buffer.com
      "did:plc:nostcgoz3uy27lco4gqr62io", // Not using hearts for political reasons
      "did:plc:eh7qf2qmtt4kv54evponoo6n", // Used as part of a large bi-flag
      "did:plc:5sxudf4p3inc7zwecaivoiwu", // Bailey is not the type we need to label
      "did:plc:pb55xcxhvzkpbjxh4blel63z", // KCRoyals Fan
    ],
  },
  {
    label: "contains-slur",
    comment: "Slur found in Starter Pack",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(retarded|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
      "i",
    ),
    whitelist: new RegExp(
      "Troon,? (Ayrshire|Scotland|🏴󠁧󠁢󠁳󠁣󠁴󠁿)|(?<=Royal )Troon|Troon Vineyard|\\bsnigger(s)?",
      "i",
    ),
  },
  {
    label: "troll",
    comment: "Trolling found in Starter Pack",
    description: true,
    displayName: true,
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("Colony of New Twitter|bluecry", "i"),
  },
];
