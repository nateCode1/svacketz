<script lang="ts">
    import { Entrant } from "$lib/bracket";
	import { MediaType } from "$lib/typedef";
	import MediaPlayer from "./Media/MediaPlayer.svelte";
	import Overlay from "./Overlay.svelte";

    let mediaManager: MediaPlayer;
    let mediaPreviewVisible = false;
    let bingbong: number;

    let entrantList: Entrant[] = [new Entrant("JS Jumpscare", 1, false, MediaType.IMAGE, "https://cdn.discordapp.com/attachments/564484316294545418/1389020465171009627/javascriptJumpscare.gif?ex=6863c25d&is=686270dd&hm=1bf6819697ce776cdc611f6014b0991e15affa80045b1c0541de24e9099f9cd2&")];

    function preview(entrant: Entrant) {
        if (entrant.media) {
            console.log('ahh')
            mediaPreviewVisible = true;
            setTimeout(() => mediaManager.preview(entrant.media!), 100);
        }
    }
</script>

<div style="background-color: #333; padding: 10px; width: 90%; max-width: 800px;">
    {#each entrantList as entrant}
        <div style="display: flex; gap: 5px;">
            <input type="text" bind:value={entrant.name} />
            {bingbong}
            <select bind:value={bingbong}>
                {#each Object.entries(MediaType).filter(i => isNaN(parseInt(i[0]))) as media}
                    <option value={media[1]}>{media[0][0].toUpperCase()}{media[0].split("").slice(1).join("").toLowerCase()}</option>
                {/each}
            </select>
            <button on:click={() => preview(entrant)}>Preview</button>
        </div>
    {/each}
    <button style="width: 100%;">Add new</button>
    <Overlay bind:visible={mediaPreviewVisible}>
        <div style="width: 80%; max-width: 700px;">
            <MediaPlayer 
                maxPreviewLength={30} 
                previewDoneCallback={() => {mediaPreviewVisible = false;}} 
                bind:this={mediaManager} 
            />
        </div>
    </Overlay>
</div>

<style>
    * {
        color: #fff;
    }

    button, input, select {
        background-color: #777;
        font-size: large;
    }
</style>