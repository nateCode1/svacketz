<!-- Adapted from: https://svelte.dev/playground/e62f83d69cea4fda9e8a897f50b5a67c?version=5.38.1#H4sIAAAAAAAACrVWXW_bNhT9K7fqUNuYLSVx1iJynGLrQ9E9bMM6DCiiPFDitUyEJgWStuOq-u8DJdv6oh2_TE82eXg_Du89l7knyAq90PvKVhlHoIqkQAQFqmQGnGnjjb0F46i98DH3zC6zYLvgjQ9Hf80yX2-QG7sWE42u9UQKg8JoL_TudaJYZh4iEZkggKUxmQ6DoIL6FDeBwowHd9e_0HgaT5F-uLpdUBp_oHQRv7-Nkzi5eX9z-3GDSjMp5lN_eu1fW2uRAADgaMrIYQ6P1Yr9cmA0hOsxbAhfYwiRp5BGHhTjLuamgUkVonCipg1UzNfoBN02QMmONC09zSJRx7uSa43fPkmpKBPEIMxBrDmfQRBAJpkwqGAHSb2_ZWbJBCScoWjkTZk2RCT4j8w-KxLHSP_Vf-3P70023drrTplIvxhc1fuu3S_0lX1B8cXlYik3qJCexPwUQl7TZtNVuLGVAmaJkC6lNrDgLHlGxUQKxJTrRmb1IbaAYZ_Ayg_8-OEgdw5Xo6bbvWu9lNvPpcc5LAjXOKshRfWzcMdtQ2ib65PzZh_Ru3dtZI-hU0Cnye7p-ogzwy3JgBlc6fbWo22Yx56Dp3HZSY9dJ09P7eY6fG7w-ATQ4a6NrHukkUJMuK3w16jpM3PmMm2hWoUiTDQb5T6opUrcU7aBhBOt55F3BEcexEzQ0CyZnufH5eKhMpy_ZYte_RV1INZoO5ODB3tJVflHXhuhzY7jPPKMzELIe8X98zkRKLKXGcQkeU6VXAsaQt5kzi_FqphF3kPbpQvVSCKgbHNIOGCLI635WyTJshJjosu6GwMrr2do_4wuZyLvitG8NOczCh9hwMSGaRZzHEAIg0FxirJW5qyVsaOeSFzxrKy6t_elCC1EG6LMPB_iCOYP3Xazn0PX0a9E-9usDw-CRAotOfpcpsPB0cVg3LM06vVGtw-gosjhxtUtrNMiTiyFI-1u92fHD_qGqBSNn6L5zV4CE-mnkou_MTHDkb-DyUl6isJ5A_8v-Sd4vyAuqz3nYnOMRdcNnLCOgp4z7sgEBb0gGcfhKBIDd60FwWsMX1BNx1fOijxjJRGw7-WLSKtfSYdnAxO2Bk056rpkdmWNvS5nVsEKOwqqxUjcv5lMOnJkYykikXfjs-diBcFDJLpMhZHoSXcRiTMNZE-cU_baV358xxwXYTIpg89___rnH7429i3FFruhleZRqdf3pUbu0_brYdgor6Z67pBzuW2UT0ao7ecQrq-yQxUfB4FfaXiN3jJqliFMr2pw18N2yQy-4sB-K6JSJiaxNEauervJWmmpQkgViXtRVa_L_FJb-4f4pCq0EIQUzQC_T8oODuHurnVIM8OkCIHEWvJ1K6dyhF81FjgujPXbJ_Aw4ZrhyowkzOxqE2WhHi7SG3sGX4wX2gFWPI09QxjfMkG9sHzcFv8BP1mn1f0NAAA= -->

<script lang="ts">
	import { Entrant } from "$lib/bracket";

	// https://svelte.dev/repl/915db3b3ed704fddb7ddfb64bcbc2624?version=3.31.1
	
    export let sortedEntrants: Entrant[];

    let mouseXCoordinate: number = 0; // pointer y coordinate within client
    let distanceLeftGrabbedVsPointer: number = 0;

    let draggingItem: Entrant | null = null;
    let draggingItemId: number | null = null;
    let draggingItemIndex: number | null = null;

    let hoveredItemIndex: number | null = null;

    let elements = new Array(sortedEntrants.length);

    let container: HTMLDivElement;
    let ghost: HTMLDivElement;
    let ghostLeft: number = 0;

    $: {
        if (
            draggingItemIndex != null &&
            hoveredItemIndex != null &&
            draggingItemIndex != hoveredItemIndex
        ) {
            // swap items
            [sortedEntrants[draggingItemIndex], sortedEntrants[hoveredItemIndex]] = [
                sortedEntrants[hoveredItemIndex],
                sortedEntrants[draggingItemIndex],
            ];

            // balance
            draggingItemIndex = hoveredItemIndex;
        }
    }

    let displayText = (e: Entrant | null) => e!.name
    $: {
        if (container && ghost) {
            let containerBoundingRect = container.getBoundingClientRect();
            ghostLeft = mouseXCoordinate + distanceLeftGrabbedVsPointer - containerBoundingRect.x
            ghostLeft = Math.min(containerBoundingRect.width - ghost.getBoundingClientRect().width, ghostLeft)
            ghostLeft = Math.max(0, ghostLeft)
        }
    }

</script>

<div class="container" bind:this={container}>
    {#if mouseXCoordinate}
        <div
            bind:this={ghost}
            class="item ghost"
            style="left: {ghostLeft}px;">
            {displayText(draggingItem)}
        </div>
    {/if}

    {#each sortedEntrants as item, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            bind:this={elements[index]}
            class="item {draggingItemId == item.seed ? 'invisible' : ''}"
            draggable="true"
            on:dragstart={(e) => {
                mouseXCoordinate = e.clientX;

                draggingItem = item;
                draggingItemIndex = index;
                draggingItemId = item.seed;

                if (e.target) distanceLeftGrabbedVsPointer = e.target.getBoundingClientRect().x - e.clientX;
            }}
            on:drag={(e) => {
                mouseXCoordinate = e.clientX;
            }}
            on:dragover={(e) => {
                hoveredItemIndex = index;
            }}
            on:dragend={(e) => {
                draggingItemId = null; // makes item visible
                hoveredItemIndex = null; // prevents instant swap
            }}>
            {item.name}
        </div>
    {/each}
</div>

<!-- {draggingItemIndex}
{hoveredItemIndex}
<br />
distanceTopGrabbedVsPointer:
{distanceTopGrabbedVsPointer}
<br />
{showGhost}
<br /> -->

<!-- {JSON.stringify(list)} -->

<style>
    .container {
        position: relative;
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #aaa;
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    .item {
        width: 100px;
        background: white;
        padding: 10px;
        cursor: grab;
        background-color: #333;
        box-shadow: 0px 0px 1px 1px rgba(255, 255, 255, 0.75);
    }

    .ghost {
        margin-bottom: 10px;
        pointer-events: none;
        z-index: 99;
        position: absolute;
        top: 0;
        left: 10;
    }

    .invisible {
        opacity: 0;
    }
</style>
