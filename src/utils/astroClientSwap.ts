/**
 * Astro Transition Swap - Proof of Concept
 *
 * A proof-of-concept demonstrating how to preserve framework component state during
 * Astro view transitions, eliminating the "hydration flash" problem without having
 * "transition:persist" components in every page.
 *
 * Preserves component state by moving DOM elements to a persistent hidden container
 * during transitions, then swapping them back before the page renders. This eliminates
 * the hydration flash completely and preserves their DOM and JavaScript states without
 * any other workaround, resulting in a seamless user and developer experience.
 *
 * Usage: Just add data-swap-id="unique-id" to any component.
 *
 * @example
 * <Counter client:load data-swap-id="my-counter" />
 */

class AstroClientSwap {
  private container: HTMLElement | null = null;
  private preservedComponentIds = new Set<string>();

  /**
   * Get or create the persistent hidden container
   */
  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.getElementById('client-swap-container');

      if (!this.container) {
        console.warn('[AstroClientSwap] Container not found. Add: <div id="client-swap-container" transition:persist style="display: none;"></div>');
        // Fallback
        this.container = document.createElement('div');
        this.container.style.cssText = 'display: none !important; position: absolute !important; top: -9999px !important;';
        document.body.appendChild(this.container);
      }
    }

    return this.container;
  }

  /**
   * Extract data-swap-id from astro-island props
   */
  private getSwapId(island: Element): string | null {
    const props = island.getAttribute('props');
    if (!props) return null;

    try {
      const parsedProps = JSON.parse(props);
      const swapIdData = parsedProps['data-swap-id'];

      // Astro serializes props as [type, value] where type 0 = string
      if (Array.isArray(swapIdData) && swapIdData[0] === 0 && typeof swapIdData[1] === 'string') {
        return swapIdData[1];
      }
    } catch (error) {
      console.warn('[AstroClientSwap] Failed to parse props JSON:', error);
    }

    return null;
  }

  /**
   * Preserve component by moving to hidden container
   */
  private preserveComponent(island: Element, swapId: string): void {
    console.debug('[AstroClientSwap] Preserving component:', swapId);

    // Move to hidden container
    this.getContainer().appendChild(island);

    // Track that we have this component preserved
    this.preservedComponentIds.add(swapId);

    console.debug('[AstroClientSwap] Preserved components:', Array.from(this.preservedComponentIds));
  }

  /**
   * Check if we have a preserved component for this swapId
   */
  private hasPreservedComponent(swapId: string): boolean {
    return this.preservedComponentIds.has(swapId);
  }

  /**
   * Find and return preserved component by swapId
   */
  private getPreservedComponent(swapId: string): Element | null {
    const container = this.getContainer();
    const preservedIslands = container.querySelectorAll('astro-island');

    for (const island of preservedIslands) {
      const islandSwapId = this.getSwapId(island);
      if (islandSwapId === swapId) {
        return island;
      }
    }

    return null;
  }

  /**
   * Replace new component with preserved one and clean up
   */
  private replaceWithPreserved(newIsland: Element, preservedIsland: Element, swapId: string): void {
    const parent = newIsland.parentElement;
    if (!parent) return;

    console.debug('[AstroClientSwap] Replacing new component with preserved one:', swapId);

    // Replace new component with preserved one
    parent.replaceChild(preservedIsland, newIsland);

    // Clean up: remove from preserved tracking since it's now back in the DOM
    this.preservedComponentIds.delete(swapId);

    console.debug('[AstroClientSwap] Successfully swapped component:', swapId);
    console.debug('[AstroClientSwap] Remaining preserved components:', Array.from(this.preservedComponentIds));
  }

  /**
   * Handle astro:before-swap - preserve marked components
   */
  private handleBeforeSwap = (): void => {
    console.debug('[AstroClientSwap] Before swap triggered');
    const islands = document.querySelectorAll('astro-island');
    console.debug('[AstroClientSwap] Found total islands:', islands.length);

    islands.forEach(island => {
      const swapId = this.getSwapId(island);
      if (swapId) {
        console.debug('[AstroClientSwap] Preserving component:', swapId);
        this.preserveComponent(island, swapId);
      }
    });
  };

  /**
   * Handle astro:after-swap - swap preserved components with new ones
   */
  private handleAfterSwap = (): void => {
    console.debug('[AstroClientSwap] After swap triggered');
    console.debug('[AstroClientSwap] Preserved component IDs:', Array.from(this.preservedComponentIds));

    // Find all new astro-islands in the current DOM (excluding those in hidden container)
    const allIslands = document.querySelectorAll('astro-island');
    const container = this.getContainer();
    const allNewIslands = Array.from(allIslands).filter(island => !container.contains(island));
    console.debug('[AstroClientSwap] Found new islands in DOM:', allNewIslands.length);

    allNewIslands.forEach(newIsland => {
      const swapId = this.getSwapId(newIsland);
      if (swapId && this.hasPreservedComponent(swapId)) {
        console.debug('[AstroClientSwap] Found new island with preserved counterpart:', swapId);

        // Get the preserved component
        const preservedIsland = this.getPreservedComponent(swapId);
        if (preservedIsland) {
          // Replace new with preserved
          this.replaceWithPreserved(newIsland, preservedIsland, swapId);
        }
      }
    });

    console.debug('[AstroClientSwap] Swap process completed');
  };

  /**
   * Initialize the swap functionality
   */
  init(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('astro:before-swap', this.handleBeforeSwap);
    document.addEventListener('astro:after-swap', this.handleAfterSwap);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    document.removeEventListener('astro:before-swap', this.handleBeforeSwap);
    document.removeEventListener('astro:after-swap', this.handleAfterSwap);
    this.preservedComponentIds.clear();
  }
}

// Auto-initialize
const clientSwap = new AstroClientSwap();

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => clientSwap.init());
  } else {
    clientSwap.init();
  }
}

export default AstroClientSwap;