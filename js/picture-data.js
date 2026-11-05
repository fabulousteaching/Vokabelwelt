/* Vokaboom – Offline-Bildwörterbuch
 * Jede Zeile: Bild | Englisch | Deutsch
 * Mehrere Wörter je Sprache mit Komma trennen.
 * Ein Bild ist entweder ein Emoji oder eine Farbe (#rrggbb) für Farbwörter.
 */
window.PICTURE_DATA = `
🍎|apple,red apple|Apfel
🍏|green apple|grüner Apfel
🍐|pear|Birne
🍊|orange,tangerine|Orange,Apfelsine,Mandarine
🍋|lemon|Zitrone
🍌|banana|Banane
🍉|watermelon|Wassermelone
🍇|grapes,grape|Traube,Trauben,Weintraube,Weintrauben
🍓|strawberry,strawberries|Erdbeere,Erdbeeren
🫐|blueberry,blueberries|Heidelbeere,Blaubeere,Heidelbeeren,Blaubeeren
🍈|melon|Melone
🍒|cherry,cherries|Kirsche,Kirschen
🍑|peach|Pfirsich
🥭|mango|Mango
🍍|pineapple|Ananas
🥥|coconut|Kokosnuss
🥝|kiwi|Kiwi
🍅|tomato,tomatoes|Tomate,Tomaten
🍆|aubergine,eggplant|Aubergine
🥑|avocado|Avocado
🥦|broccoli|Brokkoli
🥬|lettuce|Kopfsalat
🥒|cucumber|Gurke
🌶️|chili,chilli|Chili,Peperoni
🫑|pepper,bell pepper|Paprika
🌽|corn,sweetcorn|Mais
🥕|carrot,carrots|Karotte,Möhre,Karotten,Möhren
🧄|garlic|Knoblauch
🧅|onion|Zwiebel
🥔|potato,potatoes|Kartoffel,Kartoffeln
🍄|mushroom,mushrooms|Pilz,Pilze
🥜|peanut,peanuts,nuts|Erdnuss,Erdnüsse,Nüsse
🌰|chestnut|Kastanie
🍞|bread|Brot
🥐|croissant|Croissant,Hörnchen
🥖|baguette|Baguette
🥨|pretzel|Brezel
🧀|cheese|Käse
🥚|egg,eggs|Ei,Eier
🍳|fried egg,frying pan,pan|Spiegelei,Pfanne
🧈|butter|Butter
🥞|pancake,pancakes|Pfannkuchen,Crêpe
🧇|waffle,waffles|Waffel,Waffeln
🥓|bacon|Speck
🥩|meat,steak|Fleisch,Steak
🍗|chicken leg|Hähnchen,Hühnchen,Hähnchenschenkel
🌭|hot dog,sausage|Hotdog,Würstchen,Wurst
🍔|hamburger,burger|Hamburger
🍟|chips,french fries,fries|Pommes,Pommes frites
🍕|pizza|Pizza
🥪|sandwich|Sandwich,belegtes Brot
🌮|taco|Taco
🍝|spaghetti,pasta|Nudeln,Spaghetti
🍲|soup,stew|Suppe,Eintopf
🥗|salad|Salat
🍚|rice|Reis
🍣|sushi|Sushi
🍦|ice cream,ice-cream|Eis,Speiseeis
🍰|cake|Kuchen,Torte
🎂|birthday cake,birthday|Geburtstagskuchen,Geburtstagstorte,Geburtstag
🍪|biscuit,biscuits,cookie,cookies|Keks,Kekse,Plätzchen
🍫|chocolate|Schokolade
🍬|sweet,sweets,candy|Bonbon,Bonbons,Süßigkeiten
🍭|lollipop|Lutscher,Lolli
🍯|honey|Honig
🧁|cupcake,muffin|Muffin,Cupcake
🍩|doughnut,donut|Donut,Krapfen,Berliner
🍿|popcorn|Popcorn
🍮|pudding,dessert|Pudding,Nachtisch,Nachspeise
🥛|milk,glass of milk|Milch
☕|coffee,cup of coffee|Kaffee
🍵|tea|Tee
🧃|juice|Saft
💧|water|Wasser
🥤|lemonade,soft drink,fizzy drink|Limonade,Limo
🧂|salt|Salz
🍽️|plate|Teller
🍴|fork,cutlery|Gabel,Besteck
🥄|spoon|Löffel
🔪|knife|Messer
🥣|bowl,cereal,cereals|Schüssel,Müsli,Schale
🫖|teapot|Teekanne
🧊|ice,ice cube|Eiswürfel
🐶|dog|Hund
🐱|cat|Katze
🐭|mouse|Maus
🐹|hamster|Hamster
🐰|rabbit,bunny|Kaninchen,Hase
🦊|fox|Fuchs
🐻|bear|Bär
🐼|panda|Panda
🐨|koala|Koala
🐯|tiger|Tiger
🦁|lion|Löwe
🐮|cow|Kuh
🐷|pig|Schwein
🐸|frog|Frosch
🐵|monkey|Affe
🐔|chicken,hen|Huhn,Henne
🐓|rooster,cock|Hahn
🐤|chick|Küken
🐧|penguin|Pinguin
🐦|bird|Vogel
🦆|duck|Ente
🦅|eagle|Adler
🦉|owl|Eule
🦜|parrot|Papagei
🦢|swan|Schwan
🕊️|dove,pigeon|Taube
🦃|turkey|Truthahn,Pute
🐺|wolf|Wolf
🐗|wild boar,boar|Wildschwein
🐴|horse|Pferd
🦄|unicorn|Einhorn
🐝|bee|Biene
🐛|caterpillar|Raupe
🦋|butterfly|Schmetterling
🐌|snail|Schnecke
🐞|ladybird,ladybug|Marienkäfer
🐜|ant|Ameise
🕷️|spider|Spinne
🪰|fly|Fliege
🦟|mosquito|Mücke
🪱|worm|Wurm
🐢|tortoise,turtle|Schildkröte
🐍|snake|Schlange
🦎|lizard|Eidechse
🐊|crocodile|Krokodil
🐙|octopus|Krake,Tintenfisch,Oktopus
🦀|crab|Krabbe,Krebs
🐟|fish|Fisch
🐠|tropical fish|Tropenfisch
🐬|dolphin|Delfin,Delphin
🐳|whale|Wal
🦈|shark|Hai
🐘|elephant|Elefant
🦒|giraffe|Giraffe
🦓|zebra|Zebra
🦛|hippo,hippopotamus|Nilpferd,Flusspferd
🦏|rhino,rhinoceros|Nashorn
🐪|camel|Kamel
🐑|sheep|Schaf
🐐|goat|Ziege
🦌|deer|Hirsch,Reh
🐿️|squirrel|Eichhörnchen
🦔|hedgehog|Igel
🦇|bat|Fledermaus
🦖|dinosaur|Dinosaurier,Dino
🐉|dragon|Drache
🐾|paw|Pfote
👁️|eye|Auge
👀|eyes,look,to look,see,to see|Augen,schauen,sehen,gucken
👂|ear,listen,to listen,hear,to hear|Ohr,zuhören,hören
👃|nose|Nase
👄|mouth,lips|Mund,Lippen
🦷|tooth,teeth|Zahn,Zähne
👅|tongue|Zunge
✋|hand|Hand
🦶|foot,feet|Fuß,Füße
🦵|leg|Bein
💪|arm,strong|Arm,stark
👆|finger|Finger
🧠|brain|Gehirn
❤️|heart,love|Herz,Liebe
💇|hair|Haare
🙂|face|Gesicht
👶|baby|Baby
👦|boy|Junge
👧|girl|Mädchen
👨|man|Mann
👩|woman|Frau
👴|grandfather,grandpa,granddad|Großvater,Opa
👵|grandmother,grandma,granny|Großmutter,Oma
👨‍👩‍👧‍👦|family|Familie
👩‍👧|mother,mum,mom,mummy|Mutter,Mama
👨‍👦|father,dad,daddy|Vater,Papa
🧑‍🤝‍🧑|friend,friends|Freund,Freundin,Freunde
👑|crown|Krone
👸|princess|Prinzessin
🤴|prince|Prinz
🧑‍🏫|teacher|Lehrer,Lehrerin,Lehrkraft
🧑‍🎓|student,pupil|Schüler,Schülerin,Student,Studentin
🧑‍⚕️|doctor|Arzt,Ärztin
👮|police officer,policeman,policewoman|Polizist,Polizistin
🧑‍🚒|firefighter,fireman|Feuerwehrmann,Feuerwehrfrau
🧑‍🍳|cook,chef,to cook,cooking|Koch,Köchin,kochen
🧑‍🌾|farmer|Bauer,Bäuerin,Landwirt
🧑‍🚀|astronaut|Astronaut,Astronautin
👷|builder,worker|Bauarbeiter,Arbeiter
🧑‍🎨|artist,painter|Künstler,Künstlerin,Maler,Malerin
🧙|wizard,witch,magician|Zauberer,Hexe
🧚|fairy|Fee
🦸|superhero,hero|Superheld,Held
🤖|robot|Roboter
👽|alien|Außerirdischer,Alien
👻|ghost|Gespenst,Geist
🏴‍☠️|pirate|Pirat
🎃|pumpkin,halloween|Kürbis,Halloween
🎅|father christmas,santa claus,santa|Weihnachtsmann
🎄|christmas tree,christmas|Weihnachtsbaum,Tannenbaum,Weihnachten
🐣|easter|Ostern
👕|t-shirt,tshirt|T-Shirt
👔|shirt,tie|Hemd,Krawatte
👖|jeans,trousers,pants|Jeans,Hose
👗|dress|Kleid
👚|blouse,top|Bluse
🧥|coat,jacket|Mantel,Jacke
🧦|socks,sock|Socken,Socke
🧤|gloves,glove|Handschuhe,Handschuh
🧣|scarf|Schal
🧢|cap,baseball cap|Kappe,Basecap,Schirmmütze
👒|hat|Hut
👟|trainers,sneakers,shoe,shoes|Turnschuhe,Schuh,Schuhe,Sportschuhe
👢|boots,boot|Stiefel
🩳|shorts|kurze Hose,Shorts
👙|bikini|Bikini
🩱|swimsuit,swimming costume|Badeanzug
👓|glasses|Brille
🕶️|sunglasses|Sonnenbrille
🎒|schoolbag,school bag,backpack,rucksack|Schultasche,Ranzen,Schulranzen,Rucksack
👜|bag,handbag|Tasche,Handtasche
☂️|umbrella|Regenschirm
💍|ring|Ring
⌚|watch|Armbanduhr
🧶|wool|Wolle
✏️|pencil|Bleistift
🖊️|pen,biro|Kuli,Kugelschreiber,Stift
🖋️|fountain pen|Füller,Füllfederhalter
🖍️|crayon,crayons,coloured pencil,colouring pencil|Buntstift,Buntstifte,Wachsmalstift
📏|ruler|Lineal
📐|set square|Geodreieck
✂️|scissors|Schere
📚|books|Bücher
📖|book,read,to read,reading|Buch,lesen,Lesen
📓|exercise book,notebook|Heft,Schulheft
🗒️|notepad|Notizblock,Block
📝|homework|Hausaufgaben,Hausaufgabe
✍️|write,to write,writing|schreiben,Schreiben
🧮|maths,math,mathematics|Mathe,Mathematik
📎|paper clip|Büroklammer
📌|pin,drawing pin|Pinnnadel,Reißzwecke
🏫|school|Schule
🖥️|computer|Computer,Rechner
💻|laptop|Laptop
⌨️|keyboard|Tastatur
📱|mobile phone,mobile,phone,smartphone,mobile|Handy,Smartphone,Mobiltelefon
☎️|telephone|Telefon
🗺️|map|Landkarte
🌍|world,earth|Welt,Erde
🧪|experiment,science|Experiment,Naturwissenschaft
🔬|microscope,biology|Mikroskop,Biologie
🎨|art,paint,to paint,painting|Kunst,malen,Malen
🎵|music|Musik
🎶|song|Lied
📅|calendar,date|Kalender,Datum
⏰|alarm clock|Wecker
🕐|clock,time,o'clock|Uhr,Uhrzeit,Zeit
📧|email,e-mail|E-Mail
✉️|letter,envelope|Brief,Umschlag
📮|postbox|Briefkasten
📰|newspaper|Zeitung
🖼️|picture,painting|Bild,Gemälde
📷|camera,photo|Kamera,Fotoapparat,Foto
📺|television,tv,telly|Fernseher,Fernsehen
📻|radio|Radio
🎧|headphones|Kopfhörer
🎮|video game,video games,computer game|Videospiel,Computerspiel
🧸|teddy,teddy bear|Teddy,Teddybär,Kuscheltier
🪁|kite|Drachen
🧩|puzzle|Puzzle
🎲|dice|Würfel
♟️|chess|Schach
🃏|cards,playing cards|Spielkarten
🎁|present,gift|Geschenk
🎈|balloon|Luftballon
🎉|party,celebrate|Party,Fest,Feier,feiern
🕯️|candle|Kerze
🔑|key|Schlüssel
🚪|door|Tür
🪟|window|Fenster
🛏️|bed|Bett
🛋️|sofa,couch|Sofa,Couch
🪑|chair|Stuhl
🚽|toilet,loo|Toilette,Klo
🛁|bath,bathtub|Badewanne
🚿|shower,to have a shower|Dusche,duschen
🪥|toothbrush,brush your teeth|Zahnbürste,Zähne putzen
🧼|soap|Seife
🪞|mirror|Spiegel
💡|light bulb,lamp,idea|Glühbirne,Lampe,Idee
🛒|shopping trolley,shopping cart|Einkaufswagen
🛍️|shopping,go shopping|einkaufen,shoppen,Einkaufen
🧺|basket|Korb
🗑️|bin,rubbish bin,dustbin|Mülleimer,Abfalleimer
🧹|broom|Besen
🏠|house,home|Haus,Zuhause
🏡|garden|Garten
🏢|office,building|Büro,Gebäude
🏥|hospital|Krankenhaus
🏦|bank|Bank
🏪|shop,store|Geschäft,Laden
🏬|department store,shopping centre,shopping center|Kaufhaus,Einkaufszentrum
⛪|church|Kirche
🏰|castle|Burg,Schloss
🏟️|stadium|Stadion
🏖️|beach|Strand
🏝️|island|Insel
⛰️|mountain|Berg
🏔️|mountains|Gebirge,Berge
🌋|volcano|Vulkan
⛺|tent,camping,campsite|Zelt,Camping,Zeltplatz,Campingplatz
🏞️|park|Park
🌳|tree|Baum
🌲|forest,wood,woods,fir tree|Wald,Tanne
🌴|palm tree|Palme
🌵|cactus|Kaktus
🌷|tulip,spring|Tulpe,Frühling
🌹|rose|Rose
🌻|sunflower|Sonnenblume
🌸|flower,blossom|Blume,Blüte
💐|flowers,bouquet|Blumen,Blumenstrauß
🍀|clover,luck,lucky|Kleeblatt,Glück
🍂|autumn,fall,leaves|Herbst,Blätter,Laub
🍁|leaf|Blatt
🌱|plant|Pflanze
🌊|sea,wave,ocean|Meer,Welle,Ozean
🌙|moon,night|Mond,Nacht
⭐|star|Stern
☀️|sun,sunny|Sonne,sonnig
😎|cool|cool
☁️|cloud,cloudy|Wolke,bewölkt,wolkig
🌧️|rain,rainy|Regen,regnerisch
⛈️|storm,thunderstorm|Gewitter,Sturm
❄️|snow,snowy|Schnee
⛄|snowman,winter|Schneemann,Winter
🌈|rainbow|Regenbogen
🌬️|wind,windy|Wind,windig
🌫️|fog,foggy|Nebel,neblig
🔥|fire|Feuer
🌡️|temperature,thermometer|Temperatur,Thermometer
⛅|weather|Wetter
🚗|car|Auto,Wagen
🚌|bus|Bus
🚲|bike,bicycle|Fahrrad,Rad
🛴|scooter|Roller,Tretroller
🛵|moped|Motorroller,Mofa
🏍️|motorbike,motorcycle|Motorrad
🚂|train|Zug
🚇|underground,tube,subway|U-Bahn
🚊|tram|Straßenbahn
✈️|plane,aeroplane,airplane,fly,to fly|Flugzeug,fliegen
🛫|airport|Flughafen
🚁|helicopter|Hubschrauber
🚀|rocket|Rakete
🚢|ship|Schiff
⛵|boat,sailing boat|Boot,Segelboot
🚕|taxi|Taxi
🚑|ambulance|Krankenwagen
🚒|fire engine|Feuerwehrauto
🚓|police car|Polizeiauto
🚚|lorry,truck|Lastwagen,LKW,Lkw
🚜|tractor|Traktor
🚦|traffic lights|Ampel
🛣️|road,street|Straße
🌉|bridge|Brücke
🚉|station,railway station|Bahnhof
⛽|petrol station|Tankstelle
🧳|suitcase|Koffer
⚽|football,soccer,ball|Fußball,Ball
🏀|basketball|Basketball
🏐|volleyball|Volleyball
🎾|tennis|Tennis
🏓|table tennis,ping-pong|Tischtennis
🏸|badminton|Badminton,Federball
🏉|rugby|Rugby
⚾|baseball|Baseball
🏒|hockey,ice hockey|Eishockey,Hockey
⛸️|ice skating,skating,skate,to skate|Eislaufen,Schlittschuh laufen
🎿|skiing,ski,to ski|Skifahren,Ski,Ski fahren
🏂|snowboard,snowboarding|Snowboard
🛹|skateboard|Skateboard
🏊|swimming,swim,to swim|Schwimmen,schwimmen
🚴|cycling,ride a bike,to ride a bike|Radfahren,Rad fahren
🏃|running,run,to run,jogging|laufen,rennen,joggen,Laufen
🚶|walk,to walk,go for a walk|gehen,spazieren gehen,Spaziergang
🧗|climbing,climb,to climb|Klettern,klettern
🤸|gymnastics|Turnen,turnen
🏇|riding,horse riding|Reiten,reiten
💃|dance,to dance,dancing|tanzen,Tanzen,Tanz
🎤|sing,to sing,singing,microphone|singen,Singen,Mikrofon
🎸|guitar|Gitarre
🎹|piano,keyboard instrument|Klavier
🥁|drums,drum|Schlagzeug,Trommel
🎻|violin|Geige
🎺|trumpet|Trompete
🏋️|sport,sports|Sport
🏆|trophy,win,to win|Pokal,gewinnen
🥇|medal,winner|Medaille,Sieger,Gewinner
🎬|film,movie,cinema|Film,Kino
🎪|circus|Zirkus
🎡|funfair|Jahrmarkt,Kirmes
🗣️|speak,to speak,talk,to talk|sprechen,reden
🙋|ask,to ask,question|fragen,Frage
🤔|think,to think|denken,nachdenken
😴|sleep,to sleep,tired|schlafen,müde
🔍|look for,to look for,search,to search|suchen
💰|money|Geld
💶|euro,euros|Euro
🪙|coin|Münze
👋|hello,hi,goodbye,bye|Hallo,Tschüss,Auf Wiedersehen
🙏|thank you,thanks|danke
👍|yes,good,ok,okay|ja,gut,okay
👎|no,bad|nein,schlecht
😊|happy,glad|glücklich,froh
😢|sad|traurig
😠|angry,cross|wütend,böse,sauer
😱|scared,afraid,frightened|ängstlich,Angst haben
😲|surprised|überrascht
🤒|ill,sick|krank
😋|hungry,delicious,tasty|hungrig,lecker
🥵|hot|heiß
🥶|cold|kalt
🤩|great,fantastic,brilliant|toll,super,großartig
😂|funny,laugh,to laugh|lustig,lachen
🥱|bored,boring|langweilig,gelangweilt
😍|love,to love|lieben,lieben
🤗|hug,to hug|Umarmung,umarmen
😇|nice,kind|nett,lieb,freundlich
🤫|quiet|leise,still
🔔|bell|Glocke,Klingel
🔨|hammer|Hammer
🧲|magnet|Magnet
💎|diamond|Diamant
🚩|flag|Fahne,Flagge
🌐|internet|Internet
#E03131|red|rot
#F76707|orange|orange
#FCC419|yellow|gelb
#2F9E44|green|grün
#1C7ED6|blue|blau
#7048E8|purple,violet|lila,violett
#8B5A2B|brown|braun
#212529|black|schwarz
#F8F9FA|white|weiß
#F783AC|pink|rosa,pink
#868E96|grey,gray|grau
#C9A227|gold,golden|golden,Gold
#ADB5BD|silver|silbern,Silber
`;

/* Zahlwörter → Ziffer (wird als große Zahl dargestellt) */
window.NUMBER_WORDS = {
  en: ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],
  de: ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn','zwanzig'],
  tens: {
    en: { thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, 'a hundred': 100, 'one hundred': 100, hundred: 100, 'a thousand': 1000, thousand: 1000 },
    de: { 'dreißig': 30, vierzig: 40, 'fünfzig': 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90, hundert: 100, einhundert: 100, tausend: 1000 }
  }
};
