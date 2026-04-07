// ============================================================
// DEMO DATA — digunakan saat Firebase dinonaktifkan
// ============================================================

// ── Demo Users ──────────────────────────────────────────────
export type DemoUser = {
    uid: string;
    email: string;
    role: "disdik" | "sekolah";
    npsn?: string;
    nama_instansi: string;
    kecamatan?: string;
    password?: string;
};

export let DEMO_USERS: Record<string, DemoUser> = {
    disdik: {
        uid: "demo-disdik-uid-001",
        email: "admin@disdik.id",
        password: "admin", // default disdik pass
        role: "disdik",
        nama_instansi: "Dinas Pendidikan Tabalong",
    },
    "65978796": {"uid":"school-65978796","email":"65978796","password":"65978796","role":"sekolah","npsn":"65978796","nama_instansi":"SD NEGERI 1 HAPALAH","kecamatan":"Banua Lawas"},
    "24204862": {"uid":"school-24204862","email":"24204862","password":"24204862","role":"sekolah","npsn":"24204862","nama_instansi":"SD NEGERI 2 HAPALAH","kecamatan":"Banua Lawas"},
    "84931137": {"uid":"school-84931137","email":"84931137","password":"84931137","role":"sekolah","npsn":"84931137","nama_instansi":"SD NEGERI BANGKILING","kecamatan":"Banua Lawas"},
    "15005509": {"uid":"school-15005509","email":"15005509","password":"15005509","role":"sekolah","npsn":"15005509","nama_instansi":"SD NEGERI BANUA RANTAU","kecamatan":"Banua Lawas"},
    "11188253": {"uid":"school-11188253","email":"11188253","password":"11188253","role":"sekolah","npsn":"11188253","nama_instansi":"SD NEGERI BATANG BANYU","kecamatan":"Banua Lawas"},
    "26803184": {"uid":"school-26803184","email":"26803184","password":"26803184","role":"sekolah","npsn":"26803184","nama_instansi":"SD NEGERI HABAU","kecamatan":"Banua Lawas"},
    "32588116": {"uid":"school-32588116","email":"32588116","password":"32588116","role":"sekolah","npsn":"32588116","nama_instansi":"SD NEGERI HABAU HULU","kecamatan":"Banua Lawas"},
    "16008643": {"uid":"school-16008643","email":"16008643","password":"16008643","role":"sekolah","npsn":"16008643","nama_instansi":"SD NEGERI HARIANG","kecamatan":"Banua Lawas"},
    "30673297": {"uid":"school-30673297","email":"30673297","password":"30673297","role":"sekolah","npsn":"30673297","nama_instansi":"SD NEGERI KUALA PERAK","kecamatan":"Banua Lawas"},
    "30982648": {"uid":"school-30982648","email":"30982648","password":"30982648","role":"sekolah","npsn":"30982648","nama_instansi":"SD NEGERI PASAR ARBA","kecamatan":"Banua Lawas"},
    "14851838": {"uid":"school-14851838","email":"14851838","password":"14851838","role":"sekolah","npsn":"14851838","nama_instansi":"SD NEGERI PEMATANG","kecamatan":"Banua Lawas"},
    "27632560": {"uid":"school-27632560","email":"27632560","password":"27632560","role":"sekolah","npsn":"27632560","nama_instansi":"SD NEGERI PURAI","kecamatan":"Banua Lawas"},
    "26577977": {"uid":"school-26577977","email":"26577977","password":"26577977","role":"sekolah","npsn":"26577977","nama_instansi":"SD NEGERI SEI HANYAR 2","kecamatan":"Banua Lawas"},
    "70231251": {"uid":"school-70231251","email":"70231251","password":"70231251","role":"sekolah","npsn":"70231251","nama_instansi":"SD NEGERI TALAN","kecamatan":"Banua Lawas"},
    "14359927": {"uid":"school-14359927","email":"14359927","password":"14359927","role":"sekolah","npsn":"14359927","nama_instansi":"SD NEGERI TELAGA RAYA","kecamatan":"Banua Lawas"},
    "20348609": {"uid":"school-20348609","email":"20348609","password":"20348609","role":"sekolah","npsn":"20348609","nama_instansi":"SD NEGERI 1 BINTANG ARA","kecamatan":"Bintang Ara"},
    "32427702": {"uid":"school-32427702","email":"32427702","password":"32427702","role":"sekolah","npsn":"32427702","nama_instansi":"SD NEGERI 1 BURUM","kecamatan":"Bintang Ara"},
    "76023391": {"uid":"school-76023391","email":"76023391","password":"76023391","role":"sekolah","npsn":"76023391","nama_instansi":"SD NEGERI 1 DAMBUNG","kecamatan":"Bintang Ara"},
    "24752779": {"uid":"school-24752779","email":"24752779","password":"24752779","role":"sekolah","npsn":"24752779","nama_instansi":"SD NEGERI 1 USIH","kecamatan":"Bintang Ara"},
    "52636710": {"uid":"school-52636710","email":"52636710","password":"52636710","role":"sekolah","npsn":"52636710","nama_instansi":"SD NEGERI 1 WALING","kecamatan":"Bintang Ara"},
    "20129805": {"uid":"school-20129805","email":"20129805","password":"20129805","role":"sekolah","npsn":"20129805","nama_instansi":"SD NEGERI 2 WALING","kecamatan":"Bintang Ara"},
    "17323312": {"uid":"school-17323312","email":"17323312","password":"17323312","role":"sekolah","npsn":"17323312","nama_instansi":"SD NEGERI BINTANG ARA","kecamatan":"Bintang Ara"},
    "14768691": {"uid":"school-14768691","email":"14768691","password":"14768691","role":"sekolah","npsn":"14768691","nama_instansi":"SD NEGERI BURUM","kecamatan":"Bintang Ara"},
    "32917164": {"uid":"school-32917164","email":"32917164","password":"32917164","role":"sekolah","npsn":"32917164","nama_instansi":"SD NEGERI DAMBUNG","kecamatan":"Bintang Ara"},
    "32286443": {"uid":"school-32286443","email":"32286443","password":"32286443","role":"sekolah","npsn":"32286443","nama_instansi":"SD NEGERI DUYUN BARU","kecamatan":"Bintang Ara"},
    "16402440": {"uid":"school-16402440","email":"16402440","password":"16402440","role":"sekolah","npsn":"16402440","nama_instansi":"SD NEGERI KUWARI","kecamatan":"Bintang Ara"},
    "27011211": {"uid":"school-27011211","email":"27011211","password":"27011211","role":"sekolah","npsn":"27011211","nama_instansi":"SD NEGERI MANTUYUP","kecamatan":"Bintang Ara"},
    "25166017": {"uid":"school-25166017","email":"25166017","password":"25166017","role":"sekolah","npsn":"25166017","nama_instansi":"SD NEGERI MEHO","kecamatan":"Bintang Ara"},
    "27641401": {"uid":"school-27641401","email":"27641401","password":"27641401","role":"sekolah","npsn":"27641401","nama_instansi":"SD NEGERI PANAAN","kecamatan":"Bintang Ara"},
    "29132440": {"uid":"school-29132440","email":"29132440","password":"29132440","role":"sekolah","npsn":"29132440","nama_instansi":"SD NEGERI SEI MISSIM","kecamatan":"Bintang Ara"},
    "34517931": {"uid":"school-34517931","email":"34517931","password":"34517931","role":"sekolah","npsn":"34517931","nama_instansi":"SD NEGERI USIH","kecamatan":"Bintang Ara"},
    "12795491": {"uid":"school-12795491","email":"12795491","password":"12795491","role":"sekolah","npsn":"12795491","nama_instansi":"SD NEGERI 1 BATU PULUT","kecamatan":"Haruai"},
    "17965637": {"uid":"school-17965637","email":"17965637","password":"17965637","role":"sekolah","npsn":"17965637","nama_instansi":"SD NEGERI 1 BONGKANG","kecamatan":"Haruai"},
    "25823666": {"uid":"school-25823666","email":"25823666","password":"25823666","role":"sekolah","npsn":"25823666","nama_instansi":"SD NEGERI 1 HAYUP","kecamatan":"Haruai"},
    "10764954": {"uid":"school-10764954","email":"10764954","password":"10764954","role":"sekolah","npsn":"10764954","nama_instansi":"SD NEGERI 1 LOK BATU","kecamatan":"Haruai"},
    "40342273": {"uid":"school-40342273","email":"40342273","password":"40342273","role":"sekolah","npsn":"40342273","nama_instansi":"SD NEGERI 1 MAHE PASAR","kecamatan":"Haruai"},
    "11829834": {"uid":"school-11829834","email":"11829834","password":"11829834","role":"sekolah","npsn":"11829834","nama_instansi":"SD NEGERI 1 NAWIN HILIR","kecamatan":"Haruai"},
    "27552215": {"uid":"school-27552215","email":"27552215","password":"27552215","role":"sekolah","npsn":"27552215","nama_instansi":"SD NEGERI 1 SARADANG","kecamatan":"Haruai"},
    "37180956": {"uid":"school-37180956","email":"37180956","password":"37180956","role":"sekolah","npsn":"37180956","nama_instansi":"SD NEGERI 1.2 SUPUT","kecamatan":"Haruai"},
    "36297777": {"uid":"school-36297777","email":"36297777","password":"36297777","role":"sekolah","npsn":"36297777","nama_instansi":"SD NEGERI 2 BONGKANG","kecamatan":"Haruai"},
    "31077873": {"uid":"school-31077873","email":"31077873","password":"31077873","role":"sekolah","npsn":"31077873","nama_instansi":"SD NEGERI 2 KEMBANG KUNING","kecamatan":"Haruai"},
    "65779338": {"uid":"school-65779338","email":"65779338","password":"65779338","role":"sekolah","npsn":"65779338","nama_instansi":"SD NEGERI 2 LOK BATU","kecamatan":"Haruai"},
    "40515795": {"uid":"school-40515795","email":"40515795","password":"40515795","role":"sekolah","npsn":"40515795","nama_instansi":"SD NEGERI 2 NAWIN HILIR","kecamatan":"Haruai"},
    "79400778": {"uid":"school-79400778","email":"79400778","password":"79400778","role":"sekolah","npsn":"79400778","nama_instansi":"SD NEGERI 2.3 HAYUP","kecamatan":"Haruai"},
    "12758056": {"uid":"school-12758056","email":"12758056","password":"12758056","role":"sekolah","npsn":"12758056","nama_instansi":"SD NEGERI 3 BONGKANG","kecamatan":"Haruai"},
    "37577870": {"uid":"school-37577870","email":"37577870","password":"37577870","role":"sekolah","npsn":"37577870","nama_instansi":"SD NEGERI 3 KEMBANG KUNING","kecamatan":"Haruai"},
    "23538021": {"uid":"school-23538021","email":"23538021","password":"23538021","role":"sekolah","npsn":"23538021","nama_instansi":"SD NEGERI 4 HAYUP","kecamatan":"Haruai"},
    "45581573": {"uid":"school-45581573","email":"45581573","password":"45581573","role":"sekolah","npsn":"45581573","nama_instansi":"SD NEGERI AGUNG","kecamatan":"Haruai"},
    "34425363": {"uid":"school-34425363","email":"34425363","password":"34425363","role":"sekolah","npsn":"34425363","nama_instansi":"SD NEGERI DANAU","kecamatan":"Haruai"},
    "18297270": {"uid":"school-18297270","email":"18297270","password":"18297270","role":"sekolah","npsn":"18297270","nama_instansi":"SD NEGERI JURAN","kecamatan":"Haruai"},
    "26637275": {"uid":"school-26637275","email":"26637275","password":"26637275","role":"sekolah","npsn":"26637275","nama_instansi":"SD NEGERI LAMPAHUNGIN","kecamatan":"Haruai"},
    "24725021": {"uid":"school-24725021","email":"24725021","password":"24725021","role":"sekolah","npsn":"24725021","nama_instansi":"SD NEGERI MARINDI","kecamatan":"Haruai"},
    "20614943": {"uid":"school-20614943","email":"20614943","password":"20614943","role":"sekolah","npsn":"20614943","nama_instansi":"SD NEGERI NAWIN","kecamatan":"Haruai"},
    "29227454": {"uid":"school-29227454","email":"29227454","password":"29227454","role":"sekolah","npsn":"29227454","nama_instansi":"SD NEGERI SARADANG","kecamatan":"Haruai"},
    "17935229": {"uid":"school-17935229","email":"17935229","password":"17935229","role":"sekolah","npsn":"17935229","nama_instansi":"SD NEGERI SURIAN","kecamatan":"Haruai"},
    "30680431": {"uid":"school-30680431","email":"30680431","password":"30680431","role":"sekolah","npsn":"30680431","nama_instansi":"SD NEGERI WIRANG","kecamatan":"Haruai"},
    "28475805": {"uid":"school-28475805","email":"28475805","password":"28475805","role":"sekolah","npsn":"28475805","nama_instansi":"SD ISLAM AL MADANIYAH","kecamatan":"Jaro"},
    "33070373": {"uid":"school-33070373","email":"33070373","password":"33070373","role":"sekolah","npsn":"33070373","nama_instansi":"SD NEGERI 1 GARAGATA","kecamatan":"Jaro"},
    "17314118": {"uid":"school-17314118","email":"17314118","password":"17314118","role":"sekolah","npsn":"17314118","nama_instansi":"SD NEGERI 1 JARO","kecamatan":"Jaro"},
    "29188135": {"uid":"school-29188135","email":"29188135","password":"29188135","role":"sekolah","npsn":"29188135","nama_instansi":"SD NEGERI 1 MUANG","kecamatan":"Jaro"},
    "21855440": {"uid":"school-21855440","email":"21855440","password":"21855440","role":"sekolah","npsn":"21855440","nama_instansi":"SD NEGERI 1 NALUI","kecamatan":"Jaro"},
    "33716502": {"uid":"school-33716502","email":"33716502","password":"33716502","role":"sekolah","npsn":"33716502","nama_instansi":"SD NEGERI 1 NAMUN","kecamatan":"Jaro"},
    "37088007": {"uid":"school-37088007","email":"37088007","password":"37088007","role":"sekolah","npsn":"37088007","nama_instansi":"SD NEGERI 1 SOLAN","kecamatan":"Jaro"},
    "37714973": {"uid":"school-37714973","email":"37714973","password":"37714973","role":"sekolah","npsn":"37714973","nama_instansi":"SD NEGERI 2 GARAGATA","kecamatan":"Jaro"},
    "26504744": {"uid":"school-26504744","email":"26504744","password":"26504744","role":"sekolah","npsn":"26504744","nama_instansi":"SD NEGERI 2 JARO","kecamatan":"Jaro"},
    "22252226": {"uid":"school-22252226","email":"22252226","password":"22252226","role":"sekolah","npsn":"22252226","nama_instansi":"SD NEGERI 2 MUANG","kecamatan":"Jaro"},
    "12668377": {"uid":"school-12668377","email":"12668377","password":"12668377","role":"sekolah","npsn":"12668377","nama_instansi":"SD NEGERI 2 NAMUN","kecamatan":"Jaro"},
    "39189501": {"uid":"school-39189501","email":"39189501","password":"39189501","role":"sekolah","npsn":"39189501","nama_instansi":"SD NEGERI 3 JARO","kecamatan":"Jaro"},
    "17776713": {"uid":"school-17776713","email":"17776713","password":"17776713","role":"sekolah","npsn":"17776713","nama_instansi":"SD NEGERI 3 SOLAN","kecamatan":"Jaro"},
    "40021356": {"uid":"school-40021356","email":"40021356","password":"40021356","role":"sekolah","npsn":"40021356","nama_instansi":"SD NEGERI LANO","kecamatan":"Jaro"},
    "42965117": {"uid":"school-42965117","email":"42965117","password":"42965117","role":"sekolah","npsn":"42965117","nama_instansi":"SD NEGERI PURUI","kecamatan":"Jaro"},
    "40283683": {"uid":"school-40283683","email":"40283683","password":"40283683","role":"sekolah","npsn":"40283683","nama_instansi":"SD NEGERI TERATAU","kecamatan":"Jaro"},
    "17376960": {"uid":"school-17376960","email":"17376960","password":"17376960","role":"sekolah","npsn":"17376960","nama_instansi":"SD NEGERI 1 PULAU","kecamatan":"Kelua"},
    "14786170": {"uid":"school-14786170","email":"14786170","password":"14786170","role":"sekolah","npsn":"14786170","nama_instansi":"SD NEGERI 1 SUNGAI BULUH","kecamatan":"Kelua"},
    "38371242": {"uid":"school-38371242","email":"38371242","password":"38371242","role":"sekolah","npsn":"38371242","nama_instansi":"SD NEGERI 1.2 PUDAK SETEGAL","kecamatan":"Kelua"},
    "43711127": {"uid":"school-43711127","email":"43711127","password":"43711127","role":"sekolah","npsn":"43711127","nama_instansi":"SD NEGERI 2 KARANGAN PUTIH","kecamatan":"Kelua"},
    "26879223": {"uid":"school-26879223","email":"26879223","password":"26879223","role":"sekolah","npsn":"26879223","nama_instansi":"SD NEGERI 2 SEI BULUH","kecamatan":"Kelua"},
    "54865764": {"uid":"school-54865764","email":"54865764","password":"54865764","role":"sekolah","npsn":"54865764","nama_instansi":"SD NEGERI 2.3 PULAU","kecamatan":"Kelua"},
    "23199478": {"uid":"school-23199478","email":"23199478","password":"23199478","role":"sekolah","npsn":"23199478","nama_instansi":"SD NEGERI AMPUKUNG HULU","kecamatan":"Kelua"},
    "76899928": {"uid":"school-76899928","email":"76899928","password":"76899928","role":"sekolah","npsn":"76899928","nama_instansi":"SD NEGERI ASAM PAUH","kecamatan":"Kelua"},
    "40578093": {"uid":"school-40578093","email":"40578093","password":"40578093","role":"sekolah","npsn":"40578093","nama_instansi":"SD NEGERI BAHUNGIN","kecamatan":"Kelua"},
    "11833467": {"uid":"school-11833467","email":"11833467","password":"11833467","role":"sekolah","npsn":"11833467","nama_instansi":"SD NEGERI BINTURU","kecamatan":"Kelua"},
    "14925174": {"uid":"school-14925174","email":"14925174","password":"14925174","role":"sekolah","npsn":"14925174","nama_instansi":"SD NEGERI GAYAM","kecamatan":"Kelua"},
    "41154940": {"uid":"school-41154940","email":"41154940","password":"41154940","role":"sekolah","npsn":"41154940","nama_instansi":"SD NEGERI KARANGAN PUTIH","kecamatan":"Kelua"},
    "23378671": {"uid":"school-23378671","email":"23378671","password":"23378671","role":"sekolah","npsn":"23378671","nama_instansi":"SD NEGERI MASINTAN","kecamatan":"Kelua"},
    "81987239": {"uid":"school-81987239","email":"81987239","password":"81987239","role":"sekolah","npsn":"81987239","nama_instansi":"SD NEGERI PALIAT","kecamatan":"Kelua"},
    "14123823": {"uid":"school-14123823","email":"14123823","password":"14123823","role":"sekolah","npsn":"14123823","nama_instansi":"SD NEGERI PARI PARI","kecamatan":"Kelua"},
    "33116835": {"uid":"school-33116835","email":"33116835","password":"33116835","role":"sekolah","npsn":"33116835","nama_instansi":"SD NEGERI PASAR MINGGU","kecamatan":"Kelua"},
    "18003665": {"uid":"school-18003665","email":"18003665","password":"18003665","role":"sekolah","npsn":"18003665","nama_instansi":"SD NEGERI PASAR PANAS","kecamatan":"Kelua"},
    "20765793": {"uid":"school-20765793","email":"20765793","password":"20765793","role":"sekolah","npsn":"20765793","nama_instansi":"SD NEGERI TAKULAT","kecamatan":"Kelua"},
    "38808834": {"uid":"school-38808834","email":"38808834","password":"38808834","role":"sekolah","npsn":"38808834","nama_instansi":"SD NEGERI 1 TANTARINGIN","kecamatan":"Muara Harus"},
    "87548209": {"uid":"school-87548209","email":"87548209","password":"87548209","role":"sekolah","npsn":"87548209","nama_instansi":"SD NEGERI 2 TANTARINGIN","kecamatan":"Muara Harus"},
    "38856924": {"uid":"school-38856924","email":"38856924","password":"38856924","role":"sekolah","npsn":"38856924","nama_instansi":"SD NEGERI MADANG","kecamatan":"Muara Harus"},
    "18435087": {"uid":"school-18435087","email":"18435087","password":"18435087","role":"sekolah","npsn":"18435087","nama_instansi":"SD NEGERI MANDUIN","kecamatan":"Muara Harus"},
    "22818182": {"uid":"school-22818182","email":"22818182","password":"22818182","role":"sekolah","npsn":"22818182","nama_instansi":"SD NEGERI MANTUIL","kecamatan":"Muara Harus"},
    "13317677": {"uid":"school-13317677","email":"13317677","password":"13317677","role":"sekolah","npsn":"13317677","nama_instansi":"SD NEGERI MURUNG KARANGAN","kecamatan":"Muara Harus"},
    "33775370": {"uid":"school-33775370","email":"33775370","password":"33775370","role":"sekolah","npsn":"33775370","nama_instansi":"SDN PADANGIN","kecamatan":"Muara Harus"},
    "29322577": {"uid":"school-29322577","email":"29322577","password":"29322577","role":"sekolah","npsn":"29322577","nama_instansi":"SD NEGERI 1 BINJAI","kecamatan":"Muara Uya"},
    "20540247": {"uid":"school-20540247","email":"20540247","password":"20540247","role":"sekolah","npsn":"20540247","nama_instansi":"SD NEGERI 1 MANGKUPUM","kecamatan":"Muara Uya"},
    "40639748": {"uid":"school-40639748","email":"40639748","password":"40639748","role":"sekolah","npsn":"40639748","nama_instansi":"SD NEGERI 1 PALAPI","kecamatan":"Muara Uya"},
    "27771126": {"uid":"school-27771126","email":"27771126","password":"27771126","role":"sekolah","npsn":"27771126","nama_instansi":"SD NEGERI 1 PASAR BATU","kecamatan":"Muara Uya"},
    "35430834": {"uid":"school-35430834","email":"35430834","password":"35430834","role":"sekolah","npsn":"35430834","nama_instansi":"SD NEGERI 1 PULAU KUU","kecamatan":"Muara Uya"},
    "16400777": {"uid":"school-16400777","email":"16400777","password":"16400777","role":"sekolah","npsn":"16400777","nama_instansi":"SD NEGERI 1 RIBANG","kecamatan":"Muara Uya"},
    "42127998": {"uid":"school-42127998","email":"42127998","password":"42127998","role":"sekolah","npsn":"42127998","nama_instansi":"SD NEGERI 1 SIMPUNG LAYUNG","kecamatan":"Muara Uya"},
    "40901616": {"uid":"school-40901616","email":"40901616","password":"40901616","role":"sekolah","npsn":"40901616","nama_instansi":"SD NEGERI 1 UWIE","kecamatan":"Muara Uya"},
    "39528575": {"uid":"school-39528575","email":"39528575","password":"39528575","role":"sekolah","npsn":"39528575","nama_instansi":"SD NEGERI 2 BINJAI","kecamatan":"Muara Uya"},
    "13344336": {"uid":"school-13344336","email":"13344336","password":"13344336","role":"sekolah","npsn":"13344336","nama_instansi":"SD NEGERI 2 MANGKUPUM","kecamatan":"Muara Uya"},
    "95872599": {"uid":"school-95872599","email":"95872599","password":"95872599","role":"sekolah","npsn":"95872599","nama_instansi":"SD NEGERI 2 PALAPI","kecamatan":"Muara Uya"},
    "12172459": {"uid":"school-12172459","email":"12172459","password":"12172459","role":"sekolah","npsn":"12172459","nama_instansi":"SD NEGERI 2 PASAR BATU","kecamatan":"Muara Uya"},
    "38308114": {"uid":"school-38308114","email":"38308114","password":"38308114","role":"sekolah","npsn":"38308114","nama_instansi":"SD NEGERI 2 PULAU KUU","kecamatan":"Muara Uya"},
    "52057676": {"uid":"school-52057676","email":"52057676","password":"52057676","role":"sekolah","npsn":"52057676","nama_instansi":"SD NEGERI 2 SIMPUNG LAYUNG","kecamatan":"Muara Uya"},
    "36198479": {"uid":"school-36198479","email":"36198479","password":"36198479","role":"sekolah","npsn":"36198479","nama_instansi":"SD NEGERI 2 UWIE","kecamatan":"Muara Uya"},
    "30978948": {"uid":"school-30978948","email":"30978948","password":"30978948","role":"sekolah","npsn":"30978948","nama_instansi":"SD NEGERI 2.3 RIBANG","kecamatan":"Muara Uya"},
    "37014653": {"uid":"school-37014653","email":"37014653","password":"37014653","role":"sekolah","npsn":"37014653","nama_instansi":"SD NEGERI KAMPUNG BARU","kecamatan":"Muara Uya"},
    "35620252": {"uid":"school-35620252","email":"35620252","password":"35620252","role":"sekolah","npsn":"35620252","nama_instansi":"SD NEGERI KUPANG NUNDING","kecamatan":"Muara Uya"},
    "19459117": {"uid":"school-19459117","email":"19459117","password":"19459117","role":"sekolah","npsn":"19459117","nama_instansi":"SD NEGERI LUMBANG","kecamatan":"Muara Uya"},
    "48200056": {"uid":"school-48200056","email":"48200056","password":"48200056","role":"sekolah","npsn":"48200056","nama_instansi":"SD NEGERI RANDU","kecamatan":"Muara Uya"},
    "12147326": {"uid":"school-12147326","email":"12147326","password":"12147326","role":"sekolah","npsn":"12147326","nama_instansi":"SD NEGERI SALIKUNG","kecamatan":"Muara Uya"},
    "17743594": {"uid":"school-17743594","email":"17743594","password":"17743594","role":"sekolah","npsn":"17743594","nama_instansi":"SD NEGERI SANTUUN","kecamatan":"Muara Uya"},
    "41085125": {"uid":"school-41085125","email":"41085125","password":"41085125","role":"sekolah","npsn":"41085125","nama_instansi":"SD NEGERI SUNGAI KUMAP","kecamatan":"Muara Uya"},
    "72465596": {"uid":"school-72465596","email":"72465596","password":"72465596","role":"sekolah","npsn":"72465596","nama_instansi":"SD ALAM MUHAMMADIYAH TABALONG","kecamatan":"Murung Pudak"},
    "33528222": {"uid":"school-33528222","email":"33528222","password":"33528222","role":"sekolah","npsn":"33528222","nama_instansi":"SD ALAM TANJUNG TABALONG","kecamatan":"Murung Pudak"},
    "20746528": {"uid":"school-20746528","email":"20746528","password":"20746528","role":"sekolah","npsn":"20746528","nama_instansi":"SD HASBUNALLAH","kecamatan":"Murung Pudak"},
    "17677463": {"uid":"school-17677463","email":"17677463","password":"17677463","role":"sekolah","npsn":"17677463","nama_instansi":"SD INTEGRAL HIDAYATULLAH","kecamatan":"Murung Pudak"},
    "16643287": {"uid":"school-16643287","email":"16643287","password":"16643287","role":"sekolah","npsn":"16643287","nama_instansi":"SD MUHAMMADIYAH AL MUKHLISHIN","kecamatan":"Murung Pudak"},
    "15978863": {"uid":"school-15978863","email":"15978863","password":"15978863","role":"sekolah","npsn":"15978863","nama_instansi":"SD NEGERI 1 JAING HILIR","kecamatan":"Murung Pudak"},
    "31241517": {"uid":"school-31241517","email":"31241517","password":"31241517","role":"sekolah","npsn":"31241517","nama_instansi":"SD NEGERI 1 KAPAR","kecamatan":"Murung Pudak"},
    "36240821": {"uid":"school-36240821","email":"36240821","password":"36240821","role":"sekolah","npsn":"36240821","nama_instansi":"SD NEGERI 1.2 BELIMBING RAYA","kecamatan":"Murung Pudak"},
    "30308047": {"uid":"school-30308047","email":"30308047","password":"30308047","role":"sekolah","npsn":"30308047","nama_instansi":"SD NEGERI 1.2 SULINGAN","kecamatan":"Murung Pudak"},
    "17721001": {"uid":"school-17721001","email":"17721001","password":"17721001","role":"sekolah","npsn":"17721001","nama_instansi":"SD NEGERI 1.5 BELIMBING","kecamatan":"Murung Pudak"},
    "28214590": {"uid":"school-28214590","email":"28214590","password":"28214590","role":"sekolah","npsn":"28214590","nama_instansi":"SD NEGERI 2 BELIMBING","kecamatan":"Murung Pudak"},
    "11540381": {"uid":"school-11540381","email":"11540381","password":"11540381","role":"sekolah","npsn":"11540381","nama_instansi":"SD NEGERI 2 JAING HILIR","kecamatan":"Murung Pudak"},
    "13590834": {"uid":"school-13590834","email":"13590834","password":"13590834","role":"sekolah","npsn":"13590834","nama_instansi":"SD NEGERI 2 KAPAR","kecamatan":"Murung Pudak"},
    "22129127": {"uid":"school-22129127","email":"22129127","password":"22129127","role":"sekolah","npsn":"22129127","nama_instansi":"SD NEGERI 2 MABUUN","kecamatan":"Murung Pudak"},
    "38025942": {"uid":"school-38025942","email":"38025942","password":"38025942","role":"sekolah","npsn":"38025942","nama_instansi":"SD NEGERI 2 PEMBATAAN","kecamatan":"Murung Pudak"},
    "84322516": {"uid":"school-84322516","email":"84322516","password":"84322516","role":"sekolah","npsn":"84322516","nama_instansi":"SD NEGERI 3 BELIMBING","kecamatan":"Murung Pudak"},
    "32712474": {"uid":"school-32712474","email":"32712474","password":"32712474","role":"sekolah","npsn":"32712474","nama_instansi":"SD NEGERI 3 BELIMBING RAYA","kecamatan":"Murung Pudak"},
    "35441740": {"uid":"school-35441740","email":"35441740","password":"35441740","role":"sekolah","npsn":"35441740","nama_instansi":"SD NEGERI 3 KAPAR","kecamatan":"Murung Pudak"},
    "13134527": {"uid":"school-13134527","email":"13134527","password":"13134527","role":"sekolah","npsn":"13134527","nama_instansi":"SD NEGERI 4 BELIMBING","kecamatan":"Murung Pudak"},
    "19105590": {"uid":"school-19105590","email":"19105590","password":"19105590","role":"sekolah","npsn":"19105590","nama_instansi":"SD NEGERI 4 BELIMBING RAYA","kecamatan":"Murung Pudak"},
    "39431170": {"uid":"school-39431170","email":"39431170","password":"39431170","role":"sekolah","npsn":"39431170","nama_instansi":"SD NEGERI CAKUNG PERMATA NUSA","kecamatan":"Murung Pudak"},
    "33426710": {"uid":"school-33426710","email":"33426710","password":"33426710","role":"sekolah","npsn":"33426710","nama_instansi":"SD NEGERI KAPAR HULU","kecamatan":"Murung Pudak"},
    "76217863": {"uid":"school-76217863","email":"76217863","password":"76217863","role":"sekolah","npsn":"76217863","nama_instansi":"SD NEGERI KASIAU","kecamatan":"Murung Pudak"},
    "97280403": {"uid":"school-97280403","email":"97280403","password":"97280403","role":"sekolah","npsn":"97280403","nama_instansi":"SD NEGERI KASIAU RAYA","kecamatan":"Murung Pudak"},
    "16548095": {"uid":"school-16548095","email":"16548095","password":"16548095","role":"sekolah","npsn":"16548095","nama_instansi":"SD NEGERI MABUUN","kecamatan":"Murung Pudak"},
    "39931829": {"uid":"school-39931829","email":"39931829","password":"39931829","role":"sekolah","npsn":"39931829","nama_instansi":"SD NEGERI MASUKAU","kecamatan":"Murung Pudak"},
    "27676438": {"uid":"school-27676438","email":"27676438","password":"27676438","role":"sekolah","npsn":"27676438","nama_instansi":"SD NEGERI MASUKAU LUAR","kecamatan":"Murung Pudak"},
    "13586494": {"uid":"school-13586494","email":"13586494","password":"13586494","role":"sekolah","npsn":"13586494","nama_instansi":"SD NEGERI PEMBATAAN","kecamatan":"Murung Pudak"},
    "91005709": {"uid":"school-91005709","email":"91005709","password":"91005709","role":"sekolah","npsn":"91005709","nama_instansi":"SD PLUS MURUNG PUDAK","kecamatan":"Murung Pudak"},
    "30046668": {"uid":"school-30046668","email":"30046668","password":"30046668","role":"sekolah","npsn":"30046668","nama_instansi":"SDN 3 Pembataan","kecamatan":"Murung Pudak"},
    "16614552": {"uid":"school-16614552","email":"16614552","password":"16614552","role":"sekolah","npsn":"16614552","nama_instansi":"SDN MABURAI","kecamatan":"Murung Pudak"},
    "14766675": {"uid":"school-14766675","email":"14766675","password":"14766675","role":"sekolah","npsn":"14766675","nama_instansi":"SD NEGERI 1 SEI RUKAM I","kecamatan":"Pugaan"},
    "20985509": {"uid":"school-20985509","email":"20985509","password":"20985509","role":"sekolah","npsn":"20985509","nama_instansi":"SD NEGERI 1 SEI RUKAM II","kecamatan":"Pugaan"},
    "34334102": {"uid":"school-34334102","email":"34334102","password":"34334102","role":"sekolah","npsn":"34334102","nama_instansi":"SD NEGERI JIRAK","kecamatan":"Pugaan"},
    "60902082": {"uid":"school-60902082","email":"60902082","password":"60902082","role":"sekolah","npsn":"60902082","nama_instansi":"SD NEGERI KAYU GATAH","kecamatan":"Pugaan"},
    "28048609": {"uid":"school-28048609","email":"28048609","password":"28048609","role":"sekolah","npsn":"28048609","nama_instansi":"SD NEGERI PUGAAN","kecamatan":"Pugaan"},
    "24210048": {"uid":"school-24210048","email":"24210048","password":"24210048","role":"sekolah","npsn":"24210048","nama_instansi":"SD NEGERI SEI RUKAM I.2","kecamatan":"Pugaan"},
    "36494298": {"uid":"school-36494298","email":"36494298","password":"36494298","role":"sekolah","npsn":"36494298","nama_instansi":"SD NEGERI TAMUNTI","kecamatan":"Pugaan"},
    "13039157": {"uid":"school-13039157","email":"13039157","password":"13039157","role":"sekolah","npsn":"13039157","nama_instansi":"SD NEGERI 1 AGUNG","kecamatan":"Banua Lawas"},
    "42642184": {"uid":"school-42642184","email":"42642184","password":"42642184","role":"sekolah","npsn":"42642184","nama_instansi":"SD NEGERI 1 HIKUN","kecamatan":"Banua Lawas"},
    "23946257": {"uid":"school-23946257","email":"23946257","password":"23946257","role":"sekolah","npsn":"23946257","nama_instansi":"SD NEGERI 1 JANGKUNG","kecamatan":"Banua Lawas"},
    "34862760": {"uid":"school-34862760","email":"34862760","password":"34862760","role":"sekolah","npsn":"34862760","nama_instansi":"SD NEGERI 1 KALAHANG","kecamatan":"Banua Lawas"},
    "53113996": {"uid":"school-53113996","email":"53113996","password":"53113996","role":"sekolah","npsn":"53113996","nama_instansi":"SD NEGERI 1 PAMARANGAN KIWA","kecamatan":"Banua Lawas"},
    "23983297": {"uid":"school-23983297","email":"23983297","password":"23983297","role":"sekolah","npsn":"23983297","nama_instansi":"SD NEGERI 1 TANJUNG","kecamatan":"Tanjung"},
    "21546383": {"uid":"school-21546383","email":"21546383","password":"21546383","role":"sekolah","npsn":"21546383","nama_instansi":"SD NEGERI 1 WAYAU","kecamatan":"Banua Lawas"},
    "32526242": {"uid":"school-32526242","email":"32526242","password":"32526242","role":"sekolah","npsn":"32526242","nama_instansi":"SD NEGERI 1.2 KAMBITIN","kecamatan":"Banua Lawas"},
    "42888341": {"uid":"school-42888341","email":"42888341","password":"42888341","role":"sekolah","npsn":"42888341","nama_instansi":"SD NEGERI 2 AGUNG","kecamatan":"Banua Lawas"},
    "37115188": {"uid":"school-37115188","email":"37115188","password":"37115188","role":"sekolah","npsn":"37115188","nama_instansi":"SD NEGERI 2 HIKUN","kecamatan":"Banua Lawas"},
    "15959122": {"uid":"school-15959122","email":"15959122","password":"15959122","role":"sekolah","npsn":"15959122","nama_instansi":"SD NEGERI 2 JANGKUNG","kecamatan":"Banua Lawas"},
    "26968998": {"uid":"school-26968998","email":"26968998","password":"26968998","role":"sekolah","npsn":"26968998","nama_instansi":"SD NEGERI 2 KALAHANG","kecamatan":"Banua Lawas"},
    "29265282": {"uid":"school-29265282","email":"29265282","password":"29265282","role":"sekolah","npsn":"29265282","nama_instansi":"SD NEGERI 2 PAMARANGAN KIWA","kecamatan":"Banua Lawas"},
    "18613948": {"uid":"school-18613948","email":"18613948","password":"18613948","role":"sekolah","npsn":"18613948","nama_instansi":"SD NEGERI 2 TANJUNG","kecamatan":"Tanjung"},
    "10454280": {"uid":"school-10454280","email":"10454280","password":"10454280","role":"sekolah","npsn":"10454280","nama_instansi":"SD NEGERI 2 WAYAU","kecamatan":"Banua Lawas"},
    "16208482": {"uid":"school-16208482","email":"16208482","password":"16208482","role":"sekolah","npsn":"16208482","nama_instansi":"SD NEGERI 3 HIKUN","kecamatan":"Banua Lawas"},
    "36967176": {"uid":"school-36967176","email":"36967176","password":"36967176","role":"sekolah","npsn":"36967176","nama_instansi":"SD NEGERI 3 JANGKUNG","kecamatan":"Banua Lawas"},
    "19129456": {"uid":"school-19129456","email":"19129456","password":"19129456","role":"sekolah","npsn":"19129456","nama_instansi":"SD NEGERI 3 TANJUNG","kecamatan":"Tanjung"},
    "27456069": {"uid":"school-27456069","email":"27456069","password":"27456069","role":"sekolah","npsn":"27456069","nama_instansi":"SD NEGERI 5.8 TANJUNG","kecamatan":"Tanjung"},
    "41498744": {"uid":"school-41498744","email":"41498744","password":"41498744","role":"sekolah","npsn":"41498744","nama_instansi":"SD NEGERI 6 TANJUNG","kecamatan":"Tanjung"},
    "39385260": {"uid":"school-39385260","email":"39385260","password":"39385260","role":"sekolah","npsn":"39385260","nama_instansi":"SD NEGERI 9 TANJUNG","kecamatan":"Tanjung"},
    "15950803": {"uid":"school-15950803","email":"15950803","password":"15950803","role":"sekolah","npsn":"15950803","nama_instansi":"SD NEGERI BANYU TAJUN","kecamatan":"Banua Lawas"},
    "22962633": {"uid":"school-22962633","email":"22962633","password":"22962633","role":"sekolah","npsn":"22962633","nama_instansi":"SD NEGERI DUKUH","kecamatan":"Banua Lawas"},
    "33225171": {"uid":"school-33225171","email":"33225171","password":"33225171","role":"sekolah","npsn":"33225171","nama_instansi":"SD NEGERI GARUNGGUNG","kecamatan":"Banua Lawas"},
    "41463477": {"uid":"school-41463477","email":"41463477","password":"41463477","role":"sekolah","npsn":"41463477","nama_instansi":"SD NEGERI KABUAU","kecamatan":"Banua Lawas"},
    "20399009": {"uid":"school-20399009","email":"20399009","password":"20399009","role":"sekolah","npsn":"20399009","nama_instansi":"SD NEGERI KAMBITIN","kecamatan":"Banua Lawas"},
    "19992277": {"uid":"school-19992277","email":"19992277","password":"19992277","role":"sekolah","npsn":"19992277","nama_instansi":"SD NEGERI MAHE SEBERANG","kecamatan":"Banua Lawas"},
    "33701639": {"uid":"school-33701639","email":"33701639","password":"33701639","role":"sekolah","npsn":"33701639","nama_instansi":"SD NEGERI PANGI","kecamatan":"Banua Lawas"},
    "69135852": {"uid":"school-69135852","email":"69135852","password":"69135852","role":"sekolah","npsn":"69135852","nama_instansi":"SD NEGERI PUAIN KIWA","kecamatan":"Banua Lawas"},
    "67530434": {"uid":"school-67530434","email":"67530434","password":"67530434","role":"sekolah","npsn":"67530434","nama_instansi":"SD NEGERI SEI PIMPING","kecamatan":"Banua Lawas"},
    "30565897": {"uid":"school-30565897","email":"30565897","password":"30565897","role":"sekolah","npsn":"30565897","nama_instansi":"SD NEGERI SIDOREJO","kecamatan":"Banua Lawas"},
    "82142021": {"uid":"school-82142021","email":"82142021","password":"82142021","role":"sekolah","npsn":"82142021","nama_instansi":"SD NEGERI TABING SIRING","kecamatan":"Banua Lawas"},
    "39871263": {"uid":"school-39871263","email":"39871263","password":"39871263","role":"sekolah","npsn":"39871263","nama_instansi":"SD NEGERI WIKAU","kecamatan":"Banua Lawas"},
    "23165842": {"uid":"school-23165842","email":"23165842","password":"23165842","role":"sekolah","npsn":"23165842","nama_instansi":"SDIT AR RISALAH TANJUNG","kecamatan":"Banua Lawas"},
    "29676130": {"uid":"school-29676130","email":"29676130","password":"29676130","role":"sekolah","npsn":"29676130","nama_instansi":"SD NEGERI 1 PADANG PANJANG","kecamatan":"Tanta"},
    "38829645": {"uid":"school-38829645","email":"38829645","password":"38829645","role":"sekolah","npsn":"38829645","nama_instansi":"SD NEGERI 1 TANTA TIMUR","kecamatan":"Tanta"},
    "20369624": {"uid":"school-20369624","email":"20369624","password":"20369624","role":"sekolah","npsn":"20369624","nama_instansi":"SD NEGERI 1.2 MANGKUSIP","kecamatan":"Tanta"},
    "32525353": {"uid":"school-32525353","email":"32525353","password":"32525353","role":"sekolah","npsn":"32525353","nama_instansi":"SD NEGERI 2 TANTA TIMUR","kecamatan":"Tanta"},
    "13397435": {"uid":"school-13397435","email":"13397435","password":"13397435","role":"sekolah","npsn":"13397435","nama_instansi":"SD NEGERI BINGKAI SARI","kecamatan":"Tanta"},
    "21385327": {"uid":"school-21385327","email":"21385327","password":"21385327","role":"sekolah","npsn":"21385327","nama_instansi":"SD NEGERI DAHUR","kecamatan":"Tanta"},
    "38512072": {"uid":"school-38512072","email":"38512072","password":"38512072","role":"sekolah","npsn":"38512072","nama_instansi":"SD NEGERI DUHAT","kecamatan":"Tanta"},
    "40289408": {"uid":"school-40289408","email":"40289408","password":"40289408","role":"sekolah","npsn":"40289408","nama_instansi":"SD NEGERI HAUS","kecamatan":"Tanta"},
    "21327142": {"uid":"school-21327142","email":"21327142","password":"21327142","role":"sekolah","npsn":"21327142","nama_instansi":"SD NEGERI LABURAN","kecamatan":"Tanta"},
    "36245584": {"uid":"school-36245584","email":"36245584","password":"36245584","role":"sekolah","npsn":"36245584","nama_instansi":"SD NEGERI LUKBAYUR","kecamatan":"Tanta"},
    "30697349": {"uid":"school-30697349","email":"30697349","password":"30697349","role":"sekolah","npsn":"30697349","nama_instansi":"SD NEGERI PADANGIN","kecamatan":"Tanta"},
    "15825131": {"uid":"school-15825131","email":"15825131","password":"15825131","role":"sekolah","npsn":"15825131","nama_instansi":"SD NEGERI PAMARANGAN KANAN","kecamatan":"Tanta"},
    "17879073": {"uid":"school-17879073","email":"17879073","password":"17879073","role":"sekolah","npsn":"17879073","nama_instansi":"SD NEGERI PAMARANGAN RAYA","kecamatan":"Tanta"},
    "60638567": {"uid":"school-60638567","email":"60638567","password":"60638567","role":"sekolah","npsn":"60638567","nama_instansi":"SD NEGERI PUAIN KANAN","kecamatan":"Tanta"},
    "10831629": {"uid":"school-10831629","email":"10831629","password":"10831629","role":"sekolah","npsn":"10831629","nama_instansi":"SD NEGERI PULAU KUU","kecamatan":"Tanta"},
    "12610376": {"uid":"school-12610376","email":"12610376","password":"12610376","role":"sekolah","npsn":"12610376","nama_instansi":"SD NEGERI TAMIYANG","kecamatan":"Tanta"},
    "20319128": {"uid":"school-20319128","email":"20319128","password":"20319128","role":"sekolah","npsn":"20319128","nama_instansi":"SD NEGERI TANTA","kecamatan":"Tanta"},
    "23740424": {"uid":"school-23740424","email":"23740424","password":"23740424","role":"sekolah","npsn":"23740424","nama_instansi":"SD NEGERI TANTA HULU","kecamatan":"Tanta"},
    "37494158": {"uid":"school-37494158","email":"37494158","password":"37494158","role":"sekolah","npsn":"37494158","nama_instansi":"SD NEGERI URATA","kecamatan":"Tanta"},
    "34004947": {"uid":"school-34004947","email":"34004947","password":"34004947","role":"sekolah","npsn":"34004947","nama_instansi":"SD NEGERI WALANGKIR","kecamatan":"Tanta"},
    "12804603": {"uid":"school-12804603","email":"12804603","password":"12804603","role":"sekolah","npsn":"12804603","nama_instansi":"SD NEGERI WARUKIN","kecamatan":"Tanta"},
    "32870948": {"uid":"school-32870948","email":"32870948","password":"32870948","role":"sekolah","npsn":"32870948","nama_instansi":"SDIT AN-NAHL","kecamatan":"Tanta"},
    "30291726": {"uid":"school-30291726","email":"30291726","password":"30291726","role":"sekolah","npsn":"30291726","nama_instansi":"SD NEGERI 1 BILAS","kecamatan":"Upau"},
    "31386134": {"uid":"school-31386134","email":"31386134","password":"31386134","role":"sekolah","npsn":"31386134","nama_instansi":"SD NEGERI 1 KINARUM","kecamatan":"Upau"},
    "33505454": {"uid":"school-33505454","email":"33505454","password":"33505454","role":"sekolah","npsn":"33505454","nama_instansi":"SD NEGERI 1 MASINGAI I","kecamatan":"Upau"},
    "37457731": {"uid":"school-37457731","email":"37457731","password":"37457731","role":"sekolah","npsn":"37457731","nama_instansi":"SD NEGERI 1 MASINGAI II","kecamatan":"Upau"},
    "41493704": {"uid":"school-41493704","email":"41493704","password":"41493704","role":"sekolah","npsn":"41493704","nama_instansi":"SD NEGERI 1.2 PANGELAK","kecamatan":"Upau"},
    "21291339": {"uid":"school-21291339","email":"21291339","password":"21291339","role":"sekolah","npsn":"21291339","nama_instansi":"SD NEGERI 2 KINARUM","kecamatan":"Upau"},
    "48369272": {"uid":"school-48369272","email":"48369272","password":"48369272","role":"sekolah","npsn":"48369272","nama_instansi":"SD NEGERI 2 MASINGAI II","kecamatan":"Upau"},
    "39872120": {"uid":"school-39872120","email":"39872120","password":"39872120","role":"sekolah","npsn":"39872120","nama_instansi":"SD NEGERI SUNGAI RUMBIA","kecamatan":"Upau"},
};

