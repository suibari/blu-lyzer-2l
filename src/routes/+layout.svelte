<script>
  import "../app.css";
</script>

<style>
  body {
    background: linear-gradient(to bottom, #1e3a8a, #2563eb, #3b82f6);
    color: #ffffff;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
  }

  .content {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .card {
    background-color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .card-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2563eb;
  }

  h1, h2, h3 {
    color: #1e3a8a;
  }
  
  /* ...他のスタイル... */
</style>

<main class="container">
  <slot></slot>
</main>
