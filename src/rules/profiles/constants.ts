import { Checks } from "../../types.js";
export const PROFILE_CHECKS: Checks[] = [
  {
    language: ["eng"],
    label: "follow-farming",
    comment: "Follow farming hashtags found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "blueskyfollower\\.com|#ifbap|#socialistsunday|#follow4follow|#i?followback|#blue(crew|wave)|#breakfastcrew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donk(party|pack|connects|\\b)|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|#UnitedBlueCrew",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:kyh3c4gpfdxp7xgxy6hodtpu", // Has #bluecrew in bio but not engaged in other behaviors and only follows 600 people.
      "did:plc:cqlpijusxuy4u3viikknppyv", // Annoying but not a follow-farmer in the way we tend to track
    ],
  },
  {
    language: ["eng"],
    label: "blue-heart-emoji",
    comment: "💙 found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "[🩵💙]🌊|🌊[💙🩵]|[🩵💙]{2,}|(?<=#Resist|#Bluecrew|#donksfriends|#socialistsunday|#nodemunder(?:1|5|10)k|#megaboost|#donk(?:pack|party|connects)|#bluestorm(?:boosts|friends)|#fbr|#fbrparty|#fbarmy|🚫 MAGA).*?[🩵💙]|[🩵💙].*?(?=#Resist|#Bluecrew|#donksfriends|#socialistsunday|#nodemunder(?:1|5|10)k|#megaboost|#donk(?:pack|party|connects)|#bluestorm(?:boosts|friends)|#fbr|#fbrparty|#fbarmy|🚫 MAGA)",
      "u",
    ),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜[💙🩵]|💚💙|💙🤍🕊|☂💙|[💙🩵]🩷🤍🩷[💙🩵]|[💙🩵]💜(💖|💗|🩷|❤️)|(🤍)?💛💙|💙💛|💙📚|💙⚾️|⚾️💙|🩷❤️🧡💛💚🩵💙🖤|🩵💙💚🤍🧡❤️🩷|🧡💛🤍🩵💙|💜🩷💛🩵💙",
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
      "did:plc:lf32xdw4jez2vkxbcl2wbncu", // Michigan
      "did:plc:u5lvtp6ai6mg25xgazc4m7gv", // Random not political vtuber
      "did:plc:eqh433fdh2bqhvt455e3tg67", // doing a bit
      "did:plc:265db7sm562y3622h3t62koz", // False positive
      "did:plc:wuakswcypemayqaawz63yev4", // False Positive
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
      "💘📲 👉👌|getallmylinks\\.com/(alexxmini|eviepie|camisosa|cuteyalex|alexiaarmaniii|janeyy|yourbella|urjane|onlylara|lliiyy[0-9]*?|lilyscottx|janesworld|sarahheree[0-9]*?|bellasdream|amberbunnyxx|anatoom|cutexjaney|arianaslavens1sb|faykatz|freeliz)|snipfeed\\.co/(jaxtravis)|hoo\\.be/(marcroseonly)|saweria\\.co/(coltliqekajaya)|linktr\\.ee/(marcroseof|yourfavlegs|diazchat|dianadickzzy)|instagram\\.com/(pixiexbelle|thatsmolpotatoxx|lizz.mlst)|planoly\\.store/(chloeeadams[0-9]*?)|(didunddkjd|alycemi|alessakiss83|faykatz|laurenbabygirl|babyalexis|vortexdancer|aigc-island-?[a-z0-9]+?|maggystn)\\.bsky\\.social|beacons\\.ai/(dianadicksy|dianadickzzy)|(lolizy|liizzyyyy|lizzikissi|janeangel|ALEXsWOrld|CUTeyBELLa|shinyalex).carrd.co|onlyfans\\.com/(aliceeeeeeeeeeeeee|avafiery|kawaiilavina)|bit\\.ly/([a-zA-Z]+?nora[a-zA-Z]+?|[a-zA-Z]+?naomi[a-zA-Z]+?)|t\\.me/(thaliaballard|Goon_mommi)|is\\.gd/((aleksandriaqt|alexithaqt|lexieqt|lara)[0-9]{1,4}|19 💕 your dream girl 🍓 spicy|alexx.crd.co|18 🌷 Your lil dream girl 😇 FREE OF ⤵️|Blessica Blimpton|tiny\\.cc/jessica[0-9]{3,}|tinyurl\\.com/xsarahCM8N)|ishortn\\.ink/(Princes{1,3}Lily{1,3})[0-9]{1,4}|mypages\\.life/(Arianna-try-[0-9]{1,4})|lilyslittlesecret\\.life|lilyspicypage\\.life|lizzyyy\\.short\\.gy|sasoa\\.short\\.gy|linktomy\\.site/onlyfans/georgia|38d.gs/.+|antimagaclub\\.com|shorturl\\.at/(8M8H|9MVL2|ro7Tt|Wn2jQ)|linktr\\.ee/RabbiRothschild|youtube\\.com/results?search_query=rabbi+rothschild&sp=EgJAAQ%253D%253D|rabbirothschild\\.blogspot\\.com|testyourself\\.now|tinyurl\\.com/stdTestSafe|Bluesky\\.Shop|beacons\\.ai/arixsb|talk to me there👇",
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
  /*{
    label: "spammy",
    comment: "Account is suspected to be inauthentic or spammy. Please review.",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: true,
    toLabel: false,
    check: new RegExp(
      "Verified by (Molly (Shah|Shane)|@mommunism)|Verified by Molly",
      "i",
    ),
  },*/
  {
    label: "suspect-inauthentic",
    comment: "Link in bio correlated with multiple accounts",
    description: true,
    displayName: true,
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:gofund\\.me/(fec526f5))",
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
      "only[ -]?(two|2)[ -]?genders?|genders?[ -]?only[ -]?2|[o0]n[l1]y ?([t7][wvv][o0]|2) ?[g9][e3][n][d][e3][r][s5]?|groyper|kiwi-?farms?|blueskycuck|[o0]n[l1]y([t7][wvv][o0]|2)[g9][e3][n][d][e3][r][s5]?|raypist|grayper|graypist|soyjack\\.party|soyjack\\.st|soybooru\\.com|archive\\.soyjack\\.st|rdrama\\.net|watchpeopledie\\.tv|kiwifrms\\.st|jewhater|jewhater[0-9]+|soyjak|troonjak|kamalasu(cks|x)|p[e3]d[o0]hunter|watchpeopledie\\.tv|reportgod\\.group|Transwomen are (male|men)|Humans cannot change sex|🚫[ #]*illegals|jointhe41percent-[0-9]+|gabzzzsatan|ni[a-zA-Z0-9]+rni[a-zA-Z0-9]+r|lgb✂️tq|rightmemenews\\.com|[nh]ate ?[nh]iggers?|MAGA Colony|Bluecry|White lives matter|#IStandWthSandiePeggie|#SexMatters|FireCombatGlue",
      "i",
    ),
    whitelist: new RegExp("(anti|[🚫]|DNI)[ -:]?groyper", "i"),
    ignoredDIDs: [
      "did:plc:lmuoejh44euyubyxynofwavg", // Has "Anti-Groyper" in their profile and this was getting flagged before I refactored the whitelist regex.
      "did:plc:6shlnipfibgipafcp77wy7qr", // No idea why this is getting flagged.
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
      "#(MAGA|MAHA)\\b|#Trump ?202(4|8)🇺🇸?|((real|president|king|queen)? ?(barron|donald|eric|ivan(k)?a|tiffany|melenia) ?(john|j)? ?((trump)( |, )?(jr)?))\\b|(proud|king)magat?\\b|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))\\b|potus(45|46|47)\\b|ultramagat?\\b|maga [0-9]{2,4}\\b|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))\\b|🇺🇸 MAGA 🇺🇸|MAGA|^MAGA$|Love Trump",
      "i",
    ),
    whitelist: new RegExp(
      "(#?(?<=Never|Fuck|anti|🚫|DNI|Remove|🖕))[ -:]{0,2}((#)?(Donald[ -:]?)?Trump|MAGA(t)?|DJT)|#?((Donald)?[ -:]?Trump[ -:]?Hater|magazine|stop[ -:]?project[ -:]?2025|MAGA[ :]DNI)",
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
      "did:plc:rxfutzaujbo5tv3nsrzfgvqe", // Not MAGA
      "did:plc:6shlnipfibgipafcp77wy7qr",
      "did:plc:b2ecyhl2z2tro25ltrcyiytd", // DHS
      "did:plc:iw2wxg46hm4ezguswhwej6t6", // actual whitehouse
      "did:plc:fhnl65q3us5evynqc4f2qak6", // HHS
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
      "#(MAGA|MAHA)\\b|#Trump ?2024🇺🇸?|#Trump20(24|28|32|36|48)|(proud|king)magat?|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultra ?magat?|maga [0-9]{2,4}|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))|(god|jesus|lord) ?(bless(es)?|loves?).{0,20}?trump|(?:Vance2028|Vance([a-zA-Z]+)2028|Vance([a-zA-Z]+)28|Vance48)|🇺🇸 MAGA 🇺🇸|#?WWG1WGA|^MAGA$|Love Trump",
      "i",
    ),
    whitelist: new RegExp(
      "(don'?t|not|never|no|anti|fuck|hate|despise|oppose|resist|against|dump|down with|🚫|DNI|Remove|🖕|❌️|🚫NO).{0,30}?(trump|maga(t)?|djt)|(trump|maga(t)?|djt).{0,30}?(sucks|terrible|awful|horrible|threat|danger|fascis[tm]|nazi|tyrant|criminal|felon|loser|idiot|cult|worst|evil|disgrace|traitor|conman|fraud)|#(Never|Fuck|Dump|Resist|Stop|Anti|No)(Trump|MAGA|DJT)|#Trump(Sucks|Threat|Criminal|Cult|Lies)|#AntiMAGA|#MAGA.{0,5}?DNI|#MAGA ?🚫|(donald)?[ -:]?trump[ -:]?(hater|sucks)|(stop|oppose|fight|resist|against|fuck|end|ban).{0,20}?project.{0,5}?2025|project.{0,5}?2025.{0,20}?(threat|danger|scary|terrif)|(convicted|felon|criminal|rapist).{0,20}?trump|trump.{0,20}?(convicted|felon|criminal|rapist|guilty)|magazine|🚫{0,5}?(trump|maga|djt)|(trump|maga|djt){0,5}?🚫",
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
      "did:plc:rxfutzaujbo5tv3nsrzfgvqe", // Not MAGA
      "did:plc:wrprhfzhsa4f3fvjgqm2sos7", // False positive
      "did:plc:iw2wxg46hm4ezguswhwej6t6", // actual whitehouse
      "did:plc:b2ecyhl2z2tro25ltrcyiytd", // DHS
      "did:plc:fhnl65q3us5evynqc4f2qak6", // HHS
      "did:plc:n2mk6auyfotqdcjo7gu23s4m",
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
      "elon([r0-9]?musk|.*musk|reevesmusk)|Adrian[ -]?Dittmann|Doge-?Father",
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
    check: new RegExp(
      "patriotfront\\.us|nazigamingclan\\.com|卐|\\bHH ?1488\\b",
      "i",
    ),
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
    language: ["eng"],
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
    language: ["eng"],
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
    language: ["eng"],
    label: "contains-slur",
    comment: "Slur found in profile",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "\\b(retard(ed|s)?|mongoloid|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
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
      "did:plc:nbyonvtuc7l5onssae2as3ns", // Uses the word troon in a reclaimed manner
      "did:plc:65rlhxbruzs4lkqcgu2necml", // scottish
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
