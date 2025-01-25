<script>
  import { Modal } from "flowbite-svelte";
  export let aboutModal = false;
</script>
<Modal title="About Blu-lyzer" bind:open={aboutModal} autoclose outsideclose>
  <div class="space-y-2">
    <h1 class="text-2xl mb-2">本サイトについて</h1>
    <p><b>Blu-lyzer(ブルーライザー)</b>は、Blueskyの投稿、関係分析ツールです。</p>
    <p><b>Blueskyをもっと楽しむための分析ツール</b>を目指して開発されました。</p>
    <p>サービス利用にあたりログイン、インストールはいっさい不要で、Blueskyのハンドル名が分かれば、どなたでもお使いいただけます。</p>
    <p><a href="https://bsky.app/profile/suibari.com" target="_blank">すいばり</a> が開発を行いました。</p>
  </div>
  <div class="mt-2 space-y-2">
    <h1 class="text-2xl mb-2">免責事項</h1>
    <p>本サービスを利用したことによる過失や損害につきまして、開発者は一切の責任を負いません。ご了承ください。</p>
    <p>本サービスはサービス提供のために、テキストボックスに入力された情報を収集し、開発者のみ見られるログに記録します。<b>このため、テキストボックスにはハンドル名以外(パスワードや個人情報など)を入力しないよう十分お気を付けください。</b>また、得た情報は本サービス提供以外の目的では一切使用いたしません。</p>
    <p>本サービスは法令及びガイドラインに別段の定めがある場合を除き、同意を得ないで第三者に情報を提供することはいたしません。</p>
    <p>本サービスは個人情報に対して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。</p>
  </div>
	<div class="mt-2 space-y-2">
    <h1 class="text-2xl mb-2">ライセンス</h1>
		<p>本サービスはOSSであり、ソースコードは<a href="https://github.com/suibari/blu-lyzer" target="_blank">GitHub</a> で自由にご覧いただけます。</p>
		<p>本サービスは日本語感情分析に東北大学 乾・岡崎研究室の<a href="https://www.cl.ecei.tohoku.ac.jp/Open_Resources-Japanese_Sentiment_Polarity_Dictionary.html" target="_blank">日本語評価極性辞書</a>を使用しています。</p>
    <p>本サービスは英語感情分析に東京工業大学 奥村・高村研究室の<a href="http://www.lr.pi.titech.ac.jp/~takamura/pndic_en.html" target="_blank">単語感情極性対応表</a>を使用しています。</p>
    <ul class="list-disc ml-5">
      <li>東北大学 乾・岡崎研究室 / Author(s): Inui-Okazaki Laboratory, Tohoku University</li>
      <li>東山昌彦, 乾健太郎, 松本裕治, 述語の選択選好性に着目した名詞評価極性の獲得, 言語処理学会第14回年次大会論文集, pp.584-587, 2008. / Masahiko Higashiyama, Kentaro Inui, Yuji Matsumoto. Learning Sentiment of Nouns from Selectional Preferences of Verbs and Adjectives, Proceedings of the 14th Annual Meeting of the Association for Natural Language Processing, pp.584-587, 2008.</li>
    </ul>
	</div>
</Modal>
