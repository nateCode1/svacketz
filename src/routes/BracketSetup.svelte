<script lang="ts">
    import { Entrant } from "$lib/bracket";
	import { MediaType } from "$lib/typedef";
	import SvelteMarkdown from "svelte-markdown";
	import MediaPlayer from "./Media/MediaPlayer.svelte";
	import Overlay from "./Overlay.svelte";

    export let onCompleted: (entrants: Entrant[]) => void;

    let mediaManager: MediaPlayer;
    let mediaPreviewVisible = false;

    let textEditorVisible = false;
    let textEditorFor: Entrant | undefined;

    let selectedTab = 0;
    let tabs = ["Participant Setup", "Bracket Setup"];

    let entrantList: Entrant[] = [
        new Entrant("JS Jumpscare", 1, false, MediaType.IMAGE, "https://m.media-amazon.com/images/I/61irQrNjgnL._UF894,1000_QL80_.jpg"),
        new Entrant("A Text", 2, false, MediaType.TEXT, "Wow"),
        new Entrant("A three", 3, false, MediaType.TEXT, "Three text three text!"),
        new Entrant("Dare I four?", 4, false, MediaType.TEXT, "# Yes it is true"),
    ];

    let participantsPerMatch = 2;
    let winnersPerMatch = 1;
    let isDoubleElimination = false;

    let errorMessages: string[] = [];

    function errorCheck() {
        errorMessages = [];
        if (participantsPerMatch < 2) errorMessages.push("Can't have fewer than 2 participants per match.");
        if (winnersPerMatch * 2 > participantsPerMatch) errorMessages.push("Can't have winners per match be over half of participants per match.");
        else if (winnersPerMatch < 1)  errorMessages.push("Can't have fewer than 1 winners per match.");
    }

    function addNew() {
        entrantList.push(new Entrant(
            "Name",
            entrantList.length + 1,
            false,
            MediaType.NONE,
            ""
        ))
        entrantList = [...entrantList]
        sortEntrants()
    }

    function sortEntrants() {
        entrantList.sort((a,b) => a.seed-b.seed)
        entrantList = [...entrantList]
    }

    function moveItem(index: number, direction: number) {
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= entrantList.length) return entrantList;

        [entrantList[index], entrantList[newIndex]] = [entrantList[newIndex], entrantList[index]];
    }

    function preview(entrant: Entrant) {
        if (entrant.media) {
            mediaPreviewVisible = true;
            setTimeout(() => mediaManager.preview(entrant.media!), 100);
        }
    }

    function editText(entrant: Entrant) {
        textEditorVisible = true;
        textEditorFor = entrant;
    }
</script>

<div style="background-color: #333; padding: 10px; width: 90%; max-width: 800px;">
    <div style="display: flex; gap: 5px; margin: 0 5px -1px;">
        {#each tabs as tab, i}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:click={() => {selectedTab = i}} class={`tab ${i == selectedTab ? "tab-selected" : ""}`}>
                <p>{tab}</p>
            </div>
        {/each}
    </div>

    {#if selectedTab == 0}
        <div class="tab-content">
            <div style="overflow-y: scroll; max-height: 100%;">
                {#each entrantList as entrant, i}
                    <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                        <!-- <p style="line-height: 0; width: 20px;">{i}</p> -->
                        <!-- <button on:click={() => moveItem(i, -1)}>↑</button>
                        <button on:click={() => moveItem(i, 1)}>↓</button> -->
                        <input type="number" min="0" bind:value={entrant.seed} on:change={sortEntrants} style="width: 50px;" />
                        <input type="text" bind:value={entrant.name} />
                        <div style="display: flex; justify-content: center; align-items: center; width: 200px;">
                            {#if entrant.media.mediaType == MediaType.TEXT}
                                <button style="width: 70%;" on:click={() => editText(entrant)}>Edit Text</button>
                            {:else}
                                <input style="width: 100%;" disabled={entrant.media.mediaType == MediaType.NONE} type="text" bind:value={entrant.media.mediaSrc} />
                            {/if}
                        </div>
                        <select bind:value={entrant.media.mediaType}>
                            {#each Object.entries(MediaType).filter(i => isNaN(parseInt(i[0]))) as media}
                                <option value={media[1]}>{media[0][0].toUpperCase()}{media[0].split("").slice(1).join("").toLowerCase()}</option>
                            {/each}
                        </select>
                        <button on:click={() => preview(entrant)}>Preview</button>
                    </div>
                {/each}
                <div style="height: 40px;"></div>
            </div>
            <button on:click={addNew} style="width: 90%; left: 50%; transform: translateX(-50%); position: absolute; bottom: 10px; box-shadow: 0px 0px 4px 1px rgba(140, 140, 140, 0.8);">Add new</button>
        </div>
    {:else if selectedTab == 1}
        <div class="tab-content">
            <div class="input-block">
                <p>Participants per match:</p>
                <input type="number" style="width: 50px;" on:change={errorCheck} bind:value={participantsPerMatch} min={2}/>
            </div>
            <div class="input-block">
                <p>Winners per match:</p>
                <input type="number" style="width: 50px;" on:change={errorCheck} bind:value={winnersPerMatch} min={1}/>
            </div>
            <div class="input-block">
                <p>Double elimination?:</p>
                <input type="checkbox" style="width: 15px;" bind:value={isDoubleElimination}/>
            </div>
            {#each errorMessages as error}
                <p style="color: red; margin: 2px 0;">{error}</p>
            {/each}
        </div>
    {/if}

    <button on:click={() => onCompleted(entrantList)}>Done</button>

    <Overlay bind:visible={textEditorVisible}>
        {#if textEditorFor}
            <div style="background-color: #222; border-radius: 10px; padding: 10px; border: 1px solid #ddd;">
                <div>
                    <h2 style="text-align: center;">Enter Markdown Text:</h2>
                    <textarea bind:value={textEditorFor.media.mediaSrc} rows="16" cols="80"></textarea>
                </div>
                <!-- <p>{textEditorFor.media.mediaSrc}</p> -->
                <!-- <div style="width: 300px;">
                    <SvelteMarkdown source={textEditorFor.media.mediaSrc.split("").join("")} />
                </div> -->
                <div style="width: 100%; display: flex; align-items: center;">
                    <button style="margin: auto; padding: 10px;" on:click={() => {if (textEditorFor) preview(textEditorFor)}}>Preview</button>
                </div>
            </div>
        {/if}
    </Overlay>

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

    button, input, select, textarea {
        background-color: #555;
        font-size: large;
        box-sizing: border-box;
    }

    input:disabled {
        background-color: #444;
        opacity: 0.6;
    }

    .tab-content {
        padding: 5px;
        border: 1px solid gray;
        border-radius: 5px;
        height: 300px;
        position: relative;
        margin-bottom: 10px;
    }
    
    .tab {
        border: 1px solid rgba(0,0,0,0);
        border-bottom: none;
        border-radius: 5px 5px 0 0;
        padding: 0 5px;
        transition: 0.2s all;
        position: relative;
        z-index: 10;
    }
    
    .tab:hover {
        border: 1px solid rgb(100, 100, 100);
        border-bottom: none;
        background-color: #333;
    }
    
    .tab-selected {
        border: 1px solid gray !important;
        border-bottom: none !important;
        background-color: #333;
    }

    .input-block {
        display: flex;
        gap: 10px;
        height: 30px;
        align-items: center;
    }
</style>