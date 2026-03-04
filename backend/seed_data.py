"""Seed data for Telugu, Tamil artists and Indian Music articles."""
import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ── Telugu Artists & Songs ──
TELUGU_ARTISTS = [
    {
        "name": "Devi Sri Prasad", "role": "composer", "language": "telugu",
        "notable_works": ["Pushpa 2: The Rule", "Waltair Veerayya", "Pushpa: The Rise"],
        "songs": [
            {"title": "Pushpa Pushpa", "film": "Pushpa 2: The Rule", "genre": "mass anthem"},
            {"title": "Angaaron", "film": "Pushpa 2: The Rule", "genre": "dance"},
            {"title": "Srivalli", "film": "Pushpa: The Rise", "genre": "romantic"},
            {"title": "Oo Antava", "film": "Pushpa: The Rise", "genre": "item song"},
            {"title": "Boss Party", "film": "Waltair Veerayya", "genre": "dance"},
        ]
    },
    {
        "name": "Thaman S", "role": "composer", "language": "telugu",
        "notable_works": ["Akhanda", "Veera Simha Reddy", "Guntur Kaaram", "Bro"],
        "songs": [
            {"title": "Jai Balayya", "film": "Veera Simha Reddy", "genre": "mass anthem"},
            {"title": "Nuvve Nuvve", "film": "Bro", "genre": "romantic"},
            {"title": "Guntur Kaaram Title Track", "film": "Guntur Kaaram", "genre": "mass"},
            {"title": "Akhanda Title Song", "film": "Akhanda", "genre": "devotional mass"},
        ]
    },
    {
        "name": "M. M. Keeravani", "role": "composer", "language": "telugu",
        "notable_works": ["RRR", "Baahubali", "Baahubali 2"],
        "songs": [
            {"title": "Naatu Naatu", "film": "RRR", "genre": "dance"},
            {"title": "Komaram Bheemudo", "film": "RRR", "genre": "patriotic"},
            {"title": "Dosti", "film": "RRR", "genre": "friendship"},
            {"title": "Jay Jaykara", "film": "Baahubali 2", "genre": "devotional"},
            {"title": "Saahore Baahubali", "film": "Baahubali 2", "genre": "mass anthem"},
        ]
    },
    {
        "name": "Sid Sriram", "role": "singer", "language": "telugu",
        "notable_works": ["Arjun Reddy", "Butta Bomma", "Various Telugu/Tamil hits"],
        "songs": [
            {"title": "Butta Bomma", "film": "Ala Vaikunthapurramuloo", "genre": "romantic"},
            {"title": "Samajavaragamana", "film": "Ala Vaikunthapurramuloo", "genre": "classical romantic"},
            {"title": "Inkem Inkem", "film": "Geetha Govindam", "genre": "romantic"},
            {"title": "Telisiney Na Nuvvey", "film": "Arjun Reddy", "genre": "romantic"},
        ]
    },
    {
        "name": "Shreya Ghoshal", "role": "singer", "language": "telugu",
        "notable_works": ["Various Telugu film soundtracks"],
        "songs": [
            {"title": "Manasu Maree", "film": "Oh Baby", "genre": "melodious"},
            {"title": "Jaragandi", "film": "Game Changer", "genre": "dance"},
        ]
    },
    {
        "name": "Kaala Bhairava", "role": "singer", "language": "telugu",
        "notable_works": ["RRR", "Various Telugu films"],
        "songs": [
            {"title": "Komaram Bheemudo", "film": "RRR", "genre": "patriotic"},
            {"title": "Dosti", "film": "RRR", "genre": "friendship"},
        ]
    },
    {
        "name": "Rahul Sipligunj", "role": "singer", "language": "telugu",
        "notable_works": ["Rangasthalam", "Various Telugu folk songs"],
        "songs": [
            {"title": "Ranga Ranga Rangasthalaana", "film": "Rangasthalam", "genre": "folk"},
            {"title": "Jigelu Rani", "film": "Rangasthalam", "genre": "folk dance"},
        ]
    },
    {
        "name": "Armaan Malik", "role": "singer", "language": "telugu",
        "notable_works": ["Various Telugu film songs"],
        "songs": [
            {"title": "Butta Bomma (version)", "film": "Ala Vaikunthapurramuloo", "genre": "romantic"},
        ]
    },
    {
        "name": "Santhosh Narayanan", "role": "composer", "language": "telugu",
        "notable_works": ["Dasara", "Various Telugu/Tamil"],
        "songs": [
            {"title": "Ori Vaari", "film": "Dasara", "genre": "folk"},
            {"title": "Dhoom Dhaam", "film": "Dasara", "genre": "mass"},
        ]
    },
    {
        "name": "G. V. Prakash Kumar", "role": "composer", "language": "telugu",
        "notable_works": ["Lucky Bhaskar"],
        "songs": [
            {"title": "Kissik", "film": "Lucky Bhaskar", "genre": "dance"},
        ]
    },
]

