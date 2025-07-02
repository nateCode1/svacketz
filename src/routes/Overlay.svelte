<script lang="ts">
    export let visible = false;
</script>

{#if visible}
    <div class="dim-background" on:click|self={() => {visible = false;}}>
        <slot></slot>
    </div>
{/if}

<style>
    .dim-background {
        position: absolute;
        z-index: 100;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: rgba(0,0,0,0.8);
        left: 0;
        top: 0;
    }
</style>