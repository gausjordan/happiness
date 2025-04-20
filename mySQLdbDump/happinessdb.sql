-- MySQL dump 10.13  Distrib 8.1.0, for Linux (x86_64)
--
-- Host: localhost    Database: happinessdb
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `quantity` int unsigned NOT NULL,
  `price_charged` decimal(12,2) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `order_id` (`order_id`),
  KEY `order_items_ibfk_2` (`product_id`),
  CONSTRAINT `orders_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,7,1,6.00),(1,8,3,242.00),(7,1,1,11.00),(7,4,7,333.00),(8,9,1,333.00),(9,12,1,2.00),(9,13,1,16.00),(9,14,2,5.00),(10,9,66,0.01),(10,10,1,4.01),(10,11,1,25.01),(11,1,10,5.00),(11,2,1,12.34),(12,7,1,2.22),(12,8,2,99.00),(12,9,1,9.00),(13,4,1,0.44),(13,5,1,2.66),(13,6,1,22.22),(13,7,5,11.11),(89,8,1,89.00),(89,11,5,485.00),(90,1,3,123.00),(90,4,2,99.98),(90,7,2,166.00),(90,13,4,340.00),(97,2,20,1108.20),(98,11,2,194.00),(98,12,1,38.50),(98,13,1,85.00),(99,2,1,55.41),(100,3,1,62.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `dateOrdered` date DEFAULT NULL,
  `dateReceived` date DEFAULT NULL,
  `is_shipped` tinyint unsigned NOT NULL DEFAULT '0',
  `is_paid` tinyint unsigned NOT NULL DEFAULT '0',
  `is_returned` tinyint unsigned NOT NULL DEFAULT '0',
  `is_refunded` tinyint unsigned NOT NULL DEFAULT '0',
  `is_archived` tinyint NOT NULL DEFAULT '0',
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci,
  PRIMARY KEY (`id`),
  KEY `order_user_fk` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,10,'2013-02-07','2022-02-05',1,1,1,1,0,'Kompletna'),(7,11,'2014-02-01','2023-02-12',1,1,1,1,0,'Nekompletna'),(8,10,'2016-02-01','2024-02-27',0,0,0,0,0,'davna'),(9,34,'2019-02-01','2025-02-12',0,0,0,0,0,'Bozina prva narudžba.'),(10,34,'2018-02-01',NULL,0,0,0,0,0,'Bozina druga narudžba.'),(11,34,'2017-02-01',NULL,0,0,0,0,0,'Bozina nedovršena narudžba.'),(12,10,'2004-02-01','2016-02-27',0,0,0,0,1,'Buff fluff'),(13,10,'2015-02-01','2016-12-01',0,0,0,0,0,'Lala'),(89,34,'2020-03-20',NULL,0,0,0,0,0,NULL),(90,34,'2022-03-31',NULL,0,0,0,0,0,'Vamos muchachas! Ola.'),(97,10,'2021-03-28',NULL,0,0,0,0,0,'Ayayay'),(98,10,NULL,NULL,0,0,0,0,0,NULL),(99,34,NULL,NULL,0,0,0,0,0,NULL),(100,9,NULL,NULL,0,0,0,0,0,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci DEFAULT NULL,
  `naslov` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci,
  `opis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `dateAdded` date DEFAULT '2002-02-03',
  PRIMARY KEY (`id`),
  KEY `title_index` (`title`),
  KEY `naslov_index` (`naslov`),
  FULLTEXT KEY `description_index` (`description`),
  FULLTEXT KEY `opis_index` (`opis`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Femme debileé','Femme debileé','This heavy-duty plumbing pipe joint also doubles as a glamorous fashion accessory. Exotic steel and stylish brass color make this leg bracelet a must-have companion for the spring/summer season. Gaskets not included.','Ova masivna kutna cijev ujedno je i posljednji krik visoke stopalne mode za proljeće i ljeto. Elegantan dizajn nanogice omogućuje nošenje čelika i mesinga između bilo kojeg prsta, naravno, dok god govorimo o većim prstima i deformiranom tipu stopala. Brtve nisu uključene u cijenu.',41.00,1,1,'2002-02-03'),(2,'Tropical bonanza','Tropical bonanza','Energize yourself with our Tropical Bonanza leg bracelet series. Those unique fashion statements are made of high quality leather, laced with sharp shards of recycled glass. Wearing this makes you a good nature-loving person. Great for Jewish holidays.','Sjajite ovo ljeto uz Tropical Bonanza seriju nanogica. Ova jedinstvena nanogica izrađena od bizonove kože s oštrim komadićima recikliranog stakla u elegantno sivoj boji. Savršen poklon ljubavniku ili ljubavnici za obljetnicu razvoda s njegovim/njezinim bivšom partnerom.',55.41,1,1,'2002-02-03'),(3,'Blitzschmerz','Blitzschmerz','Stainless steel bracelets made specifically to match the grace and finesse of a gutter clamp - which they are. Stylish, modern, bold and uncomfortable. Make sure you buy them in pairs, and oil them up first! Make an impression. Wear the Hurt. Blitzschmerz!','Krute narukvice od industrijskog čelika nastale su u suradnji s bivšim inženjerima zagrebačke Tvornice parnih kotlova. Prilagođene su svim veličinama ruku, no prvenstveno onim gigantskim, budući da je zapravo riječ o obujmicama. Izuzetna neudobnost i smiona upadljivost ovih narukvica praktično jamče da ćeš osvojiti i poglede i strahopoštovanje.',62.00,1,1,'2002-02-03'),(4,'Hopsica & Co.','Hopsica & Co.','Hopsica & Co. is where the fun is at! Nine pounds of common rock material ought to emphasize your natural complexion and beauty. Nothing makes a man sweat more than a rock. Well rocks are what this is. You may also find yourself buffed from all the inadvertent workout.','Svaka Hopsica & Co. narukvica od polu-dragog kamenja sadrži najmanje 4 kg običnog riječnog kamenja iz kontinentalne Hrvatske. Besprijekoran dizajn naglasit će Vašu prirodnu ljepotu te ojačati Vaše bicepse, tricepse i deltoide.',49.99,1,1,'2003-02-03'),(5,'Secret penpal','Tajna prijateljica','Most beautiful earrings are hard to wear. Well these are literally impossible to wear. That said, you can try. And you should! They are made of iron, it\'s not even steel. You will look stunning.','Lijepe naušnice teško je nositi. No nositi ove naušnice doslovno je nemoguće. Ne možete ih ni staviti. Stoga izrastite iz zatvorene školjke u kraljicu vrijednu divljenja: poklonite si naušnice od sivog željeza. Nisu čak ni čelik.',20.00,1,1,'2002-02-03'),(6,'Peek\'o earrings','Piko naušnice','Time to shine! Peek\'o earrings are made to pique one\'s interest. Got it? Peek\'o, pique? Nah, you\'re pronouncing it wrong. And now the clever pun is ruined. Anyway, they\'re glamorous, and inspired by common household screws. Quite easy to insert into one\'s earhole. Or any other hole. Inserting them in places completely lacking a hole is also an option. Available in copper, gold and silver-coated variety.','Kucnuo je tvoj čas! Počasti se piko naušnicama, stvorenim po uzoru na vijke za drvo. Lako se pikaju u uho čak i ako nemate izbušene uši. Piko, zar ne? Kužite? Pikaju - piko. Duhovita doskočica. U glavnom, dostupne su u tri varijante: zanosno-zlatna, egzotično-bakrena i klasično srebrna.',70.00,1,1,'2002-02-03'),(7,'Go home, you\'re drunk','Gasi Internet, dosta je','\"Diamonds are a girl\'s best friend\", Marilyn Monroe sung back in 1953. Well, these are made of rocks. Exquisite. Beautiful. Royal. Worthless. There are rocks all over the place. We collect them. We make them into jewelry. And you should have some.','Ako se po luksuznom automobilu razpoznaju dječaci od kraljeva, tada su dijamantne naušnice ono što razdvaja kraljice od služavki. Možda je tomu tako. No ovo su naušnice od nasumično odabranog kamenja s ceste. Neke su čak i lijepe, no obično ne.',83.00,1,1,'2002-02-03'),(8,'Tarapana','Tarapana','Are you worth sacrificing everything? You sure as hell aren\'t. But a jumbo necklace might be your thing. Thick neck? No problem! Big, hefty, Shrek-sized rings will do. Trouble is, you can\'t put them on if you have a head. Wanna try?','Jeste li upoznali savršenstvo? Krug je savršenstvo. Ovo je torus. Jedinstvena ogrlica za gigantske vratove od nehrđajućeg kirurškog čelika snižene kvalitete. Na sebe možete natrpati jednu ili više njih. Ogromne su, masivan vrat nije problem. Jedino što ne idu preko glave.',89.00,1,1,'2023-02-03'),(9,'Porsché & porcolli','Porsché & porcolli','What do Leon Pinzeoletti, Andrea Forgiolli and Gioni Evasto all have in common? Well it ain\'t their name. That\'s for sure. But hold on. Imagine. If you could take the most luxurious design and condense in into just two words - what would they be? Think about it. Also, this necklace is made of old leather. Very unappealing.','Što je zajedničko Leonu Pinzeolettiju, Andrei Forgiolli i Gioniu Evasto? E, pa jedna stvar nije - njihova imena. A kada biste luksuzni dizajn mogli svesti na dvije riječi - one bi bile \"stara koža\". Porché & porcolli nije bilo kakva ogrlica. To je ogrlica od stare kože. Ne liči ni na što.',107.00,1,1,'2021-02-03'),(10,'Sweet tenderness','Slatke strasti','Do you enjoy traveling light? Well, you won\'t be enjoying having these around. Those are beautiful, spiteful and heavy. Made of meticulously crafted and hand-selected pieces of rusty metal and common unprocessed glass. No one feels easy with this baby hanging off one\'s neck. Weighing a ton it isn\'t easy to wear. Did we mention it\'s weight?','Naglasite svoj vrat ogrlicom koja će vas umoriti. Stvorena je od pomno odabranih hrđavih kukica i staklenih komadića, i Ona je ogrlica koja će vas izdići do oblaka. Ako pod \'oblacima\' mislimo na \'zemlju\' jer je toliko teška da ubrzava Vaš pad. Pazite na oštre dijelove, možete pokupiti tetanus.',64.11,1,1,'2020-02-03'),(11,'Weld me!','Zavari me!','Picture a dream vacation! Tropical islands, a cozy hammock, piles of litter and someone\'s hardware workshop nearby. Excite your imagination with one of those industrial-grade steel rings. They smell like welding fumes! You can even wear one on your thumb, and it still won\'t fit.','Zamislite svoj odmor iz snova! Tropski otok, ležaljka i oceanom doplutalo smeće. Niti četiri puna metara od plaže - nečija metalurška radionica. Probudite osjetila i maštu! Otputujte na ljetovanje uz miris ovih čeličnih prstena. Mirišu na radionicu i ljeto. Možete ih staviti na palac, i još uvijek su preveliki.',97.00,1,1,'2010-02-03'),(12,'Cindarella','Pepeljuga','What if you could wear the smallest ring ever made? Well, you can\'t. That\'s it. You can, however, look at this cute thing. It\'s so small no one can put it on. Feel the remarkable craftsmanship and glass work, and make sure you buy one for each finger.','Zamislite kako bi bilo da možete nositi najmanji prsten ikada napravljen? E, pa u stvarnosti ne možete. Ovo možda nije najmanji prsten na svijetu, ali je svakako premalen za bilo koji prst. Preporučamo kupnju ovog prstena u setu za svih deset prstiju.',38.50,1,1,'2009-02-03'),(13,'April\'s fools','Prvi april','What\'s even cooler than a cool, aggressive alpha male to decorate your inner beauty? A literal medieval weapon that looks like a piece of jewelry. Not only is it dangerous, it is downright lethal. Loaded with internal mechanical spring-based firing system (not included), it may, can and will \r\nshoot it\'s spikes in all directions, at random, killing the wearer, and then some. Why would anyone wear it, you ask? That\'s a good question.','Što je još bolje od zgodnog, zločestog dečka uz kojeg će i tvoja unutarnja ljepota zablistati? Srednjevjekovno oružje u malenom, praktičnom pakiranju, koje izgleda kao ogrlica. Nemojmo se zavaravati, ne samo da je ovo doslovno žezlo opasno, ono je ubojito. Ugrađena opruga može (i hoće) popustiti u bilo kojem trenutku, i lansirati bodlje u svim smjerovima. Zašto bi to itko nosio, pitate se? I trebali biste se pitati. \"Prvi april\" je opasan i nepotreban komad nakita.',85.00,1,1,'2016-02-03'),(14,'Craft time','Kreativica','This exceptional creative masterpiece is forged by the hands and knees of Siniša \"Sinke\" Šalomet himself. And it\'s a beauty to behold. No wonder our usual reluctance - one of showcasing master craftsman\'s brainchildren - is easily dwarfed by the presence of a córque rectoire such as this one. If you are gay (oh, you know you are) you absolutely will find this blend - irresistible. Used nip bottles and earrings? Yes, please. The 1930\'s are back.','Rijetko izlažemo partnerske kreacije, no \"Kreativica\" je proizvod kojeg smo samo za Vas, na jedvite jade, dovukli iz radionice jednog od ponajboljih LGBTQQATP+ dizajnera regije - Siniše Šalometa. Siniša \"Sinke\" Šalomet već desetljećima obogaćuje domaću farf-fashion i phashion scenu, a njegovo posljednje remek-djelo prirodan je nastavak Sinketove posljednje stvaralačke faze - one u kojoj istražuje sraz novog i starog, te tako uspjeva spojiti naušnice i potrošene \"bombice\".',1000.00,1,1,'2012-02-03');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `category_english` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Naušnice','Earrings'),(2,'Narukvice','Bracelets'),(3,'Ogrlice','Necklaces'),(4,'Prsteni','Rings'),(5,'Nanogice','Anklets');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product_images` (`product_id`),
  CONSTRAINT `fk_product_images` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=376 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'nanogica1.jpg'),(2,1,'nanogica2.jpg'),(3,1,'nanogica3.jpg'),(4,2,'nanogica-koza-staklo-1.jpg'),(5,2,'nanogica-koza-staklo-2.jpg'),(6,2,'nanogica-koza-staklo-3.jpg'),(7,3,'narukvica-celik-1.jpg'),(8,3,'narukvica-celik-2.jpg'),(9,3,'narukvica-celik-3.jpg'),(10,3,'narukvica-celik-4.jpg'),(11,4,'narukvica-kamen-1.jpg'),(12,4,'narukvica-kamen-2.jpg'),(13,4,'narukvica-kamen-3.jpg'),(14,5,'nausnica-b-1.jpg'),(15,5,'nausnica-b-2.jpg'),(16,5,'nausnica-b-3.jpg'),(17,5,'nausnica-b-4.jpg'),(18,6,'nausnica1.jpg'),(19,6,'nausnica2.jpg'),(20,6,'nausnica3.jpg'),(21,6,'nausnica4.jpg'),(22,6,'nausnica5.jpg'),(23,7,'nausnica-poludragi-kamen-2.jpg'),(24,7,'nausnica-poludragi-kamen-1.jpg'),(25,8,'ogrlica1.jpg'),(26,8,'ogrlica2.jpg'),(27,9,'ogrlica-kozna-1.jpg'),(28,9,'ogrlica-kozna-2.jpg'),(29,9,'ogrlica-kozna-3.jpg'),(30,10,'ogrlica-staklo-celik-1.jpg'),(31,10,'ogrlica-staklo-celik-2.jpg'),(32,10,'ogrlica-staklo-celik-3.jpg'),(33,11,'prsten1.jpg'),(34,11,'prsten2.jpg'),(35,11,'prsten3.jpg'),(36,11,'prsten4.jpg'),(37,12,'prsten-staklo-1.jpg'),(38,12,'prsten-staklo-2.jpg'),(39,12,'prsten-staklo-3.jpg'),(360,13,'ogrlica-apr-fools1.jpg'),(361,13,'ogrlica-apr-fools2.jpg'),(362,13,'ogrlica-apr-fools3.jpg'),(363,14,'kreativica1.jpg'),(364,14,'kreativica2.jpg'),(365,14,'kreativica3.jpg'),(366,14,'kreativica4.jpg');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_tags`
--

DROP TABLE IF EXISTS `product_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `tag_english` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_tags`
--

LOCK TABLES `product_tags` WRITE;
/*!40000 ALTER TABLE `product_tags` DISABLE KEYS */;
INSERT INTO `product_tags` VALUES (1,'Čelik','Steel'),(2,'Poludragi kamen','Semi-precious gemstone'),(3,'Staklo','Glass'),(4,'Koža','Leather');
/*!40000 ALTER TABLE `product_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_and_categories`
--

DROP TABLE IF EXISTS `products_and_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_and_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pnc_product` (`product_id`) USING BTREE,
  KEY `fk_pnc_category` (`category_id`) USING BTREE,
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_and_categories`
--