# ── Tamil Artists & Songs ──
TAMIL_ARTISTS = [
    {
        "name": "A. R. Rahman", "role": "composer", "language": "tamil",
        "notable_works": ["Roja", "Bombay", "Dil Se", "Slumdog Millionaire", "Ponniyin Selvan"],
        "songs": [
            {"title": "Jai Ho", "film": "Slumdog Millionaire", "genre": "world music"},
            {"title": "Ponni Nadhi", "film": "Ponniyin Selvan", "genre": "classical"},
            {"title": "Chola Chola", "film": "Ponniyin Selvan", "genre": "mass anthem"},
            {"title": "Roja Jaaneman", "film": "Roja", "genre": "romantic"},
            {"title": "Chaiyya Chaiyya", "film": "Dil Se", "genre": "sufi dance"},
            {"title": "Vande Mataram", "film": "Independence", "genre": "patriotic"},
            {"title": "Tere Bina", "film": "Guru", "genre": "romantic"},
        ]
    },
    {
        "name": "Anirudh Ravichander", "role": "composer", "language": "tamil",
        "notable_works": ["Jailer", "Leo", "Vikram", "GOAT"],
        "songs": [
            {"title": "Kaavaalaa", "film": "Jailer", "genre": "dance"},
            {"title": "Hukum", "film": "Jailer", "genre": "mass anthem"},
            {"title": "Ordinary Person", "film": "Leo", "genre": "mass"},
            {"title": "Pathala Pathala", "film": "Vikram", "genre": "mass anthem"},
            {"title": "Master the Blaster", "film": "Master", "genre": "dance"},
            {"title": "Vaathi Coming", "film": "Master", "genre": "mass dance"},
            {"title": "Whistle Podu", "film": "GOAT", "genre": "mass"},
        ]
    },
    {
        "name": "Ilaiyaraaja", "role": "composer", "language": "tamil",
        "notable_works": ["Legendary 1000+ film scores"],
        "songs": [
            {"title": "Ilayanila", "film": "Payanangal Mudivathillai", "genre": "melodious"},
            {"title": "Poo Maalai", "film": "Various", "genre": "classical"},
            {"title": "Sundari Kannal", "film": "Thalapathi", "genre": "classical romantic"},
        ]
    },
    {
        "name": "Yuvan Shankar Raja", "role": "composer", "language": "tamil",
        "notable_works": ["Various Tamil films"],
        "songs": [
            {"title": "Why This Kolaveri Di", "film": "3", "genre": "pop viral"},
            {"title": "Nenjukkul Peidhidum", "film": "Vaaranam Aayiram", "genre": "romantic"},
        ]
    },
    {
        "name": "Harris Jayaraj", "role": "composer", "language": "tamil",
        "notable_works": ["Ghajini", "Vettaiyaadu Vilaiyaadu"],
        "songs": [
            {"title": "Munbe Vaa", "film": "Sillunu Oru Kaadhal", "genre": "romantic"},
            {"title": "Nenje Nenje", "film": "Ratchagan", "genre": "melodious"},
        ]
    },
    {
        "name": "D. Imman", "role": "composer", "language": "tamil",
        "notable_works": ["Viswasam", "Various Tamil films"],
        "songs": [
            {"title": "Thalle Thillaaley", "film": "Viswasam", "genre": "folk"},
            {"title": "Raasaathi", "film": "Various", "genre": "folk romantic"},
        ]
    },
    {
        "name": "Sid Sriram", "role": "singer", "language": "tamil",
        "notable_works": ["Various Tamil/Telugu hits"],
        "songs": [
            {"title": "Maruvaarthai", "film": "Enai Noki Paayum Thota", "genre": "romantic"},
            {"title": "Nee Irukkum Idam Than", "film": "Various", "genre": "romantic"},
        ]
    },
    {
        "name": "Chinmayi Sripada", "role": "singer", "language": "tamil",
        "notable_works": ["Various Tamil/Telugu film songs"],
        "songs": [
            {"title": "Ennodu Nee Irundhaal", "film": "I", "genre": "romantic"},
        ]
    },
    {
        "name": "Dhee", "role": "singer", "language": "tamil",
        "notable_works": ["Enjoy Enjaami", "Indie Tamil"],
        "songs": [
            {"title": "Enjoy Enjaami", "film": "Independent", "genre": "folk rap"},
        ]
    },
    {
        "name": "Arivu", "role": "singer", "language": "tamil",
        "notable_works": ["Enjoy Enjaami", "Tamil indie rap"],
        "songs": [
            {"title": "Enjoy Enjaami", "film": "Independent", "genre": "folk rap"},
        ]
    },
]