// Function to update password
export function updateDemoUserPassword(npsnOrUid: string, newPass: string) {
    if (DEMO_USERS[npsnOrUid]) {
        DEMO_USERS[npsnOrUid].password = newPass;
    } else {
        // search by uid
        const userKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].uid === npsnOrUid);
        if (userKey) DEMO_USERS[userKey].password = newPass;
    }
}

export function resetSekolahPassword(npsn: string) {
    if (DEMO_USERS[npsn]) {
        DEMO_USERS[npsn].password = DEMO_USERS[npsn].npsn;
    }
}

export function getAllSchools(): DemoUser[] {
    return Object.values(DEMO_USERS).filter(u => u.role === "sekolah");
}

// ── Report Data ─────────────────────────────────────────────
export type DemoReport = {
    id: string;
    npsn_sekolah: string;
    nama_sekolah: string;
    link_jurnal: string;
    link_daftar_hadir: string;
    link_dokumentasi: string;
    status: "Menunggu" | "Revisi" | "Terverifikasi";
    catatan_revisi: string;
    bulan_laporan: string;
    created_at: string;
    kecamatan: string;
};

let _reports: DemoReport[] = [
    {
        id: "rpt-001",
        npsn_sekolah: "65978796",
        nama_sekolah: "SD NEGERI 1 HAPALAH",
        link_jurnal: "https://drive.google.com/demo-jurnal-1",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-1",
        link_dokumentasi: "https://drive.google.com/demo-dok-1",
        status: "Terverifikasi",
        catatan_revisi: "Laporan lengkap dan sesuai.",
        bulan_laporan: "2026-01",
        created_at: "2026-01-15T08:30:00.000Z",
        kecamatan: "Banua Lawas",
    },
    {
        id: "rpt-002",
        npsn_sekolah: "65978796",
        nama_sekolah: "SD NEGERI 1 HAPALAH",
        link_jurnal: "https://drive.google.com/demo-jurnal-2",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-2",
        link_dokumentasi: "https://drive.google.com/demo-dok-2",
        status: "Menunggu",
        catatan_revisi: "",
        bulan_laporan: "2026-02",
        created_at: "2026-02-12T09:00:00.000Z",
        kecamatan: "Banua Lawas",
    },
    {
        id: "rpt-003",
        npsn_sekolah: "65978796",
        nama_sekolah: "SD NEGERI 1 HAPALAH",
        link_jurnal: "https://drive.google.com/demo-jurnal-3",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-3",
        link_dokumentasi: "https://drive.google.com/demo-dok-3",
        status: "Revisi",
        catatan_revisi: "Dokumentasi foto kurang lengkap, tambahkan foto kegiatan outdoor.",
        bulan_laporan: "2026-03",
        created_at: "2026-03-10T07:45:00.000Z",
        kecamatan: "Banua Lawas",
    },
    {
        id: "rpt-004",
        npsn_sekolah: "3010202",
        nama_sekolah: "SDN 2 Murung Pudak",
        link_jurnal: "https://drive.google.com/demo-jurnal-4",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-4",
        link_dokumentasi: "https://drive.google.com/demo-dok-4",
        status: "Terverifikasi",
        catatan_revisi: "Sudah sesuai standar.",
        bulan_laporan: "2026-01",
        created_at: "2026-01-20T10:00:00.000Z",
        kecamatan: "Murung Pudak",
    },
    {
        id: "rpt-005",
        npsn_sekolah: "3010303",
        nama_sekolah: "SDN 3 Kelua",
        link_jurnal: "https://drive.google.com/demo-jurnal-5",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-5",
        link_dokumentasi: "https://drive.google.com/demo-dok-5",
        status: "Menunggu",
        catatan_revisi: "",
        bulan_laporan: "2026-02",
        created_at: "2026-02-18T08:15:00.000Z",
        kecamatan: "Kelua",
    },
    {
        id: "rpt-006",
        npsn_sekolah: "3010404",
        nama_sekolah: "SDN 4 Haruai",
        link_jurnal: "https://drive.google.com/demo-jurnal-6",
        link_daftar_hadir: "https://drive.google.com/demo-hadir-6",
        link_dokumentasi: "https://drive.google.com/demo-dok-6",
        status: "Terverifikasi",
        catatan_revisi: "Sangat baik, lanjutkan!",
        bulan_laporan: "2026-03",
        created_at: "2026-03-05T11:30:00.000Z",
        kecamatan: "Haruai",
    },
];

