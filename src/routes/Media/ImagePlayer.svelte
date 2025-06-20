<script lang="ts">
    export let previewDoneCallback: () => void;

    export let maxPreviewLength = 5;
    export let ready = false;
    let img_src = "";

    let endPreviewTimeout: NodeJS.Timeout | null = null;


	function endCurrentPreview() {
        if (endPreviewTimeout)
            clearTimeout(endPreviewTimeout);
        previewDoneCallback();
    }

	export function stop() {
		if (endPreviewTimeout)
            clearTimeout(endPreviewTimeout);
        ready = false;
	}

    export function preview(src: string) {
        img_src = src;
        ready = true;
        endPreviewTimeout = setTimeout(endCurrentPreview, maxPreviewLength * 1000)
    }

	export function init() {
		// This function left intentionally blank
	};
</script>

{#if ready}
    <div class="image-player-container">
        <img src={img_src} alt="Preview" />
    </div>
{/if}

<style>
	img {
        max-width: 100%;
        max-height: 100%;
    }

    .image-player-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-height: 100%;
    }
</style>
