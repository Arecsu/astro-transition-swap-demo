<script>
  // Using Svelte 5 runes syntax
  let count = $state(0);

  function increment() {
    count++;
  }

  function decrement() {
    count--;
  }

  function reset() {
    count = 0;
  }
</script>

<div class="counter">
  <h2>Persistent Counter</h2>
  <p>This counter maintains its state during page navigation!</p>

  <div class="count-display">
    <span class="count-value">{count}</span>
  </div>

  <div class="buttons">
    <button onclick={decrement}>-</button>
    <button onclick={reset}>Reset</button>
    <button onclick={increment}>+</button>
  </div>

  <p class="instruction">
    Try incrementing the counter, then navigate to other pages.
    The counter value should persist thanks to component swap!
  </p>
</div>

<style>
  .counter {
    border: 2px solid #007acc;
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    text-align: center;
    max-width: 400px;
  }

  .count-display {
    margin: 1.5rem 0;
  }

  .count-value {
    font-size: 3rem;
    font-weight: bold;
    color: #007acc;
    display: inline-block;
    min-width: 3ch;
    transition: transform 0.2s ease;
  }

  .count-value:hover {
    transform: scale(1.1);
  }

  .buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1.5rem 0;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-size: 1.2rem;
    font-weight: bold;
    border: 2px solid #007acc;
    border-radius: 8px;
    background: white;
    color: #007acc;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
  }

  button:hover {
    background: #007acc;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 122, 204, 0.3);
  }

  .instruction {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
    margin-top: 1rem;
  }

  h2 {
    color: #007acc;
    margin-top: 0;
  }
</style>