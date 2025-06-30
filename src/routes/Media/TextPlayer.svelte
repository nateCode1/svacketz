<script lang="ts">
    import SvelteMarkdown from 'svelte-markdown'

    export let previewDoneCallback: () => void;

    export let maxPreviewLength = 5;
    export let ready = false;
    let source = "";

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

    export function preview(text: string) {
        source = text;
        ready = true;
        endPreviewTimeout = setTimeout(endCurrentPreview, maxPreviewLength * 1000)
    }

	export function init() {
		// This function left intentionally blank
	};
</script>

{#if ready}
    <div class="text-player-container">
        <div>
            <SvelteMarkdown {source} />
        </div>
    </div>
{/if}

<style>
    .text-player-container {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #efefef;
        width: 100%;
        max-height: 100%;
    }
</style>
