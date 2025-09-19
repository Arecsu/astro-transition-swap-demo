# Astro Transition Swap Demo

A proof-of-concept demonstrating how to preserve framework component state during Astro view transitions, eliminating the "hydration flash" problem without having "transition:persist" components in every page.

## 🚀 Try the Demo

**🌐 Live Demo:** [arecsu.github.io/astro-transition-swap-demo](https://arecsu.github.io/astro-transition-swap-demo)

**Or run locally:**
```bash
# Clone and run
git clone https://github.com/arecsu/astro-transition-swap-demo
cd astro-transition-swap-demo
pnpm install
pnpm dev
```

Then visit `http://localhost:4321` and try the interactive counter!

## 🎯 The Problem

When navigating between pages in Astro with view transitions, framework components are destroyed and recreated. Astro statically builds and renders them server-side with their initial values, then hydrates them client-side.

To preserve their state, we could use Astro's `transition:persist` directive. But this requires having the component on every page the user might navigate to keep its state (both JavaScript and DOM wise) alive.

This is not solved by having their state saved external to the component, like using Nanostores. Because there will be a brief flash between the initial, un-hydrated state of the HTML document and the code processed by the hydration process. Other workarounds were to listen to ClientRouter events to hide the components until they have been properly mounted with the data we need, resulting in bad UX and possibly even more flashes of blank space across the page.

## ✨ The Solution

Our component swap utility preserves component state by moving DOM elements to a persistent hidden container with `id="client-swap-container"` located at the bottom of the body during transitions. Then, if these components are found again (by checking their `data-swap-id`), they will get swapped back before the page renders.

This eliminates the hydration flash completely and preserves their DOM and JavaScript states without any other workaround, resulting in a seamless user and developer experience. No need to use external stores either. The component preserves the entire state on its own.

### Ultra-Clean API

Just add `data-swap-id="unique-id"` to any component:

```astro
<Counter client:load data-swap-id="my-counter" />
```

That's it! No wrapper divs, no target slots, no complex setup.

## 🛠️ How It Works

### 1. Setup

Add the persistent container to your base layout:

```astro
<!-- Base layout -->
<div
  id="client-swap-container"
  transition:persist
  style="display: none !important; position: absolute !important; top: -9999px !important;"
></div>
```

### 2. Import the Utility

```astro
<script src="../utils/astroClientSwap.ts"></script>
```

### 3. Mark Components

```astro
<MyComponent client:load data-swap-id="unique-id" />
```

### 4. Automatic Preservation

The utility automatically:
- Detects components with `data-swap-id` during `astro:before-swap`
- Preserves them in the hidden container
- Restores them during `astro:after-swap`
- Cleans up tracking after successful swaps

### Astro Island Detection

Components are wrapped in `astro-island` elements. The utility:

```typescript
// Extract swap ID from astro-island props
// this is hack. In an official Astro implementation, it should
// follow the same patterns as "transition:" directives.
const props = island.getAttribute('props');
const parsedProps = JSON.parse(props);
const swapId = parsedProps['data-swap-id'][1]; // [type, value] format
```

### Replacement Logic

Compares preserved components with new DOM:

```typescript
// Find new components with matching IDs
allNewIslands.forEach(newIsland => {
  const swapId = this.getSwapId(newIsland);
  if (swapId && this.hasPreservedComponent(swapId)) {
    // Replace new with preserved
    this.replaceWithPreserved(newIsland, preservedIsland, swapId);
  }
});
```

## 🌟 Benefits

- **No hydration flash** - Visual consistency maintained
- **Preserves all state** - JavaScript variables, event listeners, reactive subscriptions
- **Framework agnostic** - Works with React, Svelte, Vue, Solid, etc.
- **Minimal setup** - Just add `data-swap-id` attribute
- **Astro-native** - Leverages `transition:persist`
- **Performance** - No extra overhead besides moving and removing DOM elements. Should be pretty cheap for the browser.
- **Clean API** - Ultra-minimal developer experience

## 🔧 Project Structure

```
src/
├── components/
│   └── Counter.svelte          # Demo component using Svelte 5 runes
├── layouts/
│   └── Layout.astro           # Base layout with ViewTransitions
├── pages/
│   ├── index.astro            # Home page with counter demo
│   └── example.astro          # Simple example page
└── utils/
    └── astroClientSwap.ts     # The component swap utility
```


The implementation shows that this feature is technically feasible and could be integrated into Astro core.

**Tested with Svelte 5.** We need tests with other frameworks but there's no reason it wouldn't work. We need to be sure nonetheless.

## 🔧 To Improve

This is a "hack" around Astro's ClientRouter events. In a potential official Astro implementation, we should look for a syntax similar to `transition:` directives and auto-generation of the wrapper in the body where the components get moved to.

There could be edge cases that we're not aware of. One of them is what if the component tagged with this directive gets used in a different page from the one it's been actually saved? We would like to guess that, as long as they are declared with the same id, similar to how `transition:` directives work, they will get swapped across pages and preserved as well in pages where they are not present. This might be even desired. Otherwise, if no "id" has been provided, it should target the element from the original page and position. Maybe by generating unique random "ids" at build time. I think `transition:` directives already do that.

```astro
<!-- Hypothetical future Astro directive -->
<MyComponent client:load transition:swap="unique-id" />
```

## ⚡ Performance

I believe this is as performant as it can get. We're just moving DOM elements across the document, and JavaScript states get preserved in the browser at all times. We can't think of any other way that not only would be a chore for the developer, but also prone to more bugs and possibly worse performance in the context of the browser.

## 📚 Related

- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Astro GitHub Issue #8781](https://github.com/withastro/astro/issues/8781)

## 🎉 Try It Out!

1. Run the demo: `pnpm dev`
2. Increment the counter on the home page
3. Navigate to the Example page
4. Return to home
5. See the preserved state! ✨

---

*Created with ❤️ for the Astro community*
