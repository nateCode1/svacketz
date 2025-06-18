<!--


    THIS IS CURRENTLY OUTDATED, BUT ALL THE CODE SHOULD BE FUNCTIONAL (mostly)


    The following code is from the old usage of this, and may be helpful

    const debouncedCycleFocusedParticipant = () => {
    if (cycleFocusedParticipantInterval != null)
      clearInterval(cycleFocusedParticipantInterval)
    if (overlayVisible)
      cycleFocusedParticipantInterval = setInterval(cycleFocusedParticipant, 8000)
  }

  const setFocusedParticipant = (index: number) => {
    focusedParticipant = index;
    updateAudioToFocused();
  }

  const cycleFocusedParticipant = () => {
    if (match) {
      focusedParticipant++;
      focusedParticipant %= match!.participants.length;
      updateAudioToFocused();
    }
  }

  const updateAudioToFocused = () => {
    audioManager.pauseMedia();
    let focused = match?.participants[focusedParticipant].data;
    if (focused?.mediaSrc && focused?.mediaType !== undefined)
      audioManager.loadMedia(focused.mediaType, focused.mediaSrc)
  }

  const stopAudio = () => {
    audioManager.pauseMedia();
    if (cycleFocusedParticipantInterval)
      clearInterval(cycleFocusedParticipantInterval)
  }

-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaType } from '$lib/typedef';

	export let onPlaybackUpdate: () => void;

	export const loadMedia = (type: MediaType, src: string) => {
		spotifyFunctions.setMedia(src);
	};

	export const pauseMedia = () => {
        spotifyFunctions.pause();
	};

	let player: any;

	export let ytPlayerId = 'youtube-player';

	let spotifyFunctions = {
		setMedia: (id: string) => {console.log('setMediaSpotify not yet defined');},
		pause: () => {console.log('pauseSpotify not yet defined');}
	};

	export function init() {
		window.onSpotifyIframeApiReady = (IFrameAPI) => {
			const element = document.getElementById('spotify-player');
			const options = {
				uri: 'spotify:track:1lqj3wgPj8gHCdq46hUjvr',
				width: 0,
				height: 0
			};

			const callback = (EmbedController) => {
				EmbedController.addListener('ready', () => {
					console.log('The Embed has initialized');
					// EmbedController.play()
				});

				EmbedController.addListener('playback_update', () => {
					console.log('Playback update');
					onPlaybackUpdate();
				});

				spotifyFunctions.setMedia = (id: string) => {
					console.log('Set media spotify');
					EmbedController.loadUri('spotify:track:' + id);
					EmbedController.play();
				};

				spotifyFunctions.pause = () => {
					EmbedController.pause();
				};
			};

			IFrameAPI.createController(element, options, callback);
		};
	};
</script>

<div style="position: absolute;">
	<div id="spotify-player" />
</div>

<div style="position:absolute;top:0;left:0;background-color:white;">
	<p>Spotify Player Included</p>
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