export function getDemoReports(): DemoReport[] {
    return [..._reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getDemoReportsByNpsn(npsn: string): DemoReport[] {
    return getDemoReports().filter((r) => r.npsn_sekolah === npsn);
}

export function addDemoReport(report: Omit<DemoReport, "id">): DemoReport {
    const newReport: DemoReport = { ...report, id: `rpt-${Date.now()}` };
    _reports = [newReport, ..._reports];
    return newReport;
}

export function deleteDemoReport(id: string) {
    _reports = _reports.filter((r) => r.id !== id);
}

export function updateDemoReportStatus(id: string, status: DemoReport["status"], catatan: string) {
    _reports = _reports.map((r) => (r.id === id ? { ...r, status, catatan_revisi: catatan } : r));
}

// ── SK / Decrees ────────────────────────────────────────────
export type DemoSK = {
    id: string;
    nomor_surat: string;
    judul: string;
    file_url_firebase: string;
    created_at: string;
};

let _sks: DemoSK[] = [
    {
        id: "sk-001",
        nomor_surat: "SK/001/DISDIK/2026",
        judul: "Penetapan Pelaksanaan Program PEKA SD Tahun Ajaran 2025/2026",
        file_url_firebase: "#",
        created_at: "2026-01-05T09:00:00.000Z",
    },
    {
        id: "sk-002",
        nomor_surat: "SK/002/DISDIK/2026",
        judul: "Penunjukan Tim Verifikasi Laporan Kegiatan PEKA Kabupaten Tabalong",
        file_url_firebase: "#",
        created_at: "2026-01-20T10:00:00.000Z",
    },
    {
        id: "sk-003",
        nomor_surat: "SK/003/DISDIK/2026",
        judul: "Jadwal Pelaporan Bulanan Kegiatan PEKA Sekolah Dasar Semester Genap",
        file_url_firebase: "#",
        created_at: "2026-02-10T08:30:00.000Z",
    },
];

export function getDemoSKs(): DemoSK[] {
    return [..._sks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addDemoSK(sk: Omit<DemoSK, "id">): DemoSK {
    const newSK: DemoSK = { ...sk, id: `sk-${Date.now()}` };
    _sks = [newSK, ..._sks];
    return newSK;
}

export function deleteDemoSK(id: string) {
    _sks = _sks.filter((s) => s.id !== id);
}

// ── Dokumentasi ─────────────────────────────────────────────
export type DemoDoc = {
    id: string;
    judul_kegiatan: string;
    deskripsi: string;
    thumbnail_url: string;
    link_tautan: string;
    created_at: string;
};

let _docs: DemoDoc[] = [
    {
        id: "doc-001",
        judul_kegiatan: "Sosialisasi Kurikulum Merdeka",
        deskripsi: "Kegiatan sosialisasi kurikulum merdeka kepada seluruh guru SD di Kabupaten Tabalong. Dihadiri oleh 120 peserta dari 45 sekolah.",
        thumbnail_url: "https://placehold.co/800x600/3b82f6/ffffff?text=Sosialisasi+Kurikulum",
        link_tautan: "https://drive.google.com/drive/folders/contoh-link-1",
        created_at: "2026-02-20T08:00:00.000Z",
    },
    {
        id: "doc-002",
        judul_kegiatan: "Workshop Penilaian Kinerja Guru",
        deskripsi: "Workshop peningkatan kapasitas guru dalam penilaian kinerja berbasis kompetensi. Materi meliputi asesmen formatif dan sumatif.",
        thumbnail_url: "https://placehold.co/800x600/10b981/ffffff?text=Workshop+PKG",
        link_tautan: "https://drive.google.com/drive/folders/contoh-link-2",
        created_at: "2026-01-15T09:30:00.000Z",
    },
    {
        id: "doc-003",
        judul_kegiatan: "Rapat Koordinasi Kepala Sekolah",
        deskripsi: "Rapat koordinasi rutin dengan seluruh kepala sekolah dasar di wilayah Kabupaten Tabalong membahas program semester genap.",
        thumbnail_url: "https://placehold.co/800x600/f59e0b/ffffff?text=Rakor+Kepsek",
        link_tautan: "https://drive.google.com/drive/folders/contoh-link-3",
        created_at: "2026-03-01T10:00:00.000Z",
    },
];

export function getDemoDocs(): DemoDoc[] {
    return [..._docs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addDemoDoc(doc: Omit<DemoDoc, "id">): DemoDoc {
    const newDoc: DemoDoc = { ...doc, id: `doc-${Date.now()}` };
    _docs = [newDoc, ..._docs];
    return newDoc;
}

export function deleteDemoDoc(id: string) {
    _docs = _docs.filter((d) => d.id !== id);
}