LOCK TABLES `products_and_categories` WRITE;
/*!40000 ALTER TABLE `products_and_categories` DISABLE KEYS */;
INSERT INTO `products_and_categories` VALUES (1,1,5),(7,2,5),(8,3,2),(9,4,2),(10,5,1),(11,6,1),(12,7,1),(13,8,3),(14,9,3),(15,10,3),(16,11,4),(17,12,4),(18,13,3),(246,14,1);
/*!40000 ALTER TABLE `products_and_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_and_tags`
--

DROP TABLE IF EXISTS `products_and_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_and_tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `tag_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pat_products` (`product_id`),
  KEY `fk_pat_tags` (`tag_id`),
  CONSTRAINT `fk_pat_products` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pat_tags` FOREIGN KEY (`tag_id`) REFERENCES `product_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_and_tags`
--

LOCK TABLES `products_and_tags` WRITE;
/*!40000 ALTER TABLE `products_and_tags` DISABLE KEYS */;
INSERT INTO `products_and_tags` VALUES (1,1,1),(6,2,4),(7,2,3),(8,3,1),(9,4,2),(10,5,1),(11,6,1),(12,7,2),(13,8,1),(14,9,4),(15,10,1),(16,10,3),(17,11,1),(18,12,3),(19,13,1),(20,14,3);
/*!40000 ALTER TABLE `products_and_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `token_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` int unsigned NOT NULL,
  PRIMARY KEY (`token_hash`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES ('672c1a04111f56bbae4a365ad95e61ae26e03e6c8e3be122eb2cabb325094e95',1736474297),('45e1e63fbe400fdf1debf993225c061e36e8941dc25151e52cf03e347aa6f492',1736532021),('630f010d472191c2605663a30ceda2fb664486600b780520893c85ddbc8cc32d',1736532026),('98df438fa3c948be30a75509b1c7c28ef69d8a06f2f50d2eced8301220ee2cad',1736561179),('98750e0b48dcc2b70b3463ff5cd2c58f7737dce443368cdde0ed5c93fd0fe3dd',1736805878),('097120fb9f0c628bd8b9820c7f4586f58d10018f62ca4a58b6e183eccd8ff2f7',1737005572),('2f4b62a8e7abf809fd47c112a3dbbbdc7097958649ba0e93fb7ee4c9ec2e0596',1737843829),('a41b6ce09b9a09eb2b5339dff235a7c6b93bbb976b7780a379573c83f5e28321',1737844075),('9c9d10513431561d94eff7eb7040f0c920f8dcff87222bd7749a871439d3dfd2',1737844928),('1549a145e753690eb6b061c08403226071f57dd93b7a09124f7b72fde6233724',1737851681),('138a3c88d2468986e99788f462c85ed2594e8feaf236f800df77a2396b0f40d0',1737851856),('32d564fd1073187e3f0416aa240cc82bfdc8dfd3c93290f1441e373512c40b8a',1737852011),('51450a0501b08c4f32e968cf8792af5bbb17a14e30f4e29894439c649472c800',1737855092),('83b00cdc7e1439330dbedb3612c6868f45fa334d713f216debe29f6418602ec0',1737855167),('45111c889706ef55556c4ca83ccce4b3edd9dc7ba0ba45bda6fb80d523938495',1737855617),('87210277a56c2b79c822230bd76f57571984ec139f8ae23fdf39b54419636411',1737855847),('8becb646283b0961b7b4dbd022497bd487d4ce2b85685691d74a17c7945468af',1737855900),('d7b7a9246e82f385f2764036fe8c61826deb6c9fc47987345a4cfad4f3f3dbf7',1737856985),('5016d55721dc84609c3cc0e6a65afb6f54dd93bd64c953bb8206309062c04466',1737857095),('d8b1c41cee966933d6a60a959694e4b1ce610465ec5efcb8360b9885273b71c5',1737857195),('87042f83951212720bd3b56456b1040105dfdb6b0945099d4eb78ec0590baf3b',1737857242),('34079bfee145b74becf402f08a2f3a540f2587b501524475ed577e89437e16c6',1737857243),('40ae6a1d0378c297143063135ecf7b4292abf201d4318df4a6808087f2d665df',1737857245),('9bc801f652f51fbc3234a1dde400dbd5a0676463a256a1286846291db3460a82',1737857276),('644c69073206b799efe906fae5386e609500fe04a1a3a4ae3222addfcfc7a6a9',1737857376),('f9056726ac6724fb2a951fd2ba4ce9e5fa8ee70e1090363b8395438ce19798ca',1737857765),('83e07c66f36e21357295db8f5ef9b4a2e9141b0a47269b1cb5021ca5fb28cd8d',1737859069),('bbf24c097b7998411b06d6628e98d3ba055b0b8a26cc1bc5b02fe4703e0c5c33',1737859478),('0cae52fee4f8a0441e2c1a8ba10cfd20d81596f92d0fc5980913587172b78a8f',1737861174),('20b4f960d2e5b142011af750d7a08800f64a17ab3b3c4913fdc6490a1aa91b5a',1737927701),('fa827105743d6e985349134d46c803d12b6c780f43810a6fcd96e865ce377a31',1737934284),('59f2fc90bf8064b72b02c227cb871bf43bea47b74ad1a506211ce3f6367f3292',1737967850),('3d9faeb5ab2645daacbdcaf19df5445dca7d03b6f85906e9bf8c65cd1fd2b57f',1740023882),('7a1b7ca5ba21db8886209ccc527c9dd06a4209162412ecc280022aedfe736fee',1740104240),('a2ce2449bc8ff0571aadfb70ce66be7cf81ca2e058c4bf09fb1dd2f9be2691c7',1740110050),('c03929da9d4d9e3a0d4b58165c0c94dfa6a42b5ad1a092f1a5f44348b7b89707',1741184731),('f4c68f5fab2aa4a49c0166bc4d017f1c0c4062d455ae111c544b4759939a0b0f',1741406747),('c8943f51da7668f145d771bc7e40303ab5329804aeac5a596775cb1df7972644',1741644000),('2064725e1587894b5cb5b074b732f1692d90f4f837779a69d393154dc9935b8a',1741740646),('359f37a0bcfab8908c22ca4a1d8447926052ab0af6df814f9405fa50c2ff5130',1741833736),('6f6799cb31047a01de3dc7a640308f38906b4838b9881f2f73754573fc542aa5',1741909953),('8e1b07bddb2482d1b37db65cdb2d05525edfa185c8e872d81e247ad80aa7fafa',1741910248),('6034e54adebbe2a60d2d6527006ff46f307e7dc935c1dee0bb3894d0e12353b8',1741917817),('add3b05109739d4224daa903d2c4cd1b71df74f5b6879fc9bb03d7bea15410b4',1742631298),('6a864d577b7276e218ab2c219f4174c2c5cb77df904638ed5f49146bd37ebf14',1743623895),('c76a3610142ca3f83d60b041173c276d3837a1f93dcd1a889ab66e6f8262fd09',1743624378),('ad8b37e77b7c52d14f13aa01147727d71bee22424113be7e2419c47b5c808c01',1743814227),('a1d8e36361e48b7ae9b78855eb247377dbc93d8fab16608de65678a75c4babfd',1744147199),('ce4d0c3ba70196ae01cfa8af36ba0f2b5a57c126c71bb3962e7c00029542dc2f',1744423216),('5dfa3582681f05eef98772620180f955a774dace2dbc9ce0be4eb8d0c861817d',1744925151),('8ce19af354e1bf89afc76dbe7f4c4c8c76e2410b8bbba9522a4010f9b923c361',1744944351),('ab4df2058bd969100a477f60f9e43619b8e0320dee982f12ae749150e0980ad5',1744944370),('d3ae562c34bbba00adf2a224647defbde2d99fe6d0dfadecfb4fec981037d290',1745284719),('bee7ef0475fd77715266d72a1f55f0e3982f8fd68c235d37ce017c4758a36a63',1745371917),('f5b9f157cf9122cc65257d5ca034450b6fadde727d5587e706ce5e8c0bafdbe6',1745545985);
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `firstName` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `lastName` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `email` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `phone` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `addressStreet` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `addressNumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `postalCode` int unsigned NOT NULL,
  `city` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `country` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  `role` int unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `username_index` (`username`),
  KEY `role` (`role`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role`) REFERENCES `user_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (9,'admin','Admin','Kazafmuradadminović','admin@lolzfords.lol','0951234567','Fulfinumska ulica','24',54947,'Ćepikućke kotline','Istarski kanton','$2y$10$/oacbl8rjA7xA4CojMdkGuW49gsoin3is.Of0MAsCmFxIeJsdnqJi',4),(10,'user','Juzimir','Korisniković','korisnik@usel.es','0911234567','Lješnjačkih brigada','87',10000,'Zagreb','Hrvatska','$2y$10$qXvldyVAe4Zg5v2JBBVmUOP2iwMQZSdQcTqTxR0osiNp02FnQ.YzS',2),(11,'employee','Šljakana','Radnik','dradnik~1@oldschool.srce.hr','097654321','Huplanova','11d',12555,'Balvanovo','Hrvatska','$2y$10$4GWLV8VaPCOwYtgXiJyt0OkHgiA6LzOnocIw7zGfD/ZM4i5unx8Y2',3),(34,'bozo','Lucijan-Bozo','Juzerčić','bozo@lolzords.lol','8888888888','Fulfinumska ulica','04',23237,'Pufkovljanec Gornji','Zagorje','$2y$10$LJGhswtVRYxSXyUbg8GUeetIuO3wQMRpfvDqsd8D/BpJnCapqwIri',2);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `role_desc_index` (`description`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (4,'admin'),(3,'employee'),(1,'guest'),(2,'user');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-20  2:39:58
