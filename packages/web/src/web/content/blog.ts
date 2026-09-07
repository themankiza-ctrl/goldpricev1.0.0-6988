/**
 * Static blog content. No database, no markdown parser — posts are plain data
 * so the site stays a single build artifact and nothing can 500 on a bad post.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  tag: string;
  blocks: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "kako-se-formira-cena-investicionog-zlata",
    title: "Kako se formira cena investicionog zlata",
    description:
      "Spot cena zlata, zvanični kurs NBS-a i marža — tri broja iz kojih nastaje svaka cena u našem cenovniku.",
    date: "2026-09-07",
    readMinutes: 4,
    tag: "Osnove",
    blocks: [
      {
        type: "p",
        text: "Cena zlatne poluge nije proizvoljna brojka koju prodavac upiše u tabelu. Ona nastaje iz tri sastojka: berzanske spot cene zlata, kursa evra prema dinaru i marže prodavca. Ako razumete sva tri, umete da procenite da li je ponuda koju gledate poštena.",
      },
      { type: "h", text: "1. Spot cena (XAU)" },
      {
        type: "p",
        text: "Spot je međunarodna cena jedne troj unce čistog zlata, izražena u dolarima ili evrima. Menja se neprekidno dok su svetska tržišta otvorena. Iz spota se dobija bazna cena po gramu: spot podeljen sa 31,1035 grama koliko ima jedna unca.",
      },
      {
        type: "p",
        text: "Naš sistem povlači spot automatski i preračunava ceo cenovnik na svakih 30 sekundi. To znači da cena koju vidite na sajtu nije jučerašnja — ona prati berzu u realnom vremenu.",
      },
      { type: "h", text: "2. Kurs evra" },
      {
        type: "p",
        text: "Zlato se na tržištu kotira u stranoj valuti, a vi plaćate u dinarima. Za preračun koristimo zvanični srednji kurs Narodne banke Srbije. Kada kurs skoči, dinarska cena zlata raste iako se spot uopšte nije pomerio — i obrnuto.",
      },
      { type: "h", text: "3. Marža i razlika između prodaje i otkupa" },
      {
        type: "p",
        text: "Na baznu cenu se dodaje marža koja pokriva nabavku od kovnice, transport, osiguranje i rad. Marža je po pravilu procentualno veća na sitnim gramažama: proizvodnja pločice od 1 g košta gotovo isto kao proizvodnja pločice od 100 g, ali se taj trošak raspoređuje na sto puta manje zlata.",
      },
      {
        type: "list",
        items: [
          "Manja gramaža — veća marža po gramu, ali niži ulazni prag.",
          "Veća gramaža — niža marža po gramu, ali veći iznos odjednom.",
          "Razlika između prodajne i otkupne cene (spred) pokazuje koliko tržište mora da poraste da biste izašli na nulu.",
        ],
      },
      { type: "h", text: "Šta iz ovoga da zapamtite" },
      {
        type: "p",
        text: "Kada upoređujete ponude, ne gledajte samo prodajnu cenu. Uporedite spred — razliku između cene po kojoj vam prodaju i cene po kojoj otkupljuju istu robu. Uzak spred i cena koja se vidno menja tokom dana su znak da prodavac zaista prati tržište.",
      },
      {
        type: "note",
        text: "Cene u našem cenovniku su informativne i menjaju se sa berzanskim kursom. Otkup se uvek računa iz baznog spota.",
      },
    ],
  },
  {
    slug: "zakljucavanje-cene-kako-radi",
    title: "Zaključavanje cene — kako radi i zašto postoji",
    description:
      "Fiksirajte cenu na 30 minuta do 12 sati dok ne dođete po robu. Bez uplate unapred, potrebni su samo ime i telefon.",
    date: "2026-09-05",
    readMinutes: 3,
    tag: "Kako radi",
    blocks: [
      {
        type: "p",
        text: "Najčešća frustracija pri kupovini zlata: vidite cenu ujutru, dogovorite se kod kuće, dođete posle podne — a cena više nije ista. Zaključavanje cene rešava upravo to.",
      },
      { type: "h", text: "Kako izgleda u praksi" },
      {
        type: "list",
        items: [
          "U cenovniku kliknete ZAKLJUČAJ pored proizvoda koji vas zanima.",
          "Birate koliko dugo cena treba da važi: 30 minuta, 1 sat, 6 sati ili 12 sati. Podrazumevano je 1 sat.",
          "Ostavljate ime i broj telefona. Nema uplate, nema kartice, nema avansa.",
          "Dobijate broj rezervacije u formatu GF-XXXX i cenu koja je u tom trenutku evidentirana kod nas.",
          "Dolazite u tom roku i preuzimate robu po zaključanoj ceni, bez obzira šta je berza u međuvremenu uradila.",
        ],
      },
      { type: "h", text: "Zašto uopšte nudimo ovo" },
      {
        type: "p",
        text: "Zato što nam je preciznije. Kada znamo da neko dolazi po tačno određenu robu u poznatom roku, možemo da uskladimo zalihe i da vam ponudimo užu razliku nego kada radimo na slepo. Vi dobijate izvesnost, mi dobijamo predvidivost.",
      },
      { type: "h", text: "Granice" },
      {
        type: "list",
        items: [
          "Online zaključavanje ide do 20.000 evra ukupne vrednosti. Za veće iznose se dogovaramo telefonom.",
          "Cenu obračunava naš server u trenutku slanja zahteva — ne prepisuje se sa ekrana.",
          "Ako ne dođete u roku, rezervacija jednostavno istekne. Nema penala i nema obaveze.",
        ],
      },
      {
        type: "note",
        text: "Zaključavanje nije kupovina na daljinu i ne obavezuje vas da kupite. To je samo fiksirana cena za dogovoreni rok.",
      },
    ],
  },
  {
    slug: "poluge-ili-dukati",
    title: "Poluge ili dukati — šta uzeti",
    description:
      "Finoća, gramaža, zavarena kartica i sertifikat. Praktično poređenje zlatnih pločica i dukata za nekoga ko kupuje prvi put.",
    date: "2026-09-02",
    readMinutes: 5,
    tag: "Vodič",
    blocks: [
      {
        type: "p",
        text: "Dva najčešća oblika investicionog zlata na našem tržištu su poluge (pločice) i kovani novac — dukati i kovanice poput Wiener Philharmonikera. Razlikuju se po finoći, po tome kako se čuvaju i po tome koliko lako se prodaju dalje.",
      },
      { type: "h", text: "Finoća" },
      {
        type: "list",
        items: [
          "Zlatne pločice i poluge: finoća 999,9 — praktično čisto zlato.",
          "Wiener Philharmoniker kovanice: finoća 999,9.",
          "Dukati tipa Franc Jozef: finoća 986, dakle legura sa malo bakra, zbog čega su otporniji na ogrebotine.",
        ],
      },
      {
        type: "p",
        text: "Niža finoća dukata ne znači manju vrednost po gramu čistog zlata — samo znači da komad sadrži nešto manje zlata nego što mu je ukupna masa. Cena se uvek računa na sadržaj čistog zlata.",
      },
      { type: "h", text: "Pakovanje i sertifikat" },
      {
        type: "p",
        text: "Savremene pločice dolaze zavarene u plastičnu karticu sa serijskim brojem i sertifikatom kovnice. Karticu ne treba otvarati: neotvorena ambalaža ubrzava proveru pri kasnijoj prodaji. Dukati se najčešće isporučuju bez kartice, jer se njihova autentičnost proverava merenjem i dimenzijama.",
      },
      { type: "h", text: "Kako da izaberete" },
      {
        type: "list",
        items: [
          "Ulazite sa manjim iznosom i želite fleksibilnost pri prodaji — sitnije gramaže ili dukati.",
          "Ulažete veći iznos odjednom i cilj vam je najniža cena po gramu — veće pločice, 50 g, 100 g i naviše.",
          "Želite komad koji se lako prepoznaje i prodaje bilo gde — kovanice poznatih kovnica.",
        ],
      },
      {
        type: "p",
        text: "U praksi mnogi kombinuju: jedan veći komad kao osnovu portfolija i nekoliko sitnijih koje je lako unovčiti bez razbijanja cele pozicije.",
      },
      {
        type: "note",
        text: "Radimo sa proizvodima švajcarskih i austrijskih kovnica. Aktuelne gramaže i cene su u cenovniku na naslovnoj strani.",
      },
    ],
  },
  {
    slug: "investiciono-zlato-i-pdv-u-srbiji",
    title: "Investiciono zlato i PDV u Srbiji",
    description:
      "Zašto na investiciono zlato nema PDV-a, šta se tačno smatra investicionim zlatom i zašto srebro ima drugačiji tretman.",
    date: "2026-08-28",
    readMinutes: 4,
    tag: "Porezi",
    blocks: [
      {
        type: "p",
        text: "Kupci se često iznenade kada vide da na zlatnu polugu ne plaćaju porez na dodatu vrednost, a na srebrnu kovanicu plaćaju. Razlog je poseban poreski tretman investicionog zlata.",
      },
      { type: "h", text: "Zakonski osnov" },
      {
        type: "p",
        text: "Promet investicionog zlata je oslobođen PDV-a na osnovu člana 36b Zakona o porezu na dodatu vrednost. Oslobođenje se odnosi na isporuku, uvoz i posredovanje u prometu investicionog zlata.",
      },
      { type: "h", text: "Šta se smatra investicionim zlatom" },
      {
        type: "list",
        items: [
          "Zlato u obliku poluge ili pločice, sa masom i finoćom koje prihvataju tržišta plemenitih metala, finoće jednake ili veće od 995 hiljaditih delova.",
          "Zlatni novac određene finoće, koji je bio ili jeste zakonsko sredstvo plaćanja u zemlji porekla i koji se prodaje po ceni bliskoj tržišnoj vrednosti zlata koje sadrži.",
        ],
      },
      {
        type: "p",
        text: "Zbog toga i zlatne pločice finoće 999,9 i dukati koji ispunjavaju uslove ulaze u režim bez PDV-a, dok nakit — koji nije investiciono zlato — ne ulazi.",
      },
      { type: "h", text: "Zašto srebro nije isto" },
      {
        type: "p",
        text: "Oslobođenje se odnosi samo na zlato. Srebrne poluge i kovanice se oporezuju po opštoj stopi od 20%, što je i razlog zašto je razlika između prodajne i otkupne cene kod srebra po pravilu šira nego kod zlata.",
      },
      {
        type: "note",
        text: "Ovaj tekst je informativnog karaktera i ne predstavlja poresko savetovanje. Za konkretnu situaciju obratite se poreskom savetniku.",
      },
    ],
  },
];

export function findPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  const months = [
    "januar",
    "februar",
    "mart",
    "april",
    "maj",
    "jun",
    "jul",
    "avgust",
    "septembar",
    "oktobar",
    "novembar",
    "decembar",
  ];
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}
