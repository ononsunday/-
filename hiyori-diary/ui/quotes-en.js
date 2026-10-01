// 只收录公版英文原文；中英文显示由 quotes.js 统一选择。
// 原文保留作品的用词。诗行中的换行在小卡片上合并为空格。
const collections = [
  {
    key: 'karamazov', author: '陀思妥耶夫斯基', work: '卡拉马佐夫兄弟', bookId: 28054,
    translator: 'Constance Garnett（公版英译）',
    lines: [
      'Strive to love your neighbor actively and indefatigably.',
      'If you do not attain happiness, always remember that you are on the right road, and try not to leave it.',
      'Above all, avoid falsehood, every kind of falsehood, especially falseness to yourself.',
      'Avoid being scornful, both to others and to yourself.',
      'Never be frightened at your own faint-heartedness in attaining love.',
      'But active love is labor and fortitude, and for some people too, perhaps, a complete science.',
      'Love every leaf, every ray of God’s light.',
      'Love the animals, love the plants, love everything.',
      'Love all God’s creation, the whole and every grain of sand in it.',
      'And you will come at last to love the whole world with an all-embracing love.',
      'I love the blue sky, I love some people, whom one loves you know sometimes without knowing why.',
      'I think every one should love life above everything in the world.'
    ]
  },
  {
    key: 'walden', author: '亨利·戴维·梭罗', work: '瓦尔登湖', bookId: 205,
    lines: [
      'The finest qualities of our nature, like the bloom on fruits, can be preserved only by the most delicate handling.',
      'Nature and human life are as various as our several constitutions.',
      'Who shall say what prospect life offers to another?',
      'Nature is as well adapted to our weakness as to our strength.',
      'How could youths better learn to live than by at once trying the experiment of living?',
      'Every morning was a cheerful invitation to make my life of equal simplicity, and I may say innocence, with Nature herself.',
      'Heaven is under our feet as well as over our heads.',
      'Let him step to the music which he hears, however measured or far away.',
      'Only that day dawns to which we are awake.',
      'There is more day to dawn. The sun is but a morning star.'
    ]
  },
  {
    key: 'anne', author: '露西·莫德·蒙哥马利', work: '绿山墙的安妮', bookId: 45,
    lines: [
      'I always say good night to the things I love, just as I would to people.',
      'The sun had set some time since, but the landscape was still clear in the mellow afterlight.',
      'Don’t you just love poetry that gives you a crinkly feeling up and down your back?',
      'And you know one can dream so much better in a room where there are pretty things.',
      'But just now I feel pretty nearly perfectly happy.',
      'Isn’t the sea wonderful?',
      'Marilla, isn’t it nice to think that tomorrow is a new day with no mistakes in it yet?',
      'The world looks like something God had just imagined for His own pleasure, doesn’t it?',
      'You mayn’t get the things themselves; but nothing can prevent you from having the fun of looking forward to them.',
      'Somehow, little dream girls are not satisfying after a real friend.'
    ]
  },
  {
    key: 'garden', author: '弗朗西丝·霍奇森·伯内特', work: '秘密花园', bookId: 113,
    lines: [
      'And the sun fell warm upon his face like a hand with a lovely touch.',
      'Perhaps out of pure heavenly goodness the spring came and crowded everything it possibly could into that one place.',
      'The sun was deepening the gold of its lances, the bees were going home and the birds were flying past less often.',
      'Mary thought that perhaps the sun held back a few minutes just on purpose.',
      'In its happy days flowers had been tucked away into every inch and hole and corner.',
      'The wind itself had ceased and a brilliant, deep blue sky arched high over the moorland.',
      'If it were a quite alive garden, how wonderful it would be, and what thousands of roses would grow on every side!',
      'And they both began to laugh over nothings as children will when they are happy together.'
    ]
  },
  {
    key: 'little-women', author: '路易莎·梅·奥尔科特', work: '小妇人', bookId: 514,
    lines: [
      'Let him do what he likes, as long as he is happy.',
      'All sorts of pleasant things happened about that time, for the new friendship flourished like grass in spring.',
      'You do try to fight off your shyness, and I love you for it.',
      'The sun was low, and the heavens glowed with the splendor of an autumn sunset.',
      'Along the path of a useful life, Will heart’s-ease ever bloom.',
      'You are a good doctor, Teddy, and such a comfortable friend.',
      'I’m not afraid of storms, for I’m learning how to sail my ship.',
      'love is a great beautifier.'
    ]
  },
  {
    key: 'willows', author: '肯尼斯·格雷厄姆', work: '柳林风声', bookId: 289,
    lines: [
      'What sun-bathed coasts, along which the white villas glittered against the olive woods!',
      'Isn’t it jolly to feel the sun again, soaking into one’s bones!',
      'Nature’s Grand Hotel has its Season, like the others.',
      'Believe me, my young friend, there is nothing—absolute nothing—half so much worth doing as simply messing about in boats.',
      'The weary Mole also was glad to turn in without delay, and soon had his head on his pillow, in great joy and contentment.',
      'With a smile of much happiness on his face, and something of a listening look still lingering there, the weary Rat was fast asleep.'
    ]
  },
  {
    key: 'pride', author: '简·奥斯丁', work: '傲慢与偏见', bookId: 1342,
    lines: [
      'My courage always rises with every attempt to intimidate me.',
      'Think only of the past as its remembrance gives you pleasure.',
      'Till this moment, I never knew myself.',
      'To be fond of dancing was a certain step towards falling in love;',
      'There are few people whom I really love, and still fewer of whom I think well.',
      'I was in the middle before I knew that I had begun.',
      'I could easily forgive his pride, if he had not mortified mine.',
      'Follies and nonsense, whims and inconsistencies, do divert me, I own, and I laugh at them whenever I can.'
    ]
  },
  {
    key: 'jane-eyre', author: '夏洛蒂·勃朗特', work: '简·爱', bookId: 1260,
    lines: [
      'Life appears to me too short to be spent in nursing animosity or registering wrongs.',
      'Even for me life had its gleams of sunshine.',
      'I can live alone, if self-respect, and circumstances require me so to do.',
      'I need not sell my soul to buy bliss.',
      'there is no happiness like that of being loved by your fellow-creatures, and feeling that your presence is an addition to their comfort.',
      'Reader, I married him.',
      'I would always rather be happy than dignified;',
      'his presence in a room was more cheering than the brightest fire.'
    ]
  },
  {
    key: 'alice', author: '刘易斯·卡罗尔', work: '爱丽丝漫游奇境记', bookId: 11,
    lines: [
      'Who in the world am I?',
      'Curiouser and curiouser!',
      'but it’s no use going back to yesterday, because I was a different person then.',
      'I wonder if I’ve been changed in the night?',
      'It’s the most curious thing I ever saw in my life!',
      'the best way to explain it is to do it.'
    ]
  },
  {
    key: 'dorian-gray', author: '奥斯卡·王尔德', work: '道林·格雷的画像', bookId: 174,
    lines: [
      'The artist is the creator of beautiful things.',
      'To reveal art and conceal the artist is art’s aim.',
      'Diversity of opinion about a work of art shows that the work is new, complex, and vital.',
      'The world is wide, and has many marvellous people in it.',
      'Nothing can cure the soul but the senses, just as nothing can cure the senses but the soul.',
      'When critics disagree, the artist is in accord with himself.'
    ]
  },
  {
    key: 'sonnets', author: '威廉·莎士比亚', work: '十四行诗', bookId: 1041,
    lines: [
      'Shall I compare thee to a summer’s day?',
      'Look what is best, that best I wish in thee: This wish I have; then ten times happy me!',
      'So long as men can breathe, or eyes can see, So long lives this, and this gives life to thee.',
      'For thy sweet love remember’d such wealth brings That then I scorn to change my state with kings.',
      'But if the while I think on thee, dear friend, All losses are restor’d and sorrows end.',
      'Let me not to the marriage of true minds Admit impediments.',
      'There lives more life in one of your fair eyes Than both your poets can in praise devise.',
      'To me, fair friend, you never can be old, For as you were when first your eye I ey’d, Such seems your beauty still.'
    ]
  },
  {
    key: 'blake', author: '威廉·布莱克', work: '天真与经验之歌', bookId: 1934,
    lines: [
      'Sweet dreams of pleasant streams By happy, silent, moony beams!',
      'Sweet Sleep, angel mild, Hover o’er my happy child!',
      'The moon, like a flower In heaven’s high bower, With silent delight, Sits and smiles on the night.',
      'Can I see another’s grief, And not seek for kind relief?',
      'How can the bird that is born for joy Sit in a cage and sing?',
      'I was angry with my friend: I told my wrath, my wrath did end.'
    ]
  },
  {
    key: 'emerson', author: '拉尔夫·沃尔多·爱默生', work: '爱默生散文集', bookId: 16643,
    lines: [
      'Nothing can bring you peace but yourself.',
      'Nothing can bring you peace but the triumph of principles.',
      'Nothing is at last sacred but the integrity of your own mind.',
      'We have a great deal more kindness than is ever spoken.',
      'a friend may well be reckoned the masterpiece of nature.',
      'the only way to have a friend is to be one.',
      'To be great is to be misunderstood.',
      'Every great man is a unique.'
    ]
  },
  {
    key: 'whitman', author: '沃尔特·惠特曼', work: '草叶集', bookId: 1322,
    lines: [
      'I exist as I am, that is enough,',
      'I believe a leaf of grass is no less than the journey work of the stars,',
      'Do I contradict myself? Very well then I contradict myself, (I am large, I contain multitudes.)',
      'I am satisfied—I see, dance, laugh, sing;',
      'You must habit yourself to the dazzle of the light and of every moment of your life.',
      'I give you my love more precious than money, I give you myself before preaching or law;',
      'O the joy of my spirit—it is uncaged—it darts like lightning!',
      'Who wishes to walk with me?'
    ]
  },
  {
    key: 'keats', author: '约翰·济慈', work: '济慈诗集（1820）', bookId: 23684,
    lines: [
      'Thou wast not born for death, immortal Bird!',
      'Season of mists and mellow fruitfulness, Close bosom-friend of the maturing sun;',
      'Where are the songs of Spring? Ay, where are they?',
      'Do not all charms fly At the mere touch of cold philosophy?',
      'Heard melodies are sweet, but those unheard Are sweeter;',
      'Souls of Poets dead and gone, What Elysium have ye known, Happy field or mossy cavern, Choicer than the Mermaid Tavern?'
    ]
  }
];

export const englishQuotes = collections.flatMap(({ key, author, work, bookId, translator, lines }) =>
  lines.map((text, index) => ({
    id: `en-${key}-${String(index + 1).padStart(2, '0')}`,
    text, author, work, language: 'en',
    sourceUrl: `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}-images.html`,
    ...(translator ? { translator } : {})
  }))
);
