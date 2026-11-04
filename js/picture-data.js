/* Vokabelwelt – Offline-Bildwörterbuch
 * Jede Zeile: Bild | Englisch | Französisch | Deutsch
 * Mehrere Wörter je Sprache mit Komma trennen.
 * Ein Bild ist entweder ein Emoji oder eine Farbe (#rrggbb) für Farbwörter.
 */
window.PICTURE_DATA = `
🍎|apple,red apple|pomme|Apfel
🍏|green apple|pomme verte|grüner Apfel
🍐|pear|poire|Birne
🍊|orange,tangerine|orange,mandarine|Orange,Apfelsine,Mandarine
🍋|lemon|citron|Zitrone
🍌|banana|banane|Banane
🍉|watermelon|pastèque|Wassermelone
🍇|grapes,grape|raisin,raisins|Traube,Trauben,Weintraube,Weintrauben
🍓|strawberry,strawberries|fraise,fraises|Erdbeere,Erdbeeren
🫐|blueberry,blueberries|myrtille,myrtilles|Heidelbeere,Blaubeere,Heidelbeeren,Blaubeeren
🍈|melon|melon|Melone
🍒|cherry,cherries|cerise,cerises|Kirsche,Kirschen
🍑|peach|pêche|Pfirsich
🥭|mango|mangue|Mango
🍍|pineapple|ananas|Ananas
🥥|coconut|noix de coco|Kokosnuss
🥝|kiwi|kiwi|Kiwi
🍅|tomato,tomatoes|tomate,tomates|Tomate,Tomaten
🍆|aubergine,eggplant|aubergine|Aubergine
🥑|avocado|avocat|Avocado
🥦|broccoli|brocoli|Brokkoli
🥬|lettuce|laitue|Kopfsalat
🥒|cucumber|concombre|Gurke
🌶️|chili,chilli|piment|Chili,Peperoni
🫑|pepper,bell pepper|poivron|Paprika
🌽|corn,sweetcorn|maïs|Mais
🥕|carrot,carrots|carotte,carottes|Karotte,Möhre,Karotten,Möhren
🧄|garlic|ail|Knoblauch
🧅|onion|oignon|Zwiebel
🥔|potato,potatoes|pomme de terre,pommes de terre,patate|Kartoffel,Kartoffeln
🍄|mushroom,mushrooms|champignon,champignons|Pilz,Pilze
🥜|peanut,peanuts,nuts|cacahuète,cacahuètes|Erdnuss,Erdnüsse,Nüsse
🌰|chestnut|châtaigne,marron|Kastanie
🍞|bread|pain|Brot
🥐|croissant|croissant|Croissant,Hörnchen
🥖|baguette|baguette|Baguette
🥨|pretzel|bretzel|Brezel
🧀|cheese|fromage|Käse
🥚|egg,eggs|œuf,oeuf,œufs|Ei,Eier
🍳|fried egg,frying pan,pan|œuf au plat,poêle|Spiegelei,Pfanne
🧈|butter|beurre|Butter
🥞|pancake,pancakes|crêpe,crêpes|Pfannkuchen,Crêpe
🧇|waffle,waffles|gaufre,gaufres|Waffel,Waffeln
🥓|bacon|lard,bacon|Speck
🥩|meat,steak|viande,steak|Fleisch,Steak
🍗|chicken leg|cuisse de poulet,poulet|Hähnchen,Hühnchen,Hähnchenschenkel
🌭|hot dog,sausage|hot-dog,saucisse|Hotdog,Würstchen,Wurst
🍔|hamburger,burger|hamburger|Hamburger
🍟|chips,french fries,fries|frites|Pommes,Pommes frites
🍕|pizza|pizza|Pizza
🥪|sandwich|sandwich|Sandwich,belegtes Brot
🌮|taco|taco|Taco
🍝|spaghetti,pasta|pâtes,spaghettis|Nudeln,Spaghetti
🍲|soup,stew|soupe|Suppe,Eintopf
🥗|salad|salade|Salat
🍚|rice|riz|Reis
🍣|sushi|sushi|Sushi
🍦|ice cream,ice-cream|glace|Eis,Speiseeis
🍰|cake|gâteau|Kuchen,Torte
🎂|birthday cake,birthday|gâteau d'anniversaire,anniversaire|Geburtstagskuchen,Geburtstagstorte,Geburtstag
🍪|biscuit,biscuits,cookie,cookies|biscuit,biscuits,cookie|Keks,Kekse,Plätzchen
🍫|chocolate|chocolat|Schokolade
🍬|sweet,sweets,candy|bonbon,bonbons|Bonbon,Bonbons,Süßigkeiten
🍭|lollipop|sucette|Lutscher,Lolli
🍯|honey|miel|Honig
🧁|cupcake,muffin|cupcake,muffin|Muffin,Cupcake
🍩|doughnut,donut|beignet,donut|Donut,Krapfen,Berliner
🍿|popcorn|pop-corn|Popcorn
🍮|pudding,dessert|dessert,flan|Pudding,Nachtisch,Nachspeise
🥛|milk,glass of milk|lait|Milch
☕|coffee,cup,mug|café,tasse|Kaffee,Tasse
🍵|tea|thé|Tee
🧃|juice|jus,jus de fruit|Saft
💧|water|eau|Wasser
🥤|lemonade,soft drink,drink,to drink|limonade,soda,boisson,boire|Limonade,Limo,Getränk,trinken
🧂|salt|sel|Salz
🍽️|plate,meal,dinner,lunch,eat,to eat|assiette,repas,dîner,déjeuner,manger|Teller,Mahlzeit,Abendessen,Mittagessen,essen
🥐|breakfast|petit-déjeuner,petit déjeuner|Frühstück
🍴|fork,cutlery|fourchette,couverts|Gabel,Besteck
🥄|spoon|cuillère,cuiller|Löffel
🔪|knife|couteau|Messer
🥣|bowl,cereal,cereals|bol,céréales|Schüssel,Müsli,Schale
🫖|teapot|théière|Teekanne
🧊|ice,ice cube|glaçon,glace|Eiswürfel
🐶|dog|chien|Hund
🐱|cat|chat|Katze
🐭|mouse|souris|Maus
🐹|hamster|hamster|Hamster
🐰|rabbit,bunny|lapin|Kaninchen,Hase
🦊|fox|renard|Fuchs
🐻|bear|ours|Bär
🐼|panda|panda|Panda
🐨|koala|koala|Koala
🐯|tiger|tigre|Tiger
🦁|lion|lion|Löwe
🐮|cow|vache|Kuh
🐷|pig|cochon|Schwein
🐸|frog|grenouille|Frosch
🐵|monkey|singe|Affe
🐔|chicken,hen|poule|Huhn,Henne
🐓|rooster,cock|coq|Hahn
🐤|chick|poussin|Küken
🐧|penguin|pingouin,manchot|Pinguin
🐦|bird|oiseau|Vogel
🦆|duck|canard|Ente
🦅|eagle|aigle|Adler
🦉|owl|hibou,chouette|Eule
🦜|parrot|perroquet|Papagei
🦢|swan|cygne|Schwan
🕊️|dove,pigeon|colombe,pigeon|Taube
🦃|turkey|dinde|Truthahn,Pute
🐺|wolf|loup|Wolf
🐗|wild boar,boar|sanglier|Wildschwein
🐴|horse|cheval|Pferd
🦄|unicorn|licorne|Einhorn
🐝|bee|abeille|Biene
🐛|caterpillar|chenille|Raupe
🦋|butterfly|papillon|Schmetterling
🐌|snail|escargot|Schnecke
🐞|ladybird,ladybug|coccinelle|Marienkäfer
🐜|ant|fourmi|Ameise
🕷️|spider|araignée|Spinne
🪰|fly|mouche|Fliege
🦟|mosquito|moustique|Mücke
🪱|worm|ver|Wurm
🐢|tortoise,turtle|tortue|Schildkröte
🐍|snake|serpent|Schlange
🦎|lizard|lézard|Eidechse
🐊|crocodile|crocodile|Krokodil
🐙|octopus|pieuvre,poulpe|Krake,Tintenfisch,Oktopus
🦀|crab|crabe|Krabbe,Krebs
🐟|fish|poisson|Fisch
🐠|tropical fish|poisson tropical|Tropenfisch
🐬|dolphin|dauphin|Delfin,Delphin
🐳|whale|baleine|Wal
🦈|shark|requin|Hai
🐘|elephant|éléphant|Elefant
🦒|giraffe|girafe|Giraffe
🦓|zebra|zèbre|Zebra
🦛|hippo,hippopotamus|hippopotame|Nilpferd,Flusspferd
🦏|rhino,rhinoceros|rhinocéros|Nashorn
🐪|camel|chameau|Kamel
🐑|sheep|mouton|Schaf
🐐|goat|chèvre|Ziege
🦌|deer|cerf|Hirsch,Reh
🐿️|squirrel|écureuil|Eichhörnchen
🦔|hedgehog|hérisson|Igel
🦇|bat|chauve-souris|Fledermaus
🦖|dinosaur|dinosaure|Dinosaurier,Dino
🐉|dragon|dragon|Drache
🐾|pet,pets,paw|animal domestique,animaux domestiques,patte|Haustier,Haustiere,Pfote
👁️|eye|œil,oeil|Auge
👀|eyes,look,to look,see,to see|yeux,regarder,voir|Augen,schauen,sehen,gucken
👂|ear,listen,to listen,hear,to hear|oreille,écouter,entendre|Ohr,zuhören,hören
👃|nose|nez|Nase
👄|mouth,lips|bouche,lèvres|Mund,Lippen
🦷|tooth,teeth|dent,dents|Zahn,Zähne
👅|tongue|langue|Zunge
✋|hand|main|Hand
🦶|foot,feet|pied,pieds|Fuß,Füße
🦵|leg|jambe|Bein
💪|arm,strong|bras,fort,forte|Arm,stark
👆|finger|doigt|Finger
🧠|brain|cerveau|Gehirn
❤️|heart,love|cœur,coeur,amour|Herz,Liebe
💇|hair|cheveux|Haare
🙂|face|visage|Gesicht
👶|baby|bébé|Baby
👦|boy,brother|garçon,frère|Junge,Bruder
👧|girl,sister|fille,sœur,soeur|Mädchen,Schwester
👨|man|homme|Mann
👩|woman|femme|Frau
👴|grandfather,grandpa,granddad|grand-père,papi,papy|Großvater,Opa
👵|grandmother,grandma,granny|grand-mère,mamie|Großmutter,Oma
👨‍👩‍👧‍👦|family,parents|famille,parents|Familie,Eltern
👩‍👧|mother,mum,mom,mummy|mère,maman|Mutter,Mama
👨‍👦|father,dad,daddy|père,papa|Vater,Papa
🧑‍🤝‍🧑|friend,friends|ami,amie,amis,copain,copine|Freund,Freundin,Freunde
👑|crown,king,queen|couronne,roi,reine|Krone,König,Königin
👸|princess|princesse|Prinzessin
🤴|prince|prince|Prinz
🧑‍🏫|teacher|professeur,prof,enseignant,enseignante,maître,maîtresse|Lehrer,Lehrerin,Lehrkraft
🧑‍🎓|student,pupil|élève,étudiant,étudiante|Schüler,Schülerin,Student,Studentin
🧑‍⚕️|doctor|médecin,docteur|Arzt,Ärztin
👮|police officer,policeman,policewoman|policier,policière|Polizist,Polizistin
🧑‍🚒|firefighter,fireman|pompier|Feuerwehrmann,Feuerwehrfrau
🧑‍🍳|cook,chef,to cook,cooking|cuisinier,cuisinière,cuisiner,faire la cuisine|Koch,Köchin,kochen
🧑‍🌾|farmer|fermier,fermière,agriculteur|Bauer,Bäuerin,Landwirt
🧑‍🚀|astronaut|astronaute|Astronaut,Astronautin
👷|builder,worker|ouvrier,ouvrière|Bauarbeiter,Arbeiter
🧑‍🎨|artist,painter|artiste,peintre|Künstler,Künstlerin,Maler,Malerin
🧑‍💻|work,to work,job|travailler,travail|arbeiten,Arbeit,Beruf
🧙|wizard,witch,magician|sorcier,sorcière,magicien|Zauberer,Hexe
🧚|fairy|fée|Fee
🦸|superhero,hero|super-héros,héros|Superheld,Held
🤖|robot|robot|Roboter
👽|alien|extraterrestre|Außerirdischer,Alien
👻|ghost|fantôme|Gespenst,Geist
🏴‍☠️|pirate|pirate|Pirat
🎃|pumpkin,halloween|citrouille|Kürbis,Halloween
🎅|father christmas,santa claus,santa|père noël|Weihnachtsmann
🎄|christmas tree,christmas|sapin de noël,noël|Weihnachtsbaum,Tannenbaum,Weihnachten
🐣|easter|pâques|Ostern
👕|t-shirt,tshirt|t-shirt,tee-shirt|T-Shirt
👔|shirt,tie|chemise,cravate|Hemd,Krawatte
👖|jeans,trousers,pants|jean,pantalon|Jeans,Hose
👗|dress|robe|Kleid
👚|blouse,top|chemisier|Bluse
🧥|coat,jacket|manteau,veste,blouson|Mantel,Jacke
🧦|socks,sock|chaussettes,chaussette|Socken,Socke
🧤|gloves,glove|gants,gant|Handschuhe,Handschuh
🧣|scarf|écharpe|Schal
🧢|cap,baseball cap|casquette|Kappe,Basecap,Schirmmütze
👒|hat|chapeau|Hut
👟|trainers,sneakers,shoe,shoes|baskets,chaussure,chaussures|Turnschuhe,Schuh,Schuhe,Sportschuhe
👢|boots,boot|bottes,botte|Stiefel
🩳|shorts|short|kurze Hose,Shorts
👙|bikini|bikini|Bikini
🩱|swimsuit,swimming costume|maillot de bain|Badeanzug
👓|glasses|lunettes|Brille
🕶️|sunglasses|lunettes de soleil|Sonnenbrille
🎒|schoolbag,school bag,backpack,rucksack|cartable,sac à dos|Schultasche,Ranzen,Schulranzen,Rucksack
👜|bag,handbag|sac,sac à main|Tasche,Handtasche
☂️|umbrella|parapluie|Regenschirm
💍|ring|bague|Ring
⌚|watch|montre|Armbanduhr
🧶|wool|laine|Wolle
✏️|pencil|crayon|Bleistift
🖊️|pen,biro|stylo|Kuli,Kugelschreiber,Stift
🖋️|fountain pen|stylo plume,stylo-plume|Füller,Füllfederhalter
🖍️|crayon,crayons,coloured pencil,colouring pencil|crayon de couleur,crayons de couleur|Buntstift,Buntstifte,Wachsmalstift
📏|ruler|règle|Lineal
📐|set square|équerre|Geodreieck
✂️|scissors|ciseaux|Schere
📚|books|livres|Bücher
📖|book,read,to read,reading|livre,lire,lecture|Buch,lesen,Lesen
📓|exercise book,notebook|cahier|Heft,Schulheft
🗒️|notepad|bloc-notes|Notizblock,Block
📝|homework,note,notes|devoirs,note|Hausaufgaben,Hausaufgabe,Notiz
✍️|write,to write,writing|écrire|schreiben,Schreiben
🧮|maths,math,mathematics|maths,mathématiques|Mathe,Mathematik
📎|paper clip|trombone|Büroklammer
📌|pin,drawing pin|punaise|Pinnnadel,Reißzwecke
🏫|school|école,collège|Schule
🎓|learn,to learn|apprendre|lernen
🖥️|computer|ordinateur|Computer,Rechner
💻|laptop|ordinateur portable|Laptop
⌨️|keyboard|clavier|Tastatur
📱|mobile phone,mobile,phone,smartphone,mobile|portable,téléphone portable,smartphone|Handy,Smartphone,Mobiltelefon
☎️|telephone|téléphone|Telefon
🗺️|map|carte|Landkarte,Karte
🌍|world,earth|monde,terre|Welt,Erde
🧪|experiment,science|expérience,sciences|Experiment,Naturwissenschaft
🔬|microscope,biology|microscope,biologie|Mikroskop,Biologie
🎨|art,paint,to paint,painting|art,peinture,peindre|Kunst,malen,Malen
🎵|music|musique|Musik
🎶|song|chanson|Lied
📅|calendar,date|calendrier,date|Kalender,Datum
⏰|alarm clock|réveil|Wecker
🕐|clock,time,o'clock|horloge,heure|Uhr,Uhrzeit,Zeit
📧|email,e-mail|e-mail,mail,courriel|E-Mail
✉️|letter,envelope|lettre,enveloppe|Brief,Umschlag
📮|postbox|boîte aux lettres|Briefkasten
📰|newspaper|journal|Zeitung
🖼️|picture,painting|tableau,image|Bild,Gemälde
📷|camera,photo|appareil photo,photo|Kamera,Fotoapparat,Foto
📺|television,tv,telly|télévision,télé|Fernseher,Fernsehen
📻|radio|radio|Radio
🎧|headphones|casque,écouteurs|Kopfhörer
🎮|video game,video games,computer game,play,to play|jeu vidéo,jeux vidéo,jouer|Videospiel,Computerspiel,spielen
🧸|teddy,teddy bear,toy|nounours,ours en peluche,jouet|Teddy,Teddybär,Kuscheltier,Spielzeug
🪁|kite|cerf-volant|Drachen
🧩|puzzle|puzzle|Puzzle
🎲|dice,game|dé,dés,jeu|Würfel,Spiel
♟️|chess|échecs|Schach
🃏|cards,playing cards|cartes|Spielkarten
🎁|present,gift,give,to give|cadeau,donner|Geschenk,schenken,geben
🎈|balloon|ballon de baudruche|Luftballon
🎉|party,celebrate|fête,faire la fête|Party,Fest,Feier,feiern
🕯️|candle|bougie|Kerze
🔑|key|clé,clef|Schlüssel
🚪|door|porte|Tür
🪟|window|fenêtre|Fenster
🛏️|bed|lit|Bett
🛋️|sofa,couch|canapé|Sofa,Couch
🪑|chair|chaise|Stuhl
🚽|toilet,loo|toilettes|Toilette,Klo
🛁|bath,bathtub|baignoire,bain|Badewanne
🚿|shower,wash,to wash|douche,laver,se laver|Dusche,duschen,waschen
🪥|toothbrush,brush your teeth|brosse à dents|Zahnbürste,Zähne putzen
🧼|soap|savon|Seife
🪞|mirror|miroir|Spiegel
💡|lamp,light,idea|lampe,lumière,idée|Lampe,Licht,Idee
🛒|shopping trolley,buy,to buy|caddie,acheter|Einkaufswagen,kaufen
🛍️|shopping,go shopping|faire du shopping,faire les courses,courses|einkaufen,shoppen,Einkaufen
🧺|basket|panier|Korb
🗑️|bin,rubbish bin,dustbin|poubelle|Mülleimer,Abfalleimer
🧹|broom,clean,to clean|balai,nettoyer|Besen,putzen,aufräumen
🏠|house,home,live,to live|maison,habiter,vivre|Haus,Zuhause,wohnen,leben
🏡|garden|jardin|Garten
🏢|office,building|bureau,immeuble|Büro,Gebäude
🏥|hospital|hôpital|Krankenhaus
🏦|bank|banque|Bank
🏪|shop,store|magasin,boutique|Geschäft,Laden
🏬|department store,shopping centre,shopping center|grand magasin,centre commercial|Kaufhaus,Einkaufszentrum
⛪|church|église|Kirche
🏰|castle|château|Burg,Schloss
🏟️|stadium|stade|Stadion
🏖️|beach|plage|Strand
🏝️|island|île|Insel
⛰️|mountain|montagne|Berg
🏔️|mountains|montagnes|Gebirge,Berge
🌋|volcano|volcan|Vulkan
⛺|tent,camping,campsite|tente,camping|Zelt,Camping,Zeltplatz,Campingplatz
🏞️|park,river,lake|parc,rivière,fleuve,lac|Park,Fluss,See
🌳|tree|arbre|Baum
🌲|forest,wood,woods,fir tree|forêt,bois,sapin|Wald,Tanne
🌴|palm tree|palmier|Palme
🌵|cactus|cactus|Kaktus
🌷|tulip,spring|tulipe,printemps|Tulpe,Frühling
🌹|rose|rose|Rose
🌻|sunflower|tournesol|Sonnenblume
🌸|flower,blossom|fleur|Blume,Blüte
💐|flowers,bouquet|fleurs,bouquet|Blumen,Blumenstrauß
🍀|clover,luck,lucky|trèfle,chance|Kleeblatt,Glück
🍂|autumn,fall,leaves|automne,feuilles|Herbst,Blätter,Laub
🍁|leaf|feuille|Blatt
🌱|plant|plante|Pflanze
🌊|sea,wave,ocean|mer,vague,océan|Meer,Welle,Ozean
🌙|moon,night|lune,nuit|Mond,Nacht
⭐|star|étoile|Stern
☀️|sun,sunny|soleil,ensoleillé|Sonne,sonnig
😎|summer,cool|été,cool|Sommer,cool
☁️|cloud,cloudy|nuage,nuageux|Wolke,bewölkt,wolkig
🌧️|rain,rainy|pluie,pluvieux|Regen,regnerisch
⛈️|storm,thunderstorm|orage,tempête|Gewitter,Sturm
❄️|snow,snowy|neige|Schnee
⛄|snowman,winter|bonhomme de neige,hiver|Schneemann,Winter
🌈|rainbow|arc-en-ciel|Regenbogen
🌬️|wind,windy|vent|Wind,windig
🌫️|fog,foggy|brouillard|Nebel,neblig
🔥|fire|feu|Feuer
🌡️|temperature,weather|température,météo,temps|Temperatur,Wetter
🚗|car|voiture|Auto,Wagen
🚌|bus|bus|Bus
🚲|bike,bicycle|vélo,bicyclette|Fahrrad,Rad
🛴|scooter|trottinette|Roller,Tretroller
🛵|moped|scooter,mobylette|Motorroller,Mofa
🏍️|motorbike,motorcycle|moto|Motorrad
🚂|train|train|Zug
🚇|underground,tube,subway|métro|U-Bahn
🚊|tram|tram,tramway|Straßenbahn
✈️|plane,aeroplane,airplane,fly,to fly|avion,voler|Flugzeug,fliegen
🛫|airport|aéroport|Flughafen
🚁|helicopter|hélicoptère|Hubschrauber
🚀|rocket|fusée|Rakete
🚢|ship|bateau,navire|Schiff
⛵|boat,sailing boat|voilier|Boot,Segelboot
🚕|taxi|taxi|Taxi
🚑|ambulance|ambulance|Krankenwagen
🚒|fire engine|camion de pompiers|Feuerwehrauto
🚓|police car|voiture de police|Polizeiauto
🚚|lorry,truck|camion|Lastwagen,LKW,Lkw
🚜|tractor|tracteur|Traktor
🚦|traffic lights|feux,feu rouge|Ampel
🛣️|road,street|route,rue|Straße
🌉|bridge|pont|Brücke
🚉|station,railway station|gare|Bahnhof
⛽|petrol station|station-service|Tankstelle
🧳|suitcase,travel,to travel|valise,voyager|Koffer,reisen
⚽|football,soccer,ball|football,foot,ballon,balle|Fußball,Ball
🏀|basketball|basket,basket-ball|Basketball
🏐|volleyball|volley,volley-ball|Volleyball
🎾|tennis|tennis|Tennis
🏓|table tennis,ping-pong|ping-pong,tennis de table|Tischtennis
🏸|badminton|badminton|Badminton,Federball
🏉|rugby|rugby|Rugby
⚾|baseball|baseball|Baseball
🏒|hockey,ice hockey|hockey|Eishockey,Hockey
⛸️|ice skating,skating,skate,to skate|patinage,patiner|Eislaufen,Schlittschuh laufen
🎿|skiing,ski,to ski|ski,faire du ski|Skifahren,Ski,Ski fahren
🏂|snowboard,snowboarding|snowboard|Snowboard
🛹|skateboard|skate,skateboard,planche à roulettes|Skateboard
🏊|swimming,swim,to swim,swimming pool|natation,nager,piscine|Schwimmen,schwimmen,Schwimmbad
🚴|cycling,ride a bike,to ride a bike|faire du vélo,cyclisme|Radfahren,Rad fahren
🏃|running,run,to run,jogging|courir,course|laufen,rennen,joggen,Laufen
🚶|walk,to walk,go for a walk|marcher,se promener,promenade|gehen,spazieren gehen,Spaziergang
🧗|climbing,climb,to climb|escalade,grimper|Klettern,klettern
🤸|gymnastics|gymnastique|Turnen,turnen
🏇|riding,horse riding|équitation,faire du cheval|Reiten,reiten
💃|dance,to dance,dancing|danser,danse|tanzen,Tanzen,Tanz
🎤|sing,to sing,singing,microphone|chanter,micro|singen,Singen,Mikrofon
🎸|guitar|guitare|Gitarre
🎹|piano,keyboard instrument|piano|Klavier
🥁|drums,drum|batterie,tambour|Schlagzeug,Trommel
🎻|violin|violon|Geige
🎺|trumpet|trompette|Trompete
🏋️|sport,sports|sport|Sport
🏆|cup,trophy,win,to win|coupe,trophée,gagner|Pokal,gewinnen
🥇|medal,winner|médaille,gagnant|Medaille,Sieger,Gewinner
🎬|film,movie,cinema|film,cinéma|Film,Kino
🎪|circus|cirque|Zirkus
🎡|funfair|fête foraine|Jahrmarkt,Kirmes
🗣️|speak,to speak,talk,to talk|parler|sprechen,reden
🙋|ask,to ask,question|demander,question|fragen,Frage
💬|answer,to answer|répondre,réponse|antworten,Antwort
🤔|think,to think|penser,réfléchir|denken,nachdenken
😴|sleep,to sleep,tired|dormir,fatigué,fatiguée|schlafen,müde
🔍|find,to find,look for,to look for,search|trouver,chercher|finden,suchen
💰|money|argent|Geld
💶|euro,euros|euro,euros|Euro
🪙|coin|pièce|Münze
👋|hello,hi,goodbye,bye|bonjour,salut,au revoir|Hallo,Tschüss,Auf Wiedersehen
🙏|please,thank you,thanks|s'il te plaît,s'il vous plaît,merci|bitte,danke
👍|yes,good,ok,okay|oui,bien,bon,d'accord|ja,gut,okay
👎|no,bad|non,mauvais,mauvaise|nein,schlecht
😊|happy,glad|heureux,heureuse,content,contente|glücklich,froh
😢|sad|triste|traurig
😠|angry,cross|fâché,fâchée,en colère|wütend,böse,sauer
😱|scared,afraid,frightened|effrayé,effrayée,avoir peur|ängstlich,Angst haben
😲|surprised|surpris,surprise|überrascht
🤒|ill,sick|malade|krank
😋|hungry,delicious,tasty|avoir faim,délicieux,délicieuse|hungrig,lecker
🥵|hot|chaud,chaude|heiß
🥶|cold|froid,froide|kalt
🤩|great,fantastic,brilliant|génial,super|toll,super,großartig
😂|funny,laugh,to laugh|drôle,rire|lustig,lachen
🥱|bored,boring|ennuyeux,s'ennuyer|langweilig,gelangweilt
😍|love,to love|aimer,adorer|lieben,lieben
🤗|hug,to hug|câlin,faire un câlin|Umarmung,umarmen
😇|nice,kind|gentil,gentille|nett,lieb,freundlich
🤫|quiet|silence|leise,still
🔔|bell|cloche|Glocke,Klingel
🔨|hammer|marteau|Hammer
🧲|magnet|aimant|Magnet
💎|diamond|diamant|Diamant
🚩|flag|drapeau|Fahne,Flagge
🌐|internet|internet|Internet
#E03131|red|rouge|rot
#F76707|orange|orange|orange
#FCC419|yellow|jaune|gelb
#2F9E44|green|vert,verte|grün
#1C7ED6|blue|bleu,bleue|blau
#7048E8|purple,violet|violet,violette|lila,violett
#8B5A2B|brown|marron,brun,brune|braun
#212529|black|noir,noire|schwarz
#F8F9FA|white|blanc,blanche|weiß
#F783AC|pink|rose|rosa,pink
#868E96|grey,gray|gris,grise|grau
#C9A227|gold,golden|doré,dorée,or|golden,Gold
#ADB5BD|silver|argenté,argent|silbern,Silber
`;

/* Zahlwörter → Ziffer (wird als große Zahl dargestellt) */
window.NUMBER_WORDS = {
  en: ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],
  fr: ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt'],
  de: ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn','zwanzig'],
  tens: {
    en: { thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, 'a hundred': 100, 'one hundred': 100, hundred: 100, 'a thousand': 1000, thousand: 1000 },
    fr: { trente: 30, quarante: 40, cinquante: 50, soixante: 60, 'soixante-dix': 70, 'quatre-vingts': 80, 'quatre-vingt': 80, 'quatre-vingt-dix': 90, cent: 100, mille: 1000 },
    de: { 'dreißig': 30, vierzig: 40, 'fünfzig': 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90, hundert: 100, einhundert: 100, tausend: 1000 }
  }
};
