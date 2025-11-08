import { Movie, Series, Category, Content } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Ação', keywords: ['aventura', 'heróis', 'explosões', 'lutas'] },
  { id: '2', name: 'Comédia', keywords: ['humor', 'engraçado', 'leve', 'família'] },
  { id: '3', name: 'Drama', keywords: ['emocionante', 'realista', 'sério', 'profundo'] },
  { id: '4', name: 'Terror', keywords: ['assustador', 'suspense', 'medo', 'sobrenatural'] },
  { id: '5', name: 'Ficção Científica', keywords: ['futuro', 'tecnologia', 'espaço', 'aliens'] },
  { id: '6', name: 'Romance', keywords: ['amor', 'paixão', 'relacionamento', 'dramático'] },
  { id: '7', name: 'Animação', keywords: ['disney', 'crianças', 'magia', 'aventura'] },
  { id: '8', name: 'Infantil', keywords: ['crianças', 'família', 'educativo', 'divertido'] },
  { id: '9', name: 'Documentário', keywords: ['real', 'educativo', 'natureza', 'história'] },
  { id: '10', name: 'Suspense', keywords: ['mistério', 'intriga', 'tensão', 'investigação'] },
];

const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

export const mockMovies: Content[] = [
  {
    id: '1',
    title: 'Vingadores: Era de Ultron',
    description: 'Quando Tony Stark tenta iniciar um programa de paz adormecido, as coisas dão errado e os heróis mais poderosos da Terra, incluindo Homem de Ferro, Capitão América, Thor, Hulk, Viúva Negra e Gavião Arqueiro, são postos à prova enquanto o destino do planeta fica em jogo.',
    category: 'Ação',
    keywords: ['heróis', 'aventura', 'explosões', 'marvel'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/570qhjGZmGPrBGnfx70jcwIuBr4.jpg',
    videoUrl: 'https://example.com/video1.mp4',
    year: 2015,
    duration: 141,
    rating: 7.3,
    addedDate: now,
    isNew: true,
  },
  {
    id: '2',
    title: 'Interestelar',
    description: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie.',
    category: 'Ficção Científica',
    keywords: ['espaço', 'futuro', 'dramático', 'família'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
    videoUrl: 'https://example.com/video2.mp4',
    year: 2014,
    duration: 169,
    rating: 8.6,
    addedDate: yesterday,
    isNew: true,
  },
  {
    id: '3',
    title: 'A Origem',
    description: 'Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente, obtidos durante o estado de sono. Impedido de retornar à família, ele recebe a oportunidade de se redimir ao realizar uma tarefa aparentemente impossível.',
    category: 'Ficção Científica',
    keywords: ['mistério', 'complexo', 'sonhos', 'suspense'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    videoUrl: 'https://example.com/video3.mp4',
    year: 2010,
    duration: 148,
    rating: 8.8,
    addedDate: new Date(2024, 10, 1),
  },
  {
    id: '4',
    title: 'Coringa',
    description: 'Arthur Fleck trabalha como palhaço para uma agência de talentos e luta contra sua sanidade mental. Ele se transforma no criminoso conhecido como Coringa, espalhando caos em Gotham City.',
    category: 'Drama',
    keywords: ['psicológico', 'intenso', 'vilão', 'sombrio'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    videoUrl: 'https://example.com/video4.mp4',
    year: 2019,
    duration: 122,
    rating: 8.4,
    addedDate: new Date(2024, 9, 28),
  },
  {
    id: '5',
    title: 'Pantera Negra',
    description: 'Após a morte de seu pai, o príncipe TChalla retorna a Wakanda para a cerimônia de coroação. Mas a chegada de um poderoso inimigo coloca à prova a capacidade de TChalla como rei e Pantera Negra.',
    category: 'Ação',
    keywords: ['heróis', 'aventura', 'africa', 'marvel'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg',
    videoUrl: 'https://example.com/video5.mp4',
    year: 2018,
    duration: 134,
    rating: 7.3,
    addedDate: twoDaysAgo,
    isNew: true,
  },
  {
    id: '6',
    title: 'Parasita',
    description: 'Toda a família de Ki-taek está desempregada. Um dia, seu filho consegue um emprego como professor particular. Fascinados com a vida luxuosa da família Park, começam a tramar um plano.',
    category: 'Drama',
    keywords: ['intenso', 'sociedade', 'suspense', 'premiado'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    videoUrl: 'https://example.com/video6.mp4',
    year: 2019,
    duration: 132,
    rating: 8.6,
    addedDate: new Date(2024, 9, 25),
  },
  {
    id: '7',
    title: 'Toy Story 4',
    description: 'Woody sempre se sentiu confiante sobre seu lugar no mundo e que sua prioridade era cuidar de sua criança. Mas quando Bonnie adiciona um novo brinquedo chamado Forky à sua coleção, uma aventura inesperada começa.',
    category: 'Animação',
    keywords: ['disney', 'pixar', 'aventura', 'família'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/m67smI1IIMmYzCl9axvKNULVKLr.jpg',
    videoUrl: 'https://example.com/video7.mp4',
    year: 2019,
    duration: 100,
    rating: 7.7,
    addedDate: new Date(2024, 9, 20),
  },
  {
    id: '8',
    title: 'Um Lugar Silencioso',
    description: 'Em um mundo pós-apocalíptico, uma família é forçada a viver em silêncio enquanto se esconde de monstros com audição ultrassensível.',
    category: 'Terror',
    keywords: ['suspense', 'família', 'sobrevivência', 'monstros'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/roYyPiQDQKmIKUEhO912693tSja.jpg',
    videoUrl: 'https://example.com/video8.mp4',
    year: 2018,
    duration: 90,
    rating: 7.5,
    addedDate: new Date(2024, 9, 15),
  },
  {
    id: '9',
    title: 'La La Land',
    description: 'Mia, uma aspirante a atriz, e Sebastian, um pianista de jazz, se apaixonam. Mas à medida que o sucesso os aproxima de seus sonhos, eles enfrentam decisões que começam a quebrar o frágil tecido que os une.',
    category: 'Romance',
    keywords: ['musical', 'amor', 'sonhos', 'dramático'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fp6X1J0JHvR9HeEfSg8BcxJNK0.jpg',
    videoUrl: 'https://example.com/video9.mp4',
    year: 2016,
    duration: 128,
    rating: 8.0,
    addedDate: new Date(2024, 9, 10),
  },
  {
    id: 'series1',
    title: 'Stranger Things',
    description: 'Quando um garoto desaparece, sua mãe, um chefe de polícia e seus amigos precisam enfrentar forças aterrorizantes para tê-lo de volta.',
    category: 'Ficção Científica',
    keywords: ['mistério', 'anos80', 'sobrenatural', 'suspense'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    videoUrl: '',
    year: 2016,
    rating: 8.7,
    addedDate: new Date(2024, 9, 5),
    isSeries: true,
    seasons: [
      {
        id: 's1',
        seasonNumber: 1,
        episodes: [
          {
            id: 'e1',
            title: 'Capítulo Um: O Desaparecimento de Will Byers',
            episodeNumber: 1,
            description: 'No caminho de volta para casa, Will é aterrorizado por algo. Não muito longe dali, um laboratório secreto esconde um segredo sinistro.',
            thumbnailUrl: 'https://image.tmdb.org/t/p/w500/AdwF3य़lKస్Xుఎల్బుడీన్ఎస్టేషన్స్.jpg',
            videoUrl: 'https://example.com/stranger1.mp4',
            duration: 48,
          },
          {
            id: 'e2',
            title: 'Capítulo Dois: A Estranha da Rua Maple',
            episodeNumber: 2,
            description: 'Lucas, Mike e Dustin tentam conversar com a menina que encontraram na floresta. Hopper interroga uma Joyce cada vez mais ansiosa.',
            thumbnailUrl: 'https://image.tmdb.org/t/p/w500/AdwF3अఎล్బుడీన్ఎస్టేషన్స్.jpg',
            videoUrl: 'https://example.com/stranger2.mp4',
            duration: 55,
          },
        ],
      },
    ],
  } as Series,
];

export function getContentByCategory(categoryName: string): Content[] {
  return mockMovies.filter(movie => movie.category === categoryName);
}

export function getContentByKeyword(keyword: string): Content[] {
  return mockMovies.filter(movie => 
    movie.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
}

export function getSimilarContent(content: Content): Content[] {
  const similar = mockMovies.filter(movie => {
    if (movie.id === content.id) return false;
    
    // Check if same category
    if (movie.category === content.category) return true;
    
    // Check if shares keywords
    const sharedKeywords = movie.keywords.filter(k => 
      content.keywords.includes(k)
    );
    return sharedKeywords.length > 0;
  });
  
  // Shuffle and return max 9
  return similar.sort(() => Math.random() - 0.5).slice(0, 9);
}

export function getNewContent(): Content[] {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  return mockMovies.filter(movie => movie.addedDate > twoDaysAgo);
}

export function getBannerContent(): Content[] {
  return mockMovies.filter(movie => movie.bannerUrl).slice(0, 5);
}

export function searchContent(query: string): Content[] {
  const lowerQuery = query.toLowerCase();
  return mockMovies.filter(movie =>
    movie.title.toLowerCase().includes(lowerQuery) ||
    movie.description.toLowerCase().includes(lowerQuery) ||
    movie.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
}
