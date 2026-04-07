const fs = require('fs');
const crypto = require('crypto');

// The raw CSV text based on the viewed chunks
const csvText = `Nama Sekolah,Kecamatan
SD NEGERI 1 HAPALAH,Kec. Banua Lawas
SD NEGERI 2 HAPALAH,Kec. Banua Lawas
SD NEGERI BANGKILING,Kec. Banua Lawas
SD NEGERI BANUA RANTAU,Kec. Banua Lawas
SD NEGERI BATANG BANYU,Kec. Banua Lawas
SD NEGERI HABAU,Kec. Banua Lawas
SD NEGERI HABAU HULU,Kec. Banua Lawas
SD NEGERI HARIANG,Kec. Banua Lawas
SD NEGERI KUALA PERAK,Kec. Banua Lawas
SD NEGERI PASAR ARBA,Kec. Banua Lawas
SD NEGERI PEMATANG,Kec. Banua Lawas
SD NEGERI PURAI,Kec. Banua Lawas
SD NEGERI SEI HANYAR 2,Kec. Banua Lawas
SD NEGERI TALAN,Kec. Banua Lawas
SD NEGERI TELAGA RAYA,Kec. Banua Lawas
SD NEGERI 1 BINTANG ARA,Kec. Bintang Ara
SD NEGERI 1 BURUM,Kec. Bintang Ara
SD NEGERI 1 DAMBUNG,Kec. Bintang Ara
SD NEGERI 1 USIH,Kec. Bintang Ara
SD NEGERI 1 WALING,Kec. Bintang Ara
SD NEGERI 2 WALING,Kec. Bintang Ara
SD NEGERI BINTANG ARA,Kec. Bintang Ara
SD NEGERI BURUM,Kec. Bintang Ara
SD NEGERI DAMBUNG,Kec. Bintang Ara
SD NEGERI DUYUN BARU,Kec. Bintang Ara
SD NEGERI KUWARI,Kec. Bintang Ara
SD NEGERI MANTUYUP,Kec. Bintang Ara
SD NEGERI MEHO,Kec. Bintang Ara
SD NEGERI PANAAN,Kec. Bintang Ara
SD NEGERI SEI MISSIM,Kec. Bintang Ara
SD NEGERI USIH,Kec. Bintang Ara
SD NEGERI 1 BATU PULUT,Kec. Haruai
SD NEGERI 1 BONGKANG,Kec. Haruai
SD NEGERI 1 HAYUP,Kec. Haruai
SD NEGERI 1 LOK BATU,Kec. Haruai
SD NEGERI 1 MAHE PASAR,Kec. Haruai
SD NEGERI 1 NAWIN HILIR,Kec. Haruai
SD NEGERI 1 SARADANG,Kec. Haruai
SD NEGERI 1.2 SUPUT,Kec. Haruai
SD NEGERI 2 BONGKANG,Kec. Haruai
SD NEGERI 2 KEMBANG KUNING,Kec. Haruai
SD NEGERI 2 LOK BATU,Kec. Haruai
SD NEGERI 2 NAWIN HILIR,Kec. Haruai
SD NEGERI 2.3 HAYUP,Kec. Haruai
SD NEGERI 3 BONGKANG,Kec. Haruai
SD NEGERI 3 KEMBANG KUNING,Kec. Haruai
SD NEGERI 4 HAYUP,Kec. Haruai
SD NEGERI AGUNG,Kec. Haruai
SD NEGERI DANAU,Kec. Haruai
SD NEGERI JURAN,Kec. Haruai
SD NEGERI LAMPAHUNGIN,Kec. Haruai
SD NEGERI MARINDI,Kec. Haruai
SD NEGERI NAWIN,Kec. Haruai
SD NEGERI SARADANG,Kec. Haruai
SD NEGERI SURIAN,Kec. Haruai
SD NEGERI WIRANG,Kec. Haruai
SD ISLAM AL MADANIYAH,Kec. Jaro
SD NEGERI 1 GARAGATA,Kec. Jaro
SD NEGERI 1 JARO,Kec. Jaro
SD NEGERI 1 MUANG,Kec. Jaro
SD NEGERI 1 NALUI,Kec. Jaro
SD NEGERI 1 NAMUN,Kec. Jaro
SD NEGERI 1 SOLAN,Kec. Jaro
SD NEGERI 2 GARAGATA,Kec. Jaro
SD NEGERI 2 JARO,Kec. Jaro
SD NEGERI 2 MUANG,Kec. Jaro
SD NEGERI 2 NAMUN,Kec. Jaro
SD NEGERI 3 JARO,Kec. Jaro
SD NEGERI 3 SOLAN,Kec. Jaro
SD NEGERI LANO,Kec. Jaro
SD NEGERI PURUI,Kec. Jaro
SD NEGERI TERATAU,Kec. Jaro
SD NEGERI 1 PULAU,Kec. Kelua
SD NEGERI 1 SUNGAI BULUH,Kec. Kelua
SD NEGERI 1.2 PUDAK SETEGAL,Kec. Kelua
SD NEGERI 2 KARANGAN PUTIH,Kec. Kelua
SD NEGERI 2 SEI BULUH,Kec. Kelua
SD NEGERI 2.3 PULAU,Kec. Kelua
SD NEGERI AMPUKUNG HULU,Kec. Kelua
SD NEGERI ASAM PAUH,Kec. Kelua
SD NEGERI BAHUNGIN,Kec. Kelua
SD NEGERI BINTURU,Kec. Kelua
SD NEGERI GAYAM,Kec. Kelua
SD NEGERI KARANGAN PUTIH,Kec. Kelua
SD NEGERI MASINTAN,Kec. Kelua
SD NEGERI PALIAT,Kec. Kelua
SD NEGERI PARI PARI,Kec. Kelua
SD NEGERI PASAR MINGGU,Kec. Kelua
SD NEGERI PASAR PANAS,Kec. Kelua
SD NEGERI TAKULAT,Kec. Kelua
SD NEGERI 1 TANTARINGIN,Kec. Muara Harus
SD NEGERI 2 TANTARINGIN,Kec. Muara Harus
SD NEGERI MADANG,Kec. Muara Harus
SD NEGERI MANDUIN,Kec. Muara Harus
SD NEGERI MANTUIL,Kec. Muara Harus
SD NEGERI MURUNG KARANGAN,Kec. Muara Harus
SDN PADANGIN,Kec. Muara Harus
SD NEGERI 1 BINJAI,Kec. Muara Uya
SD NEGERI 1 MANGKUPUM,Kec. Muara Uya
SD NEGERI 1 PALAPI,Kec. Muara Uya
SD NEGERI 1 PASAR BATU,Kec. Muara Uya
SD NEGERI 1 PULAU KUU,Kec. Muara Uya
SD NEGERI 1 RIBANG,Kec. Muara Uya
SD NEGERI 1 SIMPUNG LAYUNG,Kec. Muara Uya
SD NEGERI 1 UWIE,Kec. Muara Uya
SD NEGERI 2 BINJAI,Kec. Muara Uya
SD NEGERI 2 MANGKUPUM,Kec. Muara Uya
SD NEGERI 2 PALAPI,Kec. Muara Uya
SD NEGERI 2 PASAR BATU,Kec. Muara Uya
SD NEGERI 2 PULAU KUU,Kec. Muara Uya
SD NEGERI 2 SIMPUNG LAYUNG,Kec. Muara Uya
SD NEGERI 2 UWIE,Kec. Muara Uya
SD NEGERI 2.3 RIBANG,Kec. Muara Uya
SD NEGERI KAMPUNG BARU,Kec. Muara Uya
SD NEGERI KUPANG NUNDING,Kec. Muara Uya
SD NEGERI LUMBANG,Kec. Muara Uya
SD NEGERI RANDU,Kec. Muara Uya
SD NEGERI SALIKUNG,Kec. Muara Uya
SD NEGERI SANTUUN,Kec. Muara Uya
SD NEGERI SUNGAI KUMAP,Kec. Muara Uya
SD ALAM MUHAMMADIYAH TABALONG,Kec. Murung Pudak
SD ALAM TANJUNG TABALONG,Kec. Murung Pudak
SD HASBUNALLAH,Kec. Murung Pudak
SD INTEGRAL HIDAYATULLAH,Kec. Murung Pudak
SD MUHAMMADIYAH AL MUKHLISHIN,Kec. Murung Pudak
SD NEGERI 1 JAING HILIR,Kec. Murung Pudak
SD NEGERI 1 KAPAR,Kec. Murung Pudak
SD NEGERI 1.2 BELIMBING RAYA,Kec. Murung Pudak
SD NEGERI 1.2 SULINGAN,Kec. Murung Pudak
SD NEGERI 1.5 BELIMBING,Kec. Murung Pudak
SD NEGERI 2 BELIMBING,Kec. Murung Pudak
SD NEGERI 2 JAING HILIR,Kec. Murung Pudak
SD NEGERI 2 KAPAR,Kec. Murung Pudak
SD NEGERI 2 MABUUN,Kec. Murung Pudak
SD NEGERI 2 PEMBATAAN,Kec. Murung Pudak
SD NEGERI 3 BELIMBING,Kec. Murung Pudak
SD NEGERI 3 BELIMBING RAYA,Kec. Murung Pudak
SD NEGERI 3 KAPAR,Kec. Murung Pudak
SD NEGERI 4 BELIMBING,Kec. Murung Pudak
SD NEGERI 4 BELIMBING RAYA,Kec. Murung Pudak
SD NEGERI CAKUNG PERMATA NUSA,Kec. Murung Pudak
SD NEGERI KAPAR HULU,Kec. Murung Pudak
SD NEGERI KASIAU,Kec. Murung Pudak
SD NEGERI KASIAU RAYA,Kec. Murung Pudak
SD NEGERI MABUUN,Kec. Murung Pudak
SD NEGERI MASUKAU,Kec. Murung Pudak
SD NEGERI MASUKAU LUAR,Kec. Murung Pudak
SD NEGERI PEMBATAAN,Kec. Murung Pudak
SD PLUS MURUNG PUDAK,Kec. Murung Pudak
SDN 3 Pembataan,Kec. Murung Pudak
SDN MABURAI,Kec. Murung Pudak
SD NEGERI 1 SEI RUKAM I,Kec. Pugaan
SD NEGERI 1 SEI RUKAM II,Kec. Pugaan
SD NEGERI JIRAK,Kec. Pugaan
SD NEGERI KAYU GATAH,Kec. Pugaan
SD NEGERI PUGAAN,Kec. Pugaan
SD NEGERI SEI RUKAM I.2,Kec. Pugaan
SD NEGERI TAMUNTI,Kec. Pugaan
SD NEGERI 1 AGUNG,Kec. Tanjung
SD NEGERI 1 HIKUN,Kec. Tanjung
SD NEGERI 1 JANGKUNG,Kec. Tanjung
SD NEGERI 1 KALAHANG,Kec. Tanjung
SD NEGERI 1 PAMARANGAN KIWA,Kec. Tanjung
SD NEGERI 1 TANJUNG,Kec. Tanjung
SD NEGERI 1 WAYAU,Kec. Tanjung
SD NEGERI 1.2 KAMBITIN,Kec. Tanjung
SD NEGERI 2 AGUNG,Kec. Tanjung
SD NEGERI 2 HIKUN,Kec. Tanjung
SD NEGERI 2 JANGKUNG,Kec. Tanjung
SD NEGERI 2 KALAHANG,Kec. Tanjung
SD NEGERI 2 PAMARANGAN KIWA,Kec. Tanjung
SD NEGERI 2 TANJUNG,Kec. Tanjung
SD NEGERI 2 WAYAU,Kec. Tanjung
SD NEGERI 3 HIKUN,Kec. Tanjung
SD NEGERI 3 JANGKUNG,Kec. Tanjung
SD NEGERI 3 TANJUNG,Kec. Tanjung
SD NEGERI 5.8 TANJUNG,Kec. Tanjung
SD NEGERI 6 TANJUNG,Kec. Tanjung
SD NEGERI 9 TANJUNG,Kec. Tanjung
SD NEGERI BANYU TAJUN,Kec. Tanjung
SD NEGERI DUKUH,Kec. Tanjung
SD NEGERI GARUNGGUNG,Kec. Tanjung
SD NEGERI KABUAU,Kec. Tanjung
SD NEGERI KAMBITIN,Kec. Tanjung
SD NEGERI MAHE SEBERANG,Kec. Tanjung
SD NEGERI PANGI,Kec. Tanjung
SD NEGERI PUAIN KIWA,Kec. Tanjung
SD NEGERI SEI PIMPING,Kec. Tanjung
SD NEGERI SIDOREJO,Kec. Tanjung
SD NEGERI TABING SIRING,Kec. Tanjung
SD NEGERI WIKAU,Kec. Tanjung
SDIT AR RISALAH TANJUNG,Kec. Tanjung
SD NEGERI 1 PADANG PANJANG,Kec. Tanta
SD NEGERI 1 TANTA TIMUR,Kec. Tanta
SD NEGERI 1.2 MANGKUSIP,Kec. Tanta
SD NEGERI 2 TANTA TIMUR,Kec. Tanta
SD NEGERI BINGKAI SARI,Kec. Tanta
SD NEGERI DAHUR,Kec. Tanta
SD NEGERI DUHAT,Kec. Tanta
SD NEGERI HAUS,Kec. Tanta
SD NEGERI LABURAN,Kec. Tanta
SD NEGERI LUKBAYUR,Kec. Tanta
SD NEGERI PADANGIN,Kec. Tanta
SD NEGERI PAMARANGAN KANAN,Kec. Tanta
SD NEGERI PAMARANGAN RAYA,Kec. Tanta
SD NEGERI PUAIN KANAN,Kec. Tanta
SD NEGERI PULAU KUU,Kec. Tanta
SD NEGERI TAMIYANG,Kec. Tanta
SD NEGERI TANTA,Kec. Tanta
SD NEGERI TANTA HULU,Kec. Tanta
SD NEGERI URATA,Kec. Tanta
SD NEGERI WALANGKIR,Kec. Tanta
SD NEGERI WARUKIN,Kec. Tanta
SDIT AN-NAHL,Kec. Tanta
SD NEGERI 1 BILAS,Kec. Upau
SD NEGERI 1 KINARUM,Kec. Upau
SD NEGERI 1 MASINGAI I,Kec. Upau
SD NEGERI 1 MASINGAI II,Kec. Upau
SD NEGERI 1.2 PANGELAK,Kec. Upau
SD NEGERI 2 KINARUM,Kec. Upau
SD NEGERI 2 MASINGAI II,Kec. Upau
SD NEGERI SUNGAI RUMBIA,Kec. Upau`;

// Consistent simple hash to generate 8-digit NPSN
function generateNPSN(name) {
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  return parseInt(hash.substring(0, 8), 16).toString().substring(0, 8).padStart(8, '4');
}

const lines = csvText.split('\n').filter(Boolean);
lines.shift(); // remove header

const users = lines.map((line, index) => {
  const parts = line.split(',');
  const nama = parts[0].trim();
  const kec = parts[1].trim().replace('Kec. ', '');
  const npsn = generateNPSN(nama);
  return {
    uid: `school-${npsn}`,
    email: npsn, // Use NPSN as username
    password: npsn, // Default password
    role: 'sekolah',
    npsn: npsn,
    nama_instansi: nama,
    kecamatan: kec
  };
});

fs.writeFileSync('src/lib/schools.json', JSON.stringify(users, null, 2));
console.log('Successfully generated src/lib/schools.json with ' + users.length + ' schools!');
