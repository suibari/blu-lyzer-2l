<script>
  import { Modal } from "flowbite-svelte";
  export let aboutModal = false;
</script>
<Modal title="About Blu-lyzer" bind:open={aboutModal} autoclose outsideclose>
  <div>
    <h1>本サイトについて</h1>
    <p><b>Blu-lyzer(ブルーライザー)</b>は、<a href="https://bsky.app/" target="_blank">Bluesky</a> の投稿、関係分析ツールです。</p>
    <p>Blueskyをもっと楽しむ分析ツールを目指して開発されました。</p>
    <p><b>サービス利用にあたりログイン、インストールはいっさい不要で、Blueskyのハンドル名が分かれば、どなたでもお使いいただけます。</b></p>
    <p><a href="https://bsky.app/profile/suibari.com" target="_blank">すいばり</a> が開発を行いました。</p>
  </div>
</Modal>
