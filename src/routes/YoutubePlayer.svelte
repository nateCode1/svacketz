<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaType } from '$lib/typedef';

	export const stop = () => {
        youtubeFunctions.pause()
    }

    export let previewDoneCallback: () => void;

	export let ytPlayerId = 'youtube-player';
    export let maxPreviewLength = 5;
    export let ready = false;

	let player: any;
    let endPreviewTimeout: NodeJS.Timeout | null = null;

	let youtubeFunctions = {
		setMedia: (id: string) => {console.log('setMediaYoutube not yet defined');},
		pause: () => {console.log('pauseYoutube not yet defined');}
	};

    export function preview(videoId: string) {
        youtubeFunctions.setMedia(videoId);
    }

    function endCurrentPreview() {
        if (endPreviewTimeout)
            clearTimeout(endPreviewTimeout);
        youtubeFunctions.pause();
        previewDoneCallback();
    }

	export function init() {
		function onPlayerReady(event: any) {
            ready = true;

			youtubeFunctions.setMedia = (id: string) => {
                ready = false;
				player.loadVideoById(id);
			}

			youtubeFunctions.pause = () => {
				player.pauseVideo()
			}
		}

		function loadYT() {
			console.log("Load YT")
			player = new YT.Player(ytPlayerId, {
				height: '100%',
				width: '100%',
				videoId: 'BDrkPsiS0qs',
				playerVars: { autoplay: 0, controls: 0 },
				events: { 
					onReady: onPlayerReady,
					onStateChange: (event: any) => {
						if (event.data == YT.PlayerState.PLAYING && !ready) {
                            let duration = player.getDuration();
                            let latestStart = duration - maxPreviewLength;
                            
                            // if this is < 0, then the video is shorter than the max preview length, so we let it play from 0
                            if (latestStart > 0) {
                                // Otherwise start at a random time
                                let start = Math.round(Math.random() * latestStart)
                                player.seekTo(start)
                            }

                            endPreviewTimeout = setTimeout(endCurrentPreview, maxPreviewLength * 1000)

							ready = true;
						}
                        if (event.data == YT.PlayerState.ENDED) {
                            endCurrentPreview();
                        }
					}
				}
			});
		}

		if (window.YT) {
		  loadYT();
		} else {
		  window.onYouTubeIframeAPIReady = loadYT;
		}
	};
</script>

<div style="position: absolute;">
	<div id="youtube-player" />
</div>

<div style="position:absolute;top:0;left:0;background-color:white;">
	<p>Youtube Player Included</p>
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
