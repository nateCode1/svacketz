<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaType } from "$lib/typedef"; // Adjust the path as needed
	
	export let onPlaybackUpdate: () => void;

	export const loadMedia = (type: MediaType, src: string) => {
		console.log("load media run");
		currMediaType = type;
		if (type == MediaType.SPOTIFY) {
			spotifyFunctions.setMedia(src);
		}
		else if (type == MediaType.YOUTUBE) {
			console.log("Youtube media not currently supported.")
		}
	}
	
	export const pauseMedia = () => {
		if (currMediaType == MediaType.SPOTIFY) {
			spotifyFunctions.pause();
		}
		else if (currMediaType == MediaType.YOUTUBE) {
			console.log("Youtube media not currently supported.")
		}
	}
	
	let currMediaType: MediaType | null;

	let player: HTMLElement;
	let initialVideoId = 'dQw4w9WgXcQ';
  let initDone = false;

	const ytPlayerId = 'youtube-player';

	// this is an object to make svelte/js happy with redefining it later
	let spotifyFunctions = {
		setMedia: (id: string) => {console.log("setMediaSpotify not yet defined")},
		pause: () => {console.log("pauseSpotify not yet defined")},
	}

	// global var setMediaSpotify: (id: string) => void | null

	onMount(() => {
		function onPlayerReady(event: any) {
			event.target.playVideo();
		}

		function load() {
			player = new YT.Player(ytPlayerId, {
				height: '0%',
				width: '0%',
				videoId: initialVideoId,
				playerVars: { autoplay: 1 },
				events: { onReady: onPlayerReady }
			});
		}

		// if (window.YT) {
		//   load();
		// } else {
		//   window.onYouTubeIframeAPIReady = load;
		// }

    if (initDone) return;
    initDone = true;

		window.onSpotifyIframeApiReady = (IFrameAPI) => {
			const element = document.getElementById('spotify-player');
			const options = {
				uri: 'spotify:track:1lqj3wgPj8gHCdq46hUjvr',
				width: 0,
				height: 0,
				
			};
			
			const callback = (EmbedController) => {
        EmbedController.addListener("ready", () => {
          console.log("The Embed has initialized");
          // EmbedController.play()
        });

        EmbedController.addListener("playback_update", () => {
          console.log("Playback update");
					onPlaybackUpdate();
        });

				spotifyFunctions.setMedia = (id: string) => {
					console.log("Set media spotify")
					EmbedController.loadUri("spotify:track:" + id);
					EmbedController.play()
				}

				spotifyFunctions.pause = () => {
					EmbedController.pause()
				}
      };

			IFrameAPI.createController(element, options, callback);
		};
	});
</script>

<div style="position: absolute;">
	<div id="spotify-player"/>

	<div id="youtube-player" />

	<div bind:this={player}></div>
</div>

<div style="position:absolute;top:0;left:0;background-color:white;">
	<p>Audio Player Included</p>
	<!-- 
	<iframe
    title="Video1"
		bind:this={iframeRef}
		src={iframeSrc}
		width="300"
		height="200"
		frameborder="0"
		allow="autoplay; encrypted-media;"
	></iframe> -->

	<!-- <button on:click={playVideo}>Play Video</button>
	<button on:click={pauseVideo}>Pause Video</button> -->
</div>

<style>
	div {
		margin: 0;
		padding: 0;
	}

	p {
		color: #2d2d2f;
		margin: 2px;
		font-size: 10px;
	}
</style>
