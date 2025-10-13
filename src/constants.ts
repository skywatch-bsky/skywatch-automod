import { Checks } from "./types.js";

export const LINK_SHORTENER = new RegExp(
  "\\b(https?:\\/\\/)?([^.]+\\.)?(tinyurl\\.com|bit\\.ly/|goo\\.gl|g\\.co/|ow\\.ly/|shorturl\\.at|t\\.co|go\\.bsky\\.app|dlvrit\\.com|t\\.me|is\\.gd|v\\.gd|kutt\\.it|simpleURL\\.tech|sor\\.bz|shorturl\\.73\\.nu|bitly\\.com|bitly\\.kr|bl\\.ink|buff\\.ly|clicky\\.me|cutt\\.ly|dub\\.co|foxlyme\\.com|gg\\.gg|han\\.gl|is\\.gd|kurzelinks\\.de|kutt\\.it|linkhuddle\\.com|linksplit\\.iourl-shortener|lstu\\.fr|name\\.combranded-url-shortener|oe\\.cd|ow\\.ly|rebrandly\\.com|reduced\\.to|rip\\.to|san\\.aq|short\\.io|shorten-url\\.com|smallseotools\\.com/url-shortener|spoo\\.me|switchy\\.io|t2mio\\.com|tinu\\.be|tiny\\.cc|t\\.ly|urlr\\.meen|v\\.gd|vo\\.la|yaso\\.su|zlnk\\.com|dub\\.co|polrproject\\.org|reduced\\.to|shlink\\.io|yourls\\.org|nabil\\.bio|0\\.gp|02faq\\.com|0a\\.sk|101\\.gg|12ne\\.ws|17mimei\\.club|1drv\\.ms|1ea\\.ir|1kh\\.de|1o2\\.ir|1shop\\.io|1u\\.fi|1un\\.fr|1url\\.cz|2\\.gp|2\\.ht|2\\.ly|2doc\\.net|2fear\\.com|2kgam\\.es|2link\\.cc|2nu\\.gs|2pl\\.us|2u\\.lc|2u\\.pw|2wsb\\.tv|3\\.cn|3\\.ly|301\\.link|3le\\.ru|4\\.gp|4\\.ly|49rs\\.co|4sq\\.com|5\\.gp|53eig\\.ht|5du\\.pl|5w\\.fit|6\\.gp|6\\.ly|69run\\.fun|6g6\\.eu|7\\.ly|707\\.su|71a\\.xyz|7news\\.link|7ny\\.tv|7oi\\.de|8\\.ly|89q\\.sk|92url\\.com|985\\.so|98pro\\.cc|9mp\\.com|9splay\\.store|a\\.189\\.cn|a\\.co|a360\\.co|aarp\\.info|ab\\.co|abc\\.li|abc11\\.tv|abc13\\.co|abc7\\.la|abc7\\.ws|abc7ne\\.ws|abcn\\.ws|abe\\.ma|abelinc\\.me|abnb\\.me|abr\\.ai|abre\\.ai|accntu\\.re|accu\\.ps|acer\\.co|acer\\.link|aces\\.mp|acortar\\.link|act\\.gp|acus\\.org|adaymag\\.co|adbl\\.co|adfoc\\.us|adm\\.to|adobe\\.ly|adol\\.us|adweek\\.it|aet\\.na|agrd\\.io|ai6\\.net|aje\\.io|aka\\.ms|al\\.st|alexa\\.design|alli\\.pub|alnk\\.to|alpha\\.camp|alphab\\.gr|alturl\\.com|amays\\.im|amba\\.to|amc\\.film|amex\\.co|ampr\\.gs|amrep\\.org|amz\\.run|amzn\\.com|amzn\\.pw|amzn\\.to|ana\\.ms|anch\\.co|ancstry\\.me|andauth\\.co|anon\\.to|anyimage\\.io|aol\\.it|aon\\.io|apne\\.ws|app\\.philz\\.us|apple\\.co|apple\\.news|aptg\\.tw|arah\\.in|arc\\.ht|arkinv\\.st|asics\\.tv|asin\\.cc|asq\\.kr|asus\\.click|at\\.vibe\\.com|atm\\.tk|atmilb\\.com|atmlb\\.com|atres\\.red|autode\\.sk|avlne\\.ws|avlr\\.co|avydn\\.co|axios\\.link|axoni\\.us|ay\\.gy|azc\\.cc|b-gat\\.es|b\\.link|b\\.mw|b23\\.ru|b23\\.tv|b2n\\.ir|baratun\\.de|bayareane\\.ws|bbc\\.in|bbva\\.info|bc\\.vc|bca\\.id|bcene\\.ws|bcove\\.video|bcsite\\.io|bddy\\.me|beats\\.is|benqurl\\.biz|beth\\.games|bfpne\\.ws|bg4\\.me|bhpho\\.to|bigcc\\.cc|bigfi\\.sh|biggo\\.tw|biibly\\.com|binged\\.it|bit\\.ly|bitly\\.com|bitly\\.is|bitly\\.lc|bityl\\.co|bl\\.ink|blap\\.net|blbrd\\.cm|blck\\.by|blizz\\.ly|bloom\\.bg|blstg\\.news|blur\\.by|bmai\\.cc|bnds\\.in|bnetwhk\\.com|bo\\.st|boa\\.la|boile\\.rs|bom\\.so|bonap\\.it|booki\\.ng|bookstw\\.link|bose\\.life|boston25\\.com|bp\\.cool|br4\\.in|bravo\\.ly|bridge\\.dev|brief\\.ly|brook\\.gs|browser\\.to|bst\\.bz|bstk\\.me|btm\\.li|btwrdn\\.com|budurl\\.com|buff\\.ly|bung\\.ie|bwnews\\.pr|by2\\.io|bytl\\.fr|bzfd\\.it|bzh\\.me|c11\\.kr|c87\\.to|cadill\\.ac|can\\.al|canon\\.us|capital\\.one|capitalfm\\.co|captl1\\.co|careem\\.me|caro\\.sl|cart\\.mn|casio\\.link|cathaybk\\.tw|cathaysec\\.tw|cb\\.com|cbj\\.co|cbsloc\\.al|cbsn\\.ws|cbt\\.gg|cc\\.cc|cdl\\.booksy\\.com|centi\\.ai|cfl\\.re|chip\\.tl|chl\\.li|chn\\.ge|chn\\.lk|chng\\.it|chts\\.tw|chzb\\.gr|cin\\.ci|cindora\\.club|circle\\.ci|cirk\\.me|cisn\\.co|citi\\.asia|cjky\\.it|ckbe\\.at|cl\\.ly|clarobr\\.co|clc\\.am|clc\\.to|clck\\.ru|cle\\.clinic|cli\\.re|clickmeter\\.com|clicky\\.me|clr\\.tax|clvr\\.rocks|cmon\\.co|cmu\\.is|cmy\\.tw|cna\\.asia|cnb\\.cx|cnet\\.co|cnfl\\.io|cnn\\.it|cnnmon\\.ie|cnvrge\\.co|cockroa\\.ch|comca\\.st|come\\.ac|conta\\.cc|cookcenter\\.info|coop\\.uk|cort\\.as|coupa\\.ng|cplink\\.co|cr8\\.lv|crackm\\.ag|crdrv\\.co|credicard\\.biz|crwd\\.fr|crwd\\.in|crwdstr\\.ke|cs\\.co|csmo\\.us|cstu\\.io|ctbc\\.tw|ctfl\\.io|cultm\\.ac|cup\\.org|cut\\.lu|cut\\.pe|cutt\\.ly|cvent\\.me|cvs\\.co|cyb\\.ec|cybr\\.rocks|d-sh\\.io|da\\.gd|dai\\.ly|dailym\\.ai|dainik-b\\.in|datayi\\.cn|davidbombal\\.wiki|db\\.tt|dbricks\\.co|dcps\\.co|dd\\.ma|deb\\.li|dee\\.pl|deli\\.bz|dell\\.to|deloi\\.tt|dems\\.me|dhk\\.gg|di\\.sn|dibb\\.me|dis\\.gd|dis\\.tl|discord\\.gg|discvr\\.co|disq\\.us|dive\\.pub|djex\\.co|dk\\.rog\\.gg|dkng\\.co|dky\\.bz|dl\\.gl|dld\\.bz|dlsh\\.it|dlvr\\.it|dmdi\\.pl|dmreg\\.co|do\\.co|dockr\\.ly|dopice\\.sk|dpmd\\.ai|dpo\\.st|dssurl\\.com|dtdg\\.co|dtsx\\.io|dub\\.sh|dv\\.gd|dvrv\\.ai|dw\\.com|dwz\\.tax|dxc\\.to|dy\\.fi|dy\\.si|e\\.lilly|e\\.vg|ebay\\.to|econ\\.st|ed\\.gr|edin\\.ac|edu\\.nl|eepurl\\.com|efshop\\.tw|ela\\.st|elle\\.re|ellemag\\.co|embt\\.co|emirat\\.es|engt\\.co|enshom\\.link|entm\\.ag|envs\\.sh|epochtim\\.es|ept\\.ms|eqix\\.it|es\\.pn|es\\.rog\\.gg|escape\\.to|esl\\.gg|eslite\\.me|esqr\\.co|esun\\.co|etoro\\.tw|etp\\.tw|etsy\\.me|everri\\.ch|exe\\.io|exitl\\.ag|ezstat\\.ru|f1\\.com|f5yo\\.com|fa\\.by|fal\\.cn|fam\\.ag|fandan\\.co|fandom\\.link|fandw\\.me|faras\\.link|faturl\\.com|fav\\.me|fave\\.co|fb\\.me|fb\\.watch|fbstw\\.link|fce\\.gg|fetnet\\.tw|fevo\\.me|ff\\.im|fifa\\.fans|firsturl\\.de|firsturl\\.net|flic\\.kr|flip\\.it|flomuz\\.io|flq\\.us|fltr\\.ai|flx\\.to|fmurl\\.cc|fn\\.gg|fnb\\.lc|foodtv\\.com|fooji\\.info|ford\\.to|forms\\.gle|forr\\.com|found\\.ee|fox\\.tv|fr\\.rog\\.gg|frdm\\.mobi|fstrk\\.cc|ftnt\\.net|fumacrom\\.com|fvrr\\.co|fwme\\.eu|fxn\\.ws|g-web\\.in|g\\.asia|g\\.co|g\\.page|ga\\.co|gandi\\.link|garyvee\\.com|gaw\\.kr|gbod\\.org|gbpg\\.net|gbte\\.tech|gclnk\\.com|gdurl\\.com|gek\\.link|gen\\.cat|geni\\.us|genie\\.co\\.kr|getf\\.ly|geti\\.in|gfuel\\.ly|gh\\.io|ghkp\\.us|gi\\.lt|gigaz\\.in|git\\.io|github\\.co|gizmo\\.do|gjk\\.id|glbe\\.co|glblctzn\\.co|glblctzn\\.me|gldr\\.co|glmr\\.co|glo\\.bo|gma\\.abc|gmj\\.tw|go-link\\.ru|go\\.aws|go\\.btwrdn\\.co|go\\.cwtv\\.com|go\\.dbs\\.com|go\\.edh\\.tw|go\\.gcash\\.com|go\\.hny\\.co|go\\.id\\.me|go\\.intel-academy\\.com|go\\.intigriti\\.com|go\\.jc\\.fm|go\\.lamotte\\.fr|go\\.lu-h\\.de|go\\.ly|go\\.nasa\\.gov|go\\.nowth\\.is|go\\.osu\\.edu|go\\.qb\\.by|go\\.rebel\\.pl|go\\.shell\\.com|go\\.shr\\.lc|go\\.sony\\.tw|go\\.tinder\\.com|go\\.usa\\.gov|go\\.ustwo\\.games|go\\.vic\\.gov\\.au|godrk\\.de|gomomento\\.co|goo-gl\\.me|goo\\.by|goo\\.gl|goo\\.gle|goo\\.su|goolink\\.cc|goolnk\\.com|gosm\\.link|got\\.cr|got\\.to|gov\\.tw|gowat\\.ch|gph\\.to|gq\\.mn|gr\\.pn|grb\\.to|grdt\\.ai|grm\\.my|grnh\\.se|gtly\\.ink|gtly\\.to|gtne\\.ws|gtnr\\.it|gym\\.sh|haa\\.su|han\\.gl|hashi\\.co|hbaz\\.co|hbom\\.ax|her\\.is|herff\\.ly|hf\\.co|hi\\.kktv\\.to|hi\\.sat\\.cool|hi\\.switchy\\.io|hicider\\.com|hideout\\.cc|hill\\.cm|histori\\.ca|hmt\\.ai|hnsl\\.mn|homes\\.jp|hp\\.care|hpe\\.to|hrbl\\.me|href\\.li|ht\\.ly|htgb\\.co|htl\\.li|htn\\.to|httpslink\\.com|hubs\\.la|hubs\\.li|hubs\\.ly|huffp\\.st|hulu\\.tv|huma\\.na|hyperurl\\.co|hyperx\\.gg|i-d\\.co|i\\.coscup\\.org|i\\.mtr\\.cool|ibb\\.co|ibf\\.tw|ibit\\.ly|ibm\\.biz|ibm\\.co|ic9\\.in|icit\\.fr|icks\\.ro|iea\\.li|ifix\\.gd|ift\\.tt|iherb\\.co|ihr\\.fm|ii1\\.su|iii\\.im|il\\.rog\\.gg|ilang\\.in|illin\\.is|iln\\.io|ilnk\\.io|imdb\\.to|ind\\.pn|indeedhi\\.re|indy\\.st|infy\\.com|inlnk\\.ru|insig\\.ht|instagr\\.am|intel\\.ly|interc\\.pt|intuit\\.me|invent\\.ge|inx\\.lv|ionos\\.ly|ipgrabber\\.ru|ipgraber\\.ru|iplogger\\.co|iplogger\\.com|iplogger\\.info|iplogger\\.org|iplogger\\.ru|iplwin\\.us|iqiyi\\.cn|irng\\.ca|is\\.gd|isw\\.pub|itsh\\.bo|itvty\\.com|ity\\.im|ix\\.sk|j\\.gs|j\\.mp|ja\\.cat|ja\\.ma|jb\\.gg|jcp\\.is|jkf\\.lv|jnfusa\\.org|joo\\.gl|jp\\.rog\\.gg|jpeg\\.ly|k-p\\.li|kas\\.pr|kask\\.us|katzr\\.net|kbank\\.co|kck\\.st|kf\\.org|kfrc\\.co|kg\\.games|kgs\\.link|kham\\.tw|kings\\.tn|kkc\\.tech|kkday\\.me|kkne\\.ws|kko\\.to|kkstre\\.am|kl\\.ik\\.my|klck\\.me|kli\\.cx|klmf\\.ly|ko\\.gl|kortlink\\.dk|kotl\\.in|kp\\.org|kpmg\\.ch|krazy\\.la|kuku\\.lu|kurl\\.ru|kutt\\.it|ky77\\.link|l\\.linklyhq\\.com|l\\.prageru\\.com|l8r\\.it|laco\\.st|lam\\.bo|lat\\.ms|latingram\\.my|lativ\\.tw|lbtw\\.tw|lc\\.cx|learn\\.to|lego\\.build|lemde\\.fr|letsharu\\.cc|lft\\.to|lih\\.kg|lihi\\.biz|lihi\\.cc|lihi\\.one|lihi\\.pro|lihi\\.tv|lihi\\.vip|lihi1\\.cc|lihi1\\.com|lihi1\\.me|lihi2\\.cc|lihi2\\.com|lihi2\\.me|lihi3\\.cc|lihi3\\.com|lihi3\\.me|lihipro\\.com|lihivip\\.com|liip\\.to|lin\\.ee|lin0\\.de|link\\.ac|link\\.infini\\.fr|link\\.tubi\\.tv|linkbun\\.com|linkd\\.in|linkjust\\.com|linko\\.page|linkopener\\.co|links2\\.me|linkshare\\.pro|linkye\\.net|livemu\\.sc|livestre\\.am|llk\\.dk|llo\\.to|lmg\\.gg|lmt\\.co|lmy\\.de|ln\\.run|lnk\\.bz|lnk\\.direct|lnk\\.do|lnk\\.sk|lnkd\\.in|lnkiy\\.com|lnkiy\\.in|lnky\\.jp|lnnk\\.in|lnv\\.gy|lohud\\.us|lonerwolf\\.co|loom\\.ly|low\\.es|lprk\\.co|lru\\.jp|lsdl\\.es|lstu\\.fr|lt27\\.de|lttr\\.ai|ludia\\.gg|luminary\\.link|lurl\\.cc|lyksoomu\\.com|lzd\\.co|m\\.me|m\\.tb\\.cn|m101\\.org|m1p\\.fr|maac\\.io|maga\\.lu|man\\.ac\\.uk|many\\.at|maper\\.info|mapfan\\.to|mayocl\\.in|mbapp\\.io|mbayaq\\.co|mcafee\\.ly|mcd\\.to|mcgam\\.es|mck\\.co|mcys\\.co|me\\.sv|me2\\.kr|meck\\.co|meetu\\.ps|merky\\.de|metamark\\.net|mgnet\\.me|mgstn\\.ly|michmed\\.org|migre\\.me|minify\\.link|minilink\\.io|mitsha\\.re|mklnd\\.com|mm\\.rog\\.gg|mney\\.co|mng\\.bz|mnge\\.it|mnot\\.es|mo\\.ma|momo\\.dm|monster\\.cat|moo\\.im|moovit\\.me|mork\\.ro|mou\\.sr|mpl\\.pm|mrte\\.ch|mrx\\.cl|ms\\.spr\\.ly|msft\\.it|msi\\.gm|mstr\\.cl|mttr\\.io|mub\\.me|munbyn\\.biz|mvmtwatch\\.co|my\\.mtr\\.cool|mybmw\\.tw|myglamm\\.in|mylt\\.tv|mypoya\\.com|myppt\\.cc|mysp\\.ac|myumi\\.ch|myurls\\.ca|mz\\.cm|mzl\\.la|n\\.opn\\.tl|n\\.pr|n9\\.cl|name\\.ly|nature\\.ly|nav\\.cx|naver\\.me|nbc4dc\\.com|nbcbay\\.com|nbcchi\\.com|nbcct\\.co|nbcnews\\.to|nbzp\\.cz|nchcnh\\.info|nej\\.md|neti\\.cc|netm\\.ag|nflx\\.it|ngrid\\.com|njersy\\.co|nkbp\\.jp|nkf\\.re|nmrk\\.re|nnn\\.is|nnna\\.ru|nokia\\.ly|notlong\\.com|nr\\.tn|nswroads\\.work|ntap\\.com|ntck\\.co|ntn\\.so|ntuc\\.co|nus\\.edu|nvda\\.ws|nwppr\\.co|nwsdy\\.li|nxb\\.tw|nxdr\\.co|nycu\\.to|nydn\\.us|nyer\\.cm|nyp\\.st|nyr\\.kr|nyti\\.ms|o\\.vg|oal\\.lu|obank\\.tw|ock\\.cn|ocul\\.us|oe\\.cd|ofcour\\.se|offerup\\.co|offf\\.to|offs\\.ec|okt\\.to|omni\\.ag|on\\.bcg\\.com|on\\.bp\\.com|on\\.fb\\.me|on\\.ft\\.com|on\\.louisvuitton\\.com|on\\.mktw\\.net|on\\.natgeo\\.com|on\\.nba\\.com|on\\.ny\\.gov|on\\.nyc\\.gov|on\\.nypl\\.org|on\\.tcs\\.com|on\\.wsj\\.com|on9news\\.tv|onelink\\.to|onepl\\.us|onforb\\.es|onion\\.com|onx\\.la|oow\\.pw|opr\\.as|opr\\.news|optimize\\.ly|oran\\.ge|orlo\\.uk|osdb\\.link|oshko\\.sh|ouo\\.io|ouo\\.press|ourl\\.co|ourl\\.in|ourl\\.tw|outschooler\\.me|ovh\\.to|ow\\.ly|owl\\.li|owy\\.mn|oxelt\\.gl|oxf\\.am|oyn\\.at|p\\.asia|p\\.dw\\.com|p1r\\.es|p4k\\.in|pa\\.ag|packt\\.link|pag\\.la|pchome\\.link|pck\\.tv|pdora\\.co|pdxint\\.at|pe\\.ga|pens\\.pe|peoplem\\.ag|pepsi\\.co|pesc\\.pw|petrobr\\.as|pew\\.org|pewrsr\\.ch|pg3d\\.app|pgat\\.us|pgrs\\.in|philips\\.to|piee\\.pw|pin\\.it|pipr\\.es|pj\\.pizza|pl\\.kotl\\.in|pldthome\\.info|plu\\.sh|pnsne\\.ws|pod\\.fo|poie\\.ma|pojonews\\.co|politi\\.co|popm\\.ch|posh\\.mk|pplx\\.ai|ppt\\.cc|ppurl\\.io|pr\\.tn|prbly\\.us|prdct\\.school|preml\\.ge|prf\\.hn|prgress\\.co|prn\\.to|propub\\.li|pros\\.is|psce\\.pw|pse\\.is|psee\\.io|pt\\.rog\\.gg|ptix\\.co|puext\\.in|purdue\\.university|purefla\\.sh|puri\\.na|pwc\\.to|pxgo\\.net|pxu\\.co|pzdls\\.co|q\\.gs|qnap\\.to|qptr\\.ru|qr\\.ae|qr\\.net|qrco\\.de|qrs\\.ly|qvc\\.co|r-7\\.co|r\\.zecz\\.ec|rb\\.gy|rbl\\.ms|rblx\\.co|rch\\.lt|rd\\.gt|rdbl\\.co|rdcrss\\.org|rdcu\\.be|read\\.bi|readhacker\\.news|rebelne\\.ws|rebrand\\.ly|reconis\\.co|red\\.ht|redaz\\.in|redd\\.it|redir\\.ec|redir\\.is|redsto\\.ne|ref\\.trade\\.re|referer\\.us|refini\\.tv|regmovi\\.es|reline\\.cc|relink\\.asia|rem\\.ax|renew\\.ge|replug\\.link|rethinktw\\.cc|reurl\\.cc|reut\\.rs|rev\\.cm|revr\\.ec|rfr\\.bz|ringcentr\\.al|riot\\.com|rip\\.city|risu\\.io|ritea\\.id|rizy\\.ir|rlu\\.ru|rly\\.pt|rnm\\.me|ro\\.blox\\.com|rog\\.gg|roge\\.rs|rol\\.st|rotf\\.lol|rozhl\\.as|rpf\\.io|rptl\\.io|rsc\\.li|rsh\\.md|rtvote\\.com|ru\\.rog\\.gg|rushgiving\\.com|rvtv\\.io|rvwd\\.co|rwl\\.io|ryml\\.me|rzr\\.to|s\\.accupass\\.com|s\\.coop|s\\.ee|s\\.g123\\.jp|s\\.id|s\\.mj\\.run|s\\.ul\\.com|s\\.uniqlo\\.com|s\\.wikicharlie\\.cl|s04\\.de|s3vip\\.tw|saf\\.li|safelinking\\.net|safl\\.it|sail\\.to|samcart\\.me|sbird\\.co|sbux\\.co|sbux\\.jp|sc\\.mp|sc\\.org|sched\\.co|sck\\.io|scr\\.bi|scrb\\.ly|scuf\\.co|sdpbne\\.ws|sdu\\.sk|sdut\\.us|se\\.rog\\.gg|seagate\\.media|sealed\\.in|seedsta\\.rs|seiu\\.co|sejr\\.nl|selnd\\.com|seq\\.vc|sf3c\\.tw|sfca\\.re|sfcne\\.ws|sforce\\.co|sfty\\.io|sgq\\.io|shar\\.as|shiny\\.link|shln\\.me|sho\\.pe|shope\\.ee|shorl\\.com|short\\.gy|shorten\\.asia|shorten\\.ee|shorten\\.is|shorten\\.so|shorten\\.tv|shorten\\.world|shorter\\.me|shorturl\\.ae|shorturl\\.asia|shorturl\\.at|shorturl\\.com|shorturl\\.gg|shp\\.ee|shrtm\\.nu|sht\\.moe|shutr\\.bz|sie\\.ag|simp\\.ly|sina\\.lt|sincere\\.ly|sinourl\\.tw|sinyi\\.biz|sinyi\\.in|siriusxm\\.us|siteco\\.re|skimmth\\.is|skl\\.sh|skrat\\.it|skyurl\\.cc|slidesha\\.re|small\\.cat|smart\\.link|smarturl\\.it|smashed\\.by|smlk\\.es|smsb\\.co|smsng\\.news|smsng\\.us|smtvj\\.com|smu\\.gs|snd\\.sc|sndn\\.link|snip\\.link|snip\\.ly|snyk\\.co|so\\.arte|soc\\.cr|soch\\.us|social\\.ora\\.cl|socx\\.in|sokrati\\.ru|solsn\\.se|sou\\.nu|sourl\\.cn|sovrn\\.co|spcne\\.ws|spgrp\\.sg|spigen\\.co|split\\.to|splk\\.it|spoti\\.fi|spotify\\.link|spr\\.ly|spr\\.tn|sprtsnt\\.ca|sqex\\.to|sqrx\\.io|squ\\.re|srnk\\.us|ssur\\.cc|st\\.news|st8\\.fm|stanford\\.io|starz\\.tv|stmodel\\.com|storycor\\.ps|stspg\\.io|stts\\.in|stuf\\.in|sumal\\.ly|suo\\.fyi|suo\\.im|supr\\.cl|supr\\.link|surl\\.li|svy\\.mk|swa\\.is|swag\\.run|swiy\\.co|swoo\\.sh|swtt\\.cc|sy\\.to|syb\\.la|synd\\.co|syw\\.co|t-bi\\.link|t-mo\\.co|t\\.cn|t\\.co|t\\.iotex\\.me|t\\.libren\\.ms|t\\.ly|t\\.me|t\\.tl|t1p\\.de|t2m\\.io|ta\\.co|tabsoft\\.co|taiwangov\\.com|tanks\\.ly|tbb\\.tw|tbrd\\.co|tcrn\\.ch|tdrive\\.li|tdy\\.sg|tek\\.io|temu\\.to|ter\\.li|tg\\.pe|tgam\\.ca|tgr\\.ph|thatis\\.me|thd\\.co|thedo\\.do|thefp\\.pub|thein\\.fo|thesne\\.ws|thetim\\.es|thght\\.works|thinfi\\.com|thls\\.co|thn\\.news|thr\\.cm|thrill\\.to|ti\\.me|tibco\\.cm|tibco\\.co|tidd\\.ly|tim\\.com\\.vc|tinu\\.be|tiny\\.cc|tiny\\.ee|tiny\\.one|tiny\\.pl|tinyarro\\.ws|tinylink\\.net|tinyurl\\.com|tinyurl\\.hu|tinyurl\\.mobi|tktwb\\.tw|tl\\.gd|tlil\\.nl|tlrk\\.it|tmblr\\.co|tmsnrt\\.rs|tmz\\.me|tnne\\.ws|tnsne\\.ws|tnvge\\.co|tnw\\.to|tny\\.cz|tny\\.im|tny\\.so|to\\.ly|to\\.pbs\\.org|toi\\.in|tokopedia\\.link|tonyr\\.co|topt\\.al|toyota\\.us|tpc\\.io|tpmr\\.com|tprk\\.us|tr\\.ee|trackurl\\.link|trade\\.re|travl\\.rs|trib\\.al|trib\\.in|troy\\.hn|trt\\.sh|trymongodb\\.com|tsbk\\.tw|tsta\\.rs|tt\\.vg|tvote\\.org|tw\\.rog\\.gg|tw\\.sv|twb\\.nz|twm5g\\.co|twou\\.co|twtr\\.to|txdl\\.top|txul\\.cn|u\\.nu|u\\.shxj\\.pw|u\\.to|u1\\.mnge\\.co|ua\\.rog\\.gg|uafly\\.co|ubm\\.io|ubnt\\.link|ubr\\.to|ucbexed\\.org|ucla\\.in|ufcqc\\.link|ugp\\.io|ui8\\.ru|uk\\.rog\\.gg|ukf\\.me|ukoeln\\.de|ul\\.rs|ul\\.to|ul3\\.ir|ulvis\\.net|ume\\.la|umlib\\.us|unc\\.live|undrarmr\\.co|uni\\.cf|unipapa\\.co|uofr\\.us|uoft\\.me|up\\.to|upmchp\\.us|ur3\\.us|urb\\.tf|urbn\\.is|url\\.cn|url\\.cy|url\\.ie|url2\\.fr|urla\\.ru|urlgeni\\.us|urli\\.ai|urlify\\.cn|urlr\\.me|urls\\.fr|urls\\.kr|urluno\\.com|urly\\.co|urly\\.fi|urlz\\.fr|urlzs\\.com|urt\\.io|us\\.rog\\.gg|usanet\\.tv|usat\\.ly|usm\\.ag|utm\\.to|utn\\.pl|utraker\\.com|v\\.gd|v\\.redd\\.it|vai\\.la|vbly\\.us|vd55\\.com|vercel\\.link|vi\\.sa|vi\\.tc|viaalto\\.me|viaja\\.am|vineland\\.dj|viraln\\.co|vivo\\.tl|vk\\.cc|vk\\.sv|vn\\.rog\\.gg|vntyfr\\.com|vo\\.la|vodafone\\.uk|vogue\\.cm|voicetu\\.be|volvocars\\.us|vonq\\.io|vrnda\\.us|vtns\\.io|vur\\.me|vurl\\.com|vvnt\\.co|vxn\\.link|vypij\\.bar|vz\\.to|w\\.idg\\.de|w\\.wiki|w5n\\.co|wa\\.link|wa\\.me|wa\\.sv|waa\\.ai|waad\\.co|wahoowa\\.net|walk\\.sc|walkjc\\.org|wapo\\.st|warby\\.me|warp\\.plus|wartsi\\.ly|way\\.to|wb\\.md|wbby\\.co|wbur\\.fm|wbze\\.de|wcha\\.it|we\\.co|weall\\.vote|weare\\.rs|wee\\.so|wef\\.ch|wellc\\.me|wenk\\.io|wf0\\.xin|whatel\\.se|whcs\\.law|whi\\.ch|whoel\\.se|whr\\.tn|wi\\.se|win\\.gs|wit\\.to|wjcf\\.co|wkf\\.ms|wmojo\\.com|wn\\.nr|wndrfl\\.co|wo\\.ws|wooo\\.tw|wp\\.me|wpbeg\\.in|wrctr\\.co|wrd\\.cm|wrem\\.it|wun\\.io|ww7\\.fr|wwf\\.to|wwp\\.news|www\\.shrunken\\.com|x\\.gd|xbx\\.lv|xerox\\.bz|xfin\\.tv|xfl\\.ag|xfru\\.it|xgam\\.es|xor\\.tw|xpr\\.li|xprt\\.re|xqss\\.org|xrds\\.ca|xrl\\.us|xurl\\.es|xvirt\\.it|y\\.ahoo\\.it|y2u\\.be|yadi\\.sk|yal\\.su|yelp\\.to|yex\\.tt|yhoo\\.it|yip\\.su|yji\\.tw|ynews\\.page\\.link|yoox\\.ly|your\\.ls|yourls\\.org|yourwish\\.es|youtu\\.be|yubi\\.co|yun\\.ir|z23\\.ru|zat\\.ink|zaya\\.io|zc\\.vg|zcu\\.io|zd\\.net|zdrive\\.li|zdsk\\.co|zecz\\.ec|zeep\\.ly|zez\\.kr|zi\\.ma|ziadi\\.co|zipurl\\.fr|zln\\.do|zlr\\.my|zlra\\.co|zlw\\.re|zoho\\.to|zopen\\.to|zovpart\\.com|zpr\\.io|zuki\\.ie|zuplo\\.link|zurb\\.us|zurins\\.uk|zurl\\.co|zurl\\.ir|zurl\\.ws|zws\\.im|zxc\\.li|zynga\\.my|zywv\\.us|zzb\\.bz|zzu\\.info|econ\\.st)",
  "i",
);

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
      "blueskyfollower\\.com|#ifbap|#socialistsunday|#follow4follow|#i?followback|#blue(crew|wave)|#breakfastcrew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donk(party|pack|connects)|#donk\\b|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|#UnitedBlueCrew",
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
      "[🩵💙]🌊|🌊[💙🩵]|(🩵|💙){2,}|(?<=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA).*?[🩵💙]|[🩵💙].*?(?=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA)",
      "u",
    ),
    whitelist: new RegExp(
      "(💖|💗|🩷)💜[💙🩵]|💚💙|💙🤍🕊|☂💙|[💙🩵]🩷🤍🩷[💙🩵]|[💙🩵]💜(💖|💗|🩷|❤️)|(🤍)?💛💙|💙💛|💙📚|💙⚾️|⚾️💙|🩷❤️🧡💛💚🩵💙🖤|🩵💙💚🤍🧡❤️🩷",
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
      "#(MAGA|MAHA)\\b|#Trump ?202(4|8)🇺🇸?|((real|president|king|queen)? ?(barron|donald|eric|ivan(k)?a|tiffany|melenia) ?(john|j)? ?((trump)( |, )?(jr)?))\\b|(proud|king)magat?\\b|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))\\b|potus(45|46|47)\\b|ultramagat?\\b|maga [0-9]{2,4}\\b|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))\\b",
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
      "#(MAGA|MAHA)\\b|#Trump ?2024🇺🇸?|#Trump20(24|28|32|36|48)|(proud|king)magat?|(trump ?(20(24|28|32|36|48)|(45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(45|46|47)|ultramagat?|maga [0-9]{2,4}|(trump ?(is)? ?(my|your)? ?(king|maga|train|daddy|army|nation|world))|(?:Vance2028|Vance([a-zA-Z]+)2028|Vance([a-zA-Z]+)28|Vance48)",
      "i",
    ),
    whitelist: new RegExp(
      "(#?(?<=Never|Fuck|anti|🚫|DNI|Remove|🖕|🚫NO|No)).*?((#)?(Donald[ -:]?)?Trump|MAGA(t)?|DJT)|#?((Donald)?[ -:]?Trump[ -:]?Hater|magazine|stop[ -:]?project[ -:]?2025|MAGA.*?DNI)|#?(MAGA ?🚫)",
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
      "\\b(retarded|retards?|mongoloid|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b",
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
      "#(?:MAGA|MAHA)\\b|#Trump-?2024|(?:(?:real|president|king|queen)?-?(?:barron|donald|eric|ivan(?:k)?a|tiffany|melenia)-?(?:john|j)?-?(?:(?:trump)-?(?:jr)?))|(?:proud|king)magat?|(?:trump-?(?:20(?:24|28|32|36|48)|(?:45|46|47|4547)|maga|god|jesus|lord|[0-9]{2,4}))|potus(?:45|46|47)|ultramagat?|maga-[0-9]{2,4}|(?:trump-?(?:is)?-?(?:my|your)?-?(?:king|maga|train|daddy|army|nation|world))|marjorie-?taylor-?green|laura-?loomer|\\bloomered\\b|steve-?bannon|nick-?(?:j)?-?fuentes|matt=?gaetz|rfk-?jr|project?-2025|(?:thomas|tom)-?homan|(?:pam|pamala)-?bondi|kash-?patel|jd-?vance|pete-?hegseth|Karoline-?Leavitt|dana-?white|susie-?wiles|libsoftiktok.*?brid\\.gy",
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

export const POST_CHECKS: Checks[] = [
  {
    language: ["eng"],
    label: "discriminatory-language",
    comment: "Discriminatory language found in post",
    reportAcct: false,
    commentAcct: true,
    reportPost: true,
    toLabel: false,
    check: new RegExp("temu elon", "i"),
  },
  {
    label: "fundraising-link",
    comment: "Fundraising link found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "(\\b|\\n)(?:https?:\\/\\/)?([^.]+\\.)?(?:gofundme\\.com|gofund\\.me|buymeacoffee\\.com|venmo\\.com|cash\\.(app|me)|paypal\\.(com|me|app)|gogetfunding\\.com|winred\\.com|givesendgo\\.com|chuffed\\.org|memedefensefund\\.com|donate\\.stripe\\.com|fundly\\.com)",
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
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:allstaredge\\.info|americanactionnews\\.com|thepoliticalinsider\\.com|americadaily\\.com|bles\\.com|dkn\\.tv|theepochtimes\\.(com|de|fr|gr)|genuinenewspaper\\.com|tierrapura\\.org|truthandtradition\\.news|visiontimes\\.com|bigleaguepolitics\\.com|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|flvoicenews\\.com|breitbart\\.com|americasvoice\\.news|gnews\\.org|dailycaller\\.com|thefederalist\\.com|lewrockwell\\.com|loomered\\.com|newsmax\\.com|oann\\.com|patriotpost\\.us|prageru\\.com|truthfeed\\.com|thegatewaypundit\\.com|westernjournal\\.com|townhall\\.com|zerohedge\\.com|dailywire\\.com|washingtontimes\\.com|texasscorecard\\.com|babylonbee\\.com|revolver\\.news|thegrayzone\\.com|grayzoneproject\\.com|mintpressnews\\.com|21stcenturywire\\.com|www\\.globalresearch\\.ca|globalresearch\\.ca|journal-neo\\.su|theWallWillFall\\.org|beeley\\.substack\\.com|theduran\\.com|\\.unz\\.com|hotair\\.com|pjmedia\\.com|redstate\\.com|thepostmillennial\\.com| thenationalpulse\\.com|rightmemenews\\.com|rebelnews\\.com|westernstandard\\.news|redice\\.tv|tnc\\.news|junonews\\.com|smalldeadanimals\\.com|mercola\\.com|infowars\\.com|prisonplanet\\.com|endgamethemovie\\.com|healthrangerreport\\.com|healthranger\\.com|naturalnews\\.com|mikeadams\\.me|newstarget\\.com|beforeitsnews\\.com|lifesitenews\\.com|buffalochronicle\\.com|dailysceptic\\.org|disclose\\.tv|expose-news\\.com|dolcacatalunya\\.com|FactCheckArmenia\\.com|wnd\\.com|voltairenet\\.org|trunews\\.com|truepundit\\.com|thepeoplesvoice\\.tv|southfront\\.press|russia-insider\\.com|	realrawnews\\.com|projectveritas\\.com|politicususa\\.com|peacedata\\.net|opindia\\.com|news-front\\.info|libertywritersnews\\.com|theleadingreport\\.com|americanactionnews\\.com|AmericanUpdate\\.com|ThePoliticalInsider\\.com|tellmenow\\.com|tmn\\.today|cnsnews\\.com|mrctv\\.org|newsbusters\\.org|100percentfedup\\.com|bigleaguepolitics\\.com|conservativefiringline\\.com|comicallyincorrect\\.com|conservativetribune\\.com|rightwingnews\\.com|rightwing\\.news|tpnn\\.com|westernjournalism\\.com|stonecoldtruth\\.com|gnews\\.org|americasvoice\\.news|1819news\\.com|altoday\\.com|alphanewsmn\\.com|alphanews\\.org|amgreatness\\.com|american-herald\\.com|arizonamonitor\\.com|dangerandplay\\.com|freetelegraph\\.com|granitegrok\\.com|intelligencer\\.today|liveaction\\.org|eviemagazine\\.com|voz\\.us|blazetv\\.com|imprimis\\.hillsdale\\.edu|thepoliticalcesspool\\.org|ilovemyfreedom\\.org|ijr\\.com|KAGfeed\\.com|lifezette\\.com|occupydemocrats\\.com|PatriotPost\\.us|factcheckarmenia\\.com|factcheckingturkey\\.com|voxnews\\.info|banned\\.video|Brighteon\\.com|Gellerreport\\.com|hoggwatch\\.com|nationalfile\\.com|nextnewsnetwork\\.com|returnofkings\\.com|childrenshealthdefense\\.org|collective-evolution\\.com|foodbabe\\.com|geoengineeringwatch\\.org|goop\\.com|greenmedinfo\\.com|stopmandatoryvaccination\\.com|technocracy\\.news|dailysceptic\\.org|unherd\\.com|gbnews\\.com|^(?:.*\\.)?twitchy\\.com|palmerreport\\.com|news-watch\\.co\\.uk|unitynewsnetwork\\.co\\.uk|pleniiixa\\.blogspot\\.com|outkick\\.com|rumble\\.com|dallasexpress\\.com|gettr\\.com|reduxx\\.info|kitklarenberg\\.com|thiswillhold\\.substack\\.com|thecommoncoalition\\.com|theamericantribune\\.com|t\\.me/(surf_noise1|node_of_time_RUS|InfoDefenseRUS)|thefp\\.com|jihadwatch\\.org|lionessofjudah\\.substack\\.com|real-facts\\.info|timcast\\.com|americanmind\\.org|heritageaction\\.com|restorethemilitary\\.com|starrs\\.us|massdailynews\\.com|charliesmurderers\\.com|keywiki\\.org|ngocomment\\.com|x\\.com/libsoftiktok|swprs\\.org|truthlytics\\.com|dailysignal\\.com)",
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
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:givesendgo\\.com|rumble\\.com|gab\\.com|truthsocial\\.com|gettr\\.com|bitchute\\.com)",
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
    label: "unsourced-reporting",
    comment: "Post contains or links to a claim which is unsourced",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:economist\\.com/united-states/2025/09/18/how-stable-are-the-gender-identities-of-younger-children)",
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
    language: ["eng"],
    label: "contains-slur",
    comment: "Slur found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "\\b(retarded|retard|ZioNazi|mongoloid|[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ][ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]|[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]{2,}[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]|w[e3]tb[a4]ck|[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ][kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ][e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ][sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]|nate ?higger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b|\\bzio ?(🐷|🐖|🐀)\\b|(\\s(?:zio)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\s)|\\s(?:-z[i1][0o]\\b|\\bz[i1][0o]-)",
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
      "did:plc:4jedp474v24ftcpi6jvcijlb", // Reclaimed use
      "did:plc:i6m5urtifwvjqv4bfytcwslt", // ACARs repeater
    ],
  },
  {
    language: ["afr"],
    label: "contains-slur",
    comment: "Slur found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp("\\b(kaffir)", "i"),
  },
  /* eslint-disable no-misleading-character-class */
  {
    language: ["eng"],
    label: "monitor-slur",
    comment: "Possible slur found in post",
    reportAcct: false,
    commentAcct: true,
    reportPost: true,
    toLabel: false,
    check: new RegExp(
      "(\\s(?:Z(O|0)G|k[i1]k[e3])[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\s|\\b(?:t[0o]w[e3]lh[e3][a4]d|r[a4]gh[e3][a4]d|j[i1]h[a4]d[i1]|R[a4]p[e3]fug[e3][e3]|k[a4]f{1,2}[i1]r|khazar(ian)?)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b)",
      "i",
    ),
    whitelist: new RegExp("zionist|zionism|Kike Hernandez", "i"),
  },
  {
    language: ["eng"],
    label: "discourse-bait",
    comment: "Contains discourse bait",
    reportAcct: false,
    commentAcct: true,
    reportPost: false,
    toLabel: true,
    duration: 168,
    check: new RegExp(
      "((clanker|wireback|tinskin)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?)|Hive AI|thehive\\.ai|\\bRose.*?Heritage Foundation\\b",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:ksjfbda7262bbqmuoly54lww",
      "did:plc:oky5czdrnfjpqslsw2a5iclo",
      "did:plc:oisofpd7lj26yvgiivf3lxsi",
    ],
  },
  {
    language: ["eng"],
    label: "dehumanizing-rhetoric",
    comment: "Dehumanizing rhetoric found in post",
    reportAcct: true,
    commentAcct: true,
    toLabel: false,
    check: new RegExp(
      "(\\b(?:towelhead|sand nigger)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]?\\b)",
      "i",
    ),
  },
  {
    label: "dehumanizing-rhetoric",
    comment: "Dehumanizing rhetoric found in post",
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "(\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:x\\.com/libsoftiktok|daughtersadvocatingrestoration\\.org|jihadwatch\\.org|thenewworld\\.co\\.uk/sonia-sodha-sandie-peggie-and-the-dangers-of-gender-groupthink|starrs\\.us))",
      "i",
    ),
  },
  {
    language: ["eng"],
    label: "follow-farming",
    comment: "Follow farming indicators found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "blueskyfollower\\.com|#ifbap|#socialistsunday|#follow4follow|#followback|#(blue|breakfast)crew|#donksfriends|#nodemunder[0-9]+?k|#megaboost|#donkpack|#donkparty|#bluestorm(?:boosts|friends)|#fbr(?:e)?|#fbrparty|#fbarmy|#donkconnects|#ifollowback|#FreeDonk|Follow Party|#BlueResisters|#BlueCrewBoosts?[0-9]*|#BlueStormComin1|💙Vetted RESISTERS🦋|Follow Back Pack|#FreedomFightersRise|#fridaynightparties|#UnitedBlueCrew|#(Friday|Saturday|Sunday)Parties",
      "iu",
    ),
  },
  {
    label: "follow-farming",
    comment: "Follow farming indicators found in post",
    reportAcct: false,
    commentAcct: true,
    toLabel: true,
    check: new RegExp(
      "bsky\\.app/start/(did:plc:qqf54fjwyckvjrordaigstkq|did:plc:t4q27bc5gswob4zskgcqi4b6|did:plc:cu7qticlrmkvb7p6hq4etklt|did:plc:iokqyt73vzoa4f3mboyyf7go|did:plc:c3at2vzpmyodlsdksad5sqna|did:plc:fb3p4ffutjsf7ju53pvawfoz|did:plc:soxupumpwgcsbsxhqynil2m2|did:plc:agesb4bpc6iv6fpipw7pybbu|did:plc:kfj6letvntutu4ctr6dkijn7|did:plc:hhleck4pj4cl2dpuuncpzlg7|did:plc:morw3ybflmxq4wdubrvisvmn)",
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
      "\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:antimagaclub\\.com|pleniiixa\\.blogspot\\.com|testyourself\\.now|tinyurl\\.com/stdTestSafe|discord\\.me/rabbi|rabbirothschild\\.blogspot\\.com)|Pete Hegseth fired the commander of the Navy SEALS the same day he fired the director of the Defense Intelligence Agency",
      "i",
    ),
    ignoredDIDs: ["did:plc:m6k7ju4wcwnwa67mnhgjc2vc"], // Labeled already but hasn't been taken down
  },
  {
    label: "troll",
    comment: "Trolling found in post",
    reportAcct: false,
    commentAcct: true,
    reportPost: true,
    toLabel: false,
    check: new RegExp(
      "only (2|two) genders((?=.*transition)(?=.*mental health challenges)(?=.*love)(?=.*ideology))|trump is (your ?)(king|god|jesus|daddy)|(there (are|is))? only (two|2) genders|Colony of New Twitter|bluecry|mutilate (adolescents|kids|children)|Floyd.*convicted|[Gg]eorge.*[Ff]entanyl|YWNBAW|CASTRATING Minors|\\b(?:https?:\\/\\/)?([^.]+\\.)?(?:x\\.com/libsoftiktok)|2020 Election was Stolen|kiwifarms\\.st|Leftist terrorists|#IStandWthSandiePeggie|#SexMatters|#TheodoreUpton|radical leftists|demonrats",
      "i",
    ),
  },
  {
    label: "terf-gc",
    comment: "TERF rhetoric found in post",
    reportAcct: false,
    commentAcct: true,
    reportPost: true,
    toLabel: false,
    check: new RegExp(
      "protect women's sports|protect womens sports|(trans)?gender ideology|biological males?|the transgender issue|trantifa|#cancelnetflix",
      "i",
    ),
  },
  {
    language: ["eng"],
    label: "maga-trump",
    comment: "Possible trump support found in post",
    reportAcct: false,
    commentAcct: true,
    reportPost: false,
    toLabel: false,
    check: new RegExp("Trump is (still)? your president|#MA[GH]A\\b", "i"),
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
      "💙🌊|🌊💙|💙{2,}|(?<=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA).*?💙|💙.*?(?=#Resist|#Bluecrew|#bluecrew|#donksfriends|#socialistsunday|#nodemunder1k|#nodemunder5k|#nodemunder10k|#megaboost|#donkpack|#donkparty|#bluestormboosts|#fbr|#bluestormfriends|#fbrparty|#fbarmy|#donkconnects|#fbrparty|🚫 MAGA)",
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
    check: new RegExp("Colony of New Twitter|bluecry\\b", "i"),
  },
];
