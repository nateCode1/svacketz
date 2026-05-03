import matplotlib.pyplot as plt
import numpy as np

def nonFirstRoundByes(wpm, ppm, p, firstRoundMin=None):
  assert wpm * 2 <= ppm
  if firstRoundMin is None:
    firstRoundMin = p

  firstRound = firstRoundMin + -(firstRoundMin % -ppm)
  byes = [firstRound - firstRoundMin]
  pRemaining = firstRound

  while pRemaining > wpm:
    assert pRemaining % ppm == 0
    pRemaining = int(pRemaining * (wpm/ppm))
    if pRemaining == wpm:
      break

    requiredByes = -(pRemaining % -ppm)
    byes.append(requiredByes)
    pRemaining += requiredByes
  
  return byes

ppm = 5
wpm = 2
participant_values = list(range(5, 250))


results = [nonFirstRoundByes(wpm, ppm, x) for x in participant_values]

max_len = max(len(res) for res in results)
padded_results = [res + [0] * (max_len - len(res)) for res in results]

layers = np.array(padded_results).T 

fig, ax = plt.subplots(figsize=(10, 6))
ax.grid(axis='y', linestyle='--', alpha=0.7)

bottom = np.zeros(len(participant_values))

for i, result in enumerate(results):
  score = 0
  for j, val in enumerate(result):
    score += val * j
  ax.plot(participant_values[i], score, "bo")

for i, layer in enumerate(layers):
    ax.bar(participant_values, layer, bottom=bottom, label=f'Round {i}', edgecolor='white')
    score = 0
    bottom += layer

ax.set_xlabel('Participants', fontsize=12)
ax.set_ylabel('Byes by Round', fontsize=12)
ax.set_title(f'Byes for ${ppm} to ${wpm} brackets of varying size', fontsize=14)
ax.set_xticks(participant_values)
ax.legend()

plt.tight_layout()
plt.show()