<script lang="ts">
  interface Person {
    id: number;
    name: string;
  }

  let patsByR: Person[][] = [[
    {id: 1, name: "david"},
    {id: 63, name: "ahmad"},
    {id: 1763, name: "nathan"},
    {id: 12, name: "luke"},
    {id: 1482, name: "asher"},
    {id: 27, name: "emily"},
    {id: 104, name: "olivia"},
    {id: 865, name: "liam"},
    {id: 42, name: "sophia"},
    {id: 390, name: "jackson"},
    {id: 56, name: "ella"},
    {id: 150, name: "ethan"},
    {id: 777, name: "mia"},
    {id: 9, name: "noah"},
    {id: 330, name: "ava"},
    {id: 83, name: "oliver"},
    {id: 220, name: "isabella"},
    {id: 1901, name: "logan"},
    {id: 77, name: "amelia"},
    {id: 502, name: "lucas"},
    {id: 15, name: "abigail"},
    {id: 120, name: "carter"},
    {id: 1249, name: "charlotte"},
    {id: 32, name: "sebastian"},
    {id: 442, name: "harper"},
    {id: 8, name: "alexander"},
    {id: 950, name: "evelyn"},
    {id: 1045, name: "mason"},
    {id: 5, name: "sophie"},
    {id: 28, name: "jacob"},
    {id: 639, name: "scarlett"},
    {id: 763, name: "william"},
    {id: 17, name: "ava"},
    {id: 222, name: "madison"},
    {id: 1913, name: "henry"},
    {id: 2, name: "emma"},
    {id: 145, name: "james"},
    {id: 170, name: "grace"},
    {id: 163, name: "benjamin"},
    {id: 1987, name: "aaliyah"},
    {id: 74, name: "daniel"},
    {id: 208, name: "victoria"},
    {id: 35, name: "logan"},
    {id: 486, name: "aubrey"},
    {id: 62, name: "matthew"},
    {id: 791, name: "ella"},
    {id: 168, name: "jayden"},
    {id: 240, name: "aria"},
    {id: 2093, name: "zoe"},
    {id: 203, name: "dylan"},
    {id: 57, name: "grace"},
    {id: 765, name: "owen"},
    {id: 444, name: "mia"},
    {id: 938, name: "ethan"},
    {id: 537, name: "aubrey"},
    {id: 165, name: "jackson"},
    {id: 1296, name: "lily"},
    {id: 73, name: "caden"},
    {id: 503, name: "sophia"},
    {id: 84, name: "olivia"},
    {id: 1764, name: "jeremy"},
    {id: 98, name: "piper"},
    {id: 41, name: "jason"},
    {id: 555, name: "natalie"},
  ]]

  let prevR: Person[] = patsByR[0]
  while (prevR.length > 1) {
    patsByR.push([]);
    for (let i = 0; i < prevR.length; i += 2) {
      patsByR[patsByR.length - 1].push(Math.random() > 0.499 ? prevR[i] : prevR[i + 1] ?? prevR[i])        
    }
    prevR = patsByR[patsByR.length - 1];
  } 

</script>

<h1>Welcome to Svaketz</h1>

<h3>{patsByR.map(i => i.length)}</h3>

<div style="display: flex; flex-direction: row; align-items: stretch;">
{#each patsByR as r, rn}
  <div style="display: flex; min-width: 80px; flex-direction: column; justify-content: space-around;">
    {#each r as pat, i (pat.id)}
      <div style={`flex-grow: 1; text-align: center; display: flex; align-items: center; position: relative;`}>
        <!-- Tick Before -->
        {#if (rn != 0)}
          <div style="height:2px; background-color: black; width: 10px;"></div>
        {/if}

        <!-- Name -->
        <p style="margin: 0 2px; width: 100%;">{pat.name}</p>

        <!-- Tick After & Vertical Line Between -->
        {#if (rn != patsByR.length - 1)}
          <div style={`position: absolute; border-radius: 2px; padding: 0.5px 0; height: 50%; width: 100%; border-right: 2px solid black; top: ${i % 2 == 0 ? '' : '0'}; bottom: ${i % 2 == 0 ? '0' : ''}`}></div>
          <div style="height:2px; background-color: black; width: 5px;"></div>
        {/if}
      </div>
    {/each}
  </div>
{/each}
</div>

