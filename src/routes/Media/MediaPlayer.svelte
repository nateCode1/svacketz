<!-- This component is more or less one big multiplexer -->

<script context="module" lang="ts">
    export const multiPreviewSupportedMediaTypes = [MediaType.IMAGE, MediaType.TEXT, MediaType.NONE];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaType, type MediaInfo } from '$lib/typedef';
	import YoutubePlayer from './YoutubePlayer.svelte';
	import ImagePlayer from './ImagePlayer.svelte';
	import TextPlayer from './TextPlayer.svelte';

    export let previewDoneCallback: () => void;

    export let maxPreviewLength = 5;

    let youtubePlayer: YoutubePlayer;
    let youtubeReady: boolean = false;

    let imagePlayer: ImagePlayer;
    let imageReady: boolean = false;
    
    let textPlayer: ImagePlayer;
    let textReady: boolean = false;

    let currentMediaType: MediaType | null = null;

	export function stop() {
		if (currentMediaType == MediaType.YOUTUBE)
            youtubePlayer.stop();
        if (currentMediaType == MediaType.IMAGE)
            imagePlayer.stop();
        if (currentMediaType == MediaType.TEXT)
            textPlayer.stop();
	}

    export function preview(media: MediaInfo) {
        currentMediaType = media.mediaType;
        if (currentMediaType == MediaType.YOUTUBE)
            youtubePlayer.preview(media.mediaSrc);
        if (currentMediaType == MediaType.IMAGE)
            imagePlayer.preview(media.mediaSrc);
        if (currentMediaType == MediaType.TEXT)
            textPlayer.preview(media.mediaSrc); 
    }

	export function init() {
		youtubePlayer.init()
        imagePlayer.init()
        textPlayer.init()
	};
</script>


<YoutubePlayer
    bind:this={youtubePlayer}
    bind:ready={youtubeReady}
    maxPreviewLength={maxPreviewLength}
    previewDoneCallback={previewDoneCallback}
    ytPlayerId="yt-player-media-player"
/>

<!-- TODO: use youtbeready property to display things only if youtube is ready, also make sure to multiplex to prevent drawing multiple media concurrently -->

<div class="media-container">
    <div class={`${youtubeReady && currentMediaType == MediaType.YOUTUBE ? "visible" : ""} media`}>
        <div id="yt-player-media-player"></div>
    </div>
    <div class={`${imageReady && currentMediaType == MediaType.IMAGE ? "visible" : ""} media`}>
        <div class="image-container">
            <ImagePlayer
                bind:this={imagePlayer}
                bind:ready={imageReady}
                maxPreviewLength={maxPreviewLength}
                previewDoneCallback={previewDoneCallback} 
            />
        </div>
    </div>
    <div class={`${textReady && currentMediaType == MediaType.TEXT ? "visible" : ""} media`}>
        <div class="image-container">
            <TextPlayer
                bind:this={textPlayer}
                bind:ready={textReady}
                maxPreviewLength={maxPreviewLength}
                previewDoneCallback={previewDoneCallback} 
            />
        </div>
    </div>
    <div class="no-media-text">
        <p>No Media</p>
    </div>
</div>

<style>
    #yt-player-media-player{
        height: 400px;
    }

    .image-container {
        height: 100%;
        display: flex;
    }

    .no-media-text {
        position: absolute;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        line-height: 0;
        color: #8c8c8c;
        z-index: 0;
    }

    .media-container {
        border: 2px solid white;
        border-radius: 4px;
        position: relative;
        height: 400px;
    }

    .media {
        position: absolute;
        height: 100%;
        width: 100%;
        transition: 0.2s all;
        z-index: 5;
        opacity: 0;
        background-color: #1D1D1F;
    }

    .visible {
        opacity: 100%;
    }
</style>