# ── Indian Music Articles ──
ARTICLES = [
    {
        "id": "art-1",
        "title": "Evolution of Indian Classical Music",
        "category": "classical",
        "content": "Indian classical music is one of the oldest musical traditions in the world, dating back over 3,000 years to the Vedic period. It evolved from the chanting of Sama Veda hymns into two major traditions: Hindustani (North Indian) and Carnatic (South Indian). The foundation of Indian classical music lies in the concepts of Raga (melodic framework) and Tala (rhythmic cycle). Over centuries, these frameworks became increasingly sophisticated, with hundreds of ragas catalogued and complex tala patterns developed. The Mughal era (16th-19th century) heavily influenced Hindustani music, introducing instruments like the sitar and tabla, while Carnatic music maintained stronger ties to its Vedic roots. The 20th century saw Indian classical music gain global recognition through artists like Ravi Shankar, who collaborated with Western musicians like The Beatles. Today, classical music continues to evolve while maintaining its ancient foundations, with artists blending traditional ragas with contemporary arrangements."
    },
    {
        "id": "art-2",
        "title": "Hindustani vs Carnatic: Two Streams of Indian Classical Music",
        "category": "classical",
        "content": "While both Hindustani and Carnatic music share common roots in ancient Indian musical theory, they diverged significantly after the 12th century. Hindustani music, prevalent in North India, was influenced by Persian and Arabic musical traditions during the Mughal period. It emphasizes improvisation (alap) and uses instruments like the sitar, sarod, and tabla. Carnatic music, prevalent in South India (Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, Kerala), remained more rooted in structured compositions. The Carnatic tradition centers around the 'kriti' compositions of the Musical Trinity - Tyagaraja, Muthuswami Dikshitar, and Syama Sastri. Carnatic music uses the veena, mridangam, and violin as primary instruments. While Hindustani music has gharanas (schools/lineages), Carnatic music follows a more unified system of pedagogy."
    },
    {
        "id": "art-3",
        "title": "The Concept of Ragas and Talas",
        "category": "classical",
        "content": "A Raga is the melodic framework of Indian classical music - far more than just a scale. Each raga has specific ascending (arohanam) and descending (avarohanam) note patterns, characteristic phrases (pakad), and an associated emotional mood (rasa). Some ragas are associated with specific times of day or seasons. For example, Raga Bhairav is a morning raga, while Raga Malkauns is performed late at night. Tala is the rhythmic framework, consisting of a cycle of beats. Common talas include Teental (16 beats), Adi tala (8 beats in Carnatic), and Rupak (7 beats). Together, raga and tala create the entire structure of a performance, allowing musicians to improvise within set boundaries. This combination of structure and freedom is what makes Indian classical music unique."
    },
    {
        "id": "art-4",
        "title": "History of Playback Singing in India",
        "category": "film_music",
        "content": "Playback singing - where professional singers record songs that actors lip-sync to on screen - became the standard in Indian cinema from the 1940s onwards. Before this, actors sang their own songs. The transition began when the quality gap between trained singers and actors became apparent. K. L. Saigal was among the first major playback singers. The golden era (1950s-1980s) was dominated by legends like Lata Mangeshkar, Mohammed Rafi, Kishore Kumar, and Asha Bhosle in Hindi cinema, and P. Susheela, S. P. Balasubrahmanyam, and S. Janaki in South Indian cinema. These singers recorded thousands of songs each. The modern era sees singers like Arijit Singh, Sid Sriram, Shreya Ghoshal, and Armaan Malik carrying forward this tradition while also being visible performers in their own right."
    },
    {
        "id": "art-5",
        "title": "Golden Era of Indian Film Music (1950-1980)",
        "category": "film_music",
        "content": "The period from 1950 to 1980 is often called the Golden Era of Indian film music. Composers like S. D. Burman, Naushad, Shankar-Jaikishan, and R. D. Burman created timeless melodies that remain popular today. This era blended Indian classical music with orchestral arrangements, creating a unique sound. Songs like 'Lag Jaa Gale' (Madan Mohan), 'Mere Sapno Ki Rani' (S.D. Burman), and 'Dum Maro Dum' (R.D. Burman) defined generations. In South Indian cinema, composers like M.S. Viswanathan, Ilaiyaraaja, and K.V. Mahadevan were creating equally remarkable music. This era established film music as the dominant popular music form in India - a position it still holds today."
    },
    {
        "id": "art-6",
        "title": "Legendary Singer: S. P. Balasubrahmanyam",
        "category": "legends",
        "content": "S. P. Balasubrahmanyam (SPB) holds the Guinness World Record for recording the most songs - over 40,000 songs in 16 languages across a career spanning 5 decades. Born in Andhra Pradesh, SPB was equally celebrated in Telugu, Tamil, Kannada, and Hindi cinema. His voice became synonymous with actors like Kamal Haasan and Salman Khan. His range was extraordinary - from the classical purity of 'Sundari Kannal' to the playful energy of 'Jumbalakka'. SPB won 6 National Film Awards for Best Male Playback Singer and the Padma Bhushan. His passing in 2020 was mourned across India. His legacy lives through his son S.P. Charan and countless songs that continue to be loved across generations."
    },
    {
        "id": "art-7",
        "title": "Rise of A. R. Rahman and the Modern Sound",
        "category": "film_music",
        "content": "A. R. Rahman's debut with 'Roja' (1992) revolutionized Indian film music. His use of synthesizers, world music elements, and unconventional song structures created a completely new sound. Unlike the melody-driven approach of earlier composers, Rahman brought texture, layering, and production quality that matched international standards. His Oscar-winning 'Jai Ho' from Slumdog Millionaire brought Indian music to a global audience. Rahman's influence extends beyond his own work - he inspired an entire generation of composers including Anirudh Ravichander, who credits Rahman as his primary inspiration. Rahman's recent work on 'Ponniyin Selvan' showed his continued ability to create grand, emotionally resonant music."
    },
    {
        "id": "art-8",
        "title": "Folk Music of Andhra Pradesh and Telangana",
        "category": "folk",
        "content": "The Telugu-speaking regions of Andhra Pradesh and Telangana have rich folk music traditions. Bathukamma songs, sung during the floral festival of Telangana, are hauntingly beautiful. Burra Katha is a narrative ballad form performed with percussion instruments. Janapadalu (folk songs) cover themes of love, farming, and daily life. Oggu Katha, Lambadi songs, and Dappu (drum) music are integral to festivals and celebrations. In modern cinema, composers like Devi Sri Prasad and Santhosh Narayanan have brilliantly incorporated these folk elements. Songs like 'Ranga Ranga Rangasthalaana' from Rangasthalam and tracks from Dasara showcase this fusion of folk and film music."
    },
    {
        "id": "art-9",
        "title": "Tamil Folk Music Traditions",
        "category": "folk",
        "content": "Tamil Nadu has one of the most diverse folk music traditions in India. Gaana music from North Chennai is raw, energetic, and deeply connected to working-class culture - artists like Gana Bala have brought it mainstream. Kuthu music is the fast-paced dance music that forms the backbone of Tamil mass entertainers. Oppari (lamentation songs), Kummi and Kolattam (dance songs), and Villupaattu (bow song) are ancient forms still practiced. The recent indie movement has seen artists like Dhee and Arivu ('Enjoy Enjaami') blend Tamil folk with modern production, creating globally viral hits. Composers like Santhosh Narayanan and D. Imman regularly incorporate these authentic folk sounds into their film scores."
    },
    {
        "id": "art-10",
        "title": "Evolution of Telugu Cinema Music",
        "category": "regional",
        "content": "Telugu cinema music has undergone remarkable evolution. From the classical compositions of Ghantasala in the 1950s-70s, to the revolutionary work of Ilaiyaraaja who brought symphonic orchestration in the 1980s, to the electronic innovations of A. R. Rahman in the 1990s. The 2000s saw Devi Sri Prasad (DSP) create a new brand of energetic mass music, while M. M. Keeravani brought epic grandeur to the Baahubali franchise. Thaman S became the go-to composer for commercial Telugu cinema. The Oscar win for 'Naatu Naatu' put Telugu music on the global map. Today, Telugu music blends folk, classical, mass appeal, and international production standards."
    },
    {
        "id": "art-11",
        "title": "Evolution of Tamil Cinema Music",
        "category": "regional",
        "content": "Tamil cinema has been at the forefront of Indian film music innovation. The classical era was dominated by M.S. Viswanathan and K.V. Mahadevan. Ilaiyaraaja then revolutionized the industry by introducing Western classical orchestration while maintaining Indian melodic sensibility. A. R. Rahman took this further with electronic and world music fusion. Anirudh Ravichander represents the current generation - his work on films like Jailer, Leo, and GOAT combines trap, EDM, and mass anthem styles with Tamil sensibility. His song 'Kaavaalaa' became a global viral hit. Harris Jayaraj, Yuvan Shankar Raja, and D. Imman each brought unique styles, making Tamil music one of the most diverse film music industries in the world."
    },
    {
        "id": "art-12",
        "title": "Instruments of India: Veena, Mridangam, and Tabla",
        "category": "instruments",
        "content": "India boasts an incredible diversity of musical instruments. The Veena (or Saraswati Veena in the South) is one of the oldest string instruments, considered the instrument of Goddess Saraswati. The Mridangam is the primary percussion instrument of Carnatic music - a barrel-shaped drum that produces complex rhythmic patterns. The Tabla, the North Indian percussion instrument, consists of two drums (dayan and bayan) and is central to Hindustani music. The Sitar, popularized globally by Ravi Shankar, has moveable frets and sympathetic strings creating its distinctive buzzing tone. The Nadaswaram (a large wind instrument) and Thavil (drum) are essential for South Indian temple music and festivals. The Flute (bansuri) has been elevated to a concert instrument by masters like Hariprasad Chaurasia."
    },
    {
        "id": "art-13",
        "title": "Devotional Music in India",
        "category": "devotional",
        "content": "Devotional music forms the spiritual backbone of Indian musical tradition. Bhajans (devotional songs to Hindu deities) range from the simple chants of Meerabai to the complex compositions of Tyagaraja. Qawwali, popularized by Nusrat Fateh Ali Khan, is the devotional music of Sufi Islam. Kirtan and Shabad are devotional forms in Sikh tradition. In Telugu culture, Annamacharya's keertanas (15th century) are still sung daily in temples. In Tamil tradition, the Thevaram and Thiruppavai hymns are ancient devotional compositions. Film music has always drawn from devotional traditions - songs like 'Akhanda Title Song' blend mass cinema with devotional fervor, while Rahman's 'Vande Mataram' channels patriotic devotion."
    },
    {
        "id": "art-14",
        "title": "The Indie Music Movement in India",
        "category": "contemporary",
        "content": "India's independent music scene has exploded in the 2020s. Artists are creating music outside the film industry, finding audiences directly through streaming platforms. 'Enjoy Enjaami' by Dhee and Arivu, produced by Santhosh Narayanan, became a global phenomenon - a Tamil folk-rap song about land and identity that garnered hundreds of millions of views. Artists like Prateek Kuhad, When Chai Met Toast, Nucleya, and Divine have built massive followings. The Tamil indie scene is particularly vibrant with artists blending folk, electronic, and hip-hop. Telugu indie is growing too, with artists exploring beyond film music. Streaming platforms like Spotify and YouTube have democratized music distribution, allowing independent artists to reach audiences without film industry backing."
    },
    {
        "id": "art-15",
        "title": "Legendary Singer: Lata Mangeshkar",
        "category": "legends",
        "content": "Lata Mangeshkar, known as the 'Nightingale of India', was one of the most prolific and celebrated playback singers in the world. With a career spanning over seven decades and an estimated 25,000+ songs in 36 languages, she is an unparalleled figure in music history. Her voice defined Hindi cinema's golden and silver eras. Songs like 'Lag Jaa Gale', 'Ajeeb Dastaan Hai Yeh', and 'Tujhe Dekha Toh' remain timeless. She received the Bharat Ratna (India's highest civilian honor), Dadasaheb Phalke Award, and France's Legion of Honour. Her passing in 2022 was mourned as a national loss. Her younger sister Asha Bhosle is equally legendary, known for her versatility across genres."
    },
    {
        "id": "art-16",
        "title": "Anirudh Ravichander: The New King of South Indian Music",
        "category": "contemporary",
        "content": "Anirudh Ravichander burst onto the scene at age 21 with 'Why This Kolaveri Di' (composed by Yuvan, sung with Dhanush) but quickly established himself as a composer with 'Ethir Neechal'. His music for Rajinikanth's 'Jailer' made him the youngest composer to score for the superstar. 'Kaavaalaa' from Jailer became a global dance trend. His work on 'Vikram' (Pathala Pathala), 'Leo', 'Master', and 'GOAT' cemented his status. Anirudh's style blends Western electronic production with Tamil mass sensibility. He also composes for Telugu cinema, creating a pan-South Indian appeal. His concerts draw massive crowds, making him as much a performer as a composer."
    },
    {
        "id": "art-17",
        "title": "Ghazals: Poetry Meets Music in India",
        "category": "classical",
        "content": "The Ghazal is a poetic form set to music that originated in Arabic poetry and flourished in Urdu literature. In India, it became one of the most sophisticated musical forms. Legendary ghazal singers include Mehdi Hassan (the 'King of Ghazal'), Jagjit Singh (who modernized the form), Ghulam Ali, and Begum Akhtar. Ghazals typically deal with themes of love, loss, and philosophical reflection. The form uses specific poetic meters (bahar) and a distinctive rhyme scheme. Pankaj Udhas and Talat Aziz brought ghazals to mainstream audiences. In Telugu, similar poetic song forms exist in the 'padyam' tradition. Film music frequently incorporates ghazal-influenced compositions for romantic and melancholic sequences."
    },
    {
        "id": "art-18",
        "title": "Women Pioneers in Indian Music",
        "category": "legends",
        "content": "Indian music history is illuminated by extraordinary women. M.S. Subbulakshmi was the first musician to receive the Bharat Ratna - her rendition of 'Bhaja Govindam' at the United Nations is legendary. Lata Mangeshkar and Asha Bhosle dominated Hindi playback for decades. P. Susheela holds the world record for most songs by a female playback singer in Indian cinema. S. Janaki's range across South Indian languages was unmatched. In the current era, Shreya Ghoshal continues to dominate across languages. Young artists like Dhee are breaking new ground in indie music. In the classical sphere, Bombay Jayashri, Aruna Sairam, and Sudha Ragunathan carry forward the rich Carnatic tradition."
    },
    {
        "id": "art-19",
        "title": "Music in Indian Festivals",
        "category": "cultural",
        "content": "Music is inseparable from Indian festivals. Bathukamma celebrations in Telangana feature women singing in circles around flower stacks. Ganesh Chaturthi in Maharashtra and Andhra Pradesh involves massive processions with Dappu (drum) music. Navratri in Gujarat features Garba and Dandiya with live music. Tamil Nadu's Pongal celebrations include Villuppattu performances. Classical music festivals like the Madras Music Season (December-January) host hundreds of Carnatic concerts. Thyagaraja Aradhana in Tirupati is the world's largest choral tribute. Film music concerts have become festivals of their own - Anirudh's live concerts and DSP's performances draw crowds in the tens of thousands."
    },
    {
        "id": "art-20",
        "title": "The Impact of Digital Streaming on Indian Music",
        "category": "contemporary",
        "content": "Digital streaming has transformed Indian music consumption and creation. Before streaming, film music dominated entirely - radio and TV were the primary channels. Now, Spotify, YouTube Music, and JioSaavn have created space for independent artists. Telugu and Tamil music have found international audiences - diaspora communities stream South Indian music globally. YouTube premiere of film songs has become a cultural event - 'Pushpa 2' songs broke records with millions of views in hours. Streaming data now influences which composers get hired for films. The democratization has also led to the rise of non-film music in Telugu and Tamil, with independent singles becoming hits. However, film music still dominates - over 70% of streams in South Indian languages are film soundtracks."
    },
]

async def seed_data():
    # Seed artists
    all_artists = TELUGU_ARTISTS + TAMIL_ARTISTS
    for artist in all_artists:
        await db.artists.update_one(
            {"name": artist["name"], "language": artist["language"]},
            {"$set": artist},
            upsert=True
        )
    print(f"Seeded {len(all_artists)} artists")

    # Seed articles
    for article in ARTICLES:
        article["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.articles.update_one(
            {"id": article["id"]},
            {"$set": article},
            upsert=True
        )
    print(f"Seeded {len(ARTICLES)} articles")

    # Create indexes
    await db.artists.create_index("language")
    await db.articles.create_index("category")
    print("Indexes created")

if __name__ == "__main__":
    asyncio.run(seed_data())
    print("Seed data complete!")
