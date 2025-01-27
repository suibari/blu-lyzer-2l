export const EXCLUDE_WORDS = [
  "こと", "これ", "それ", "そう", "どこ", 
  "さん", "ちゃん", "くん", "自分", "おれ", "やつ", 
  "よう", "みたい", 
  "はず", 
  "今日", "明日", "本日", "あした", "きょう",
  "ここ", "ところ",
  "www", "com", "https", 
  "あなた", "彼", "彼女", "俺", "僕", "私", "私達", "私たち", "あなたたち", "彼ら", "誰", "何", "何か", "どれ", "どちら", // 人称代名詞
  "今", "昨日", "昨日", "明後日", "先日", "先週", "来週", "今年", "去年", "日", "年", "月", "時間", "時", "分", "秒", "いつ", "前", "後", "前日", "毎日", "毎年", "毎月", "昨日", "先ほど", "そこ", // 時間場所
  "もの", "事", "事柄", "場合", "人", "方", "人々", "方々", "者", "方", "事", "所", "物", "部分", "箇所", // 一般的な言葉
  "全て", "すべて", "みんな", "全部", "他", "他人", "誰か",
  "ところ", "くらい", "ぐらい", "けど", "けれども", "ただ", "ため", "どう", "何故", "なぜ", "どんな", "どの", "だれ", "これ", "それ", "あれ", "ここ", "そこ", "あそこ",
  "http", "www", "html", "php", "net", "org", "ftp", "co", "io", "jp", "www", "mailto", // インターネット
  "bsky", "social", // Bluesky
  "to", "the", "of", "you", "be", "in", "is", "it", "for", "that", "on", // 英語
  "ちんぽ", "ちんちん", // R-18
  "なん", "あと", "うち", "たち", "とき", "感じ", "気持ち", "楽しみ", // 運用してみていらないもの
];

export const MIN_WORD_LENGTH = 2; // 単語の最小長

export const MIN_WORD_COUNT = 2; // 単語の最小出現数
