<script lang="ts">
	import type { Entrant } from "$lib/bracket";
	import { MediaType, type MediaInfo } from "$lib/typedef";
  import SvelteMarkdown from 'svelte-markdown'

	export let entrantList: (Entrant | undefined)[] | undefined;

  let displayEntrants: Entrant[] = [];

  let itemWidth = 0;
  let itemHeight = 0;
  let numItems = 0;

  
  $: {
    if (entrantList) {
      displayEntrants = entrantList.filter((i): i is Entrant => i !== undefined)

      numItems = displayEntrants.length

      let cols = Math.ceil(Math.sqrt(numItems))
      let rows = Math.ceil(numItems / cols)

      itemHeight = 100/rows
      itemWidth = 100/cols
    }
    else {
      numItems = 0;
    }
  }
</script>


<div class="multi-media-container">
    {#each displayEntrants as i}
      <div style="width: {itemWidth}%; height: {itemHeight}%; position: relative;">
        <p class="media-label">{i.name}</p>
        {#if i.media.mediaType == MediaType.IMAGE}
          <img class="content" src={i.media.mediaSrc} alt="Preview" />
        {:else if i.media.mediaType == MediaType.TEXT}
          <div class="content">
            <SvelteMarkdown source={i.media.mediaSrc} />
          </div>
        {/if}
      </div>
    {/each}
</div>

<style>
  .multi-media-container {
    display: flex;
    flex-wrap: wrap;
    height: 400px;
    justify-content: center;
    margin-top: 15px;
  }

  .media-label {
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: 0.85em;
    background-color: #333;
    z-index: 20;
    margin: 0;
  }

  .content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 3px;
    object-fit: contain;
    border: 1px solid white;
  }
</style>
