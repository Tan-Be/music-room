// Моковые данные треков для Music Room

export interface MockTrack {
  id: string
  title: string
  artist: string
  duration: number // секунды (макс 360)
  thumbnail_url: string
  genre?: string
}

// Набор ~50 треков разных жанров
export const mockTracks: MockTrack[] = [
  // Поп
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: 200,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'pop'
  },
  {
    id: '2',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    duration: 174,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'pop'
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: 203,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'pop'
  },
  {
    id: '4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    duration: 178,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'pop'
  },
  {
    id: '5',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    duration: 141,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'pop'
  },
  
  // Рок
  {
    id: '6',
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    duration: 356,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'rock'
  },
  {
    id: '7',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    duration: 301,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'rock'
  },
  {
    id: '8',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    duration: 354,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'rock'
  },
  {
    id: '9',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    duration: 296,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'rock'
  },
  {
    id: '10',
    title: 'Hotel California',
    artist: 'Eagles',
    duration: 391,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'rock'
  },
  
  // Хип-хоп
  {
    id: '11',
    title: 'Sicko Mode',
    artist: 'Travis Scott',
    duration: 312,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'hip-hop'
  },
  {
    id: '12',
    title: 'God\'s Plan',
    artist: 'Drake',
    duration: 198,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'hip-hop'
  },
  {
    id: '13',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    duration: 177,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'hip-hop'
  },
  {
    id: '14',
    title: 'Old Town Road',
    artist: 'Lil Nas X ft. Billy Ray Cyrus',
    duration: 157,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'hip-hop'
  },
  {
    id: '15',
    title: 'Industry Baby',
    artist: 'Lil Nas X, Jack Harlow',
    duration: 212,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'hip-hop'
  },
  
  // Электроника
  {
    id: '16',
    title: 'Strobe',
    artist: 'Deadmau5',
    duration: 360,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'electronic'
  },
  {
    id: '17',
    title: 'Levels',
    artist: 'Avicii',
    duration: 342,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'electronic'
  },
  {
    id: '18',
    title: 'Titanium',
    artist: 'David Guetta ft. Sia',
    duration: 245,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'electronic'
  },
  {
    id: '19',
    title: 'Wake Me Up',
    artist: 'Avicii',
    duration: 249,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'electronic'
  },
  {
    id: '20',
    title: 'Animals',
    artist: 'Martin Garrix',
    duration: 225,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'electronic'
  },
  
  // Джаз
  {
    id: '21',
    title: 'Take Five',
    artist: 'Dave Brubeck Quartet',
    duration: 320,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'jazz'
  },
  {
    id: '22',
    title: 'So What',
    artist: 'Miles Davis',
    duration: 292,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'jazz'
  },
  {
    id: '23',
    title: 'Blue Moon',
    artist: 'Billie Holiday',
    duration: 226,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'jazz'
  },
  {
    id: '24',
    title: 'A Love Supreme',
    artist: 'John Coltrane',
    duration: 315,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'jazz'
  },
  {
    id: '25',
    title: 'Mack the Knife',
    artist: 'Louis Armstrong',
    duration: 265,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'jazz'
  },
  
  // Классика
  {
    id: '26',
    title: 'Für Elise',
    artist: 'Ludwig van Beethoven',
    duration: 180,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'classical'
  },
  {
    id: '27',
    title: 'Nocturne in E-flat Major',
    artist: 'Frédéric Chopin',
    duration: 310,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'classical'
  },
  {
    id: '28',
    title: 'The Four Seasons: Spring',
    artist: 'Antonio Vivaldi',
    duration: 198,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'classical'
  },
  {
    id: '29',
    title: 'Symphony No. 9',
    artist: 'Ludwig van Beethoven',
    duration: 360,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'classical'
  },
  {
    id: '30',
    title: 'Eine kleine Nachtmusik',
    artist: 'Wolfgang Amadeus Mozart',
    duration: 298,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'classical'
  },
  
  // Регги
  {
    id: '31',
    title: 'One Love',
    artist: 'Bob Marley & The Wailers',
    duration: 166,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'reggae'
  },
  {
    id: '32',
    title: 'No Woman No Cry',
    artist: 'Bob Marley & The Wailers',
    duration: 210,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'reggae'
  },
  {
    id: '33',
    title: 'Three Little Birds',
    artist: 'Bob Marley & The Wailers',
    duration: 180,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'reggae'
  },
  {
    id: '34',
    title: 'Red Red Wine',
    artist: 'UB40',
    duration: 185,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'reggae'
  },
  {
    id: '35',
    title: 'Is This Love',
    artist: 'Bob Marley & The Wailers',
    duration: 232,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'reggae'
  },
  
  // Металл
  {
    id: '36',
    title: 'Enter Sandman',
    artist: 'Metallica',
    duration: 331,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'metal'
  },
  {
    id: '37',
    title: 'Crazy Train',
    artist: 'Ozzy Osbourne',
    duration: 292,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'metal'
  },
  {
    id: '38',
    title: 'Master of Puppets',
    artist: 'Metallica',
    duration: 312,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'metal'
  },
  {
    id: '39',
    title: 'Paranoid',
    artist: 'Black Sabbath',
    duration: 172,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'metal'
  },
  {
    id: '40',
    title: 'Ace of Spades',
    artist: 'Motörhead',
    duration: 170,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'metal'
  },
  
  // Альтернатива
  {
    id: '41',
    title: 'Creep',
    artist: 'Radiohead',
    duration: 236,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'alternative'
  },
  {
    id: '42',
    title: 'Wonderwall',
    artist: 'Oasis',
    duration: 258,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'alternative'
  },
  {
    id: '43',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    duration: 223,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'alternative'
  },
  {
    id: '44',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    duration: 231,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'alternative'
  },
  {
    id: '45',
    title: 'Somebody That I Used to Know',
    artist: 'Gotye ft. Kimberly',
    duration: 244,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'alternative'
  },
  
  // Кантри
  {
    id: '46',
    title: 'Jolene',
    artist: 'Dolly Parton',
    duration: 160,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'country'
  },
  {
    id: '47',
    title: 'Friends in Low Places',
    artist: 'Garth Brooks',
    duration: 203,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'country'
  },
  {
    id: '48',
    title: 'The Gambler',
    artist: 'Kenny Rogers',
    duration: 210,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'country'
  },
  {
    id: '49',
    title: 'Ring of Fire',
    artist: 'Johnny Cash',
    duration: 155,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'country'
  },
  {
    id: '50',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    duration: 190,
    thumbnail_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    genre: 'country'
  }
]