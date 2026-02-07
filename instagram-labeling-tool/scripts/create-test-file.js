const XLSX = require('xlsx');

// 真实的 Instagram 博主链接（时尚/穿搭类博主）
const testData = [
  ['博主名称', '主页链接', '粉丝量级'],
  ['Chiara Ferragni', 'https://www.instagram.com/chiaraferragni', '29M'],
  ['Camila Coelho', 'https://www.instagram.com/camilacoelho', '10M'],
  ['Aimee Song', 'https://www.instagram.com/aimeesong', '7M'],
  ['Negin Mirsalehi', 'https://www.instagram.com/neaboreal', '6M'],
  ['Julie Sariñana', 'https://www.instagram.com/sincerelyjules', '6M'],
  ['Danielle Bernstein', 'https://www.instagram.com/weworewhat', '3M'],
  ['Chriselle Lim', 'https://www.instagram.com/chrisellelim', '1.5M'],
  ['Blair Eadie', 'https://www.instagram.com/blaireadie', '2M'],
  ['Jessica Wang', 'https://www.instagram.com/jessicawang', '1M'],
  ['Brittany Xavier', 'https://www.instagram.com/brittanyxavier', '1.5M'],
];

const worksheet = XLSX.utils.aoa_to_sheet(testData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Bloggers');

XLSX.writeFile(workbook, 'test-bloggers.xlsx');
console.log('Created test-bloggers.xlsx with', testData.length - 1, 'bloggers');
